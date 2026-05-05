import { getOrder, setPayment } from "../../lib/db.js";
import { createPreference } from "../../lib/mercadopago.js";
import { check } from "../../lib/ratelimit.js";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ error: "Método não permitido." });
    }
    try {
        const rl = await check(req, "checkout");
        if (!rl.ok) return res.status(429).json({ error: "Muitos pedidos. Tente novamente." });

        const { id } = req.query;
        const order = await getOrder(id);
        if (!order) return res.status(404).json({ error: "Pedido não encontrado." });
        if (!Array.isArray(order.photo_keys) || order.photo_keys.length === 0) {
            return res.status(400).json({ error: "Suba ao menos uma foto antes de pagar." });
        }

        const { checkoutUrl, preferenceId } = await createPreference(order.id, order.email);
        await setPayment(order.id, preferenceId, "awaiting_payment");
        return res.status(200).json({ checkoutUrl });
    } catch (err) {
        console.error("[checkout]", err);
        return res.status(500).json({ error: "Erro ao iniciar pagamento." });
    }
}
