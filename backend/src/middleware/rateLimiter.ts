import { Request, Response, NextFunction } from 'express';
import { fail } from '../lib/response.js';

// Custom sliding-window rate limiter — no black-box import.
// Tracks request timestamps per IP in a Map. Configurable window + max.

interface LimiterConfig {
  windowMs: number;
  max: number;
}

interface Bucket {
  timestamps: number[];
}

const buckets = new Map<string, Bucket>();

// Periodic cleanup of expired entries (every 5 min)
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    bucket.timestamps = bucket.timestamps.filter((t) => now - t < 60 * 60 * 1000);
    if (bucket.timestamps.length === 0) buckets.delete(key);
  }
}, 5 * 60 * 1000).unref?.();

export function rateLimit(config: LimiterConfig) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';
    const now = Date.now();
    const bucket = buckets.get(ip) ?? { timestamps: [] };

    // Drop timestamps outside the window
    bucket.timestamps = bucket.timestamps.filter((t) => now - t < config.windowMs);

    if (bucket.timestamps.length >= config.max) {
      const retryAfter = Math.ceil((config.windowMs - (now - bucket.timestamps[0])) / 1000);
      res.setHeader('Retry-After', String(retryAfter));
      return fail(res, 'RATE_LIMITED', `Too many requests. Try again in ${retryAfter}s.`, 429);
    }

    bucket.timestamps.push(now);
    buckets.set(ip, bucket);
    next();
  };
}

// Presets
export const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
export const loginLimiter = rateLimit({ windowMs: 60 * 1000, max: 5 });
