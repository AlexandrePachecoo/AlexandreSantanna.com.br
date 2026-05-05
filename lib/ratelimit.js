import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let limiter;
function get() {
    if (limiter) return limiter;
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        return null;
    }
    limiter = new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(10, "1 h"),
        analytics: true,
        prefix: "wlg:rl",
    });
    return limiter;
}

export function clientIp(req) {
    const fwd = req.headers["x-forwarded-for"] || req.headers.get?.("x-forwarded-for");
    if (fwd) return String(fwd).split(",")[0].trim();
    return req.socket?.remoteAddress || req.headers["x-real-ip"] || "anon";
}

export async function check(req, key) {
    const rl = get();
    if (!rl) return { ok: true };
    const id = `${key}:${clientIp(req)}`;
    const { success, limit, remaining, reset } = await rl.limit(id);
    return { ok: success, limit, remaining, reset };
}
