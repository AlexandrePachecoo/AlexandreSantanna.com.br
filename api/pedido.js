import { criarPedido } from '../server/services/pedido.js';

const MAX_FILES = 5;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const body = req.body || {};
    const nomeMae = body['nome-mae'] || body.nomeMae;
    const email = body.email;
    const nomeCliente = body['seu-nome'] || body.nomeCliente;
    const fotosPaths = Array.isArray(body.fotosPaths) ? body.fotosPaths : [];

    if (!nomeMae || !email || !nomeCliente || fotosPaths.length === 0) {
      return res.status(400).json({
        error: 'Campos obrigatórios: nome-mae, seu-nome, email e pelo menos uma foto',
      });
    }
    if (fotosPaths.length > MAX_FILES) {
      return res.status(400).json({ error: `Máximo de ${MAX_FILES} fotos` });
    }
    if (!fotosPaths.every(p => typeof p === 'string' && p.startsWith('uploads/'))) {
      return res.status(400).json({ error: 'Caminhos de foto inválidos' });
    }

    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const frontendUrl = process.env.FRONTEND_URL || `${proto}://${host}`;

    const result = await criarPedido({
      nomeMae,
      idade: parseInt(body.idade) || null,
      estilo: body.estilo || 'colagem-revista',
      tamanho: body.tamanho || 'post',
      email,
      fotosPaths,
      nomeCliente,
      frontendUrl,
    });

    return res.status(200).json({
      success: true,
      checkoutUrl: result.checkoutUrl,
      pedidoId: result.pedidoId,
    });
  } catch (err) {
    console.error('Erro em /api/pedido:', err);
    return res.status(500).json({
      error: err.message || 'Erro interno do servidor',
    });
  }
}
