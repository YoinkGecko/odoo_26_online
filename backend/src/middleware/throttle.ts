import type { RequestHandler } from "express";

/**
 * Token-bucket throttle for write-heavy endpoints.
 * Each key (default: IP) gets `capacity` tokens refilled at `refillPerSec`.
 */
export function tokenBucketThrottle(options: {
  capacity?: number;
  refillPerSec?: number;
  keyFn?: (req: Parameters<RequestHandler>[0]) => string;
}): RequestHandler {
  const capacity = options.capacity ?? 10;
  const refillPerSec = options.refillPerSec ?? 2;
  const keyFn = options.keyFn ?? (req => req.ip ?? "unknown");

  const buckets = new Map<string, { tokens: number; lastRefill: number }>();

  return (req, res, next) => {
    const key = keyFn(req);
    const now = Date.now();
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = { tokens: capacity, lastRefill: now };
      buckets.set(key, bucket);
    }

    const elapsed = (now - bucket.lastRefill) / 1000;
    bucket.tokens = Math.min(capacity, bucket.tokens + elapsed * refillPerSec);
    bucket.lastRefill = now;

    if (bucket.tokens < 1) {
      res.status(429).json({
        success: false,
        error: { code: "THROTTLED", message: "Too many write requests — please slow down" },
      });
      return;
    }

    bucket.tokens -= 1;
    next();
  };
}
