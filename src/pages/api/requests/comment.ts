import { formHandler } from "../../../lib/api";
import { getDb } from "../../../lib/db";
import { sanitize } from "../../../lib/sanitize";
import { rateLimit } from "../../../lib/rate-limit";
import { audit } from "../../../lib/audit";
import { requestComments, architecturalRequests, commentRequestSchema } from "../../../../shared/schema";
import { eq } from "drizzle-orm";

export const POST = formHandler(async ({ request, locals, redirect }) => {
  const user = locals.user!;
  const env = locals.runtime.env;

  // Rate limit: 20 comments per hour
  const rl = await rateLimit(env.SESSIONS, `comment-request:${user.id}`, 20, 3600);
  if (!rl.allowed) return new Response("Too many requests", { status: 429 });

  const form = await request.formData();
  const parsed = commentRequestSchema.safeParse({
    requestId: form.get("requestId"),
    comment: (form.get("comment") as string)?.trim(),
  });

  if (!parsed.success) return redirect("/requests");

  const { requestId, comment } = parsed.data;

  const db = getDb(env);

  // Verify request exists and user has access (same household, or admin/board)
  const [req] = await db.select().from(architecturalRequests).where(eq(architecturalRequests.id, requestId));
  if (!req) return redirect("/requests");

  if (user.role !== "admin" && user.role !== "board" && req.householdId !== user.householdId) {
    return redirect("/requests");
  }

  await db.insert(requestComments).values({
    requestId,
    userId: user.id,
    comment: sanitize(comment),
  });

  await audit(env, request, user, {
    action: "request.comment",
    resourceType: "request",
    resourceId: requestId,
  });

  return redirect(`/requests/${requestId}?success=comment`);
}, "/requests");
