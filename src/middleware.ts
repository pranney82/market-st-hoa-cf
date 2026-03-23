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

  // ── Public paths ────────────────────────────────────────────────
  if (PUBLIC_PATHS.includes(path)) {
    locals.user = null;
    return addSecurityHeaders(await next());
  }

  // ── Dev bypass (wrangler dev has no CF Access in front) ─────────
  if (env.CF_ACCESS_TEAM_DOMAIN === "dev") {
    const db = getDb(env);
    const devUser = await getUserByEmail(db, "peterranney@gmail.com");
    if (devUser) {
      locals.user = devUser;
      return addSecurityHeaders(await next());
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

  return addSecurityHeaders(await next());
});

function addSecurityHeaders(response: Response): Response {
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.helcim.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://api.helcim.com; frame-src https://checkout.helcim.com; frame-ancestors 'self'"
  );
  return response;
}

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
