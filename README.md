# Presente de Dia das Mães com IA · WLG Distribuidora

Landing page para o projeto da WLG Distribuidora que usa Inteligência Artificial para criar um presente único de Dia das Mães.

## Como funciona o produto

1. O usuário sobe até **10 fotos**.
2. Escreve um texto ou preenche os campos (nome, idade, mensagem).
3. A IA gera **uma arte com título** e composição harmoniosa.
4. A IA gera um **vídeo** com as imagens.
5. A IA **narra a mensagem** ou aplica uma trilha instrumental.

## Stack

Site estático leve, sem dependências de build:

- `index.html` · estrutura
- `styles.css` · tema Dia das Mães (paleta rosê / creme), responsivo
- `script.js` · contador regressivo, upload com drag-and-drop, formulário, animações

## Rodar localmente

Basta abrir o `index.html` no navegador, ou servir com qualquer HTTP server estático:

```bash
python3 -m http.server 8000
# acesse http://localhost:8000
```

## Próximos passos

- Conectar o formulário a um endpoint que dispare o pipeline da IA.
- Integrar geração de imagem (ex.: GPT image / DALL·E) para a arte com título.
- Integrar geração de vídeo + narração TTS.
- Pagamento e envio do presente final por e-mail.

## Contato

**WLG Distribuidora**
Av. Nações Unidas, 369 · Bairro Rincão · Novo Hamburgo · CEP 93310-435
Telefone: 51 3065-6655
Site: [www.wlgdistribuidora.com.br](https://www.wlgdistribuidora.com.br)
