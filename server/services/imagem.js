import OpenAI, { toFile } from 'openai';
import { downloadFoto, uploadArte } from './storage.js';

let openai = null;

function getOpenAI() {
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

const estilosPrompt = {
  'mosaico-classico': 'colagem em mosaico clássico, fotos organizadas em grade harmoniosa com molduras delicadas, toques florais entre as fotos, paleta rosa pastel, dourado e creme',
  'polaroid-scrapbook': 'colagem estilo scrapbook com fotos em formato polaroid sobreposto, fundo de papel envelhecido com flores secas e fitas, sensação de álbum afetivo de família',
  'coracao-floral': 'fotos compostas formando um grande coração, cercado por flores rosa e brancas em aquarela, tipografia delicada e romântica',
  'moldura-unica': 'as fotos integradas em uma única moldura artística com flores, tons de rosa e dourado, composição emocional de Dia das Mães',
  ia: 'colagem artística harmoniosa de Dia das Mães, combinando as fotos com elementos florais, tons rosa pastel e dourado',
};

export async function gerarArte({ pedido }) {
  const { id, nome_mae, idade, estilo, mensagem, fotos_urls } = pedido;
  const estiloDescricao = estilosPrompt[estilo] || estilosPrompt.ia;

  const MAX_FOTOS = 3;
  const fotosParaUsar = (fotos_urls || []).slice(0, MAX_FOTOS);
  const fotosFiles = await Promise.all(
    fotosParaUsar.map(async (path, i) => {
      const buffer = await downloadFoto(path);
      return toFile(buffer, `foto-${i + 1}.png`, { type: 'image/png' });
    })
  );

  if (fotosFiles.length === 0) {
    throw new Error('Nenhuma foto disponível para a colagem');
  }

  const prompt = `Crie uma arte comemorativa de Dia das Mães em estilo ${estiloDescricao}.
Componha as fotos enviadas (Imagem 1 até Imagem ${fotosFiles.length} são fotos da família) em uma colagem afetiva e emocional.
Inclua o nome "${nome_mae}"${idade ? ` (${idade} anos)` : ''} em tipografia elegante e a frase: "${mensagem || 'Feliz Dia das Mães'}".
Paleta: rosas suaves, dourado e creme. Composição harmoniosa, qualidade de presente impresso em alta resolução.
Não inclua nenhum outro texto além do nome e da frase.`;

  const client = getOpenAI();
  const response = await client.images.edit({
    model: 'gpt-image-2',
    image: fotosFiles,
    prompt,
    size: '1024x1024',
    quality: 'medium',
  });

  const item = response.data?.[0];
  if (!item) throw new Error('Modelo não retornou imagem');

  const buffer = item.b64_json
    ? Buffer.from(item.b64_json, 'base64')
    : Buffer.from(await (await fetch(item.url)).arrayBuffer());

  return await uploadArte(buffer, id);
}
