import axios from 'axios';

const abacatepayApi = axios.create({
  baseURL: 'https://api.abacatepay.com/v1',
  headers: {
    Authorization: `Bearer ${process.env.ABACATEPAY_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

export async function criarCobranca({ pedidoId, email, nomeMae, valor }) {
  const frontend = process.env.FRONTEND_URL || '';
  const response = await abacatepayApi.post('/charges', {
    customer: { email, name: nomeMae },
    amount: valor,
    type: 'pix',
    description: `Presente de Dia das Mães - Pedido #${pedidoId}`,
    metadata: { pedido_id: pedidoId },
    return_url: `${frontend}/sucesso.html?id=${pedidoId}`,
  });

  return {
    checkoutUrl: response.data.checkout_url,
    chargeId: response.data.id,
  };
}

export function validarWebhookSecret(query) {
  const expected = process.env.ABACATEPAY_WEBHOOK_SECRET;
  if (!expected) return false;
  return query?.webhookSecret === expected;
}
