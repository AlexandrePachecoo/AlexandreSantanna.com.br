import { verifyWebhook, parseWebhook } from "../../lib/abacatepay.js";
import { getOrder, setPayment } from "../../lib/db.js";
import { Inngest } from "inngest";

const inngest = new Inngest({ id: "wlg-presente-mae" });

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).end();
    }
    try {
        if (!verifyWebhook(req)) {
            return res.status(401).json({ error: "webhookSecret inválido." });
        }

        const { event, orderId, billingId, status } = parseWebhook(req.body || {});
        if (!orderId) return res.status(200).json({ ignored: "sem externalId" });

        const order = await getOrder(orderId);
        if (!order) return res.status(404).json({ error: "Pedido não encontrado." });

        const isPaid = event === "billing.paid" || status === "PAID";
        const isFailed = event === "billing.expired" || event === "billing.cancelled" ||
                         status === "EXPIRED" || status === "CANCELLED";

        const alreadyProgressing = ["paid", "art_ready", "video_ready"].includes(order.status);

        if (isPaid && !alreadyProgressing) {
            await setPayment(orderId, billingId || order.payment_id, "paid");
            await inngest.send({ name: "presente/generate", data: { orderId } });
        } else if (isFailed && !alreadyProgressing) {
            await setPayment(orderId, billingId || order.payment_id, "failed");
        }

        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error("[payments/webhook]", err);
        return res.status(500).json({ error: "Erro no webhook." });
    }
}
