import { formHandler } from "../../../lib/api";
import { getDb } from "../../../lib/db";
import { sanitize } from "../../../lib/sanitize";
import { rateLimit } from "../../../lib/rate-limit";
import { audit } from "../../../lib/audit";
import { users, updateProfileSchema } from "../../../../shared/schema";
import { eq } from "drizzle-orm";

export const POST = formHandler(async ({ request, locals, redirect }) => {
  const user = locals.user!;
  const env = locals.runtime.env;

  // Rate limit: 10 profile updates per hour
  const rl = await rateLimit(env.SESSIONS, `profile:${user.id}`, 10, 3600);
  if (!rl.allowed) return new Response("Too many requests", { status: 429 });

  const form = await request.formData();
  const parsed = updateProfileSchema.safeParse({
    firstName: (form.get("firstName") as string)?.trim() || undefined,
    lastName: (form.get("lastName") as string)?.trim() || undefined,
    phoneNumber: (form.get("phoneNumber") as string)?.trim() || undefined,
  });

  if (!parsed.success) {
    const msg = parsed.error.errors.map(e => e.message).join(". ");
    return redirect(`/settings?error=${encodeURIComponent(msg)}`);
  }

  const updates: Record<string, string> = {};
  for (const [key, value] of Object.entries(parsed.data)) {
    if (value !== undefined) updates[key] = sanitize(value);
  }

  const db = getDb(env);
  await db.update(users).set({ ...updates, updatedAt: new Date().toISOString() }).where(eq(users.id, user.id));

  await audit(env, request, user, {
    action: "user.update_profile",
    resourceType: "user",
    resourceId: user.id,
    details: { fields: Object.keys(updates) },
  });

  return redirect("/settings?success=profile");
}, "/settings");
