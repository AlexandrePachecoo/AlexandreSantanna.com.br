import { supabase } from '../config/supabase.js';

export async function uploadFotos(fotos, email) {
  try {
    const fotosUrls = [];
    const timestamp = Date.now();

    for (let i = 0; i < fotos.length; i++) {
      const file = fotos[i];
      const ext = file.originalname.split('.').pop();
      const filename = `${email}/${timestamp}-foto-${i + 1}.${ext}`;

      // Upload para Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('fotos-pedidos')
        .upload(filename, file.buffer, {
          contentType: file.mimetype,
        });

      if (uploadError) {
        throw new Error(`Erro ao fazer upload de foto: ${uploadError.message}`);
      }

      // Gerar URL pública
      const { data: publicUrl } = supabase.storage
        .from('fotos-pedidos')
        .getPublicUrl(filename);

      fotosUrls.push(publicUrl.publicUrl);
    }

    return fotosUrls;
  } catch (err) {
    console.error('Erro ao fazer upload de fotos:', err);
    throw err;
  }
}
