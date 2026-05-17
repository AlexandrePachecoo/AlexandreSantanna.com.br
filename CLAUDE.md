# CLAUDE.md

Guia para o Claude Code (claude.ai/code) trabalhar neste repositório.

## Visão geral

**Carta Virtual de Dia dos Namorados** (WLG Distribuidora) — landing page que permite criar uma carta digital personalizada para presentear no Dia dos Namorados (Brasil: 12 de junho). Fluxo do produto:

1. Cliente escreve uma mensagem (até **2.000 caracteres**).
2. Sobe até **10 fotos** (`image/*`, comprimidas no browser antes do upload).
3. Escolhe uma música no Spotify via busca server-side (Client Credentials).
4. Paga **R$ 15,00 via PIX** no checkout do AbacatePay (preço controlado por `PRODUCT_PRICE`).
5. Webhook do AbacatePay confirma o pagamento → carta vira `publicada`.
6. Página de sucesso entrega link público `https://<host>/c/<slug>`, QR Code (PNG/SVG) e botão de WhatsApp.

Sem build step: HTML/CSS/JS estáticos + Vercel Functions em `api/`.

## Stack

- **Front estático**: HTML5, CSS (design tokens em `:root`, paleta rose/cream), Vanilla JS em IIFE.
- **Backend**: Vercel Functions, Node ESM (`"type": "module"`).
- **DB**: Supabase Postgres, tabela `cartas`.
- **Storage**: Supabase Storage, bucket `fotos-pedidos` (signed upload URLs + signed read URLs com TTL de 1h).
- **Pagamento**: AbacatePay (`/v1/billing/create`, `frequency: ONE_TIME`, `methods: ['PIX']`). CPF e celular são coletados pelo próprio checkout do AbacatePay — **não enviar no `customer`**.
- **Spotify**: Client Credentials flow no servidor, token cacheado em memória (Vercel warm starts reaproveitam).
- **QR Code**: pacote `qrcode` (PNG buffer ou SVG string).
- **HTTP client**: `axios` (timeouts explícitos de 8s em chamadas externas).

## Rodando localmente

```bash
# 1) Apenas o front (sem APIs):
python3 -m http.server 8000

# 2) Stack completa (APIs + estático): exige Vercel CLI + .env populado
npm install
npm run dev   # vercel dev
```

`npm run build` é no-op. O deploy é Vercel; `vercel.json` define `outputDirectory: "."` (sem pasta de build).

## Estrutura de arquivos

### Front

- `index.html` — landing + formulário de criação de carta.
- `carta.html` — viewer público servido em `/c/:slug` (rewrite no `vercel.json`).
- `sucesso.html` — pós-checkout; faz polling em `/api/carta-publica?slug=...&statusOnly=1` até virar `publicada`, depois mostra link/QR/WhatsApp.
- `styles.css` — design system completo (header, hero, form, Spotify picker, share box, carta viewer).
- `script.js` — IIFE: countdown (próximo 12 de junho), drag-drop + compressão de imagem (canvas, 1600px, JPEG 0.85), busca Spotify com debounce, submit do formulário.

### API (Vercel Functions, todas ESM)

| Endpoint | Método | Função |
|---|---|---|
| `api/upload-urls.js` | POST | Gera signed upload URLs no Supabase Storage (1 por arquivo). Body: `{ files: [{ name, mimeType }] }`. Retorna `{ uploadId, files: [{ signedUrl, path, token }] }`. |
| `api/spotify-search.js` | GET `?q=` | Busca até 8 tracks no Spotify. Cache HTTP de 60s. |
| `api/carta.js` | POST | Cria registro `cartas` (status `pendente_pagamento`) + cobrança AbacatePay. Retorna `{ checkoutUrl, slug, cartaId }`. |
| `api/webhook.js` | POST | Recebe `charge.completed` / `charge.confirmed` / `billing.paid` do AbacatePay → marca carta como `publicada`. Idempotente. |
| `api/carta-publica.js` | GET `?slug=` | Leitura pública. Se `?statusOnly=1`, retorna só o status. Se `status='publicada'`, devolve dados + signed URLs das fotos. |
| `api/qrcode.js` | GET `?slug=&format=png\|svg` | Gera QR apontando para `<FRONTEND_URL>/c/<slug>`. Cache de 24h. |

