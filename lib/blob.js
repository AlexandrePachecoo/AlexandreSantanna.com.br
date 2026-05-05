import { put, del, head } from "@vercel/blob";
import { handleUpload } from "@vercel/blob/client";

const PHOTO_PREFIX = "photos";
const ART_PREFIX   = "art";
const AUDIO_PREFIX = "audio";
const VIDEO_PREFIX = "video";

const safeExt = (ct = "") => {
    if (ct.includes("png"))  return "png";
    if (ct.includes("jpeg") || ct.includes("jpg")) return "jpg";
    if (ct.includes("webp")) return "webp";
    if (ct.includes("mp3") || ct.includes("mpeg")) return "mp3";
    if (ct.includes("mp4")) return "mp4";
    return "bin";
};

export function photoKey(orderId, idx, contentType) {
    return `${PHOTO_PREFIX}/${orderId}/${idx}.${safeExt(contentType)}`;
}

export async function uploadArt(orderId, buffer) {
    const key = `${ART_PREFIX}/${orderId}.png`;
    const r = await put(key, buffer, { access: "public", contentType: "image/png", addRandomSuffix: false });
    return { key, url: r.url };
}

export async function uploadAudio(orderId, buffer) {
    const key = `${AUDIO_PREFIX}/${orderId}.mp3`;
    const r = await put(key, buffer, { access: "public", contentType: "audio/mpeg", addRandomSuffix: false });
    return { key, url: r.url };
}

export async function uploadVideo(orderId, buffer) {
    const key = `${VIDEO_PREFIX}/${orderId}.mp4`;
    const r = await put(key, buffer, { access: "public", contentType: "video/mp4", addRandomSuffix: false });
    return { key, url: r.url };
}

export async function readBlob(key) {
    const meta = await head(key);
    const res = await fetch(meta.url);
    if (!res.ok) throw new Error(`Falha ao ler blob ${key}: ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
}

export async function urlOf(key) {
    if (!key) return null;
    const meta = await head(key);
    return meta.url;
}

export async function deleteMany(keys) {
    const list = (keys || []).filter(Boolean);
    if (!list.length) return;
    await del(list);
}

/**
 * Handler oficial do client upload do Vercel Blob.
 * Frontend chama PUT /api/orders/upload com este handler para subir as fotos.
 * Doc: https://vercel.com/docs/storage/vercel-blob/client-upload
 */
export async function handleClientUpload(req, { onUploadCompleted } = {}) {
    const body = await req.json();
    return handleUpload({
        body,
        request: req,
        onBeforeGenerateToken: async (pathname) => {
            if (!pathname.startsWith(`${PHOTO_PREFIX}/`)) {
                throw new Error("Caminho não permitido.");
            }
            return {
                allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
                maximumSizeInBytes: 12 * 1024 * 1024,
                addRandomSuffix: false,
            };
        },
        onUploadCompleted: onUploadCompleted || (async () => {}),
    });
}
