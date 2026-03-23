import { describe, it, expect, vi, beforeEach } from "vitest";
import { rateLimit, rateLimitResponse } from "../src/lib/rate-limit";

// Mock KV namespace
function createMockKV(): KVNamespace {
  const store = new Map<string, string>();
  return {
    get: vi.fn(async (key: string) => store.get(key) ?? null),
    put: vi.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    delete: vi.fn(),
    list: vi.fn(),
    getWithMetadata: vi.fn(),
  } as unknown as KVNamespace;
}

describe("rateLimit", () => {
  let kv: KVNamespace;

  beforeEach(() => {
    kv = createMockKV();
  });

  it("allows first request", async () => {
    const result = await rateLimit(kv, "test:user1", 5, 60);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("tracks request count", async () => {
    await rateLimit(kv, "test:user1", 5, 60);
    const result = await rateLimit(kv, "test:user1", 5, 60);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(3);
  });

  it("blocks after exceeding limit", async () => {
    for (let i = 0; i < 5; i++) {
      await rateLimit(kv, "test:user1", 5, 60);
    }
    const result = await rateLimit(kv, "test:user1", 5, 60);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("tracks different keys independently", async () => {
    for (let i = 0; i < 5; i++) {
      await rateLimit(kv, "test:user1", 5, 60);
    }
    const result = await rateLimit(kv, "test:user2", 5, 60);
    expect(result.allowed).toBe(true);
  });
});

describe("rateLimitResponse", () => {
  it("returns 429 status", () => {
    const res = rateLimitResponse(Date.now() + 60000);
    expect(res.status).toBe(429);
  });

  it("includes Retry-After header", () => {
    const resetAt = Date.now() + 60000;
    const res = rateLimitResponse(resetAt);
    const retryAfter = parseInt(res.headers.get("Retry-After") || "0");
    expect(retryAfter).toBeGreaterThan(0);
    expect(retryAfter).toBeLessThanOrEqual(60);
  });

  it("returns JSON body", async () => {
    const res = rateLimitResponse(Date.now() + 60000);
    const body = await res.json();
    expect(body.message).toContain("Too many requests");
  });
});
