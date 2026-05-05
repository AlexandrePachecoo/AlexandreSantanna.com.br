import ffmpeg from 'fluent-ffmpeg';
import { supabase } from '../config/supabase.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configurar FFmpeg (em produção, usar binários do sistema)
// Em local, instalar: brew install ffmpeg (Mac) ou apt-get install ffmpeg (Linux)

export async function gerarVideo({ fotosUrls, arteUrl, nomeMae, trilha }) {
  try {
    const tempDir = path.join(__dirname, '..', 'temp', `video-${Date.now()}`);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Baixar fotos
    const fotosLocal = await Promise.all(
      fotosUrls.map((url, idx) => downloadFoto(url, tempDir, idx))
    );

    // Baixar arte gerada
    const arteLocal = await downloadFoto(arteUrl, tempDir, 'arte');

    // Criar lista de imagens para FFmpeg
    const durationPerFoto = 4; // segundos por foto
    const durationArte = 3; // segundos para arte final
    const transicao = 0.5; // segundos de transição

    // Construir comando FFmpeg com transições
    const outputPath = path.join(tempDir, 'video.mp4');
    const command = ffmpeg();

    // Adicionar fotos como input
    fotosLocal.forEach((foto, idx) => {
      command.input(foto);
    });

    // Adicionar arte como input final
    command.input(arteLocal);

    // Construir filtro complexo de vídeo com transições
    const filterComplex = construirFiltroTransicoes(
      fotosLocal.length + 1,
      durationPerFoto,
      durationArte,
      transicao
    );

    command
      .complexFilter(filterComplex, 'v')
      .videoCodec('libx264')
      .audioCodec('aac')
      .outputOptions([
        '-pix_fmt yuv420p',
        '-preset veryfast',
        '-crf 23', // qualidade: 0-51 (menor = melhor)
      ])
      .on('start', (cmdline) => {
        console.log('[VIDEO] FFmpeg command:', cmdline);
      })
      .on('error', (err) => {
        console.error('[VIDEO] Erro:', err);
      })
      .on('end', () => {
        console.log('[VIDEO] Vídeo gerado com sucesso');
      });

    // Render do vídeo (promise)
    await new Promise((resolve, reject) => {
      command
        .save(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', reject);
    });

    // Upload para Supabase
    const videoBuffer = fs.readFileSync(outputPath);
    const filename = `videos-pedidos/${nomeMae}-${Date.now()}.mp4`;

    const { error: uploadError } = await supabase.storage
      .from('videos')
      .upload(filename, videoBuffer, {
        contentType: 'video/mp4',
      });

    if (uploadError) {
      throw new Error(`Erro ao salvar vídeo: ${uploadError.message}`);
    }

    // Gerar URL pública
    const { data: publicUrl } = supabase.storage
      .from('videos')
      .getPublicUrl(filename);

    // Limpar arquivos temporários
    fs.rmSync(tempDir, { recursive: true });

    return publicUrl.publicUrl;
  } catch (err) {
    console.error('Erro ao gerar vídeo:', err);
    throw err;
  }
}

function construirFiltroTransicoes(numImagens, durFoto, durArte, durTransicao) {
  // Construir filtro de vídeo complexo com transições fade
  // Cada foto fica durFoto segundos, com transição de durTransicao
  // Arte fica durArte segundos

  const inputs = Array.from({ length: numImagens }, (_, i) => `[${i}]`);
  const fotoInputs = inputs.slice(0, -1);
  const arteInput = inputs[numImagens - 1];

  // Exemplo simplificado: concat com fade
  // Para produção, considerar usar ffmpeg-concat ou biblioteca similar
  const filter = `${inputs.join('')}concat=n=${numImagens}:v=1[v]`;

  return filter;
}

async function downloadFoto(url, tempDir, nomeArquivo) {
  const filename = path.join(tempDir, `${nomeArquivo}.jpg`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Erro ao fazer download: ${response.statusText}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(filename, buffer);
  return filename;
}
