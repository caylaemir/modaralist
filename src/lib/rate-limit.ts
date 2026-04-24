import "server-only";

// Basit in-memory rate limiter — tek instance icinde calisir.
// Production'da multi-instance veya cold-start'a dayanikli olmak icin
// Upstash Redis vs. lazim. MVP icin yeterli.
//
// Her key (genelde IP) icin son N saniyede kac istek atildigini sayar.
// limit'i asarsa allowed=false doner.

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

// Sürekli büyümesin diye periyodik temizle
let cleanupInterval: NodeJS.Timeout | null = null;
function ensureCleanup() {
  if (cleanupInterval || typeof setInterval === "undefined") return;
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, b] of buckets.entries()) {
      if (b.resetAt <= now) buckets.delete(key);
    }
  }, 60_000);
  // Node.js'in sürecini canlı tutmaması için unref
  if (cleanupInterval && typeof cleanupInterval.unref === "function") {
    cleanupInterval.unref();
  }
}

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

/**
 * @param key Genelde "namespace:ip" formatinda
 * @param limit Pencere icindeki maksimum istek
 * @param windowMs Pencere uzunlugu (ms)
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  ensureCleanup();
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    const next: Bucket = { count: 1, resetAt: now + windowMs };
    buckets.set(key, next);
    return { allowed: true, remaining: limit - 1, resetAt: next.resetAt };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return {
    allowed: true,
    remaining: limit - bucket.count,
    resetAt: bucket.resetAt,
  };
}

/** Request'ten IP cekme yardimcisi (proxy header'larini sirayla dener) */
export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}
