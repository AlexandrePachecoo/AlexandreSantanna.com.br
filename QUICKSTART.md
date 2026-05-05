# Quick Start — Presente de Dia das Mães com IA

## 5 Minutos para Começar

### 1. Clonar e Instalar

```bash
cd /Users/devalexandre/Desktop/projetos/AlexandreSantanna.com.br
npm install
```

### 2. Configurar Variáveis de Ambiente

```bash
cp .env.example .env
```

Editar `.env` com suas credenciais (mínimas para testar):

```
SUPABASE_URL=sua_url
SUPABASE_SERVICE_ROLE_KEY=sua_chave
OPENAI_API_KEY=sua_chave
ELEVENLABS_API_KEY=sua_chave
RESEND_API_KEY=sua_chave
ABACATEPAY_API_KEY=sua_chave
ABACATEPAY_SECRET_KEY=sua_chave
```

### 3. Rodar Localmente (2 Terminais)

**Terminal 1 — Frontend:**
```bash
python3 -m http.server 8000
```

**Terminal 2 — Backend:**
```bash
npm run dev
```

### 4. Testar

Abrir http://localhost:8000 e preencher o formulário.

Ao clicar "Gerar meu presente", deve:
1. ✓ Enviar fotos para o backend
2. ✓ Redirecionar para checkout AbacatePay
3. ✓ (Após pagamento) Processar IA em background

---

## Arquivos Principais

| Arquivo | O que faz |
|---------|-----------|
| `index.html` | Frontend (form, hero, FAQ) |
| `script.js` | Inteligência do frontend (upload, submit) |
| `styles.css` | Design (responsive, rose/cream theme) |
| `server/index.js` | Servidor Express |
| `server/routes/pedido.js` | POST /api/pedido |
| `server/services/pipeline.js` | Orquestra IA (arte → vídeo → email) |
| `.env` | Variáveis de ambiente (nunca commitar!) |
| `package.json` | Dependências Node.js |

---

## Documentação Completa

- **`BACKEND.md`** — Setup detalhado, APIs, variáveis de ambiente
- **`DEPLOYMENT.md`** — Deploy no Vercel, checklist de configuração
- **`ARCHITECTURE.md`** — Diagramas, fluxos, integrações, banco de dados

---

## Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| CORS error | Verificar `FRONTEND_URL` em `.env` |
| 404 /api/pedido | Backend não está rodando na porta 3001 |
| Arquivo .env não funciona | Copiar de `.env.example`, não renomear |
| FFmpeg not found | `brew install ffmpeg` (Mac) ou `apt-get install ffmpeg` (Linux) |
| Supabase error | Verificar `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` |

---

## Próximas Etapas

1. Obter credenciais de APIs (OpenAI, ElevenLabs, Resend, AbacatePay, Supabase)
2. Preencher `.env`
3. Executar schema.sql no Supabase
4. Criar buckets no Supabase Storage
5. Testar localmente
6. Deploy no Vercel

---

## Referência Rápida — Estrutura

```
.
├── index.html              ← Frontend principal
├── styles.css              ← Design
├── script.js               ← Lógica do form
├── package.json            ← Dependências
├── .env                    ← Variáveis (NÃO commitar!)
├── .env.example            ← Template (commitar)
├── .gitignore              ← Ignora .env, node_modules, etc
├── QUICKSTART.md           ← Este arquivo
├── BACKEND.md              ← Docs do backend
├── DEPLOYMENT.md           ← Como deployar
├── ARCHITECTURE.md         ← Diagramas e fluxos
├── README.md               ← Sobre o produto
└── server/
    ├── index.js            ← Express principal
    ├── routes/
    │   ├── pedido.js       ← POST /api/pedido
    │   └── webhook.js      ← POST /api/webhook/abacatepay
    ├── services/
    │   ├── pedido.js
    │   ├── pagamento.js
    │   ├── storage.js
    │   ├── pipeline.js
    │   ├── imagem.js
    │   ├── video.js
    │   ├── tts.js
    │   └── email.js
    └── config/
        ├── supabase.js
        └── schema.sql
```

---

## Status do Projeto

✅ **Completo!**

- [x] Frontend landing page
- [x] Backend Express.js
- [x] Integração AbacatePay (pagamento)
- [x] Supabase (DB + Storage)
- [x] Geração de arte (GPT Image 2)
- [x] Geração de vídeo (FFmpeg)
- [x] TTS narração (ElevenLabs)
- [x] Envio de email (Resend)
- [x] Webhook de confirmação de pagamento
- [x] Pipeline completo de IA

Próximas melhorias: áudio mixado, dashboard de admin, mais opções de voz.

---

## Suporte

Perguntas? Ver:
- `BACKEND.md` — técnica detalhada
- `DEPLOYMENT.md` — deploy e troubleshooting
- `ARCHITECTURE.md` — como funciona tudo

Good luck! 🎁
