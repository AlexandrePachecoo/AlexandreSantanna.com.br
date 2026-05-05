import OpenAI from 'openai';
import { supabase } from '../config/supabase.js';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const estilosPrompt = {
  aquarela: 'Estilo aquarela romântica com tons pastéis suaves, flores delicadas e textura aquosa. Cores dominantes: rosa claro, rosa pálido, creme e ouro.',
  polaroid: 'Estilo retrô polaroid com bordas brancas, textura envelhecida e sensação nostálgica de álbum de família. Cores vintage e ligeiramente desbotadas.',
  minimalista: 'Estilo moderno e minimalista com composição limpa, tipografia elegante, linhas simples e foco na mensagem. Paleta: branco, tons de rosa e ouro.',
  ia: 'Estilo artístico que combina elementos românticos com modernidade, harmonia visual equilibrada.',
};

export async function gerarArte({ nomeMae, idade, estilo, mensagem, fotosUrls }) {
  try {
    const estiloDescricao = estilosPrompt[estilo] || estilosPrompt.ia;

    // Construir prompt para a IA
    const prompt = `
Crie uma arte de presente de Dia das Mães altamente emocional e personalizada:

Destinatário: ${nomeMae}${idade ? ` (${idade} anos)` : ''}
Estilo visual: ${estiloDescricao}
Mensagem: "${mensagem}"

Requisitos:
1. Incluir o título: "Para ${nomeMae}, com amor ♥"
2. Incorporar a essência emocional da mensagem visual
3. Composição harmoniosa que sugira foto, família e amor
4. Cores quentes e reconfortantes
5. Dimensão ideal: 1080x1920px (vertical para mobile)
6. Arte deve parecer genuína e tocante, não genérica

A arte será impressa em alta resolução para emoldurar.
Crie uma imagem que würde fazer uma mãe chorar de emoção.
`;

    // Chamar GPT Image 2 (DALL-E 3) via OpenAI
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024', // DALL-E 3 suporta 1024x1024, 1792x1024, 1024x1792
      quality: 'hd',
      style: 'vivid',
    });

    if (!response.data || response.data.length === 0) {
      throw new Error('Nenhuma imagem foi gerada pela IA');
    }

    const imageUrl = response.data[0].url;

    // Baixar a imagem gerada
    const imageBuffer = await downloadImage(imageUrl);

    // Salvar no Supabase Storage
    const timestamp = Date.now();
    const filename = `arte-pedidos/${nomeMae}-${timestamp}.png`;

    const { error: uploadError } = await supabase.storage
      .from('arte')
      .upload(filename, imageBuffer, {
        contentType: 'image/png',
      });

    if (uploadError) {
      throw new Error(`Erro ao salvar arte: ${uploadError.message}`);
    }

    // Gerar URL pública
    const { data: publicUrl } = supabase.storage
      .from('arte')
      .getPublicUrl(filename);

    return publicUrl.publicUrl;
  } catch (err) {
    console.error('Erro ao gerar arte com GPT Image 2:', err);
    throw err;
  }
}

async function downloadImage(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Erro ao fazer download da imagem: ${response.statusText}`);
  }
  return Buffer.from(await response.arrayBuffer());
}
