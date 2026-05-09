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
  'colagem-revista': 'colagem editorial estilo revista, recortes de fotos sobrepostos com bordas irregulares, manchetes tipográficas variadas, fitas adesivas, marca-textos e elementos gráficos retrô, paleta vibrante com toques de rosa e dourado',
  'capa-revista': 'capa de revista de moda profissional, foto principal em destaque ocupando o fundo, logotipo grande no topo, manchetes laterais com chamadas, código de barras e data, tipografia elegante e contemporânea',
  album: 'página de álbum afetivo de família, fotos coladas em papel envelhecido com cantoneiras, anotações à mão, flores secas e fitas, sensação nostálgica e delicada',
  polaroid: 'composição de fotos no formato Polaroid, levemente sobrepostas e inclinadas, sombra suave sobre fundo claro de tecido ou madeira, com pequenas anotações feitas à mão na parte branca da Polaroid',
};

const tamanhos = {
  post: { size: '1024x1024', descricao: 'formato quadrado de post de Instagram (1:1)' },
  story: { size: '1024x1536', descricao: 'formato vertical de Story de Instagram (9:16)' },
};

export async function gerarArte({ pedido }) {
  const { id, nome_mae, idade, estilo, tamanho, fotos_urls } = pedido;
  const estiloDescricao = estilosPrompt[estilo] || estilosPrompt['colagem-revista'];
  const tamanhoConfig = tamanhos[tamanho] || tamanhos.post;

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

  const prompt = `Crie uma arte comemorativa de Dia das Mães no estilo ${estiloDescricao}, no ${tamanhoConfig.descricao}.
Componha as fotos enviadas (Imagem 1 até Imagem ${fotosFiles.length} são fotos da família) de forma afetiva e emocional.
Inclua apenas o nome "${nome_mae}"${idade ? ` (${idade} anos)` : ''} em tipografia elegante coerente com o estilo.
Não escreva nenhuma mensagem, frase ou texto adicional além do nome.`;

  const client = getOpenAI();
  const response = await client.images.edit({
    model: 'gpt-image-2',
    image: fotosFiles,
    prompt,
    size: tamanhoConfig.size,
    quality: 'medium',
  });

  const item = response.data?.[0];
  if (!item) throw new Error('Modelo não retornou imagem');

  const buffer = item.b64_json
    ? Buffer.from(item.b64_json, 'base64')
    : Buffer.from(await (await fetch(item.url)).arrayBuffer());

  return await uploadArte(buffer, id);
}
