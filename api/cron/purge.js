import { listExpiredForPurge, markPurged } from "../../lib/db.js";
import { deleteMany } from "../../lib/blob.js";

export default async function handler(req, res) {
    // Vercel Cron envia GET com header Authorization: Bearer <CRON_SECRET>
    const auth = req.headers.authorization || "";
    if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: "unauthorized" });
    }
    try {
        const rows = await listExpiredForPurge(30);
        let blobs = 0, orders = 0;
        for (const r of rows) {
            const keys = [
                ...(Array.isArray(r.photo_keys) ? r.photo_keys.map(p => p.key) : []),
                r.art_key,
                r.audio_key,
                r.video_key,
            ].filter(Boolean);
            await deleteMany(keys);
            await markPurged(r.id);
            blobs += keys.length;
            orders += 1;
        }
        return res.status(200).json({ orders, blobs });
    } catch (err) {
        console.error("[cron/purge]", err);
        return res.status(500).json({ error: "Erro ao purgar." });
    }
}
