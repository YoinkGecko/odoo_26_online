//Token Bucket
//Map + Token Bucket + Cleanup Job

const MAX_TOKENS = Number(process.env.MAX_TOKENS);
const REFILL_RATE = MAX_TOKENS / 1000; // 20 tokens/sec
const CLEAN_TIME = Number(process.env.CLEAN_TIME); // 10 minutes

if (!MAX_TOKENS || !CLEAN_TIME) {
    throw new Error("Missing environment variables");
}

const buckets = new Map();

const rateLimiter = (req, res, next) => {
    const ip = req.ip;

    if (!ip) {
        return res.status(403).json({
            message: "Invalid User"
        });
    }

    const now = Date.now();

    // Create bucket if first request
    if (!buckets.has(ip)) {
        buckets.set(ip, {
            tokens: MAX_TOKENS,
            lastRefill: now,
            lastSeen: now
        });
    }

    const bucket = buckets.get(ip);

    // Calculate elapsed time
    const elapsed = now - bucket.lastRefill;

    // Refill tokens
    const refill = elapsed * REFILL_RATE;

    bucket.tokens = Math.min(
        MAX_TOKENS,
        bucket.tokens + refill
    );

    bucket.lastRefill = now;
    bucket.lastSeen = now;

    // Check limit
    if (bucket.tokens < 1) {
        return res.status(429).json({
            message: "Too Many Requests"
        });
    }

    // Consume token
    bucket.tokens--;

    next();
};

// Cleanup inactive IPs
setInterval(() => {
    const now = Date.now();

    for (const [ip, bucket] of buckets) {
        if (now - bucket.lastSeen > CLEAN_TIME) {
            buckets.delete(ip);
        }
    }
}, 60 * 1000);

module.exports = rateLimiter;