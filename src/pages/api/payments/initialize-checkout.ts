import { apiHandler } from "../../../lib/api";

const HELCIM_API_BASE = "https://api.helcim.com/v2";

export const POST = apiHandler(async ({ request, locals }) => {
  const user = locals.user;
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const env = locals.runtime.env;
  if (!env.HELCIM_API_TOKEN) {
    return Response.json({ error: "Payment processing not configured" }, { status: 500 });
  }

  const { amount } = await request.json();
  const paymentAmount = parseFloat(amount);
  if (isNaN(paymentAmount) || paymentAmount < 1) {
    return Response.json({ error: "Minimum payment is $1.00" }, { status: 400 });
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

  return Response.json({ checkoutToken: data.checkoutToken, amount: paymentAmount });
});
