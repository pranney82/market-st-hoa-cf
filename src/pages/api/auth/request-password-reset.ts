import { formHandler } from "../../../lib/api";
import { getDb } from "../../../lib/db";
import { rateLimit, rateLimitResponse } from "../../../lib/rate-limit";
import { getClientIp } from "../../../lib/sanitize";
import { users, passwordResetTokens } from "../../../../shared/schema";
import { eq } from "drizzle-orm";

export const POST = formHandler(async ({ request, locals, redirect }) => {
  const env = locals.runtime.env;

  // Rate limit: 3 requests per 15 min per IP
  const ip = getClientIp(request);
  const rl = await rateLimit(env.SESSIONS, `reset:${ip}`, 3, 900);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  const form = await request.formData();
  const email = (form.get("email") as string)?.trim();
  if (!email) return redirect("/forgot-password");

  const db = getDb(env);
  const [user] = await db.select().from(users).where(eq(users.email, email));

  if (user) {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    const token = Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");

    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const tokenHash = Array.from(new Uint8Array(hashBuffer), b => b.toString(16).padStart(2, "0")).join("");

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    await db.insert(passwordResetTokens).values({ userId: user.id, tokenHash, expiresAt });
    // TODO: send email via Resend with: ${env.BASE_URL}/reset-password?token=${token}
  }

  return redirect("/forgot-password?sent=1");
}, "/forgot-password");
