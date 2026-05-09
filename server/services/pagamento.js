import axios from 'axios';

const abacatepayApi = axios.create({
  baseURL: 'https://api.abacatepay.com/v1',
  headers: {
    Authorization: `Bearer ${process.env.ABACATEPAY_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

export async function criarCobranca({ pedidoId, email, nomeCliente, cpf, celular, valor, frontendUrl }) {
  if (!frontendUrl) throw new Error('frontendUrl é obrigatório para returnUrl/completionUrl do AbacatePay');

  const response = await abacatepayApi.post('/billing/create', {
    frequency: 'ONE_TIME',
    methods: ['PIX'],
    products: [{
      externalId: pedidoId,
      name: 'Presente de Dia das Mães com IA',
      description: `Pedido ${pedidoId}`,
      quantity: 1,
      price: valor,
    }],
    returnUrl: `${frontendUrl}/`,
    completionUrl: `${frontendUrl}/sucesso.html?id=${pedidoId}`,
    customer: {
      name: nomeCliente,
      email,
      cellphone: celular,
      taxId: cpf,
    },
    metadata: { pedido_id: pedidoId },
  });

  const billing = response.data?.data;
  if (!billing?.url || !billing?.id) {
    throw new Error('Resposta inesperada do AbacatePay: ' + JSON.stringify(response.data));
  }

  return {
    checkoutUrl: billing.url,
    chargeId: billing.id,
  };
}

export function validarWebhookSecret(query) {
  const expected = process.env.ABACATEPAY_WEBHOOK_SECRET;
  if (!expected) return false;
  return query?.webhookSecret === expected;
}
