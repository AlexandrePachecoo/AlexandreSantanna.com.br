# CLAUDE.md

Guia para o Claude Code trabalhar neste repositório.

## Visão geral

**specialDay** — plataforma de cartas virtuais emocionais, compartilháveis por link. Sem login. O usuário entra, escreve, personaliza, recebe link público + link secreto de edição, e compartilha.

Casos de uso: pedido de namoro, aniversário, carta para o futuro, pedido de desculpas, amizade, datas comemorativas.

## Stack

- **Next.js 15** App Router em JavaScript puro (sem TypeScript).
- **Tailwind CSS 3** + **shadcn/ui** (adaptado: componentes manuais usando Radix + CVA + tailwind-merge, sem o CLI TS-first).
- **Framer Motion** para todas as animações.
- **Supabase** (Postgres + Storage). Service role usado **somente no servidor** — nada de Supabase direto no client.
- **bcryptjs** para senhas; **nanoid** para slug/token.
- **sonner** para toasts; **lucide-react** para ícones.
- Deploy Vercel.

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencher SUPABASE_*
npm run dev
```

## Estrutura

```
src/
├── app/
│   ├── layout.js                      # fonts + metadata + Toaster
│   ├── page.js                        # landing
│   ├── globals.css                    # tokens, base, prose-letter
│   ├── create/page.js                 # form de criação
│   ├── c/[slug]/                      # viewer público (dinâmico)
│   │   ├── page.js                    # server: busca + roteia para gate/countdown/render
│   │   ├── LetterClient.jsx           # client wrapper para password gate
│   │   ├── not-found.js
│   │   └── loading.js
│   ├── edit/[token]/                  # editor sem login
│   │   ├── page.js
│   │   └── not-found.js
│   └── api/
│       ├── letters/route.js                       # POST criar carta
│       ├── letters/[slug]/unlock/route.js         # POST validar senha
│       ├── letters/edit/[token]/route.js          # GET + PUT
│       └── upload/route.js                        # POST signed upload URL
│
├── components/
│   ├── ui/             # button, input, textarea, card, dialog, switch, radio-group, badge, label
│   ├── animations/     # FadeIn, Reveal
│   ├── sections/       # Navbar, Hero, HowItWorks, Demo, Templates, FAQ, CTA, Footer
│   ├── forms/          # CreateLetterForm, EditLetterForm, ThemePicker, CoverUploader
│   ├── letter/         # LetterRenderer, EnvelopeOpen, PasswordGate, LockedCountdown, MusicPlayer, ThemeDecorations
│   └── shared/         # CopyButton, ShareButtons, SuccessScreen, LoadingState
│
├── services/
│   ├── supabase.js     # singleton service-role
│   ├── letters.js      # CRUD: createLetter, getLetterBySlug, getLetterByEditToken, updateLetterByEditToken, incrementViews
│   └── storage.js      # createCoverUploadUrl, getPublicUrl
│
├── lib/
│   ├── utils.js        # cn, absoluteUrl
│   ├── slug.js         # generateSlug, generateEditToken, slugify (com reserved set)
│   ├── password.js     # bcrypt wrappers
│   ├── validators.js   # validateLetterPayload + sanitizeText
│   └── ratelimit.js    # in-memory bucket por IP
│
├── hooks/              # useClipboard, useDebounce, useCountdown
├── utils/              # format (date, number, truncate)
└── constants/          # themes, templates, site
```

## Modelo de dados

Tabela **`letters`** (`supabase/migrations/0001_letters.sql`):

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | `gen_random_uuid()` |
| `slug` | text unique | público em `/c/:slug` (8 chars a-z0-9 ou custom) |
| `edit_token` | text unique | secreto, 24 chars nanoid — única forma de editar |
| `title`, `content` | text | obrigatórios |
| `sender_name`, `recipient_name` | text | opcionais |
| `theme` | text | id do catálogo em `constants/themes.js` |
| `cover_image`, `music_url` | text | opcionais |
| `visibility` | text | `public` ou `private` |
| `password_hash` | text | bcrypt; só presente se `visibility=private` |
| `unlock_date` | timestamptz | se setado, carta só abre depois |
| `views` | int | contador best-effort |
| `created_at`, `updated_at` | timestamptz | trigger automático |

Bucket de storage: **`letters`** (público). Path padrão: `covers/<nanoid>-<timestamp>.<ext>`.

## Fluxos

### Criação
1. Form em `/create` → `POST /api/letters` com payload validado/sanitizado.
2. Service gera `slug` (custom se válido, senão random) + `edit_token`, faz hash da senha (se houver), insere row.
3. Resposta: `{ slug, editToken }`. Front renderiza `SuccessScreen` com ambos os links.

### Viewer (`/c/:slug`)
1. Server Component busca a row.
2. Se `unlock_date` no futuro → `LockedCountdown`.
3. Se `visibility=private` → `LetterClient` (client) com `PasswordGate`, que chama `POST /api/letters/:slug/unlock`.
4. Caso contrário → `LetterRenderer` direto.
5. `incrementViews` é chamado fire-and-forget.

### Edição (`/edit/:token`)
1. Server Component busca por `edit_token`.
2. `EditLetterForm` (client) salva via `PUT /api/letters/edit/:token`.

### Upload de capa
1. Client comprime imagem (canvas, max 1600px, JPEG q=0.85).
2. `POST /api/upload` retorna `signedUrl` + `publicUrl`.
3. Client faz PUT direto no Supabase Storage.
4. `publicUrl` é gravada em `letters.cover_image`.

## Temas

`src/constants/themes.js` é um objeto `{ id: { name, emoji, decoration, vars } }`. `vars` vira CSS vars (`--letter-bg`, `--letter-surface`, `--letter-ink`, fontes...) aplicadas no `LetterRenderer`. `decoration` é consumido por `ThemeDecorations` (hearts, stars, sakura, confetti, paper, none).

**Para adicionar um tema novo**: adicione um entry em `THEMES`. Decoração nova exige um branch novo em `ThemeDecorations`.

## Segurança e abuso

- **Service role só no servidor** (`src/services/supabase.js`). Nunca expor `SUPABASE_SERVICE_ROLE_KEY` no client.
- **Sanitização** via `sanitizeText` remove tags perigosas e handlers `on*=`. Renderização usa `whitespace-pre-wrap`, sem `dangerouslySetInnerHTML`.
- **Rate limit** in-memory (`src/lib/ratelimit.js`): 6 cartas/min, 10 unlocks/min/slug, 20 edits/min, 20 uploads/min, todos por IP. Trocar por Upstash quando o tráfego crescer.
- **Brute force**: PasswordGate é protegido pelo rate limit acima.

## Convenções

- ESM apenas (`"type": "module"`). Sem `require`.
- Server Components por padrão. `'use client'` só quando há estado/efeitos.
- Imports com alias `@/` (configurado em `jsconfig.json`).
- Componentes pequenos. Forms são o único arquivo "grosso" — partidos em `Field` reutilizável.
- Tailwind com tokens em `:root` (HSL). Dark mode via classe `.dark` (preparado mas não exposto no UI ainda).

## Limites

- `LIMITS.title = 80`, `LIMITS.content = 5000`, `LIMITS.name = 60`, `LIMITS.password = 64`.
- Upload máx 8MB (validado client + server).

## Gotchas

- **`params` é Promise no Next 15** — sempre `const { slug } = await params`.
- **Toda página com dados do Supabase** marca `export const dynamic = 'force-dynamic'` e `revalidate = 0` para não cachear.
- **`incrementViews`** é fire-and-forget; race condition de contador é aceitável.
- **Token de edição é a única chave** — não há fluxo de recuperação. Avisar isso no `SuccessScreen` é crítico.
- **Bucket `letters` precisa ser público** para servir as capas sem signed URL. Se preferir privado, gerar signed URL no render.
