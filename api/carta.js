import { criarCarta } from '../server/services/carta.js';

const MAX_FILES = 10;
const MAX_TEXTO = 2000;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const body = req.body || {};
    const nomeDestinatario = body['nome-destinatario'] || body.nomeDestinatario;
    const nomeRemetente = body['nome-remetente'] || body.nomeRemetente;
    const email = body.email;
    const texto = (body.texto || '').toString();
    const fotosPaths = Array.isArray(body.fotosPaths) ? body.fotosPaths : [];
    const idade = body.idade ? parseInt(body.idade) : null;

    if (!nomeDestinatario || !nomeRemetente || !email || !texto.trim()) {
      return res.status(400).json({
        error: 'Campos obrigatórios: nome-destinatario, nome-remetente, email e texto',
      });
    }
    if (texto.length > MAX_TEXTO) {
      return res.status(400).json({ error: `Texto excede ${MAX_TEXTO} caracteres` });
    }
    if (fotosPaths.length === 0) {
      return res.status(400).json({ error: 'Envie pelo menos uma foto' });
    }
    if (fotosPaths.length > MAX_FILES) {
      return res.status(400).json({ error: `Máximo de ${MAX_FILES} fotos` });
    }
    if (!fotosPaths.every((p) => typeof p === 'string' && p.startsWith('uploads/'))) {
      return res.status(400).json({ error: 'Caminhos de foto inválidos' });
    }

    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const frontendUrl = process.env.FRONTEND_URL || `${proto}://${host}`;

    const result = await criarCarta({
      nomeRemetente,
      nomeDestinatario,
      idade,
      texto: texto.trim(),
      email,
      fotosPaths,
      spotifyTrackId: body.spotify_track_id || null,
      spotifyTrackName: body.spotify_track_name || null,
      spotifyArtist: body.spotify_artist || null,
      spotifyAlbumArt: body.spotify_album_art || null,
      frontendUrl,
    });

    return res.status(200).json({
      success: true,
      checkoutUrl: result.checkoutUrl,
      slug: result.slug,
      cartaId: result.cartaId,
    });
  } catch (err) {
    console.error('Erro em /api/carta:', {
      message: err?.message,
      code: err?.code,
      details: err?.details,
      hint: err?.hint,
      stack: err?.stack,
    });
    return res.status(500).json({
      error: err.message || 'Erro interno do servidor',
    });
  }
}
