import { formHandler } from "../../../lib/api";
import { getDb } from "../../../lib/db";
import { sanitize } from "../../../lib/sanitize";
import { architecturalRequests } from "../../../../shared/schema";

export const POST = formHandler(async ({ request, locals, redirect }) => {
  const user = locals.user!;
  const form = await request.formData();
  const title = sanitize((form.get("title") as string)?.trim() || "");
  const description = sanitize((form.get("description") as string)?.trim() || "");
  const requestType = (form.get("requestType") as string) || "architectural";

  if (!title || !description || description.length < 10) {
    return redirect("/requests/new?error=Title and description (10+ chars) required");
  }

  const db = getDb(locals.runtime.env);
  const [req] = await db.insert(architecturalRequests).values({
    requestType, title, description, submittedBy: user.id, householdId: user.householdId,
  }).returning();

  return redirect(`/requests/${req.id}`);
}, "/requests/new");
