import { formHandler } from "../../../lib/api";
import { getDb } from "../../../lib/db";
import { hash } from "../../../lib/auth";
import { users, passwordResetTokens } from "../../../../shared/schema";
import { eq, and } from "drizzle-orm";

export const POST = formHandler(async ({ request, locals, redirect }) => {
  const form = await request.formData();
  const token = form.get("token") as string;
  const newPassword = form.get("newPassword") as string;

  if (!token || !newPassword || newPassword.length < 8) {
    return redirect(`/reset-password?token=${token}&error=Password must be 8+ characters`);
  }

  const db = getDb(locals.runtime.env);

  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const tokenHash = Array.from(new Uint8Array(hashBuffer), b => b.toString(16).padStart(2, "0")).join("");

  const [record] = await db.select().from(passwordResetTokens).where(
    and(eq(passwordResetTokens.tokenHash, tokenHash), eq(passwordResetTokens.used, false))
  );

  if (!record || new Date(record.expiresAt) < new Date()) {
    return redirect(`/reset-password?token=${token}&error=Invalid or expired token`);
  }

  const hashed = await hash(newPassword);
  await db.update(users).set({ localPasswordHash: hashed }).where(eq(users.id, record.userId));
  await db.update(passwordResetTokens).set({ used: true }).where(eq(passwordResetTokens.id, record.id));

  return redirect("/login");
}, "/forgot-password");
