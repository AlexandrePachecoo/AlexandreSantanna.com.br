-- Cobrança via AbacatePay (PIX). Cada carta vira um pedido que precisa ser pago
-- antes de ficar pública. Sem pagamento confirmado em 20min, expira.
--
-- payment_status: ciclo de vida do pagamento
--   awaiting_payment → carta criada, esperando webhook do AbacatePay
--   paid             → pago e liberado (carta fica pública)
--   expired          → tempo limite estourou sem pagamento
--   refunded         → reembolsado depois de pago
-- payment_provider: hoje só 'abacatepay'; deixa coluna pra trocar gateway no futuro.
-- payment_id: id retornado pelo gateway (billing id no AbacatePay).
-- payment_url: URL do checkout PIX para o usuário pagar / retomar.
-- payment_amount_cents: total cobrado (carta + foto + frete) — snapshot, em centavos.
-- payment_expires_at: 20min após criação. Checado preguiçosamente no GET de /c/:slug.

alter table public.letters
  add column if not exists payment_status text not null default 'awaiting_payment'
    check (payment_status in ('awaiting_payment','paid','expired','refunded')),
  add column if not exists payment_provider text default 'abacatepay',
  add column if not exists payment_id text,
  add column if not exists payment_amount_cents integer,
  add column if not exists payment_url text,
  add column if not exists payment_paid_at timestamptz,
  add column if not exists payment_expires_at timestamptz;

create index if not exists letters_payment_id_idx
  on public.letters (payment_id)
  where payment_id is not null;

create index if not exists letters_payment_status_pending_idx
  on public.letters (payment_expires_at)
  where payment_status = 'awaiting_payment';

-- Função usada pelo lazy-expire em /c/:slug. Marca como expired tudo que estourou.
create or replace function public.expire_pending_letters()
returns integer
language sql
as $$
  with updated as (
    update public.letters
       set payment_status = 'expired'
     where payment_status = 'awaiting_payment'
       and payment_expires_at is not null
       and payment_expires_at < now()
    returning id
  )
  select count(*)::int from updated;
$$;
