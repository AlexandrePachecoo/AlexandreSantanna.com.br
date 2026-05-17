import { randomBytes } from 'crypto';
import { criarCarta as dbCriarCarta, updateCartaBySlug } from '../db.js';
import { criarCobranca } from './pagamento.js';

function gerarSlug() {
  return randomBytes(6).toString('base64url');
}

export async function criarCarta({
  nomeRemetente,
  nomeDestinatario,
  idade,
  texto,
  email,
  fotosPaths,
  spotifyTrackId,
  spotifyTrackName,
  spotifyArtist,
  spotifyAlbumArt,
  frontendUrl,
}) {
  const slug = gerarSlug();

  const carta = await dbCriarCarta({
    slug,
    email,
    nome_remetente: nomeRemetente,
    nome_destinatario: nomeDestinatario,
    idade,
    texto,
    fotos_paths: fotosPaths,
    spotify_track_id: spotifyTrackId,
    spotify_track_name: spotifyTrackName,
    spotify_artist: spotifyArtist,
    spotify_album_art: spotifyAlbumArt,
  });

  const bypassPayment = ['1', 'true', 'yes'].includes(
    String(process.env.BYPASS_PAYMENT || '').toLowerCase()
  );

  if (bypassPayment) {
    await updateCartaBySlug(slug, { status: 'publicada' });
    return {
      slug,
      cartaId: carta.id,
      checkoutUrl: `${frontendUrl}/sucesso.html?slug=${slug}`,
    };
  }

  const { checkoutUrl, chargeId } = await criarCobranca({
    pedidoId: carta.id,
    metadata: { carta_slug: slug, carta_id: carta.id },
    email,
    nomeCliente: nomeRemetente,
    valor: parseInt(process.env.PRODUCT_PRICE) || 1500,
    frontendUrl,
    completionPath: `/sucesso.html?slug=${slug}`,
  });

  await updateCartaBySlug(slug, { charge_id: chargeId });

  return { slug, cartaId: carta.id, checkoutUrl };
}
