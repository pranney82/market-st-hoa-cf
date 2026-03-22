import { formHandler } from "../../../lib/api";
import { getDb } from "../../../lib/db";
import { sanitize } from "../../../lib/sanitize";
import { architecturalRequests } from "../../../../shared/schema";
import { eq } from "drizzle-orm";

export const POST = formHandler(async ({ request, locals, redirect }) => {
  const user = locals.user!;
  if (user.role !== "admin" && user.role !== "board") return redirect("/requests");

  const form = await request.formData();
  const requestId = form.get("requestId") as string;
  const status = form.get("status") as string;
  const reviewNotes = sanitize((form.get("reviewNotes") as string)?.trim() || "");

  if (!requestId || !["approved", "denied"].includes(status)) return redirect("/requests");

  const db = getDb(locals.runtime.env);
  await db.update(architecturalRequests).set({
    status, reviewNotes: reviewNotes || null, reviewedBy: user.id,
    reviewedAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  }).where(eq(architecturalRequests.id, requestId));

  return redirect(`/requests/${requestId}?success=status`);
}, "/requests");
