import { formHandler } from "../../lib/api";
import { getDb } from "../../lib/db";
import { verify, createSession } from "../../lib/auth";
import { rateLimit, rateLimitResponse } from "../../lib/rate-limit";
import { getClientIp } from "../../lib/sanitize";
import { users } from "../../../shared/schema";
import { eq } from "drizzle-orm";

export const POST = formHandler(async ({ request, locals, redirect }) => {
  const env = locals.runtime.env;

  // Rate limit: 5 attempts per 15 min per IP
  const ip = getClientIp(request);
  const rl = await rateLimit(env.SESSIONS, `login:${ip}`, 5, 900);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  const form = await request.formData();
  const email = (form.get("email") as string)?.trim();
  const password = form.get("password") as string;

  if (!email || !password) return redirect("/login?error=Email and password are required");

  const db = getDb(env);
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user?.localPasswordHash) return redirect("/login?error=Invalid email or password");

  const valid = await verify(password, user.localPasswordHash);
  if (!valid) return redirect("/login?error=Invalid email or password");

  const cookie = await createSession(env, { userId: user.id, email: user.email!, role: user.role });
  return new Response(null, { status: 302, headers: { Location: "/dashboard", "Set-Cookie": cookie } });
}, "/login");
