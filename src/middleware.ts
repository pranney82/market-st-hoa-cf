import { defineMiddleware } from "astro:middleware";
import { getSession, getUser } from "./lib/auth";
import { getDb } from "./lib/db";
import { generateCsrfToken, validateCsrf } from "./lib/csrf";

const PUBLIC_PATHS = ["/", "/login", "/register", "/forgot-password", "/reset-password"];
const PUBLIC_API = ["/api/login", "/api/register", "/api/auth/request-password-reset", "/api/auth/reset-password"];

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, locals, url, redirect } = context;
  const env = locals.runtime.env;
  const path = url.pathname;
  const isApi = path.startsWith("/api/");
  const isPublic = PUBLIC_PATHS.includes(path) || PUBLIC_API.includes(path);

  // ── CSRF validation on all POSTs (except public APIs) ─────────
  if (request.method === "POST" && !PUBLIC_API.includes(path) && env.SESSION_SECRET) {
    const valid = await validateCsrf(request, env.SESSION_SECRET);
    if (!valid && !isPublic) {
      if (isApi) {
        return new Response(JSON.stringify({ message: "Invalid CSRF token" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }
      return redirect(url.pathname);
    }
  }

  // ── Auth check ────────────────────────────────────────────────
  if (isPublic) {
    locals.user = null;
  } else {
    const session = await getSession(request, env);
    if (!session) {
      if (isApi) return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
      return redirect("/login");
    }

    const db = getDb(env);
    const user = await getUser(db, session);
    if (!user) {
      if (isApi) return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
      return redirect("/login");
    }
    locals.user = user;
  }

  // ── Generate CSRF token for pages ─────────────────────────────
  if (!isApi && request.method === "GET" && env.SESSION_SECRET) {
    const { token, cookie } = await generateCsrfToken(env.SESSION_SECRET);
    locals.csrfToken = token;
    const response = await next();

    // Set CSRF cookie
    response.headers.append("Set-Cookie", cookie);

    // ── Security headers ──────────────────────────────────────
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "SAMEORIGIN");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    response.headers.set("Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; frame-ancestors 'self'"
    );

    return response;
  }

  return next();
});
