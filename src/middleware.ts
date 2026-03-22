import { defineMiddleware } from "astro:middleware";
import { getSession, getUser } from "./lib/auth";
import { getDb } from "./lib/db";

const PUBLIC = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/api/login", "/api/register", "/api/auth/request-password-reset", "/api/auth/reset-password"];

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, locals, url, redirect } = context;
  const env = locals.runtime.env;

  // Public routes — no auth needed
  if (PUBLIC.some((p) => url.pathname === p || url.pathname.startsWith("/api/public"))) {
    locals.user = null;
    return next();
  }

  // Check session
  const session = await getSession(request, env);

  if (!session) {
    // API routes return 401, pages redirect to login
    if (url.pathname.startsWith("/api/")) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    return redirect("/login");
  }

  // Hydrate full user from DB
  const { db, pool } = getDb(env);
  try {
    const user = await getUser(db, session);
    if (!user) {
      if (url.pathname.startsWith("/api/")) {
        return new Response(JSON.stringify({ message: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
      return redirect("/login");
    }
    locals.user = user;
  } finally {
    await pool.end();
  }

  return next();
});
