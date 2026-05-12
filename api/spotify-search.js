import { buscarTracks } from '../server/services/spotify.js';

export const config = { maxDuration: 15 };

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const q = (req.query?.q || '').toString().trim();
  if (!q) {
    return res.status(200).json({ success: true, tracks: [] });
  }

  res.setHeader('Cache-Control', 'public, max-age=60');

  try {
    const tracks = await buscarTracks(q, 8);
    return res.status(200).json({ success: true, tracks });
  } catch (err) {
    console.error('Erro em /api/spotify-search:', err.response?.data || err.message);
    return res.status(500).json({ success: false, error: err.message || 'Erro ao buscar no Spotify' });
  }
}
