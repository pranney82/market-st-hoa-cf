import { formHandler } from "../../../lib/api";
import { getDb } from "../../../lib/db";
import { sanitize } from "../../../lib/sanitize";
import { users } from "../../../../shared/schema";
import { eq } from "drizzle-orm";

export const POST = formHandler(async ({ request, locals, redirect }) => {
  const user = locals.user!;
  const form = await request.formData();
  const updates: Record<string, string> = {};
  for (const key of ["firstName", "lastName", "phoneNumber"]) {
    const val = form.get(key) as string;
    if (val !== undefined && val !== null) updates[key] = sanitize(val.trim());
  }

  const db = getDb(locals.runtime.env);
  await db.update(users).set({ ...updates, updatedAt: new Date().toISOString() }).where(eq(users.id, user.id));
  return redirect("/settings?success=profile");
}, "/settings");
