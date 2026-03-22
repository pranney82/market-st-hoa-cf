import type { APIRoute } from "astro";
import { getDb } from "../../../lib/db";
import { users } from "../../../../shared/schema";
import { eq } from "drizzle-orm";

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const user = locals.user!;
  const env = locals.runtime.env;
  const form = await request.formData();

  const updates: Record<string, string> = {};
  for (const key of ["firstName", "lastName", "phoneNumber"]) {
    const val = form.get(key) as string;
    if (val !== undefined && val !== null) updates[key] = val.trim();
  }

  const db = getDb(env);
  try {
    await db.update(users).set(updates).where(eq(users.id, user.id));
    return redirect("/settings?success=profile");
};
