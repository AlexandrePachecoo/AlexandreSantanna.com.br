# specialDay

> Transforme sentimentos em algo inesquecível.

Plataforma para criar cartinhas virtuais emocionais e compartilhá-las por link. Sem cadastro. Pensada para momentos que precisam ser ditos: pedido de namoro, aniversário, carta para o futuro, pedido de desculpas, amizade.

## Stack

Next.js 15 (App Router, JS) · Tailwind · shadcn/ui (adaptado JS) · Framer Motion · Supabase (DB + Storage) · Vercel.

## Setup

```bash
npm install
cp .env.example .env.local
# preencha SUPABASE_* (URL + service role) e NEXT_PUBLIC_SITE_URL

# Subir o schema no Supabase:
# - rode supabase/migrations/0001_letters.sql
# - crie o bucket `letters` como PÚBLICO no Storage

npm run dev
```

Abre em `http://localhost:3000`.

## Variáveis de ambiente

```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx
SUPABASE_STORAGE_BUCKET=letters
```

## Rotas

| Rota | Função |
|---|---|
| `/` | Landing page |
| `/create` | Criar carta (suporta `?template=<id>`) |
| `/c/[slug]` | Viewer público (com password gate + countdown) |
| `/edit/[token]` | Editor sem login |
| `/api/letters` (POST) | Cria carta |
| `/api/letters/[slug]/unlock` (POST) | Valida senha de carta privada |
| `/api/letters/edit/[token]` (GET/PUT) | Lê/atualiza via token de edição |
| `/api/upload` (POST) | Gera signed upload URL para capa |

## Próximos passos

- Painel anônimo via cookie pra listar cartas criadas no device
- Email opcional (não-obrigatório) pra recuperar link de edição
- Métricas anônimas de "abertura"
- Modo dark global
- Mais temas (anos 90, polaroid, neon, christmas)
- Templates dinâmicos com prompts de IA

Veja `CLAUDE.md` para detalhes técnicos.
