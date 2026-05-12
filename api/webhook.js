import { validarWebhookSecret } from '../server/services/pagamento.js';
import { getCartaBySlug, getCartaByChargeId, updateCartaBySlug } from '../server/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido' });
  }

  if (!validarWebhookSecret(req)) {
    console.warn('[webhook] secret inválido');
    return res.status(401).json({ error: 'Não autorizado' });
  }

  const body = req.body || {};
  const event = body.event;
  const data = body.data || {};

  if (event !== 'charge.completed' && event !== 'charge.confirmed' && event !== 'billing.paid') {
    return res.status(200).json({ success: true, ignored: event });
  }

  try {
    const meta = data.metadata || {};
    const nestedMeta = meta.metadata || {};
    const slug = meta.carta_slug || nestedMeta.carta_slug;

    let carta = slug ? await getCartaBySlug(slug) : null;
    if (!carta && data.id) {
      carta = await getCartaByChargeId(data.id);
    }

    if (!carta) {
      console.error(`[webhook] carta não encontrada (metadata=${JSON.stringify(meta)}, charge=${data.id})`);
      return res.status(404).json({ error: 'Carta não encontrada' });
    }

    if (carta.status === 'publicada') {
      return res.status(200).json({ success: true, idempotent: true });
    }

    await updateCartaBySlug(carta.slug, {
      status: 'publicada',
      charge_id: data.id || carta.charge_id,
    });

    return res.status(200).json({ success: true, slug: carta.slug });
  } catch (err) {
    console.error('Erro em /api/webhook:', err);
    return res.status(500).json({ error: err.message });
  }
}
