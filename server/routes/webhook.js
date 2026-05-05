import express from 'express';
import { processarPagamento } from '../services/pagamento.js';

const router = express.Router();

// POST /api/webhook/abacatepay - Receber confirmação de pagamento
router.post('/webhook/abacatepay', async (req, res, next) => {
  try {
    const { event, data } = req.body;

    // Validar webhook (idealmente usar assinatura)
    if (!event || !data) {
      return res.status(400).json({ error: 'Payload inválido' });
    }

    // Processar confirmação de pagamento
    if (event === 'charge.completed' || event === 'charge.confirmed') {
      await processarPagamento(data);
      res.json({ success: true });
    } else {
      // Ignorar outros eventos
      res.json({ success: true });
    }
  } catch (err) {
    console.error('Erro ao processar webhook:', err);
    next(err);
  }
});

export default router;
