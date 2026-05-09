import axios from 'axios';

const abacatepayApi = axios.create({
  baseURL: 'https://api.abacatepay.com/v1',
  headers: {
    Authorization: `Bearer ${process.env.ABACATEPAY_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

export async function criarCobranca({ pedidoId, email, nomeCliente, valor, frontendUrl }) {
  if (!frontendUrl) throw new Error('frontendUrl é obrigatório para returnUrl/completionUrl do AbacatePay');

  // CPF e celular são coletados pelo próprio AbacatePay no checkout — por isso
  // não enviamos esses campos no customer aqui.
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

export function validarWebhookSecret(req) {
  const expected = process.env.ABACATEPAY_WEBHOOK_SECRET;
  if (!expected) return false;

  const fromQuery = req?.query?.webhookSecret;
  const headers = req?.headers || {};
  const fromHeader =
    headers['x-webhook-secret'] ||
    headers['x-abacatepay-secret'] ||
    headers['webhook-secret'];

  return fromQuery === expected || fromHeader === expected;
}

export async function consultarCobranca(chargeId) {
  if (!chargeId) return null;
  try {
    const response = await abacatepayApi.get('/billing/list', { timeout: 8000 });
    const list = response.data?.data || [];
    const billing = list.find(b => b.id === chargeId);
    if (!billing) return null;
    return { status: billing.status, isPaid: billing.status === 'PAID' };
  } catch (err) {
    console.error('[consultarCobranca] erro:', err.response?.status, err.message);
    return null;
  }
}
