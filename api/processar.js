import { getPedido, updatePedido } from '../server/db.js';

export const config = {
  maxDuration: 15,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const expected = process.env.PROCESSAR_SECRET;
  if (!expected || req.headers['x-secret'] !== expected) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  const id = req.query?.id;
  if (!id) {
    return res.status(400).json({ error: 'Parâmetro id obrigatório' });
  }

  try {
    const pedido = await getPedido(id);
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    if (pedido.status === 'entregue') {
      return res.status(200).json({ success: true, idempotent: true });
    }
    if (pedido.status === 'processando') {
      const ageMs = Date.now() - new Date(pedido.updated_at || 0).getTime();
      // Allow retry only after 150s — beyond the Supabase Edge Function timeout
      if (ageMs < 150_000) {
        return res.status(200).json({ success: true, idempotent: true });
      }
    }

    await updatePedido(id, { status: 'processando' });

    // Fire-and-forget: the Edge Function handles the long-running work (up to 150s)
    const supabaseUrl = process.env.SUPABASE_URL;
    fetch(`${supabaseUrl}/functions/v1/gerar-arte`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-secret': process.env.PROCESSAR_SECRET || '',
      },
      body: JSON.stringify({ pedidoId: id }),
    }).catch((err) => console.error('[processar->edge] err:', err.message));

    return res.status(200).json({ success: true, queued: true });
  } catch (err) {
    console.error(`[processar ${id}] erro:`, err.message);
    return res.status(500).json({ error: err.message });
  }
}
