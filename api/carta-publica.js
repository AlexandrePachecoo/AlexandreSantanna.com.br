import { getCartaBySlug } from '../server/db.js';
import { supabase } from '../server/config/supabase.js';

const BUCKET_FOTOS = 'fotos-pedidos';
const SIGNED_URL_TTL = 3600;

export const config = { maxDuration: 15 };

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const slug = req.query?.slug;
  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ success: false, error: 'Parâmetro slug obrigatório' });
  }

  res.setHeader('Cache-Control', 'no-store');

  try {
    const carta = await getCartaBySlug(slug);
    if (!carta) {
      return res.status(404).json({ success: false, error: 'Carta não encontrada' });
    }

    const statusOnly = req.query?.statusOnly === '1';
    if (statusOnly) {
      return res.status(200).json({ success: true, status: carta.status });
    }

    if (carta.status !== 'publicada') {
      return res.status(200).json({ success: true, status: carta.status });
    }

    const fotos = await Promise.all(
      (carta.fotos_paths || []).map(async (path) => {
        const { data, error } = await supabase.storage
          .from(BUCKET_FOTOS)
          .createSignedUrl(path, SIGNED_URL_TTL);
        if (error) {
          console.error('[carta-publica] signed url erro:', error.message, path);
          return null;
        }
        return data?.signedUrl || null;
      })
    );

    return res.status(200).json({
      success: true,
      status: carta.status,
      carta: {
        slug: carta.slug,
        nome_remetente: carta.nome_remetente,
        nome_destinatario: carta.nome_destinatario,
        idade: carta.idade,
        texto: carta.texto,
        fotos: fotos.filter(Boolean),
        spotify: carta.spotify_track_id
          ? {
              id: carta.spotify_track_id,
              name: carta.spotify_track_name,
              artist: carta.spotify_artist,
              album_art: carta.spotify_album_art,
              embed_url: `https://open.spotify.com/embed/track/${carta.spotify_track_id}`,
            }
          : null,
        created_at: carta.created_at,
      },
    });
  } catch (err) {
    console.error('Erro em /api/carta-publica:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
