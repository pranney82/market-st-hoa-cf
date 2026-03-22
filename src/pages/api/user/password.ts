import { formHandler } from "../../../lib/api";
import { getDb } from "../../../lib/db";
import { verify, hash } from "../../../lib/auth";
import { users } from "../../../../shared/schema";
import { eq } from "drizzle-orm";

export const POST = formHandler(async ({ request, locals, redirect }) => {
  const user = locals.user!;
  const form = await request.formData();
  const currentPassword = form.get("currentPassword") as string;
  const newPassword = form.get("newPassword") as string;

  if (!currentPassword || !newPassword || newPassword.length < 8) return redirect("/settings?error=password");
  if (!user.localPasswordHash) return redirect("/settings?error=password");

  const valid = await verify(currentPassword, user.localPasswordHash);
  if (!valid) return redirect("/settings?error=password");

  const hashed = await hash(newPassword);
  const db = getDb(locals.runtime.env);
  await db.update(users).set({ localPasswordHash: hashed }).where(eq(users.id, user.id));
  return redirect("/settings?success=password");
}, "/settings");
