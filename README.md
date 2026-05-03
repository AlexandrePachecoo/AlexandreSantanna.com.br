# Presente de Dia das Mães com IA · WLG Distribuidora

Landing page + backend que usa a API **`gpt-image-1`** da OpenAI para gerar uma arte personalizada de Dia das Mães a partir das fotos e da mensagem do usuário.

## Como funciona

1. O usuário sobe até **10 fotos** (drag-and-drop com preview).
2. Preenche nome, idade, estilo da arte e mensagem.
3. O backend chama `openai.images.edit` com o modelo `gpt-image-1`, passando as fotos como referência e um prompt construído a partir do formulário.
4. A imagem (PNG base64) volta para o front e aparece na tela com botão de download.

> Próximos passos: encadear geração de vídeo + narração TTS e cobrança.

## Stack

- **Front:** HTML/CSS/JS estáticos (sem build).
- **Back:** Node 20+, Express, Multer e o SDK oficial `openai`.

## Setup

```bash
# 1. instalar dependências
npm install

# 2. configurar a chave
cp .env.example .env
# edite .env e coloque sua OPENAI_API_KEY

# 3. rodar
npm run dev
# abra http://localhost:3000
```

### Variáveis de ambiente

| Variável               | Default        | Descrição                                       |
|------------------------|----------------|-------------------------------------------------|
| `OPENAI_API_KEY`       | —              | **Obrigatório.** https://platform.openai.com    |
| `OPENAI_IMAGE_MODEL`   | `gpt-image-1`  | Permite trocar para outro modelo de imagem.     |
| `PORT`                 | `3000`         | Porta do servidor.                              |

## Endpoint

### `POST /api/generate`

`multipart/form-data` com:

- `nome` (obrigatório) — nome da mãe
- `idade` — número
- `estilo` — `aquarela` · `polaroid` · `minimalista` · `ia`
- `mensagem` — texto até 500 caracteres
- `trilha` — `narracao` ou `musica` (usado pelo passo de vídeo, ainda não conectado)
- `fotos` — até 10 imagens (`image/*`)

**Resposta 200:**

```json
{
  "image": "data:image/png;base64,...",
  "prompt": "...",
  "model": "gpt-image-1",
  "usedReferences": 4
}
```

## Estrutura

```
.
├── index.html       # landing
├── styles.css       # tema rosê/creme + estados de loading/erro/resultado
├── script.js        # upload, validação, chamada ao /api/generate
├── server.js        # Express + integração com gpt-image-1
├── package.json
├── .env.example
└── .gitignore
```

## Contato

**WLG Distribuidora**
Av. Nações Unidas, 369 · Bairro Rincão · Novo Hamburgo · CEP 93310-435
Telefone: 51 3065-6655
Site: [www.wlgdistribuidora.com.br](https://www.wlgdistribuidora.com.br)
