import { apiHandler } from "../../../lib/api";
import { getDb } from "../../../lib/db";
import { rateLimit } from "../../../lib/rate-limit";
import { audit } from "../../../lib/audit";
import { users } from "../../../../shared/schema";
import { eq } from "drizzle-orm";
import { cancelSubscription } from "../../../lib/autopay";

/**
 * Cancel the user's autopay subscription in Helcim and update local state.
 */
export const POST = apiHandler(async ({ request, locals }) => {
  const user = locals.user;
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const env = locals.runtime.env;
  if (!env.HELCIM_API_TOKEN) {
    return Response.json({ error: "Payment processing not configured" }, { status: 500 });
  }

  // Rate limit
  const rl = await rateLimit(env.SESSIONS, `autopay-cancel:${user.id}`, 5, 3600);
  if (!rl.allowed) return Response.json({ error: "Too many requests" }, { status: 429 });

  if (!user.helcimSubscriptionId) {
    return Response.json({ error: "No active autopay subscription" }, { status: 400 });
  }

  // Cancel in Helcim
  const result = await cancelSubscription(env, user.helcimSubscriptionId);
  if (!result.success) {
    return Response.json({ error: result.error || "Failed to cancel autopay" }, { status: 500 });
  }

  // Update user record
  const db = getDb(env);
  await db.update(users).set({
    autopayEnabled: false,
    helcimSubscriptionId: null,
    updatedAt: new Date().toISOString(),
  }).where(eq(users.id, user.id));

  await audit(env, request, user, {
    action: "autopay.cancelled",
    resourceType: "user",
    resourceId: user.id,
  });

  return Response.json({ success: true });
});
