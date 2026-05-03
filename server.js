import "dotenv/config";
import express from "express";
import multer from "multer";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import OpenAI, { toFile } from "openai";

const __dirname = dirname(fileURLToPath(import.meta.url));

const PORT = process.env.PORT || 3000;
const MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";
const MAX_FILES = 10;
const MAX_FILE_BYTES = 12 * 1024 * 1024;

if (!process.env.OPENAI_API_KEY) {
    console.warn("[wlg] OPENAI_API_KEY ausente. Defina no .env antes de chamar /api/generate.");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const app = express();
app.use(express.static(__dirname));

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_BYTES, files: MAX_FILES },
    fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            return cb(new Error("Apenas imagens são aceitas."));
        }
        cb(null, true);
    },
});

const STYLE_DIRECTIVES = {
    aquarela:     "Pintura em aquarela romântica, paleta pastel suave (rosê, pêssego, marfim), pinceladas delicadas, flores aquareladas e textura de papel artesanal.",
    polaroid:     "Composição em colagem nostálgica de polaroids vintage, recortes sobrepostos, fita adesiva washi, papel envelhecido e atmosfera de álbum de família dos anos 80.",
    minimalista:  "Design moderno e minimalista, fundo limpo em tom marfim, tipografia serifada elegante, geometria sutil e abundância de espaço em branco.",
    ia:           "Estilo refinado escolhido pela IA, com paleta harmoniosa em tons rosê e dourado, atmosfera emocional e composição artística.",
};

const buildPrompt = ({ name, age, message, style, hasPhotos }) => {
    const styleDirective = STYLE_DIRECTIVES[style] || STYLE_DIRECTIVES.ia;
    const safeName = (name || "Mãe querida").trim();
    const safeAge = age ? `${age} anos` : null;
    const messageLine = (message || "").trim();
    const photoLine = hasPhotos
        ? "Use as fotos de referência fornecidas como inspiração visual: preserve traços, cenas e atmosferas de forma artística (não fotorrealista) e integre os elementos numa única composição harmônica."
        : "Crie uma cena emocional e atemporal sobre o amor entre mãe e filhos.";

    return [
        `Crie uma arte celebrativa de Dia das Mães para "${safeName}"${safeAge ? `, ${safeAge}` : ""}.`,
        `Título destacado em tipografia bonita: "Para ${safeName}, com amor".`,
        messageLine ? `Inclua sutilmente, em tipografia menor, a mensagem: "${messageLine.slice(0, 240)}".` : "",
        styleDirective,
        photoLine,
        "Composição centralizada, equilibrada, com molduras florais delicadas, corações sutis e luz quente. Resultado emocionante, presenteável, alta qualidade.",
        "NÃO inclua textos em outros idiomas além de português. NÃO inclua marca d'água, logotipos ou códigos QR.",
    ].filter(Boolean).join(" ");
};

app.post("/api/generate", upload.array("fotos", MAX_FILES), async (req, res) => {
    try {
        const { nome, idade, mensagem, estilo } = req.body || {};
        const photos = req.files || [];

        if (!nome || !nome.trim()) {
            return res.status(400).json({ error: "Informe o nome da sua mãe." });
        }

        const prompt = buildPrompt({
            name: nome,
            age: idade,
            message: mensagem,
            style: estilo,
            hasPhotos: photos.length > 0,
        });

        const baseParams = {
            model: MODEL,
            prompt,
            size: "1024x1024",
            n: 1,
        };

        let response;
        if (photos.length > 0) {
            const referenceFiles = await Promise.all(
                photos.map((f, i) =>
                    toFile(f.buffer, f.originalname || `foto-${i}.png`, { type: f.mimetype })
                )
            );
            response = await openai.images.edit({
                ...baseParams,
                image: referenceFiles,
                quality: "high",
            });
        } else {
            response = await openai.images.generate({
                ...baseParams,
                quality: "high",
            });
        }

        const result = response?.data?.[0];
        if (!result) {
            return res.status(502).json({ error: "A IA não retornou imagem. Tente novamente." });
        }

        const payload = {
            prompt,
            model: MODEL,
            usedReferences: photos.length,
        };
        if (result.b64_json) {
            payload.image = `data:image/png;base64,${result.b64_json}`;
        } else if (result.url) {
            payload.image = result.url;
        } else {
            return res.status(502).json({ error: "Formato de retorno inesperado da API de imagem." });
        }

        res.json(payload);
    } catch (err) {
        console.error("[wlg] erro em /api/generate:", err);
        const status = err.status && Number.isInteger(err.status) ? err.status : 500;
        res.status(status).json({
            error: err.message || "Erro ao gerar a imagem.",
        });
    }
});

app.use((err, _req, res, _next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: `Upload inválido: ${err.message}` });
    }
    if (err) {
        return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Erro interno." });
});

app.listen(PORT, () => {
    console.log(`[wlg] Pronto em http://localhost:${PORT}`);
});