### Server lib

- `server/config/supabase.js` — singleton do client Supabase usando **service role key** (tudo no backend, sem RLS pelo lado do cliente).
- `server/db.js` — CRUD da tabela `cartas`: `criarCarta`, `getCartaBySlug`, `getCartaByChargeId`, `updateCartaBySlug`.
- `server/services/carta.js` — orquestra `db.criarCarta` + `pagamento.criarCobranca` + grava `charge_id` no update subsequente.
- `server/services/pagamento.js` — wrapper AbacatePay (`criarCobranca`, `validarWebhookSecret`, `consultarCobranca`).
- `server/services/spotify.js` — token Client Credentials cacheado em módulo + `buscarTracks(query, limit)`.
- `server/services/storage.js` — helpers de Storage: `criarUploadUrls` (usado pelo flow atual), `uploadFotos`/`downloadFoto`/`uploadArte`/`apagarFotos` (helpers legados ou para futuras features).

### Banco

- `supabase/migrations/0001_add_tamanho.sql` — legado (`ALTER TABLE pedidos ADD COLUMN tamanho`). Mantido por compat histórica.
- `supabase/migrations/0002_cartas.sql` — schema atual da tabela `cartas`.
- `server/config/schema.sql` — referência da tabela legada `pedidos` (não está mais em uso pelo fluxo principal).

## Modelo de dados

Tabela **`cartas`**:

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | `gen_random_uuid()` |
| `slug` | TEXT UNIQUE | gerado com `randomBytes(6).toString('base64url')` — identificador público em `/c/:slug` |
| `email` | TEXT | do remetente |
| `nome_remetente`, `nome_destinatario` | TEXT | |
| `idade` | INT | opcional |
| `texto` | TEXT | até 2000 chars |
| `fotos_paths` | TEXT[] | chaves no bucket `fotos-pedidos`, sempre `uploads/<uploadId>/foto-N.<ext>` |
| `spotify_track_id`, `_track_name`, `_artist`, `_album_art` | TEXT | opcional, snapshot dos dados na hora da criação |
| `status` | TEXT | `pendente_pagamento` → `publicada` (ou `erro`) |
| `charge_id` | TEXT | id da cobrança AbacatePay; usado como fallback no webhook |
| `created_at`, `updated_at` | TIMESTAMP | `updated_at` é setado manualmente em `updateCartaBySlug` |

Índices: `slug` (unique), `charge_id`, `email`, `status`.

## Variáveis de ambiente

```
FRONTEND_URL=                       # URL pública (usada em returnUrl/completionUrl e QR Code)
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=          # service role; o front NUNCA chama Supabase direto
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
ABACATEPAY_API_KEY=
ABACATEPAY_WEBHOOK_SECRET=          # validado via header (x-webhook-secret / x-abacatepay-secret / webhook-secret) OU query (?webhookSecret=)
PRODUCT_PRICE=1500                  # em centavos
```

`server/config/supabase.js` faz `throw` se Supabase env vars faltarem. `server/services/spotify.js` idem para credenciais Spotify.

## Fluxos end-to-end

### Criação da carta (happy path)

1. Browser comprime fotos (canvas, max 1600px, JPEG quality 0.85).
2. `POST /api/upload-urls` → recebe N signed URLs.
3. Browser sobe cada foto direto no Supabase Storage via PUT na signed URL.
4. `POST /api/carta` com `fotosPaths` (validados — devem começar com `uploads/`).
5. Backend insere em `cartas` (`pendente_pagamento`), cria cobrança AbacatePay com `metadata.carta_slug = slug`, grava `charge_id`.
6. Front redireciona para `result.checkoutUrl` (página do AbacatePay).
7. Após pagamento, AbacatePay redireciona para `completionUrl = ${FRONTEND_URL}/sucesso.html?slug=<slug>`.
8. `sucesso.html` faz polling em `/api/carta-publica?slug=...&statusOnly=1` até `status === 'publicada'`.
9. Paralelamente, AbacatePay chama `POST /api/webhook` (com `webhookSecret` em header/query) → marca como `publicada`.
10. Sucesso renderiza link `/c/<slug>`, QR (`/api/qrcode?slug=...`) e botão WhatsApp.

