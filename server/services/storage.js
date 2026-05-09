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
