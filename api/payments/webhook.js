import { fetchPayment, verifyWebhookSignature } from "../../lib/mercadopago.js";
import { getOrder, setPayment } from "../../lib/db.js";
import { Inngest } from "inngest";

const inngest = new Inngest({ id: "wlg-presente-mae" });

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).end();
    }
    try {
        const body = req.body || {};
        if (!verifyWebhookSignature(req, body)) {
            return res.status(401).json({ error: "Assinatura inválida." });
        }

        // O webhook do MP traz {action, type, data:{id}} para diferentes eventos.
        const type = body.type || body.topic;
        const dataId = body?.data?.id;
        if (type !== "payment" || !dataId) return res.status(200).json({ ignored: true });

        const payment = await fetchPayment(dataId);
        const orderId = payment?.external_reference;
        if (!orderId) return res.status(200).json({ ignored: "sem external_reference" });

        const order = await getOrder(orderId);
        if (!order) return res.status(404).json({ error: "Pedido não encontrado." });

        const status = payment.status; // approved, pending, rejected, refunded...
        if (status === "approved" && order.status !== "paid" && order.status !== "art_ready" && order.status !== "video_ready") {
            await setPayment(orderId, String(payment.id), "paid");
            await inngest.send({ name: "presente/generate", data: { orderId } });
        } else if (status === "rejected") {
            await setPayment(orderId, String(payment.id), "failed");
        }

        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error("[payments/webhook]", err);
        return res.status(500).json({ error: "Erro no webhook." });
    }
}
