import { validateOrderInput } from "../../lib/prompt.js";
import { createOrder } from "../../lib/db.js";
import { check } from "../../lib/ratelimit.js";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ error: "Método não permitido." });
    }

    try {
        const rl = await check(req, "orders/create");
        if (!rl.ok) return res.status(429).json({ error: "Muitos pedidos. Tente novamente em alguns minutos." });

        const body = req.body || {};
        const { ok, errors, clean } = validateOrderInput(body);
        if (!ok) return res.status(400).json({ error: errors[0], errors });

        const id = await createOrder(clean);
        return res.status(201).json({ id });
    } catch (err) {
        console.error("[orders/create]", err);
        return res.status(500).json({ error: "Erro ao criar pedido." });
    }
}
