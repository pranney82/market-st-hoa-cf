import { formHandler } from "../../../lib/api";
import { getDb } from "../../../lib/db";
import { sanitize } from "../../../lib/sanitize";
import { rateLimit } from "../../../lib/rate-limit";
import { audit } from "../../../lib/audit";
import { architecturalRequests, createRequestSchema } from "../../../../shared/schema";

export const POST = formHandler(async ({ request, locals, redirect }) => {
  const user = locals.user!;
  const env = locals.runtime.env;

  // Rate limit: 10 requests per hour
  const rl = await rateLimit(env.SESSIONS, `create-request:${user.id}`, 10, 3600);
  if (!rl.allowed) return new Response("Too many requests", { status: 429 });

  // Household check: user must belong to a household
  if (!user.householdId) {
    return redirect("/requests/new?error=You must be assigned to a household to submit requests");
  }

  const form = await request.formData();
  const parsed = createRequestSchema.safeParse({
    title: (form.get("title") as string)?.trim(),
    description: (form.get("description") as string)?.trim(),
    requestType: form.get("requestType") as string,
  });

  if (!parsed.success) {
    const msg = parsed.error.errors.map(e => e.message).join(". ");
    return redirect(`/requests/new?error=${encodeURIComponent(msg)}`);
  }

  const { title, description, requestType } = parsed.data;

  const db = getDb(env);
  const [req] = await db.insert(architecturalRequests).values({
    requestType,
    title: sanitize(title),
    description: sanitize(description),
    submittedBy: user.id,
    householdId: user.householdId,
  }).returning();

  await audit(env, request, user, {
    action: "request.create",
    resourceType: "request",
    resourceId: req.id,
    details: { title, requestType },
  });

  return redirect(`/requests/${req.id}`);
}, "/requests/new");
