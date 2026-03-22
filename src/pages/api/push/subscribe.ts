import { apiHandler } from "../../../lib/api";

export const POST = apiHandler(async ({ request, locals }) => {
  const user = locals.user;
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const subscription = await request.json();
  await locals.runtime.env.SESSIONS.put(`push:${user.id}`, JSON.stringify(subscription), { expirationTtl: 365 * 24 * 60 * 60 });
  return Response.json({ ok: true });
});
