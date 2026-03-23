import type { APIContext } from "astro";
import { getDb } from "../../../lib/db";
import { users } from "../../../../shared/schema";
import { eq } from "drizzle-orm";
import { sendWelcomeEmail } from "../../../lib/email";

export async function POST({ request, locals, redirect }: APIContext) {
  const user = locals.user;
  if (!user || user.role !== "admin") {
    return new Response(JSON.stringify({ message: "Forbidden" }), { status: 403, headers: { "Content-Type": "application/json" } });
  }

  const env = locals.runtime.env;
  const db = getDb(env);
  const form = await request.formData();
  const action = form.get("action") as string;

  if (action === "create") {
    const email = (form.get("email") as string)?.trim().toLowerCase();
    const firstName = (form.get("firstName") as string)?.trim();
    const lastName = (form.get("lastName") as string)?.trim();
    const roleInput = (form.get("role") as string) || "homeowner";
    const validRoles = ["admin", "board", "homeowner"] as const;
    const role = validRoles.includes(roleInput as any) ? roleInput : "homeowner";
    const householdId = (form.get("householdId") as string) || null;
    const sendWelcome = form.get("sendWelcome") === "true";

    if (!email || !firstName || !lastName) {
      return redirect("/admin/users?error=Email, first name, and last name are required");
    }

    // Basic email format validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return redirect("/admin/users?error=Invalid email format");
    }

    // Check for existing user
    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existing) {
      return redirect("/admin/users?error=A user with this email already exists");
    }

    const id = crypto.randomUUID();
    await db.insert(users).values({
      id,
      email,
      firstName,
      lastName,
      role,
      householdId: householdId || null,
      memberStatus: "active",
      profileCompleted: false,
    });

    if (sendWelcome) {
      await sendWelcomeEmail(env, email, firstName);
    }

    return redirect("/admin/users?success=User added successfully");
  }

  if (action === "delete") {
    const userId = form.get("userId") as string;
    if (!userId) return redirect("/admin/users?error=User ID required");
    if (userId === user.id) return redirect("/admin/users?error=You cannot remove yourself");

    await db.delete(users).where(eq(users.id, userId));
    return redirect("/admin/users?success=User removed");
  }

  return redirect("/admin/users?error=Invalid action");
}
