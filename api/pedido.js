import Busboy from 'busboy';
import { criarPedido } from '../server/services/pedido.js';

export const config = {
  api: { bodyParser: false },
};

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const bb = Busboy({
      headers: req.headers,
      limits: { files: MAX_FILES, fileSize: MAX_FILE_SIZE },
    });
    const fields = {};
    const files = [];
    let fileError = null;

    bb.on('field', (name, value) => {
      fields[name] = value;
    });

    bb.on('file', (name, stream, info) => {
      if (name !== 'fotos' || !info.mimeType?.startsWith('image/')) {
        stream.resume();
        return;
      }
      const chunks = [];
      stream.on('data', (c) => chunks.push(c));
      stream.on('limit', () => {
        fileError = new Error(`Arquivo ${info.filename} excede ${MAX_FILE_SIZE} bytes`);
      });
      stream.on('end', () => {
        if (!fileError) {
          files.push({
            filename: info.filename,
            mimeType: info.mimeType,
            buffer: Buffer.concat(chunks),
          });
        }
      });
    });

    bb.on('error', reject);
    bb.on('close', () => {
      if (fileError) reject(fileError);
      else resolve({ fields, files });
    });

    req.pipe(bb);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { fields, files } = await parseMultipart(req);
    const nomeMae = fields['nome-mae'];
    const email = fields.email;

    if (!nomeMae || !email || files.length === 0) {
      return res.status(400).json({
        error: 'Campos obrigatórios: nome-mae, email e pelo menos uma foto',
      });
    }

    const result = await criarPedido({
      nomeMae,
      idade: parseInt(fields.idade) || null,
      estilo: fields.estilo || 'ia',
      mensagem: fields.mensagem || '',
      trilha: fields.trilha || 'narracao',
      email,
      fotos: files,
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
