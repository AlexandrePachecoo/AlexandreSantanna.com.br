import { getPedido } from '../server/db.js';

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
    const pedido = await getPedido(id);
    if (!pedido) {
      return res.status(404).json({ success: false, error: 'Pedido não encontrado' });
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
