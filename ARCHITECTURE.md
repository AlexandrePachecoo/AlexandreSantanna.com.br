# Arquitetura — Presente de Dia das Mães com IA

## Fluxo Geral

```
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND (Static HTML + JavaScript)                         │
│ http://localhost:8000                                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
         1. Usuário preenche form + envia fotos
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│ BACKEND (Express.js)                                        │
│ http://localhost:3001                                       │
│                                                             │
│ POST /api/pedido (routes/pedido.js)                        │
│   │                                                         │
│   ├─ Recebe: FormData (fotos + campos)                    │
│   ├─ Upload fotos → Supabase Storage                      │
│   ├─ Salva pedido no DB (status: pendente_pagamento)     │
│   └─ Cria cobrança AbacatePay                             │
│       │                                                     │
│       └─ Retorna checkoutUrl                              │
│           │                                                │
│           ▼ (Frontend redireciona para)                   │
└─────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ ABACATEPAY (Pagamento PIX)                                  │
│ https://checkout.abacatepay.com                            │
│                                                             │
│ 2. Usuário paga via PIX                                    │
│    (ou boleto/cartão)                                      │
│                                                             │
│ 3. AbacatePay envia webhook ao backend                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
         POST /api/webhook/abacatepay
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│ BACKEND WEBHOOK                                             │
│                                                             │
│ - Recebe confirmação de pagamento                          │
│ - Atualiza pedido: status = "pago"                         │
│ - Dispara processarPipeline()                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
         4. Inicia processamento de IA (background)
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│ PIPELINE DE IA (services/pipeline.js)                       │
│                                                             │
│ Fase 1: Gerar Arte                                          │
│ ├─ Construir prompt com estilo + mensagem                 │
│ ├─ Chamar OpenAI DALL-E 3                                 │
│ └─ Salvar em Supabase Storage (bucket: arte)              │
│                                                             │
│ Fase 2: Gerar Vídeo                                         │
│ ├─ Baixar fotos do usuário                                │
│ ├─ Usar FFmpeg para montar slideshow                      │
│ ├─ Adicionar transições fade entre fotos                  │
│ └─ Salvar em Supabase Storage (bucket: videos)            │
│                                                             │
│ Fase 3: Adicionar Áudio (se selecionado)                   │
│ ├─ SE trilha = "narracao":                                │
│ │  ├─ Chamar ElevenLabs TTS                              │
│ │  ├─ Gerar narração em português                        │
│ │  └─ Salvar em Supabase Storage (bucket: audios)        │
│ │                                                         │
│ └─ SE trilha = "musica":                                  │
│    └─ (TODO) Usar trilha instrumental                    │
│                                                             │
│ Fase 4: Enviar Email                                        │
│ ├─ Compor HTML com preview da arte                        │
│ ├─ Adicionar links para downloads                         │
│ ├─ Chamar Resend                                          │
│ └─ Enviar para email do usuário                           │
│                                                             │
│ Atualizar status = "entregue"                              │
└─────────────────────────────────────────────────────────────┘
                       │
         5. Usuário recebe email com presente!
```

---

## Componentes Principais

### Frontend (index.html + script.js)

```
┌────────────────────────────────────────┐
│ Hero Section                            │
├────────────────────────────────────────┤
│ Countdown Timer                         │
│ (2º domingo de maio)                   │
├────────────────────────────────────────┤
│ How it Works (5 steps)                  │
├────────────────────────────────────────┤
│ Examples (3 art styles)                 │
├────────────────────────────────────────┤
│ CREATE FORM                             │
│ ├─ Nome da mãe (required)              │
│ ├─ Idade                               │
│ ├─ Estilo (aquarela/polaroid/min)     │
│ ├─ Mensagem (500 chars)                │
│ ├─ Trilha (narração/música)            │
│ ├─ Upload Fotos (drag-drop, max 10)   │
│ └─ Email (required)                    │
├────────────────────────────────────────┤
│ FAQ (details/summary)                   │
├────────────────────────────────────────┤
│ Footer                                  │
└────────────────────────────────────────┘
```

### Backend (Express.js)

```
server/
├── index.js
│   └─ Inicia Express na porta 3001
│      CORS: http://localhost:8000
│
├── routes/
│   ├─ pedido.js
│   │  └─ POST /api/pedido
│   │     ├─ Multer: upload de fotos
│   │     └─ Chama criarPedido()
│   │
│   └─ webhook.js
│      └─ POST /api/webhook/abacatepay
│         └─ Chama processarPagamento()
│
├── services/
│   ├─ pedido.js
│   │  └─ criarPedido()
│   │     ├─ uploadFotos() → Supabase
│   │     ├─ Insere no DB
│   │     └─ criarCobranca() → AbacatePay
│   │
│   ├─ pagamento.js
│   │  ├─ criarCobranca()
│   │  │  └─ POST /charges (AbacatePay)
│   │  │
│   │  └─ processarPagamento()
│   │     ├─ Atualiza status → "pago"
│   │     └─ processarPipeline()
│   │
│   ├─ storage.js
│   │  └─ uploadFotos()
│   │     └─ Supabase Storage API
│   │
│   ├─ pipeline.js
│   │  └─ processarPipeline()
│   │     ├─ gerarArte()
│   │     ├─ gerarVideo()
│   │     ├─ gerarNarracao()
│   │     └─ enviarPresentePorEmail()
│   │
│   ├─ imagem.js
│   │  └─ gerarArte()
│   │     ├─ OpenAI DALL-E 3
│   │     └─ Supabase Storage
│   │
│   ├─ video.js
│   │  └─ gerarVideo()
│   │     ├─ FFmpeg (slideshow)
│   │     └─ Supabase Storage
│   │
│   ├─ tts.js
│   │  └─ gerarNarracao()
│   │     ├─ ElevenLabs API
│   │     └─ Supabase Storage
│   │
│   └─ email.js
│      └─ enviarPresentePorEmail()
│         └─ Resend API
│
└── config/
   ├─ supabase.js (cliente)
   └─ schema.sql (tabela pedidos)
```

