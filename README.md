# Carta Virtual de Dia das Mães · WLG Distribuidora

Landing page da WLG Distribuidora para criar uma **carta virtual** de Dia das Mães. O cliente monta uma carta com texto, fotos e a música favorita do Spotify; depois do pagamento PIX, recebe um link público (com QR Code) que pode ser compartilhado pelo WhatsApp ou impresso na embalagem do presente.

## Como funciona

1. Escreve a mensagem (até 2.000 caracteres).
2. Sobe até **10 fotos**.
3. Escolhe uma música no Spotify (busca direta no formulário).
4. Paga via PIX (AbacatePay).
5. Recebe um link `https://<host>/c/<slug>` + QR Code (PNG/SVG) + botão de WhatsApp pronto.

## Stack

- HTML/CSS/JS estáticos (sem build).
- Vercel Functions em `api/` (Node, ESM).
- Supabase (Postgres + Storage).
- AbacatePay (PIX) com webhook.
- Spotify Web API (Client Credentials, lado servidor).
- Lib `qrcode` para gerar QR.

## Rodar localmente

```bash
# Front estático (sem APIs)
python3 -m http.server 8000

# Com Vercel Functions (precisa de .env populado)
npm install
npm run dev
```

## Próximos passos

- Painel pra o cliente acompanhar/editar cartas geradas.
- E-mail automático com o link logo após o pagamento confirmado.
- Métricas de visualização do link (sem perder anonimato).

## Contato

**WLG Distribuidora**
Av. Nações Unidas, 369 · Bairro Rincão · Novo Hamburgo · CEP 93310-435
Telefone: 51 3065-6655
Site: [www.wlgdistribuidora.com.br](https://www.wlgdistribuidora.com.br)
