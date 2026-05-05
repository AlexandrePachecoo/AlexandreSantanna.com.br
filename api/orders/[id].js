import { getOrder } from "../../lib/db.js";
import { urlOf } from "../../lib/blob.js";

const PUBLIC_FIELDS = ["id", "status", "nome", "estilo", "trilha"];

export default async function handler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({ error: "Método não permitido." });
    }
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "id obrigatório." });

    try {
        const order = await getOrder(id);
        if (!order) return res.status(404).json({ error: "Pedido não encontrado." });

        const out = {};
        for (const k of PUBLIC_FIELDS) out[k] = order[k];

        if (order.art_key) out.artUrl = await urlOf(order.art_key);

        const now = Date.now();
        const expiresAt = order.video_expires_at ? new Date(order.video_expires_at).getTime() : 0;
        if (order.video_key && expiresAt > now) {
            out.videoUrl = await urlOf(order.video_key);
            out.videoExpiresAt = new Date(expiresAt).toISOString();
            out.videoSecondsLeft = Math.max(0, Math.floor((expiresAt - now) / 1000));
        } else if (order.video_key && expiresAt && expiresAt <= now) {
            out.videoExpired = true;
        }

        if (order.last_error) out.lastError = order.last_error;

        res.setHeader("Cache-Control", "no-store");
        return res.status(200).json(out);
    } catch (err) {
        console.error("[orders/[id]]", err);
        return res.status(500).json({ error: "Erro ao consultar pedido." });
    }
}
