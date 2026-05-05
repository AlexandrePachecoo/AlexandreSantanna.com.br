import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { inngest } from "../client.js";
import { getOrder, setArt, setAudio, markVideoReady, markFailed } from "../../lib/db.js";
import { generateArt, generateNarration } from "../../lib/openai.js";
import { uploadArt, uploadAudio, uploadVideo, readBlob, urlOf } from "../../lib/blob.js";
import { buildSlideshow } from "../../lib/video.js";
import { sendPresenteReady } from "../../lib/email.js";

const APP_URL = process.env.APP_URL || "http://localhost:3000";
const MUSIC_DIR = join(process.cwd(), "assets", "music");
const MUSIC_FILES = ["trilha-1.mp3", "trilha-2.mp3", "trilha-3.mp3"];

async function pickMusic() {
    const file = MUSIC_FILES[Math.floor(Math.random() * MUSIC_FILES.length)];
    try {
        return await readFile(join(MUSIC_DIR, file));
    } catch {
        return null; // sem trilha → vídeo silencioso
    }
}

export const generatePresente = inngest.createFunction(
    { id: "presente.generate", name: "Gera arte + áudio + vídeo do presente", retries: 2 },
    { event: "presente/generate" },
    async ({ event, step }) => {
        const { orderId } = event.data;

        const order = await step.run("load-order", () => getOrder(orderId));
        if (!order) throw new Error(`Pedido ${orderId} não encontrado.`);

        try {
            // 1. Arte
            const artKey = await step.run("gera-arte", async () => {
                const photoBuffers = await Promise.all(
                    (order.photo_keys || []).map(async (p) => ({
                        buffer: await readBlob(p.key),
                        mimetype: p.contentType || "image/jpeg",
                        name: p.key.split("/").pop(),
                    }))
                );
                const png = await generateArt({ ...order, photos: photoBuffers });
                const { key } = await uploadArt(orderId, png);
                await setArt(orderId, key);
                return key;
            });

            // 2. Áudio
            const audioKey = await step.run("gera-audio", async () => {
                let buf;
                if (order.trilha === "narracao" && (order.mensagem || "").trim()) {
                    buf = await generateNarration(order.mensagem);
                } else {
                    buf = await pickMusic();
                }
                if (!buf) return null;
                const { key } = await uploadAudio(orderId, buf);
                await setAudio(orderId, key);
                return key;
            });

            // 3. Vídeo
            const videoKey = await step.run("gera-video", async () => {
                const [art, photos, audio] = await Promise.all([
                    readBlob(artKey),
                    Promise.all((order.photo_keys || []).map(p => readBlob(p.key))),
                    audioKey ? readBlob(audioKey) : Promise.resolve(null),
                ]);
                const mp4 = await buildSlideshow({ art, photos, audio });
                const { key } = await uploadVideo(orderId, mp4);
                return key;
            });

            // 4. Marca pronto + janela de 15 min para o site
            const ready = await step.run("marca-pronto", () => markVideoReady(orderId, videoKey, 15));

            // 5. E-mail (links de longa duração — site continua com janela de 15 min)
            await step.run("envia-email", async () => {
                const [artUrl, videoUrl] = await Promise.all([
                    urlOf(artKey),
                    urlOf(videoKey),
                ]);
                await sendPresenteReady({
                    to: order.email,
                    nome: order.nome,
                    artUrl,
                    videoUrl,
                    orderUrl: `${APP_URL}/pedido.html?id=${orderId}`,
                });
            });

            return { orderId, videoExpiresAt: ready.videoExpiresAt };
        } catch (err) {
            await markFailed(orderId, err.message || String(err));
            throw err;
        }
    }
);
