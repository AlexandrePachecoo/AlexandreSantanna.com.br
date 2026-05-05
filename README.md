# Presente de Dia das Mães com IA · WLG Distribuidora

Produto sazonal serverless da WLG: a pessoa sobe até 10 fotos, escreve uma mensagem, paga R$ 39,90 (Mercado Pago) e recebe **uma arte personalizada + um vídeo narrado** gerados por IA.

## Pipeline

```
Browser → /api/orders/create → /api/orders/upload (Vercel Blob) → /api/checkout
   → Mercado Pago Checkout → webhook → dispara Inngest
   → [arte gpt-image-1] → [áudio gpt-4o-mini-tts ou trilha local] → [vídeo ffmpeg Ken Burns]
   → e-mail (Resend) + janela de 15 min no site
```

## Stack

| Camada | Serviço |
|--------|---------|
| Hosting / functions | Vercel (Node 20) |
| Storage | Vercel Blob |
| DB | Vercel Postgres (Neon) |
| Fila | Inngest |
| Pagamento | Mercado Pago Checkout Pro |
| E-mail | Resend |
| Imagem | OpenAI `gpt-image-1` |
| Voz | OpenAI `gpt-4o-mini-tts` |
| Vídeo | `ffmpeg-static` (1080×1920 Ken Burns) |
| Rate limit | Upstash Redis |

## Setup

```bash
# 1. dependências
npm install

# 2. configurar .env
cp .env.example .env
#    → preencher OPENAI_API_KEY, BLOB_READ_WRITE_TOKEN, POSTGRES_URL,
#      MP_ACCESS_TOKEN, RESEND_API_KEY, INNGEST_*, UPSTASH_*

# 3. migração Postgres
psql "$POSTGRES_URL" -f migrations/0001_orders.sql

# 4. (opcional) trilhas instrumentais → ler assets/music/README.md

# 5. local (2 terminais)
npm run dev          # vercel dev em :3000
npm run inngest      # worker Inngest local
```

## Endpoints

| Rota | Método | O que faz |
|------|--------|-----------|
| `/api/orders/create` | POST | Cria pedido `draft`. Body JSON `{nome, email, idade, estilo, mensagem, trilha, lgpd}`. Retorna `{id}`. |
| `/api/orders/upload` | POST | Handler oficial do Vercel Blob client upload (uso interno do front). |
| `/api/orders/[id]` | GET | Estado do pedido. Inclui `videoUrl` e `videoSecondsLeft` somente se `now < videoExpiresAt`. |
| `/api/checkout/[id]` | POST | Cria preferência Mercado Pago, retorna `{checkoutUrl}`. |
| `/api/payments/webhook` | POST | Webhook MP, valida assinatura HMAC e dispara o job Inngest. |
| `/api/inngest` | GET/POST | Endpoint do Inngest. |
| `/api/cron/purge` | GET | Cron diário que apaga blobs e zera dados de pedidos > 30 dias (LGPD). |

## Regras importantes

- **Vídeo no site por 15 min**: `markVideoReady` (`lib/db.js`) grava `video_expires_at = now + 15min`. `/api/orders/[id]` só devolve `videoUrl` enquanto não expira; depois retorna `videoExpired: true`. O e-mail recebe URL do Blob de longa duração.
- **LGPD**: checkbox obrigatório no formulário; cron apaga em 30 dias.
- **Rate limit**: 10 pedidos/h por IP (Upstash). Sem env var Upstash, o limit é desligado em dev.
- **ffmpeg em serverless**: `vercel.json` faz `includeFiles` do `node_modules/ffmpeg-static/**` apenas para `api/inngest.js`, com `maxDuration=300` (Vercel Pro).

## Deploy

```bash
vercel link
vercel env pull .env.production.local   # depois de configurar no dashboard
vercel deploy --prod
```

Configurar no dashboard Vercel:
- Integrations: Vercel Blob + Vercel Postgres + Upstash Redis + Inngest.
- Cron: já declarado em `vercel.json` (`/api/cron/purge` 04:00 UTC).
- Resend: domínio `wlgdistribuidora.com.br` verificado (SPF + DKIM).
- Mercado Pago: webhook apontando para `https://<domínio>/api/payments/webhook`.

## Estrutura

```
.
├── public/                # estático (Vercel serve direto)
│   ├── index.html         # landing
│   ├── pedido.html        # página de status pós-pagamento
│   ├── script.js          # form: cria pedido → upload → checkout
│   ├── pedido.js          # polling + countdown 15 min
│   └── styles.css
├── api/                   # serverless functions
│   ├── orders/{create,[id],upload}.js
│   ├── checkout/[id].js
│   ├── payments/webhook.js
│   ├── cron/purge.js
│   └── inngest.js
├── lib/                   # código compartilhado
│   ├── prompt.js          # buildPrompt + STYLE_DIRECTIVES + validateOrderInput
│   ├── openai.js          # generateArt + generateNarration
│   ├── video.js           # buildSlideshow (ffmpeg Ken Burns)
│   ├── db.js              # Postgres helpers
│   ├── blob.js            # Vercel Blob helpers + handleClientUpload
│   ├── mercadopago.js     # createPreference + verifyWebhookSignature
│   ├── email.js           # Resend template
│   └── ratelimit.js       # Upstash sliding window
├── inngest/
│   ├── client.js
│   └── functions/generatePresente.js
├── assets/music/          # trilhas instrumentais (commitar mp3 livres)
├── migrations/0001_orders.sql
├── vercel.json            # runtime + maxDuration + includeFiles + crons
├── package.json
└── .env.example
```

## Contato (cliente)

**WLG Distribuidora** · Av. Nações Unidas, 369 · Bairro Rincão · Novo Hamburgo · CEP 93310-435
51 3065-6655 · [www.wlgdistribuidora.com.br](https://www.wlgdistribuidora.com.br)
