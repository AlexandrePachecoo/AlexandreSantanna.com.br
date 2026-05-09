import { getPedido, updatePedido } from '../server/db.js';
import { consultarCobranca } from '../server/services/pagamento.js';

export const config = { maxDuration: 15 };

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const id = req.query?.id;
  if (!id) {
    return res.status(400).json({ success: false, error: 'Parâmetro id obrigatório' });
  }

  try {
    let pedido = await getPedido(id);
    if (!pedido) {
      return res.status(404).json({ success: false, error: 'Pedido não encontrado' });
    }

    if (pedido.status === 'pendente_pagamento' && pedido.charge_id) {
      const cobranca = await consultarCobranca(pedido.charge_id);
      if (cobranca?.isPaid) {
        await updatePedido(id, { status: 'pago' });
        pedido = { ...pedido, status: 'pago' };
        dispararProcessar(req, id);
      }
    }

    if (pedido.status === 'pago' && !pedido.arte_url) {
      const updatedAt = pedido.updated_at ? new Date(pedido.updated_at).getTime() : 0;
      const ageMs = Date.now() - updatedAt;
      if (ageMs > 10_000) {
        await updatePedido(id, { status: 'pago' });
        dispararProcessar(req, id);
      }
    }

    if (pedido.status === 'processando') {
      const updatedAt = pedido.updated_at ? new Date(pedido.updated_at).getTime() : 0;
      const ageMs = Date.now() - updatedAt;
      // Only retry after 150s — beyond the Supabase Edge Function timeout
      if (ageMs > 150_000) {
        dispararProcessar(req, id);
      }
    }

    return res.status(200).json({
      success: true,
      status: pedido.status,
      arteUrl: pedido.arte_url || null,
      erro: pedido.erro_mensagem || null,
    });
  } catch (err) {
    console.error('Erro em /api/status:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

function dispararProcessar(req, pedidoId) {
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const url = `${proto}://${host}/api/processar?id=${encodeURIComponent(pedidoId)}`;
  fetch(url, {
    method: 'POST',
    headers: { 'x-secret': process.env.PROCESSAR_SECRET || '' },
  }).catch((err) => console.error('[status->processar] err:', err.message));
}
