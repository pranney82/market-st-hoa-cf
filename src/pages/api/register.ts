import { formHandler } from "../../lib/api";
import { getDb } from "../../lib/db";
import { hash, createSession } from "../../lib/auth";
import { rateLimit, rateLimitResponse } from "../../lib/rate-limit";
import { getClientIp } from "../../lib/sanitize";
import { users, households } from "../../../shared/schema";
import { eq } from "drizzle-orm";

export const POST = formHandler(async ({ request, locals, redirect }) => {
  const env = locals.runtime.env;

  // Rate limit: 3 registrations per hour per IP
  const ip = getClientIp(request);
  const rl = await rateLimit(env.SESSIONS, `register:${ip}`, 3, 3600);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  const form = await request.formData();
  const email = (form.get("email") as string)?.trim();
  const password = form.get("password") as string;
  const firstName = (form.get("firstName") as string)?.trim();
  const lastName = (form.get("lastName") as string)?.trim();
  const houseNumber = (form.get("houseNumber") as string)?.trim();

  if (!email || !password || !firstName || !lastName || !houseNumber) {
    return redirect("/register?error=All fields are required");
  }
  if (password.length < 8) return redirect("/register?error=Password must be 8+ characters");
  if (!["667", "663", "659", "655", "651"].includes(houseNumber)) {
    return redirect("/register?error=Invalid house number");
  }

  const db = getDb(env);
  const [existing] = await db.select().from(users).where(eq(users.email, email));
  if (existing) return redirect("/register?error=Email already registered");

  const hashed = await hash(password);
  const address = `${houseNumber} Market Street`;
  const userId = `local_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  // D1 supports batch() for atomic multi-statement operations
  await db.insert(users).values({
    id: userId, email, firstName, lastName, address, localPasswordHash: hashed, role: "homeowner",
  });

  const [h] = await db.select().from(households).where(eq(households.address, address));
  if (h) {
    await db.update(users).set({ householdId: h.id }).where(eq(users.id, userId));
  } else {
    const [newH] = await db.insert(households).values({ address, primaryContactId: userId, isActive: true }).returning();
    await db.update(users).set({ householdId: newH.id }).where(eq(users.id, userId));
  }

  const cookie = await createSession(env, { userId, email, role: "homeowner" });
  return new Response(null, { status: 302, headers: { Location: "/dashboard", "Set-Cookie": cookie } });
}, "/register");
