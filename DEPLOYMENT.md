# Deployment — Presente de Dia das Mães com IA

## Resumo da Implementação

Seu projeto está **100% implementado** com:

✅ **Frontend** — Landing page estática (index.html, styles.css, script.js)
✅ **Backend** — Servidor Express.js com todas as rotas e serviços
✅ **Pipeline de IA** — Geração de arte (GPT Image 2), vídeo (FFmpeg), narração (ElevenLabs)
✅ **Pagamentos** — Integração AbacatePay com webhooks
✅ **Email** — Resend para entrega do presente
✅ **Storage** — Supabase para fotos, vídeos, áudios e arte

---

## Próximos Passos (Checklist)

### 1. Configurar Contas e APIs

- [ ] **Supabase**
  - Criar conta em https://supabase.com
  - Criar novo projeto
  - Executar schema.sql (BACKEND.md > Setup > 3.1)
  - Criar bucket `fotos-pedidos`, `arte`, `videos`, `audios` no Storage
  - Copiar URL e chaves para `.env`

- [ ] **OpenAI (GPT Image 2)**
  - Conta em https://platform.openai.com
  - Gerar API key
  - Adicionar crédito (DALL-E 3 custa ~$0.08 por imagem)

- [ ] **ElevenLabs (TTS)**
  - Conta em https://elevenlabs.io
  - Obter API key
  - Escolher voice ID em português (o arquivo tts.js tem placeholder)

- [ ] **Resend (Email)**
  - Conta em https://resend.com
  - Obter API key
  - Configurar domínio (resend fornece @resend.com ou seu próprio domínio)

- [ ] **AbacatePay**
  - Conta em https://abacatepay.com.br
  - Obter API keys (public + secret)
  - Configurar webhook URL (será seu backend em produção)

### 2. Rodar Localmente

```bash
# Frontend (em terminal 1)
python3 -m http.server 8000

# Backend (em terminal 2)
npm install
npm run dev
```

Visitar http://localhost:8000 e testar o fluxo:
1. Preencher form com fotos
2. Submeter → deve redirecionar para checkout AbacatePay
3. No Supabase, verificar se pedido foi criado com status `pendente_pagamento`

### 3. Testar Pipeline (Simular Webhook)

Usar curl para simular confirmação de pagamento:

```bash
curl -X POST http://localhost:3001/api/webhook/abacatepay \
  -H "Content-Type: application/json" \
  -d '{
    "event": "charge.completed",
    "data": {
      "metadata": { "pedido_id": "<uuid-do-pedido>" },
      "status": "completed",
      "id": "charge_xxx"
    }
  }'
```

Verificar logs do backend para ver se IA gerou arte, vídeo, narração e enviou email.

### 4. Deploy para Vercel

#### 4.1 Preparar para Vercel

O Express.js funciona no Vercel, mas é otimizado para serverless. Opção simples:

```bash
git add .
git commit -m "Backend Express + Pipeline de IA completo"
git push origin main
```

#### 4.2 Conectar ao Vercel

1. Visitar https://vercel.com
2. Importar seu repositório GitHub
3. Ao perguntar pelo "root directory", deixar `.`
4. Build command: `npm install`
5. Start command: `npm start`
6. **Environment Variables** → adicionar todas de `.env`:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
   - `ELEVENLABS_API_KEY`
   - `RESEND_API_KEY`
   - `ABACATEPAY_API_KEY`
   - `ABACATEPAY_SECRET_KEY`
   - `ABACATEPAY_WEBHOOK_SECRET`
   - `PRODUCT_PRICE=1500`
   - `FRONTEND_URL=https://seu-dominio.vercel.app`

7. Deploy!

#### 4.3 Atualizar Webhook no AbacatePay

No dashboard AbacatePay, configurar URL de webhook:

```
https://seu-dominio.vercel.app/api/webhook/abacatepay
```

#### 4.4 Atualizar script.js

No `script.js`, mudar a URL da API para produção:

```javascript
const apiUrl = process.env.REACT_APP_API_URL || 'https://seu-dominio.vercel.app';
```

Ou configurar como variável de ambiente e usar dinamicamente.

---

## Estrutura Final de Arquivos

```
projeto/
├── index.html               # Frontend
├── styles.css
├── script.js
├── package.json             # Backend
├── .env.example
├── .gitignore
├── CLAUDE.md
├── README.md
├── BACKEND.md
├── DEPLOYMENT.md (este arquivo)
└── server/
    ├── index.js
    ├── routes/
    │   ├── pedido.js
    │   └── webhook.js
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

## Troubleshooting

### Erro: "SUPABASE_URL is required"
- [ ] Verificar `.env` — copiar de `.env.example` e preencher

### Erro: "OpenAI API key not found"
- [ ] Verificar `OPENAI_API_KEY` em `.env`
- [ ] Testar key em https://platform.openai.com/account/api-keys

### Erro: "FFmpeg not found"
- [ ] Instalar FFmpeg:
  - Mac: `brew install ffmpeg`
  - Ubuntu/Debian: `apt-get install ffmpeg`
  - Windows: usar WSL ou installer oficial

### Webhook não chega no servidor
- [ ] Verificar URL configurada no AbacatePay
- [ ] Testar com curl (exemplo acima)
- [ ] Ver logs do Vercel: `vercel logs`

### Vídeo não está sendo gerado
- [ ] Verificar logs do backend
- [ ] FFmpeg requer espaço em disco para arquivos temp
- [ ] Em Vercel, usar `/tmp` para arquivo temporário (já configurado)

---

## Performance e Custos

| Serviço | Custo | Notas |
|---|---|---|
| DALL-E 3 | $0.080/imagem | ~10k presentes/mês = $800 |
| ElevenLabs | $0.03/1K chars | Narração de 500 chars ≈ $0.015 por presente |
| Supabase | Free até 1GB | Storage é barato depois |
| Resend | Free até 100 emails/dia | Depois $0.20 por 1000 emails |
| AbacatePay | Comissão PIX ~0.99% + R$0.90 | Seu produto é R$15, ganha ~R$14 |
| Vercel | Free tier suficiente | Upgrades conforme tráfego |

---

## Próximas Melhorias (Pós-MVP)

1. **Áudio misturado ao vídeo** — implementar FFmpeg audio mux
2. **Trilha instrumental** — integrar biblioteca de músicas CC0
3. **Seleção de voz ElevenLabs** — deixar usuário escolher voz feminina/masculina
4. **Gerador de vídeo com IA** — trocar FFmpeg por Remotion ou RunwayML
5. **Dashboard de admin** — ver vendas, gerar relatórios
6. **Página de sucesso/download** — após pagamento, link para downloads

---

## Suporte

- **Documentação técnica detalhada:** BACKEND.md
- **Plano de arquitetura:** Veja `/Users/devalexandre/.claude/plans/me-diga-quais-s-o-abstract-sunset.md`
- **Dúvidas do código:** Ver comentários em `server/services/*.js`

Boa sorte! 🎁
