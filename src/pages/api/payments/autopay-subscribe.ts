import { apiHandler } from "../../../lib/api";
import { getDb } from "../../../lib/db";
import { rateLimit } from "../../../lib/rate-limit";
import { audit } from "../../../lib/audit";
import { users } from "../../../../shared/schema";
import { eq } from "drizzle-orm";
import { createSubscription, getPaymentPlans } from "../../../lib/autopay";

/**
 * After successful verify checkout, subscribe the user to the
 * monthly dues recurring plan in Helcim.
 *
 * The plan and amount live entirely in Helcim — we fetch the
 * first active plan and subscribe to it. No local config needed.
 */
export const POST = apiHandler(async ({ request, locals }) => {
  const user = locals.user;
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const env = locals.runtime.env;
  if (!env.HELCIM_API_TOKEN) {
    return Response.json({ error: "Payment processing not configured" }, { status: 500 });
  }

  // Rate limit
  const rl = await rateLimit(env.SESSIONS, `autopay-sub:${user.id}`, 5, 3600);
  if (!rl.allowed) return Response.json({ error: "Too many requests" }, { status: 429 });

  const { customerCode, secretToken, cardLast4, cardType, bankLast4, bankName } = await request.json();
  if (!customerCode) {
    return Response.json({ error: "Customer code required" }, { status: 400 });
  }

  // Verify the setup session
  const raw = await env.SESSIONS.get(`autopay-setup:${user.id}`);
  if (!raw) {
    return Response.json({ error: "Setup session expired" }, { status: 400 });
  }
  const session = JSON.parse(raw);
  if (session.secretToken !== secretToken) {
    return Response.json({ error: "Invalid session" }, { status: 403 });
  }

  // Already has an active subscription?
  if (user.helcimSubscriptionId) {
    return Response.json({ error: "Autopay is already active" }, { status: 400 });
  }

  // Get plan from Helcim — plan + amount live there, not in our DB
  const plans = await getPaymentPlans(env);
  if (plans.length === 0) {
    return Response.json({ error: "No autopay plan configured in Helcim" }, { status: 500 });
  }
  const plan = plans[0];

  // Create the subscription in Helcim
  const result = await createSubscription(env, plan.id, customerCode, plan.amount);
  if (!result.success) {
    return Response.json({ error: result.error || "Failed to set up autopay" }, { status: 500 });
  }

  // Track subscription locally (for cancel + UI display only)
  const db = getDb(env);
  await db.update(users).set({
    autopayEnabled: true,
    helcimCustomerCode: customerCode,
    helcimSubscriptionId: result.subscriptionId!,
    autopayMethod: bankLast4 ? "ach" : "card",
    autopayCardLast4: cardLast4 || null,
    autopayCardType: cardType || null,
    autopayBankLast4: bankLast4 || null,
    autopayBankName: bankName || null,
    updatedAt: new Date().toISOString(),
  }).where(eq(users.id, user.id));

  // Clean up setup session
  await env.SESSIONS.delete(`autopay-setup:${user.id}`);

  await audit(env, request, user, {
    action: "autopay.subscribed",
    resourceType: "user",
    resourceId: user.id,
    details: { subscriptionId: result.subscriptionId, planId: plan.id },
  });

  return Response.json({ success: true, subscriptionId: result.subscriptionId });
});
