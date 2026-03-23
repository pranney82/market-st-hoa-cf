import { apiHandler } from "../../../lib/api";
import { rateLimit } from "../../../lib/rate-limit";
import { audit } from "../../../lib/audit";
import { initializeVerifyCheckout } from "../../../lib/autopay";

/**
 * Initialize a HelcimPay.js "verify" checkout to capture a card/bank
 * for autopay without charging. Returns checkout tokens for the iframe.
 */
export const POST = apiHandler(async ({ request, locals }) => {
  const user = locals.user;
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const env = locals.runtime.env;
  if (!env.HELCIM_API_TOKEN) {
    return Response.json({ error: "Payment processing not configured" }, { status: 500 });
  }

  // Rate limit: 5 setup attempts per hour
  const rl = await rateLimit(env.SESSIONS, `autopay-setup:${user.id}`, 5, 3600);
  if (!rl.allowed) return Response.json({ error: "Too many requests" }, { status: 429 });

  const result = await initializeVerifyCheckout(env, user.helcimCustomerCode || undefined);
  if (!result) {
    return Response.json({ error: "Failed to initialize autopay setup" }, { status: 500 });
  }

  // Store secret token in KV for verification
  await env.SESSIONS.put(
    `autopay-setup:${user.id}`,
    JSON.stringify({ secretToken: result.secretToken }),
    { expirationTtl: 3600 }
  );

  await audit(env, request, user, {
    action: "autopay.setup_initiated",
    resourceType: "user",
    resourceId: user.id,
  });

  return Response.json({
    checkoutToken: result.checkoutToken,
    secretToken: result.secretToken,
  });
});
