import { validarWebhookSecret } from '../server/services/pagamento.js';
import { getPedido, updatePedido } from '../server/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido' });
  }

  if (!validarWebhookSecret(req.query)) {
    console.warn('[webhook] secret inválido');
    return res.status(401).json({ error: 'Não autorizado' });
  }

  const body = req.body || {};
  const event = body.event;
  const data = body.data || {};
  const pedidoId = data.metadata?.pedido_id;

  if (!pedidoId) {
    return res.status(400).json({ error: 'pedido_id ausente no metadata' });
  }

  if (event !== 'charge.completed' && event !== 'charge.confirmed' && event !== 'billing.paid') {
    return res.status(200).json({ success: true, ignored: event });
  }

  try {
    const pedido = await getPedido(pedidoId);
    if (!pedido) {
      console.error(`[webhook] pedido ${pedidoId} não encontrado`);
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    if (pedido.status === 'entregue' || pedido.status === 'processando') {
      return res.status(200).json({ success: true, idempotent: true });
    }

    await updatePedido(pedidoId, {
      status: 'pago',
      charge_id: data.id || pedido.charge_id,
    });

    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const processarUrl = `${proto}://${host}/api/processar?id=${encodeURIComponent(pedidoId)}`;

    fetch(processarUrl, {
      method: 'POST',
      headers: { 'x-secret': process.env.PROCESSAR_SECRET || '' },
    }).catch((err) => console.error('[webhook] falha ao disparar processar:', err));

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Erro em /api/webhook:', err);
    return res.status(500).json({ error: err.message });
  }
}
