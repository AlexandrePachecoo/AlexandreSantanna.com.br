-- AbacatePay /transparents/create devolve PIX inline (brCode + QR base64),
-- não uma URL de checkout externo. Salvamos isso na própria letter para
-- renderizar a página de aguardando pagamento.
--
-- payment_pix_brcode: PIX copia-e-cola (string EMV).
-- payment_pix_qr_base64: data:image/png;base64,... — imagem do QR Code.

alter table public.letters
  add column if not exists payment_pix_brcode text,
  add column if not exists payment_pix_qr_base64 text;
