import { defineMiddleware } from "astro:middleware";
import { authenticateRequest, getUserByEmail } from "./lib/auth";
import { getDb } from "./lib/db";

// Landing page is public (prerendered). Everything else requires auth.
const PUBLIC_PATHS = ["/", "/not-provisioned"];

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, locals, url, redirect } = context;
  const env = locals.runtime.env;
  const path = url.pathname;
  const isApi = path.startsWith("/api/");

  // ── Generate CSP nonce for this request ───────────────────────
  const nonceBytes = new Uint8Array(16);
  crypto.getRandomValues(nonceBytes);
  const nonce = btoa(String.fromCharCode(...nonceBytes));
  locals.nonce = nonce;

  // ── Public paths ────────────────────────────────────────────────
  if (PUBLIC_PATHS.includes(path)) {
    locals.user = null;
    return await addSecurityHeaders(await next(), nonce);
  }

  // ── Dev bypass (wrangler dev has no CF Access in front) ─────────
  if (env.CF_ACCESS_TEAM_DOMAIN === "dev") {
    const db = getDb(env);
    const devUser = await getUserByEmail(db, "peterranney@gmail.com");
    if (devUser) {
      locals.user = devUser;
      return await addSecurityHeaders(await next(), nonce);
    }
  }

  // ── Authenticate via CF Access JWT ──────────────────────────────
  const identity = await authenticateRequest(request, env);
  if (!identity) {
    if (isApi) return jsonError("Unauthorized", 401);
    return redirect("/");
  }

  // ── Authorize: look up user in D1 ──────────────────────────────
  const db = getDb(env);
  const user = await getUserByEmail(db, identity.email);
  if (!user) {
    if (isApi) return jsonError("Account not provisioned", 403);
    return redirect("/not-provisioned");
  }

  locals.user = user;

  // ── CSRF: verify Origin on state-changing requests ────────
  if (request.method === "POST" || request.method === "PUT" || request.method === "DELETE" || request.method === "PATCH") {
    const origin = request.headers.get("Origin");
    const allowed = env.BASE_URL ? new URL(env.BASE_URL).origin : url.origin;
    if (!origin || origin !== allowed) {
      if (isApi) return jsonError("Forbidden", 403);
      return new Response("Forbidden", { status: 403 });
    }
  }

  return await addSecurityHeaders(await next(), nonce);
});

async function addSecurityHeaders(response: Response, nonce: string): Promise<Response> {
  const contentType = response.headers.get("content-type") || "";
  let body: string | ReadableStream<Uint8Array> | null = response.body;

  // Inject nonce into any inline <script> tags that Astro generated without one
  if (contentType.includes("text/html") && body) {
    const html = await response.text();
    body = html.replace(/<script(?![^>]*\bnonce=)/g, `<script nonce="${nonce}"`);
  }

  const patched = new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers: new Headers(response.headers),
  });
  patched.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  patched.headers.set("X-Content-Type-Options", "nosniff");
  patched.headers.set("X-Frame-Options", "SAMEORIGIN");
  patched.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  patched.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  patched.headers.set("Content-Security-Policy",
    `default-src 'self'; script-src 'self' 'nonce-${nonce}' https://js.helcim.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://api.helcim.com; frame-src https://checkout.helcim.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self'`
  );
  return patched;
}

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
