import { handleClientUpload } from "../../lib/blob.js";
import { getOrder, setPhotoKeys } from "../../lib/db.js";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ error: "Método não permitido." });
    }
    try {
        const result = await handleClientUpload(req, {
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                const orderId = tokenPayload?.orderId;
                if (!orderId) return;
                const order = await getOrder(orderId);
                if (!order) return;
                const keys = Array.isArray(order.photo_keys) ? order.photo_keys : [];
                if (keys.length >= 10) return;
                keys.push({ key: blob.pathname, url: blob.url, contentType: blob.contentType });
                await setPhotoKeys(orderId, keys);
            },
        });
        return res.status(200).json(result);
    } catch (err) {
        console.error("[orders/upload]", err);
        return res.status(400).json({ error: err.message || "Falha no upload." });
    }
}
