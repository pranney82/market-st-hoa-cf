import { getDb } from "../../../lib/db";
import { sanitize } from "../../../lib/sanitize";
import { rateLimit } from "../../../lib/rate-limit";
import { audit } from "../../../lib/audit";
import { users, createUserSchema } from "../../../../shared/schema";
import { eq } from "drizzle-orm";
import type { APIContext } from "astro";

export async function POST({ request, locals, redirect }: APIContext) {
  const user = locals.user;
  if (!user || user.role !== "admin") {
    return new Response(JSON.stringify({ message: "Forbidden" }), { status: 403, headers: { "Content-Type": "application/json" } });
  }

  const env = locals.runtime.env;

  // Rate limit: 20 admin actions per hour
  const rl = await rateLimit(env.SESSIONS, `admin-users:${user.id}`, 20, 3600);
  if (!rl.allowed) return new Response("Too many requests", { status: 429 });

  const db = getDb(env);
  const form = await request.formData();
  const action = form.get("action") as string;

  if (action === "create") {
    const parsed = createUserSchema.safeParse({
      email: (form.get("email") as string)?.trim().toLowerCase(),
      firstName: (form.get("firstName") as string)?.trim(),
      lastName: (form.get("lastName") as string)?.trim(),
      role: form.get("role") || "homeowner",
      householdId: (form.get("householdId") as string) || null,
      sendWelcome: form.get("sendWelcome") === "true",
    });

    if (!parsed.success) {
      const msg = parsed.error.errors.map(e => e.message).join(". ");
      return redirect(`/admin/users?error=${encodeURIComponent(msg)}`);
    }

    const { email, firstName, lastName, role, householdId, sendWelcome } = parsed.data;

    // Check for existing user
    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existing) {
      return redirect("/admin/users?error=A user with this email already exists");
    }

    const id = crypto.randomUUID();
    await db.insert(users).values({
      id,
      email,
      firstName: sanitize(firstName),
      lastName: sanitize(lastName),
      role,
      householdId: householdId || null,
      memberStatus: "active",
      profileCompleted: false,
    });

    if (sendWelcome) {
      await env.EMAIL_QUEUE.send({
        type: "welcome",
        to: email,
        name: firstName,
      });
    }

    await audit(env, request, user, {
      action: "user.create",
      resourceType: "user",
      resourceId: id,
      details: { email, role },
    });

    return redirect("/admin/users?success=User added successfully");
  }

  if (action === "delete") {
    const userId = form.get("userId") as string;
    if (!userId) return redirect("/admin/users?error=User ID required");
    if (userId === user.id) return redirect("/admin/users?error=You cannot remove yourself");

    // Get user info for audit log before deletion
    const [targetUser] = await db.select({ email: users.email }).from(users).where(eq(users.id, userId)).limit(1);

    await db.delete(users).where(eq(users.id, userId));

    await audit(env, request, user, {
      action: "user.delete",
      resourceType: "user",
      resourceId: userId,
      details: { deletedEmail: targetUser?.email },
    });

    return redirect("/admin/users?success=User removed");
  }

  return redirect("/admin/users?error=Invalid action");
}
