import { sql } from "@vercel/postgres";
import { randomUUID } from "node:crypto";

export async function createOrder(input) {
    const id = randomUUID();
    const { email, nome, idade, estilo, mensagem, trilha } = input;
    await sql`
        INSERT INTO orders (id, email, nome, idade, estilo, mensagem, trilha, status)
        VALUES (${id}, ${email}, ${nome}, ${idade}, ${estilo}, ${mensagem}, ${trilha}, 'draft')
    `;
    return id;
}

export async function getOrder(id) {
    const { rows } = await sql`SELECT * FROM orders WHERE id = ${id} LIMIT 1`;
    return rows[0] || null;
}

export async function setPhotoKeys(id, keys) {
    await sql`
        UPDATE orders
        SET photo_keys = ${JSON.stringify(keys)}::jsonb,
            updated_at = now()
        WHERE id = ${id}
    `;
}

export async function setPayment(id, paymentId, status) {
    await sql`
        UPDATE orders
        SET payment_id = ${paymentId},
            status     = ${status},
            updated_at = now()
        WHERE id = ${id}
    `;
}

export async function findByPayment(paymentId) {
    const { rows } = await sql`SELECT * FROM orders WHERE payment_id = ${paymentId} LIMIT 1`;
    return rows[0] || null;
}

export async function setArt(id, artKey) {
    await sql`
        UPDATE orders
        SET art_key    = ${artKey},
            status     = 'art_ready',
            updated_at = now()
        WHERE id = ${id}
    `;
}

export async function setAudio(id, audioKey) {
    await sql`UPDATE orders SET audio_key = ${audioKey}, updated_at = now() WHERE id = ${id}`;
}

export async function markVideoReady(id, videoKey, ttlMinutes = 15) {
    const now = new Date();
    const expires = new Date(now.getTime() + ttlMinutes * 60 * 1000);
    await sql`
        UPDATE orders
        SET video_key        = ${videoKey},
            video_ready_at   = ${now.toISOString()},
            video_expires_at = ${expires.toISOString()},
            status           = 'video_ready',
            updated_at       = now()
        WHERE id = ${id}
    `;
    return { videoReadyAt: now, videoExpiresAt: expires };
}

export async function markFailed(id, message) {
    await sql`
        UPDATE orders
        SET status     = 'failed',
            last_error = ${String(message).slice(0, 500)},
            updated_at = now()
        WHERE id = ${id}
    `;
}

export async function listExpiredForPurge(days = 30) {
    const { rows } = await sql`
        SELECT id, photo_keys, art_key, audio_key, video_key
        FROM orders
        WHERE created_at < now() - interval '1 day' * ${days}
          AND status NOT IN ('purged')
    `;
    return rows;
}

export async function markPurged(id) {
    await sql`
        UPDATE orders
        SET photo_keys = '[]'::jsonb,
            art_key    = NULL,
            audio_key  = NULL,
            video_key  = NULL,
            mensagem   = NULL,
            status     = 'purged',
            updated_at = now()
        WHERE id = ${id}
    `;
}
