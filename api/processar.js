import { getPedido, updatePedido } from '../server/db.js';
import { gerarArte } from '../server/services/imagem.js';
import { apagarFotos } from '../server/services/storage.js';

export const config = {
  maxDuration: 60,
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

  let pedido;
  try {
    pedido = await getPedido(id);
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    if (pedido.status === 'entregue') {
      return res.status(200).json({ success: true, idempotent: true });
    }
    if (pedido.status === 'processando') {
      const ageMs = Date.now() - new Date(pedido.updated_at || 0).getTime();
      if (ageMs < 90_000) {
        return res.status(200).json({ success: true, idempotent: true });
      }
      // Stuck > 90s (likely Vercel timeout): fall through and retry
    }

    await updatePedido(id, { status: 'processando' });

    const LIMITE_MS = 55_000;
    const arteUrl = await Promise.race([
      gerarArte({ pedido }),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(Object.assign(new Error('timeout_geracao'), { retriable: true })),
          LIMITE_MS,
        ),
      ),
    ]);

    await updatePedido(id, { status: 'entregue', arte_url: arteUrl });

    apagarFotos(pedido.fotos_urls).catch(() => {});

    return res.status(200).json({ success: true, arteUrl });
  } catch (err) {
    console.error(`[processar ${id}] erro:`, err.message);
    if (pedido) {
      // On timeout reset to pago so the retry loop in status.js can pick it up again.
      // On any other error mark as erro so the user sees the error screen.
      const novoStatus = err.retriable ? 'pago' : 'erro';
      await updatePedido(id, {
        status: novoStatus,
        ...(novoStatus === 'erro' ? { erro_mensagem: err.message?.slice(0, 500) } : {}),
      }).catch(() => {});
    }
    return res.status(500).json({ error: err.message });
  }
}
