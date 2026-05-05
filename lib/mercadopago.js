import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import { createHmac, timingSafeEqual } from "node:crypto";

const PRICE_BRL = Number(process.env.PRICE_BRL || 39.9);
const APP_URL   = process.env.APP_URL || "http://localhost:3000";

let _client;
function client() {
    if (!_client) {
        if (!process.env.MP_ACCESS_TOKEN) throw new Error("MP_ACCESS_TOKEN ausente.");
        _client = new MercadoPagoConfig({
            accessToken: process.env.MP_ACCESS_TOKEN,
            options: { timeout: 8000 },
        });
    }
    return _client;
}

export async function createPreference(orderId, email) {
    const pref = new Preference(client());
    const result = await pref.create({
        body: {
            external_reference: orderId,
            payer: { email },
            items: [{
                id: "presente-mae",
                title: "Presente de Dia das Mães com IA",
                description: "Arte personalizada + vídeo narrado",
                quantity: 1,
                currency_id: "BRL",
                unit_price: PRICE_BRL,
            }],
            back_urls: {
                success: `${APP_URL}/pedido.html?id=${orderId}`,
                failure: `${APP_URL}/pedido.html?id=${orderId}&erro=1`,
                pending: `${APP_URL}/pedido.html?id=${orderId}`,
            },
            auto_return: "approved",
            notification_url: `${APP_URL}/api/payments/webhook`,
            metadata: { orderId },
        },
    });
    return { checkoutUrl: result.init_point, preferenceId: result.id };
}

export async function fetchPayment(paymentId) {
    const pay = new Payment(client());
    return pay.get({ id: paymentId });
}

/**
 * Valida assinatura x-signature do Mercado Pago (v1).
 * https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
 */
export function verifyWebhookSignature(req, body) {
    const secret = process.env.MP_WEBHOOK_SECRET;
    if (!secret) return true; // permitir em dev sem segredo

    const xSig = req.headers["x-signature"] || req.headers.get?.("x-signature");
    const xReq = req.headers["x-request-id"] || req.headers.get?.("x-request-id");
    if (!xSig || !xReq) return false;

    const parts = Object.fromEntries(
        String(xSig).split(",").map(p => p.trim().split("=").map(s => s.trim()))
    );
    const ts = parts.ts;
    const v1 = parts.v1;
    if (!ts || !v1) return false;

    const dataId = body?.data?.id || "";
    const manifest = `id:${dataId};request-id:${xReq};ts:${ts};`;
    const expected = createHmac("sha256", secret).update(manifest).digest("hex");

    try {
        return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(v1, "hex"));
    } catch {
        return false;
    }
}
