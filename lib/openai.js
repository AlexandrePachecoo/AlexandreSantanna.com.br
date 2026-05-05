import OpenAI, { toFile } from "openai";
import { buildPrompt } from "./prompt.js";

let _client;
function client() {
    if (!_client) {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error("OPENAI_API_KEY ausente.");
        }
        _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return _client;
}

const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";
const TTS_MODEL   = process.env.OPENAI_TTS_MODEL   || "gpt-4o-mini-tts";
const TTS_VOICE   = process.env.OPENAI_TTS_VOICE   || "nova";

/**
 * Gera a arte celebrativa.
 * @param {{nome,idade,estilo,mensagem,photos:Array<{buffer,mimetype,name}>}} order
 * @returns {Promise<Buffer>} PNG buffer
 */
export async function generateArt(order) {
    const prompt = buildPrompt({
        name: order.nome,
        age: order.idade,
        message: order.mensagem,
        style: order.estilo,
        hasPhotos: (order.photos || []).length > 0,
    });

    const baseParams = { model: IMAGE_MODEL, prompt, size: "1024x1536", n: 1, quality: "high" };
    let response;

    if (order.photos && order.photos.length > 0) {
        const refs = await Promise.all(
            order.photos.map((p, i) =>
                toFile(p.buffer, p.name || `foto-${i}.png`, { type: p.mimetype || "image/png" })
            )
        );
        response = await client().images.edit({ ...baseParams, image: refs });
    } else {
        response = await client().images.generate(baseParams);
    }

    const result = response?.data?.[0];
    if (!result?.b64_json) throw new Error("API de imagem não retornou b64_json.");
    return Buffer.from(result.b64_json, "base64");
}

/**
 * Gera narração TTS em PT-BR.
 * @param {string} text
 * @returns {Promise<Buffer>} MP3 buffer
 */
export async function generateNarration(text) {
    const safe = (text || "").trim();
    if (!safe) throw new Error("Texto vazio para narração.");

    const speech = await client().audio.speech.create({
        model: TTS_MODEL,
        voice: TTS_VOICE,
        input: safe.slice(0, 4000),
        format: "mp3",
        instructions: "Tom afetuoso, calmo, emocional. Português do Brasil. Pausas suaves entre frases. Carinho na voz, como quem fala para a própria mãe.",
    });
    const ab = await speech.arrayBuffer();
    return Buffer.from(ab);
}