### Viewer público (`/c/:slug`)

1. `vercel.json` rewrites `/c/:slug` → `/carta.html`.
2. `carta.html` lê o slug da URL, faz `GET /api/carta-publica?slug=...`.
3. Se status ≠ `publicada`, mostra placeholder (carta em preparo).
4. Se publicada, renderiza texto + galeria (signed URLs com TTL 1h) + embed do Spotify.

### Webhook idempotente

- `validarWebhookSecret` aceita o secret via query (`?webhookSecret=`) **ou** headers `x-webhook-secret` / `x-abacatepay-secret` / `webhook-secret`.
- Evento aceito: `charge.completed`, `charge.confirmed`, `billing.paid`. Qualquer outro retorna 200 com `ignored: <event>`.
- Lookup: primeiro tenta `metadata.carta_slug` (ou `metadata.metadata.carta_slug` aninhado), depois `data.id` como `charge_id`.
- Se já `publicada`, devolve `{ success: true, idempotent: true }` sem reescrever.

## Convenções e padrões

### JavaScript front

- IIFE em `script.js` para não vazar para o escopo global.
- Queries DOM null-safe (`if (el)` antes de adicionar listener).
- Intersection Observer para reveal animations (com fallback se indisponível).
- Compressão de imagem **no cliente** antes de subir — evita estourar o limite de payload de funções serverless.

### CSS

- Design tokens (cores, espaçamentos, sombras, radius) em `:root` — paleta rose/cream/ink.
- Typography: Playfair Display (serif) para títulos, Inter (sans) para corpo.
- `clamp()` para tipografia fluida; mobile-first.
- Backdrop blur no header com fallback.

### Backend

- Sempre **ESM** (não use `require`).
- Todos os handlers checam `req.method` e setam `Allow` em 405.
- Erros são logados (`console.error('Erro em /api/X:', err)`) e devolvidos como 500 com `err.message`.
- Validação de payload feita explicitamente em cada handler (sem framework de schema).
- Timeouts: `axios` chama externas com `timeout: 8000`. `maxDuration` por função no `vercel.json` (10–30s).

## Gotchas e armadilhas

- **AbacatePay**: o endpoint correto é `POST /v1/billing/create` (não `/charges`). Não enviar `customer.cpf` nem `customer.phone` — esses campos quebram a request; o AbacatePay coleta no checkout.
- **Webhook secret**: precisa estar configurado no painel AbacatePay com o mesmo valor de `ABACATEPAY_WEBHOOK_SECRET`. Aceita header **ou** query — depende de como o AbacatePay está configurado.
- **Slug**: 8 caracteres base64url (`randomBytes(6).toString('base64url')`). O regex em `api/qrcode.js` aceita `[A-Za-z0-9_-]{4,64}`.
- **Storage paths**: `fotosPaths` enviados ao `/api/carta` **precisam** começar com `uploads/` — qualquer outro prefixo é rejeitado. Isso amarra ao formato gerado por `criarUploadUrls`.
- **Signed URLs de leitura**: TTL de 3600s. O viewer público gera novas a cada request — não tente cachear no front.
- **Token Spotify**: cacheado em variável de módulo. Em cold starts da Vercel, o primeiro request paga ~200ms para obter token; warm starts reutilizam.
- **`carta.status === 'erro'`**: existe no CHECK constraint mas não há fluxo atual que seta esse valor — reservado para uso futuro.

## Limites operacionais

- Máx **10 fotos** por carta (`MAX_FILES` em `api/upload-urls.js` e `api/carta.js`).
- Máx **2000 chars** no texto (`MAX_TEXTO` em `api/carta.js`).
- Apenas MIME `image/*` aceito no upload.
- Funções com `maxDuration` configurado em `vercel.json` (30s para `/api/carta` e `/api/webhook`; menores para o resto).

## Próximos passos conhecidos (do README)

- Painel pro cliente acompanhar/editar cartas geradas.
- E-mail automático com o link após o pagamento.
- Métricas de visualização do link (sem perder anonimato).