---

## Banco de Dados (Supabase)

### Tabela: pedidos

```sql
CREATE TABLE pedidos (
  id UUID PRIMARY KEY,
  email TEXT,
  nome_mae TEXT,
  idade INTEGER,
  estilo TEXT ('aquarela'|'polaroid'|'minimalista'|'ia'),
  mensagem TEXT,
  trilha TEXT ('narracao'|'musica'),
  fotos_urls TEXT[] (URLs das fotos enviadas),
  status TEXT ('pendente_pagamento'|'pago'|'processando'|'entregue'|'erro'),
  charge_id TEXT (ID da cobrança AbacatePay),
  arte_url TEXT (URL da arte gerada),
  video_url TEXT (URL do vídeo),
  erro_mensagem TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Storage Buckets

- **fotos-pedidos** — fotos enviadas pelo usuário
- **arte** — artes geradas por DALL-E 3
- **videos** — vídeos gerados por FFmpeg
- **audios** — narações geradas por ElevenLabs

---

## Integrações Externas

| Serviço | Endpoint | Autenticação |
|---------|----------|--------------|
| **Supabase** | https://xxxxx.supabase.co | Service Role Key |
| **OpenAI** | https://api.openai.com/v1/images/generations | API Key |
| **ElevenLabs** | https://api.elevenlabs.io/v1/text-to-speech | API Key |
| **Resend** | https://api.resend.com/emails | API Key |
| **AbacatePay** | https://api.abacatepay.com/v1 | API Key + Secret |

---

## Fluxo de Status

```
Pedido criado
│
├─ pendente_pagamento (aguardando PIX)
│  └─ Timeout? → erro
│
├─ pago (pagamento confirmado)
│  └─ processarPipeline()
│
├─ processando (gerando IA)
│  └─ Erro? → status = "erro"
│
└─ entregue (email enviado com sucesso)
```

---

## Timeouts e Limites

| Operação | Timeout | Limite |
|----------|---------|--------|
| Upload de foto | 30s | 10MB por arquivo |
| Geração de arte (DALL-E) | 2min | 1 requisição/pedido |
| Geração de vídeo (FFmpeg) | 5min | Até 10 fotos |
| Geração TTS (ElevenLabs) | 1min | 500 caracteres |
| Envio de email (Resend) | 10s | 1 email/pedido |
| **Total pipeline** | **10min** | Paralelo parcial |

---

## Segurança

- [x] Validação de tipo de arquivo (image/* apenas)
- [x] Limite de tamanho de arquivo (10MB)
- [x] CORS habilitado apenas para frontend
- [x] Service Role Key do Supabase (não expor ao cliente)
- [ ] Validação de assinatura de webhook AbacatePay
- [ ] Rate limiting em endpoints
- [ ] Autenticação JWT (opcional, para dashboard admin)

---

## Métricas e Monitoramento

```
Dashboard (recomendação):
├─ Pedidos por dia (conversão)
├─ Taxa de erro no pipeline
├─ Tempo médio de geração
├─ Custos por serviço
├─ Taxa de bounce no checkout AbacatePay
└─ Satisfação do cliente (feedback)
```

---

## Deploy

```
Ambiente Local
├─ Frontend: http://localhost:8000 (Python HTTP Server)
└─ Backend: http://localhost:3001 (npm run dev)

Ambiente Produção (Vercel)
├─ Frontend: https://seu-dominio.vercel.app
└─ Backend: https://seu-dominio.vercel.app/api/*
   (Vercel usa Edge Functions para rotas /api)
```

---

## Melhorias Futuras

1. **Audio Mixing** — Misturar narração TTS ao vídeo com FFmpeg
2. **Playlist de Música** — Integrar Epidemic Sound ou AudioJungle
3. **AI Video Generation** — Remotion ou Kling AI para vídeos mais criativos
4. **Admin Dashboard** — Ver vendas, estatísticas, gerenciar pedidos
5. **Custom Domain** — usar domínio próprio em produção
6. **Multiple Checkout** — Suportar Stripe além de AbacatePay
7. **Webhooks Assíncronos** — Background jobs com Bull/Bee-Queue
8. **CI/CD** — GitHub Actions para testes automáticos
