const API_BASE = process.env.ABACATE_API_URL || "https://api.abacatepay.com/v1";
const PRICE_BRL = Number(process.env.PRICE_BRL || 39.9);
const APP_URL   = process.env.APP_URL || "http://localhost:3000";

function authHeader() {
    const key = process.env.ABACATE_API_KEY;
    if (!key) throw new Error("ABACATE_API_KEY ausente.");
    return { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
}

/**
 * Cria uma cobrança Pix no AbacatePay.
 * Doc: https://abacatepay.readme.io/reference/create-billing
 *
 * @returns {Promise<{checkoutUrl:string, billingId:string}>}
 */
export async function createBilling({ orderId, email, nome }) {
    const body = {
        frequency: "ONE_TIME",
        methods: ["PIX"],
        products: [{
            externalId: orderId,
            name: "Presente de Dia das Mães com IA",
            description: "Arte personalizada + vídeo narrado em PT-BR",
            quantity: 1,
            price: Math.round(PRICE_BRL * 100), // centavos
        }],
        returnUrl:     `${APP_URL}/pedido.html?id=${orderId}`,
        completionUrl: `${APP_URL}/pedido.html?id=${orderId}`,
        customer: {
            email,
            name: nome,
        },
    };

    const res = await fetch(`${API_BASE}/billing/create`, {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.error) {
        const msg = json.error?.message || json.error || `HTTP ${res.status}`;
        throw new Error(`AbacatePay: ${msg}`);
    }
    const data = json.data || json;
    return { checkoutUrl: data.url, billingId: data.id };
}

/**
 * Valida o webhook. AbacatePay envia o segredo como query param `webhookSecret`
 * (configurado no painel ao cadastrar a URL).
 */
export function verifyWebhook(req) {
    const secret = process.env.ABACATE_WEBHOOK_SECRET;
    if (!secret) return true;
    const provided = req.query?.webhookSecret || new URL(req.url, "http://x").searchParams.get("webhookSecret");
    return provided === secret;
}

/**
 * Extrai os campos relevantes de um payload de webhook.
 */
export function parseWebhook(body) {
    const event = body?.event;
    const billing = body?.data?.billing || body?.data;
    const orderId = billing?.products?.[0]?.externalId || null;
    const billingId = billing?.id || null;
    const status = billing?.status || null; // PENDING | PAID | EXPIRED | CANCELLED | REFUNDED
    return { event, orderId, billingId, status };
}
