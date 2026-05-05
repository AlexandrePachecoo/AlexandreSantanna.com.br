# Backend — Presente de Dia das Mães com IA

## Setup

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copiar `.env.example` para `.env` e preencher com suas credenciais:

```bash
cp .env.example .env
```

Preencher:
- `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` — obter no dashboard Supabase
- `OPENAI_API_KEY` — obter em https://platform.openai.com/api-keys
- `ELEVENLABS_API_KEY` — obter em https://elevenlabs.io/app/api-keys
- `RESEND_API_KEY` — obter em https://resend.com/api-keys
- `ABACATEPAY_API_KEY` e `ABACATEPAY_SECRET_KEY` — obter em AbacatePay dashboard
- `FRONTEND_URL` — URL do frontend (padrão: http://localhost:8000)

### 3. Configurar Supabase

#### 3.1 Criar tabela `pedidos`

No dashboard do Supabase, ir para "SQL Editor" e executar:

```sql
[Copiar conteúdo de server/config/schema.sql]
```

#### 3.2 Criar Storage bucket `fotos-pedidos`

No dashboard → Storage → New bucket:
- Nome: `fotos-pedidos`
- Public: YES (para gerar URLs públicas)

### 4. Rodar o servidor

**Modo desenvolvimento** (com auto-reload):

```bash
npm run dev
```

O servidor iniciará em `http://localhost:3001`.

**Modo produção**:

```bash
npm start
```

## Estrutura de arquivos

```
server/
├── index.js                    # Servidor Express
├── routes/
│   ├── pedido.js              # POST /api/pedido
│   └── webhook.js             # POST /api/webhook/abacatepay
├── services/
│   ├── pedido.js              # Lógica de criar pedido
│   ├── pagamento.js           # Integração AbacatePay
│   ├── storage.js             # Upload para Supabase
│   ├── pipeline.js            # Orquestração da IA
│   ├── imagem.js              # Geração com GPT Image 2
│   ├── video.js               # FFmpeg + vídeo
│   ├── tts.js                 # ElevenLabs TTS
│   └── email.js               # Resend
└── config/
    ├── supabase.js            # Cliente Supabase
    └── schema.sql             # Schema do banco
```

## Fluxo de Requisição

1. **POST /api/pedido** — Frontend envia form + fotos
   - Salva fotos em Supabase Storage
   - Cria pedido no DB com status `pendente_pagamento`
   - Cria cobrança PIX no AbacatePay
   - Retorna `checkoutUrl` ao frontend
   - Frontend redireciona para checkout

2. **POST /api/webhook/abacatepay** — AbacatePay confirma pagamento
   - Atualiza status do pedido para `pago`
   - Dispara `processarPipeline()`

3. **Pipeline de IA** (background)
   - Gera arte com GPT Image 2
   - Gera vídeo com FFmpeg
   - Adiciona narração TTS com ElevenLabs
   - Envia email com Resend
   - Atualiza status para `entregue`

## Variáveis de Ambiente (Resumo)

| Var | Valor | Obrigatório |
|---|---|---|
| `NODE_ENV` | `development` ou `production` | sim |
| `PORT` | `3001` | não (padrão: 3001) |
| `FRONTEND_URL` | `http://localhost:8000` | não |
| `SUPABASE_URL` | URL do projeto Supabase | sim |
| `SUPABASE_ANON_KEY` | Chave anon (só leitura) | não (apenas frontend) |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave admin do servidor | sim |
| `OPENAI_API_KEY` | Chave da OpenAI | sim |
| `ELEVENLABS_API_KEY` | Chave da ElevenLabs | sim |
| `RESEND_API_KEY` | Chave da Resend | sim |
| `ABACATEPAY_API_KEY` | Chave pública AbacatePay | sim |
| `ABACATEPAY_SECRET_KEY` | Chave secreta AbacatePay | sim |
| `ABACATEPAY_WEBHOOK_SECRET` | Secret para validar webhook | sim |
| `PRODUCT_PRICE` | Preço em centavos (1500 = R$ 15) | sim |

## Testing

### Testar form submission (local)

1. Rodar frontend: `python3 -m http.server 8000` (na raiz do projeto)
2. Rodar backend: `npm run dev`
3. Preencher e submeter form
4. Verificar logs do servidor

### Simular webhook do AbacatePay

```bash
curl -X POST http://localhost:3001/api/webhook/abacatepay \
  -H "Content-Type: application/json" \
  -d '{
    "event": "charge.completed",
    "data": {
      "metadata": { "pedido_id": "xxxxx" },
      "status": "completed",
      "id": "charge_xxx"
    }
  }'
```

## Deploy no Vercel

1. Conectar repositório ao Vercel
2. Definir variáveis de ambiente (Settings → Environment Variables)
3. Deploy automaticamente a cada push em `main`

### Estrutura para Vercel

O Vercel detecta Node.js automaticamente. Para serverless, idealmente mover rotas para `/api/[...].js`, mas Express também funciona com adapter.
