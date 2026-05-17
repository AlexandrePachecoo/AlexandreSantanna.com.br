import axios from 'axios';

const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SEARCH_URL = 'https://api.spotify.com/v1/search';

let tokenCache = { value: null, expiresAt: 0 };

async function obterToken() {
  const now = Date.now();
  if (tokenCache.value && tokenCache.expiresAt > now + 30_000) {
    return tokenCache.value;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('SPOTIFY_CLIENT_ID e SPOTIFY_CLIENT_SECRET são obrigatórios');
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const params = new URLSearchParams({ grant_type: 'client_credentials' });

  const response = await axios.post(TOKEN_URL, params.toString(), {
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    timeout: 8000,
  });

  const access = response.data?.access_token;
  const expiresIn = response.data?.expires_in || 3600;
  if (!access) throw new Error('Spotify não retornou access_token');

  tokenCache = {
    value: access,
    expiresAt: now + expiresIn * 1000,
  };
  return access;
}

export async function buscarTracks(query, limit = 8) {
  if (!query || typeof query !== 'string' || !query.trim()) return [];

  const token = await obterToken();
  const response = await axios.get(SEARCH_URL, {
    params: { q: query.trim(), type: 'track', limit },
    headers: { Authorization: `Bearer ${token}` },
    timeout: 8000,
  });

  const items = response.data?.tracks?.items || [];
  return items.map((track) => {
    const albumImage = track.album?.images?.[1] || track.album?.images?.[0] || null;
    const artist = (track.artists || []).map((a) => a.name).join(', ');
    return {
      id: track.id,
      name: track.name,
      artist,
      album_art: albumImage?.url || null,
      preview_url: track.preview_url || null,
      embed_url: `https://open.spotify.com/embed/track/${track.id}`,
    };
  });
}
