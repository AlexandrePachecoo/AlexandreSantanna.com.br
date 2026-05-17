import { randomUUID } from 'crypto';
import { criarUploadUrls } from '../server/services/storage.js';

const MAX_FILES = 10;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const body = req.body || {};
    const files = Array.isArray(body.files) ? body.files : [];

    if (files.length === 0) {
      return res.status(400).json({ error: 'Envie pelo menos uma foto' });
    }
    if (files.length > MAX_FILES) {
      return res.status(400).json({ error: `Máximo de ${MAX_FILES} fotos` });
    }
    for (const f of files) {
      if (!f?.name || typeof f.name !== 'string') {
        return res.status(400).json({ error: 'Cada foto precisa de um nome' });
      }
      if (!f.mimeType?.startsWith('image/')) {
        return res.status(400).json({ error: 'Apenas arquivos de imagem são aceitos' });
      }
    }

    const uploadId = randomUUID();
    const urls = await criarUploadUrls(uploadId, files);

    return res.status(200).json({
      success: true,
      uploadId,
      files: urls,
    });
  } catch (err) {
    console.error('Erro em /api/upload-urls:', {
      message: err?.message,
      name: err?.name,
      code: err?.code,
      statusCode: err?.statusCode ?? err?.status,
      cause: err?.cause,
      stack: err?.stack,
    });
    return res.status(500).json({ error: err.message || 'Erro interno' });
  }
}
