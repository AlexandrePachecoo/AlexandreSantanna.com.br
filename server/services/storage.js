import { supabase } from '../config/supabase.js';

const BUCKET_FOTOS = 'fotos-pedidos';
const BUCKET_ARTE = 'arte';

export async function uploadFotos(fotos, pedidoId) {
  const paths = [];

  for (let i = 0; i < fotos.length; i++) {
    const foto = fotos[i];
    const ext = (foto.filename || `foto-${i}.jpg`).split('.').pop().toLowerCase();
    const path = `${pedidoId}/foto-${i + 1}.${ext}`;

    const { error } = await supabase.storage
      .from(BUCKET_FOTOS)
      .upload(path, foto.buffer, {
        contentType: foto.mimeType || 'image/jpeg',
        upsert: false,
      });

    if (error) throw error;
    paths.push(path);
  }

  return paths;
}

async function withRetry(fn, { retries = 3, baseDelayMs = 300 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt === retries) break;
      const delay = baseDelayMs * 2 ** attempt;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastErr;
}

export async function criarUploadUrls(uploadId, files) {
  return Promise.all(
    files.map(async (f, i) => {
      const safeExt = (f.name || '').split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
      const ext = ['jpg', 'jpeg', 'png', 'webp'].includes(safeExt) ? safeExt : 'jpg';
      const path = `uploads/${uploadId}/foto-${i + 1}.${ext}`;

      const data = await withRetry(async () => {
        const { data, error } = await supabase.storage
          .from(BUCKET_FOTOS)
          .createSignedUploadUrl(path);
        if (error) throw error;
        return data;
      });

      return { signedUrl: data.signedUrl, path, token: data.token };
    }),
  );
}

export async function downloadFoto(path) {
  const { data, error } = await supabase.storage
    .from(BUCKET_FOTOS)
    .download(path);

  if (error) throw error;
  return Buffer.from(await data.arrayBuffer());
}

export async function uploadArte(buffer, pedidoId) {
  const path = `${pedidoId}/arte.png`;

  const { error } = await supabase.storage
    .from(BUCKET_ARTE)
    .upload(path, buffer, {
      contentType: 'image/png',
      upsert: true,
    });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET_ARTE).getPublicUrl(path);
  return data.publicUrl;
}

export async function apagarFotos(paths) {
  if (!paths?.length) return;
  const { error } = await supabase.storage.from(BUCKET_FOTOS).remove(paths);
  if (error) console.error('[storage] falha ao apagar fotos:', error);
}
