import type { APIRoute } from "astro";
import { getDb } from "../../lib/db";
import { verify, createSession } from "../../lib/auth";
import { users } from "../../../shared/schema";
import { eq } from "drizzle-orm";

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const env = locals.runtime.env;
  const form = await request.formData();
  const email = (form.get("email") as string)?.trim();
  const password = form.get("password") as string;

  if (!email || !password) {
    return redirect("/login?error=Email and password are required");
  }

  const db = getDb(env);

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user || !user.localPasswordHash) {
      return redirect("/login?error=Invalid email or password");
    }

    const valid = await verify(password, user.localPasswordHash);
    if (!valid) {
      return redirect("/login?error=Invalid email or password");
    }

    const cookie = await createSession(env, {
      userId: user.id,
      email: user.email!,
      role: user.role,
    });

    return new Response(null, {
      status: 302,
      headers: {
        Location: "/dashboard",
        "Set-Cookie": cookie,
      },
    });
};
