// Rate limiting using KV with TTL-based expiry.
// Each key is ip:route, value is a count. Expires after the window.

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export async function rateLimit(
  kv: KVNamespace,
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const kvKey = `rl:${key}`;
  const now = Date.now();

  const raw = await kv.get(kvKey);
  let data: { count: number; resetAt: number } | null = raw ? JSON.parse(raw) : null;

  // Window expired or no data — start fresh
  if (!data || data.resetAt < now) {
    data = { count: 1, resetAt: now + windowSeconds * 1000 };
    await kv.put(kvKey, JSON.stringify(data), { expirationTtl: windowSeconds });
    return { allowed: true, remaining: maxRequests - 1, resetAt: data.resetAt };
  }

  // Within window
  data.count += 1;

  if (data.count > maxRequests) {
    return { allowed: false, remaining: 0, resetAt: data.resetAt };
  }

  await kv.put(kvKey, JSON.stringify(data), { expirationTtl: windowSeconds });
  return { allowed: true, remaining: maxRequests - data.count, resetAt: data.resetAt };
}

export function rateLimitResponse(resetAt: number): Response {
  return new Response(JSON.stringify({ message: "Too many requests. Please try again later." }), {
    status: 429,
    headers: {
      "Content-Type": "application/json",
      "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
    },
  });
}
