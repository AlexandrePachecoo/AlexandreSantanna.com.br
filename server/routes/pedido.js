import express from 'express';
import multer from 'multer';
import { criarPedido } from '../services/pedido.js';

const router = express.Router();

// Configurar multer para upload de fotos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB por arquivo
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas'), false);
    }
  },
});

// POST /api/pedido - Receber form e criar pedido
router.post('/pedido', upload.array('fotos', 10), async (req, res, next) => {
  try {
    const { 'nome-mae': nomeMae, idade, estilo, mensagem, trilha, email } = req.body;
    const fotos = req.files || [];

    // Validar campos obrigatórios
    if (!nomeMae || !email || fotos.length === 0) {
      return res.status(400).json({
        error: 'Campos obrigatórios: nome-mae, email e pelo menos uma foto',
      });
    }

    // Criar pedido
    const result = await criarPedido({
      nomeMae,
      idade: parseInt(idade) || null,
      estilo: estilo || 'ia',
      mensagem,
      trilha: trilha || 'narracao',
      email,
      fotos,
    });

    res.json({
      success: true,
      checkoutUrl: result.checkoutUrl,
      pedidoId: result.pedidoId,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
