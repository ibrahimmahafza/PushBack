/**
 * Simple in-memory rate limiter for API routes.
 * Tracks requests per IP with a sliding window.
 * 
 * Not distributed (resets on redeploy/cold start), but sufficient
 * for preventing abuse on a hackathon demo.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up stale entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetAt) store.delete(key);
    }
  }, 5 * 60 * 1000);
}

/**
 * Check and consume a rate limit token.
 * @returns `null` if allowed, or a `{ error, retryAfter }` object if rate limited.
 */
export function rateLimit(
  ip: string,
  route: string,
  { maxRequests = 10, windowMs = 60 * 60 * 1000 }: { maxRequests?: number; windowMs?: number } = {}
): { error: string; retryAfter: number } | null {
  const key = `${route}:${ip}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (entry.count >= maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return {
      error: `Rate limit exceeded. You can make ${maxRequests} requests per hour. Please try again later.`,
      retryAfter,
    };
  }

  entry.count++;
  return null;
}
