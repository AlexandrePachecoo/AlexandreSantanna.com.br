import QRCode from 'qrcode';

export const config = { maxDuration: 10 };

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const slug = (req.query?.slug || '').toString().trim();
  if (!slug || !/^[A-Za-z0-9_-]{4,64}$/.test(slug)) {
    return res.status(400).json({ error: 'slug inválido' });
  }

  const format = (req.query?.format || 'png').toLowerCase();
  if (format !== 'png' && format !== 'svg') {
    return res.status(400).json({ error: 'format deve ser png ou svg' });
  }

  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const base = process.env.FRONTEND_URL || `${proto}://${host}`;
  const cartaUrl = `${base}/c/${slug}`;

  const options = {
    margin: 2,
    width: 600,
    color: { dark: '#1d0f1a', light: '#ffffff' },
  };

  try {
    res.setHeader('Cache-Control', 'public, max-age=86400');
    if (format === 'svg') {
      const svg = await QRCode.toString(cartaUrl, { ...options, type: 'svg' });
      res.setHeader('Content-Type', 'image/svg+xml');
      return res.status(200).send(svg);
    }

    const buffer = await QRCode.toBuffer(cartaUrl, { ...options, type: 'png' });
    res.setHeader('Content-Type', 'image/png');
    return res.status(200).send(buffer);
  } catch (err) {
    console.error('Erro em /api/qrcode:', err);
    return res.status(500).json({ error: err.message });
  }
}
