import { apiHandler } from "../../../lib/api";
import { getDb } from "../../../lib/db";
import { rateLimit } from "../../../lib/rate-limit";
import { duesPayments } from "../../../../shared/schema";
import { eq, and, inArray } from "drizzle-orm";

const HELCIM_API_BASE = "https://api.helcim.com/v2";

export const POST = apiHandler(async ({ request, locals }) => {
  const user = locals.user;
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const env = locals.runtime.env;

  // Rate limit: 10 checkouts per hour
  const rl = await rateLimit(env.SESSIONS, `init-checkout:${user.id}`, 10, 3600);
  if (!rl.allowed) return Response.json({ error: "Too many requests" }, { status: 429 });

  if (!env.HELCIM_API_TOKEN) {
    return Response.json({ error: "Payment processing not configured" }, { status: 500 });
  }

  const db = getDb(env);

  // Calculate amount server-side from actual pending dues
  const pendingDues = await db.select().from(duesPayments)
    .where(and(
      eq(duesPayments.userId, user.id),
      inArray(duesPayments.status, ["pending", "overdue"])
    ));

  const paymentAmount = pendingDues.reduce((sum, d) => sum + parseFloat(d.amount), 0);

  if (paymentAmount < 1) {
    return Response.json({ error: "No outstanding balance" }, { status: 400 });
  }

  // Initialize Helcim checkout
  const res = await fetch(`${HELCIM_API_BASE}/helcim-pay/initialize`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-token": env.HELCIM_API_TOKEN,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      paymentType: "purchase",
      amount: paymentAmount,
      currency: "USD",
      paymentMethod: "cc-ach",
      hasConvenienceFee: 1,
      confirmationScreen: true,
    }),
  });

  if (!res.ok) {
    console.error("Helcim init error:", await res.text());
    return Response.json({ error: "Failed to initialize payment" }, { status: 500 });
  }

  const data = await res.json();

  // Store checkout state in KV (expires in 30 min)
  await env.SESSIONS.put(
    `checkout:${user.id}`,
    JSON.stringify({ amount: paymentAmount, secretToken: data.secretToken }),
    { expirationTtl: 1800 }
  );

  return Response.json({ checkoutToken: data.checkoutToken, secretToken: data.secretToken, amount: paymentAmount });
});
