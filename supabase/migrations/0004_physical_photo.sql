-- Pedido opcional de foto física impressa com QR para a carta.
-- physical_photo_enabled: switch ligado no form de criação
-- physical_photo_url: foto a imprimir; null = reusa cover_image
-- shipping_address (jsonb): { cep, street, number, complement, neighborhood, city, uf, recipient }
-- shipping_cost_cents: snapshot do frete em centavos
-- shipping_region: rótulo legível da região (RS, SC/PR, SP/RJ/MG/ES, NE/CO, N)
-- shipping_status: ciclo de vida do pedido físico

alter table public.letters
  add column if not exists physical_photo_enabled boolean not null default false,
  add column if not exists physical_photo_url text,
  add column if not exists shipping_address jsonb,
  add column if not exists shipping_cost_cents integer,
  add column if not exists shipping_region text,
  add column if not exists shipping_status text
    check (shipping_status in ('pending','paid','shipped','delivered','canceled'));

create index if not exists letters_shipping_status_idx
  on public.letters (shipping_status)
  where physical_photo_enabled = true;
