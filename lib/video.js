import { spawn } from "node:child_process";
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import ffmpegPath from "ffmpeg-static";

const FRAMES_PER_PHOTO = 75;     // 2.5s @ 30fps
const FRAMES_COVER     = 90;     // 3.0s @ 30fps
const FPS              = 30;
const W                = 1080;
const H                = 1920;

function runFfmpeg(args) {
    return new Promise((resolve, reject) => {
        const ff = spawn(ffmpegPath, args, { stdio: ["ignore", "pipe", "pipe"] });
        let stderr = "";
        ff.stderr.on("data", chunk => { stderr += chunk.toString(); });
        ff.on("error", reject);
        ff.on("close", code => {
            if (code === 0) resolve();
            else reject(new Error(`ffmpeg saiu com código ${code}: ${stderr.slice(-1500)}`));
        });
    });
}

/**
 * Monta um slideshow Ken Burns vertical (1080x1920) com:
 *  - capa: arte gerada (3s)
 *  - fotos do usuário (2.5s cada com leve zoom-in)
 *  - áudio (narração ou trilha) mixado no final
 *
 * @param {{art:Buffer, photos:Buffer[], audio:Buffer|null}} input
 * @returns {Promise<Buffer>} MP4 buffer
 */
export async function buildSlideshow({ art, photos, audio }) {
    const dir = await mkdtemp(join(tmpdir(), "wlg-"));
    try {
        const coverPath = join(dir, "cover.png");
        await writeFile(coverPath, art);

        const photoPaths = [];
        for (let i = 0; i < photos.length; i++) {
            const p = join(dir, `p-${i}.jpg`);
            await writeFile(p, photos[i]);
            photoPaths.push(p);
        }

        const audioPath = audio ? join(dir, "audio.mp3") : null;
        if (audio) await writeFile(audioPath, audio);

        const inputs = [coverPath, ...photoPaths];
        const args = [];

        for (const path of inputs) {
            args.push("-loop", "1", "-i", path);
        }
        if (audioPath) args.push("-i", audioPath);

        // Filter complex: cada foto vira um clipe com Ken Burns + fade, depois concat
        const filterParts = [];
        for (let i = 0; i < inputs.length; i++) {
            const isCover = i === 0;
            const frames = isCover ? FRAMES_COVER : FRAMES_PER_PHOTO;
            const zEnd = isCover ? 1.08 : 1.18;
            // scale to large canvas, depois zoompan, depois fade in/out
            filterParts.push(
                `[${i}:v]scale=2160:3840:force_original_aspect_ratio=increase,` +
                `crop=2160:3840,setsar=1,` +
                `zoompan=z='min(zoom+${((zEnd - 1) / frames).toFixed(5)},${zEnd})':d=${frames}:s=${W}x${H}:fps=${FPS},` +
                `fade=t=in:st=0:d=0.4,fade=t=out:st=${(frames / FPS - 0.4).toFixed(2)}:d=0.4` +
                `[v${i}]`
            );
        }
        const concatInputs = inputs.map((_, i) => `[v${i}]`).join("");
        filterParts.push(`${concatInputs}concat=n=${inputs.length}:v=1:a=0[outv]`);
        const filter = filterParts.join(";");

        args.push("-filter_complex", filter);
        args.push("-map", "[outv]");

        if (audioPath) {
            const audioIdx = inputs.length;
            args.push("-map", `${audioIdx}:a`, "-c:a", "aac", "-b:a", "160k", "-shortest");
        }

        const outPath = join(dir, "out.mp4");
        args.push(
            "-c:v", "libx264",
            "-preset", "veryfast",
            "-crf", "22",
            "-pix_fmt", "yuv420p",
            "-r", String(FPS),
            "-movflags", "+faststart",
            "-y",
            outPath
        );

        await runFfmpeg(args);
        return await readFile(outPath);
    } finally {
        rm(dir, { recursive: true, force: true }).catch(() => {});
    }
}
