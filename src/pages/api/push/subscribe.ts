import { apiHandler } from "../../../lib/api";
import { rateLimit } from "../../../lib/rate-limit";
import { pushSubscriptionSchema } from "../../../../shared/schema";

export const POST = apiHandler(async ({ request, locals }) => {
  const user = locals.user;
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const env = locals.runtime.env;

  // Rate limit: 10 subscription updates per hour
  const rl = await rateLimit(env.SESSIONS, `push:${user.id}`, 10, 3600);
  if (!rl.allowed) return Response.json({ error: "Too many requests" }, { status: 429 });

  const body = await request.json();
  const parsed = pushSubscriptionSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid subscription data" }, { status: 400 });
  }

  await env.SESSIONS.put(`push:${user.id}`, JSON.stringify(parsed.data), { expirationTtl: 365 * 24 * 60 * 60 });
  return Response.json({ ok: true });
});
