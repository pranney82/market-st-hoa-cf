import { formHandler } from "../../../lib/api";
import { getDb } from "../../../lib/db";
import { sanitize } from "../../../lib/sanitize";
import { rateLimit } from "../../../lib/rate-limit";
import { audit } from "../../../lib/audit";
import { architecturalRequests, reviewRequestSchema, users } from "../../../../shared/schema";
import { eq } from "drizzle-orm";

export const POST = formHandler(async ({ request, locals, redirect }) => {
  const user = locals.user!;
  const env = locals.runtime.env;

  if (user.role !== "admin" && user.role !== "board") return redirect("/requests");

  // Rate limit: 30 reviews per hour
  const rl = await rateLimit(env.SESSIONS, `review-request:${user.id}`, 30, 3600);
  if (!rl.allowed) return new Response("Too many requests", { status: 429 });

  const form = await request.formData();
  const parsed = reviewRequestSchema.safeParse({
    requestId: form.get("requestId"),
    status: form.get("status"),
    reviewNotes: (form.get("reviewNotes") as string)?.trim(),
  });

  if (!parsed.success) return redirect("/requests");

  const { requestId, status, reviewNotes } = parsed.data;

  const db = getDb(env);

  // Only allow reviewing pending requests
  const [existing] = await db.select().from(architecturalRequests).where(eq(architecturalRequests.id, requestId));
  if (!existing || existing.status !== "pending") return redirect(`/requests/${requestId}`);

  await db.update(architecturalRequests).set({
    status,
    reviewNotes: reviewNotes ? sanitize(reviewNotes) : null,
    reviewedBy: user.id,
    reviewedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }).where(eq(architecturalRequests.id, requestId));

  await audit(env, request, user, {
    action: `request.${status}`,
    resourceType: "request",
    resourceId: requestId,
    details: { status, reviewNotes: reviewNotes || null, submittedBy: existing.submittedBy },
  });

  // Notify the submitter of the decision
  const [submitter] = await db.select().from(users).where(eq(users.id, existing.submittedBy)).limit(1);
  if (submitter?.email && submitter.emailNotifications) {
    await env.EMAIL_QUEUE.send({
      type: "request_status",
      to: submitter.email,
      name: submitter.firstName || "Homeowner",
      title: existing.title,
      status,
      notes: reviewNotes || undefined,
      requestId,
    });
  }

  return redirect(`/requests/${requestId}?success=status`);
}, "/requests");
