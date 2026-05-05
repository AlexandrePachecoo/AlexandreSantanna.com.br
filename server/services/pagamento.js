import axios from 'axios';
import { supabase } from '../config/supabase.js';
import { processarPipeline } from './pipeline.js';

const abacatepayApi = axios.create({
  baseURL: 'https://api.abacatepay.com/v1',
  headers: {
    Authorization: `Bearer ${process.env.ABACATEPAY_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

export async function criarCobranca({ pedidoId, email, nomeMae, valor }) {
  try {
    // Criar cobrança no AbacatePay via PIX
    const response = await abacatepayApi.post('/charges', {
      customer: {
        email,
        name: nomeMae,
      },
      amount: valor, // em centavos (1500 = R$ 15)
      type: 'pix',
      description: `Presente de Dia das Mães - Pedido #${pedidoId}`,
      metadata: {
        pedido_id: pedidoId,
      },
      // Callback para webhook
      hooks: {
        url: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/api/webhook/abacatepay`,
      },
    });

    const { checkout_url } = response.data;
    return checkout_url;
  } catch (err) {
    console.error('Erro ao criar cobrança AbacatePay:', err.response?.data || err.message);
    throw err;
  }
}

export async function processarPagamento(data) {
  try {
    const { metadata, status, id: chargeId } = data;
    const pedidoId = metadata?.pedido_id;

    if (!pedidoId) {
      console.error('Pedido ID não encontrado no webhook');
      return;
    }

    // Atualizar status do pedido para "pago"
    const { error: updateError } = await supabase
      .from('pedidos')
      .update({
        status: 'pago',
        charge_id: chargeId,
        updated_at: new Date(),
      })
      .eq('id', pedidoId);

    if (updateError) {
      throw new Error(`Erro ao atualizar pedido: ${updateError.message}`);
    }

    // Disparar pipeline de IA
    await processarPipeline(pedidoId);
  } catch (err) {
    console.error('Erro ao processar pagamento:', err);
    throw err;
  }
}
