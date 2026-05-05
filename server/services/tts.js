import axios from 'axios';
import { supabase } from '../config/supabase.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const elevenLabsApi = axios.create({
  baseURL: 'https://api.elevenlabs.io/v1',
  headers: {
    'xi-api-key': process.env.ELEVENLABS_API_KEY,
  },
});

// VoiceID da ElevenLabs — escolher voz feminina em português
const VOICE_ID = 'IZSifMMhbKnLn0FZ'; // Portuguese Female voice (ajustar conforme disponível)

export async function gerarNarracao({ mensagem, nomeMae, email }) {
  try {
    // Preparar texto para narração
    const textoDaNarracao = `
Prezada ${nomeMae},
${mensagem}
Com amor, do seu filho ou filha.
`.trim();

    console.log('[TTS] Gerando narração com ElevenLabs...');

    // Chamar ElevenLabs API para gerar áudio
    const response = await elevenLabsApi.post(
      `/text-to-speech/${VOICE_ID}`,
      {
        text: textoDaNarracao,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      },
      {
        responseType: 'arraybuffer',
      }
    );

    const audioBuffer = Buffer.from(response.data);

    // Salvar no Supabase Storage
    const filename = `audios-pedidos/${email}-${Date.now()}.mp3`;

    const { error: uploadError } = await supabase.storage
      .from('audios')
      .upload(filename, audioBuffer, {
        contentType: 'audio/mpeg',
      });

    if (uploadError) {
      throw new Error(`Erro ao salvar áudio: ${uploadError.message}`);
    }

    // Gerar URL pública
    const { data: publicUrl } = supabase.storage
      .from('audios')
      .getPublicUrl(filename);

    return publicUrl.publicUrl;
  } catch (err) {
    console.error('Erro ao gerar narração com TTS:', err.response?.data || err.message);
    throw err;
  }
}

export async function usarMusicalocator(trilha = 'instrumental') {
  // Placeholder para música instrumental
  // Em produção, usar serviço como:
  // - Epidemic Sound (API)
  // - AudioJungle (API)
  // - Ou biblioteca de CC0 music

  console.log(`[MUSIC] Usando trilha instrumental: ${trilha}`);
  return null; // Implementar depois
}
