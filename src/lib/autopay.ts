/**
 * Autopay via Helcim Recurring API.
 *
 * Flow:
 * 1. Admin creates a Payment Plan in Helcim (or via API) for monthly dues
 * 2. User clicks "Set Up Autopay" → HelcimPay.js with paymentType: "verify"
 *    captures their card/bank and sets it as default payment method
 * 3. We subscribe the customer to the plan via POST /v2/subscriptions
 * 4. Helcim charges them automatically on the billing date
 * 5. User can cancel anytime via DELETE /v2/subscriptions/{id}
 */

const HELCIM_API = "https://api.helcim.com/v2";

function helcimHeaders(apiToken: string) {
  return {
    accept: "application/json",
    "api-token": apiToken,
    "content-type": "application/json",
  };
}

// ── Payment Plans ──────────────────────────────────────────────

export interface HelcimPlan {
  id: number;
  name: string;
  amount: number;
  currency: string;
  status: string;
  frequency: string;
}

export async function getPaymentPlans(env: Env): Promise<HelcimPlan[]> {
  const res = await fetch(`${HELCIM_API}/payment-plans`, {
    headers: helcimHeaders(env.HELCIM_API_TOKEN),
  });
  if (!res.ok) {
    console.error("[Autopay] Failed to fetch plans:", res.status);
    return [];
  }
  return res.json();
}

// ── Subscriptions ──────────────────────────────────────────────

export interface HelcimSubscription {
  id: number;
  paymentPlanId: number;
  customerCode: string;
  status: string;
  amount: number;
  nextBillingDate: string;
}

export async function getSubscription(env: Env, subscriptionId: number): Promise<HelcimSubscription | null> {
  const res = await fetch(`${HELCIM_API}/subscriptions/${subscriptionId}`, {
    headers: helcimHeaders(env.HELCIM_API_TOKEN),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function createSubscription(
  env: Env,
  planId: number,
  customerCode: string,
  amount: number,
): Promise<{ success: boolean; subscriptionId?: number; error?: string }> {
  const res = await fetch(`${HELCIM_API}/subscriptions`, {
    method: "POST",
    headers: helcimHeaders(env.HELCIM_API_TOKEN),
    body: JSON.stringify({
      paymentPlanId: planId,
      customerCode,
      amount,
      activationDate: new Date().toISOString().split("T")[0],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[Autopay] Create subscription failed:", text);
    return { success: false, error: "Failed to create subscription" };
  }

  const data = await res.json();
  return { success: true, subscriptionId: data.id };
}

export async function cancelSubscription(
  env: Env,
  subscriptionId: number,
): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(`${HELCIM_API}/subscriptions/${subscriptionId}`, {
    method: "DELETE",
    headers: helcimHeaders(env.HELCIM_API_TOKEN),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[Autopay] Cancel subscription failed:", text);
    return { success: false, error: "Failed to cancel subscription" };
  }

  return { success: true };
}

// ── Verify Checkout (capture card without charging) ────────────

export async function initializeVerifyCheckout(
  env: Env,
  customerCode?: string,
): Promise<{ checkoutToken: string; secretToken: string } | null> {
  const body: Record<string, unknown> = {
    paymentType: "verify",
    currency: "USD",
    amount: 0,
  };
  if (customerCode) {
    body.customerCode = customerCode;
  }

  const res = await fetch(`${HELCIM_API}/helcim-pay/initialize`, {
    method: "POST",
    headers: helcimHeaders(env.HELCIM_API_TOKEN),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error("[Autopay] Verify checkout init failed:", await res.text());
    return null;
  }

  return res.json();
}
