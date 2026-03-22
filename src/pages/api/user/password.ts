import type { APIRoute } from "astro";
import { getDb } from "../../../lib/db";
import { verify, hash } from "../../../lib/auth";
import { users } from "../../../../shared/schema";
import { eq } from "drizzle-orm";

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const user = locals.user!;
  const env = locals.runtime.env;
  const form = await request.formData();
  const currentPassword = form.get("currentPassword") as string;
  const newPassword = form.get("newPassword") as string;

  if (!currentPassword || !newPassword || newPassword.length < 8) {
    return redirect("/settings?error=password");
  }

  if (!user.localPasswordHash) {
    return redirect("/settings?error=password");
  }

  const valid = await verify(currentPassword, user.localPasswordHash);
  if (!valid) return redirect("/settings?error=password");

  const { db, pool } = getDb(env);
  try {
    const hashed = await hash(newPassword);
    await db.update(users).set({ localPasswordHash: hashed }).where(eq(users.id, user.id));
    return redirect("/settings?success=password");
  } finally {
    await pool.end();
  }
};
