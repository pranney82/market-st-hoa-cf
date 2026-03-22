import { formHandler } from "../../../lib/api";
import { getDb } from "../../../lib/db";
import { sanitize } from "../../../lib/sanitize";
import { requestComments } from "../../../../shared/schema";

export const POST = formHandler(async ({ request, locals, redirect }) => {
  const user = locals.user!;
  const form = await request.formData();
  const requestId = form.get("requestId") as string;
  const comment = sanitize((form.get("comment") as string)?.trim() || "");
  if (!requestId || !comment) return redirect("/requests");

  const db = getDb(locals.runtime.env);
  await db.insert(requestComments).values({ requestId, userId: user.id, comment });
  return redirect(`/requests/${requestId}?success=comment`);
}, "/requests");
