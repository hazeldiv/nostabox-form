type Bucket = {
  count: number;
  resetAt: number;
};

export type RateLimiter = {
  consume: (key: string) => boolean;
};

export function createRateLimiter(limit: number, windowMs: number): RateLimiter {
  const buckets = new Map<string, Bucket>();
  let lastSweep = Date.now();

  function sweep(now: number) {
    if (now - lastSweep < windowMs) return;

    lastSweep = now;

    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
  }

  return {
    consume(key: string): boolean {
      const now = Date.now();

      sweep(now);

      const bucket = buckets.get(key);

      if (!bucket || bucket.resetAt <= now) {
        buckets.set(key, { count: 1, resetAt: now + windowMs });

        return true;
      }

      if (bucket.count >= limit) return false;

      bucket.count += 1;

      return true;
    },
  };
}
