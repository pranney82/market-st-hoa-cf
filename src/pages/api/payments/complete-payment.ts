import { apiHandler } from "../../../lib/api";
import { getDb } from "../../../lib/db";
import { payments, paymentApplications, duesPayments } from "../../../../shared/schema";
import { eq, and } from "drizzle-orm";

const HELCIM_API_BASE = "https://api.helcim.com/v2";

export const POST = apiHandler(async ({ request, locals }) => {
  const user = locals.user;
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const env = locals.runtime.env;
  const { transactionId } = await request.json();

  // Retrieve checkout state from KV
  const raw = await env.SESSIONS.get(`checkout:${user.id}`);
  if (!raw) return Response.json({ error: "Payment session expired" }, { status: 400 });

  const { amount: sessionAmount } = JSON.parse(raw);

  // Verify transaction with Helcim (try card first, then bank/ACH)
  let transaction: any;
  let isACH = false;

  let verifyRes = await fetch(`${HELCIM_API_BASE}/card-transactions/${transactionId}`, {
    headers: { accept: "application/json", "api-token": env.HELCIM_API_TOKEN },
  });

  if (!verifyRes.ok) {
    verifyRes = await fetch(`${HELCIM_API_BASE}/bank-transactions/${transactionId}`, {
      headers: { accept: "application/json", "api-token": env.HELCIM_API_TOKEN },
    });
    if (!verifyRes.ok) return Response.json({ error: "Failed to verify payment" }, { status: 500 });
    isACH = true;
    transaction = await verifyRes.json();
    const achOk = transaction.statusAuth === 5 || transaction.statusAuth === "APPROVED" || transaction.statusAuth === "INITIATED";
    if (!achOk) return Response.json({ error: "Payment not approved" }, { status: 400 });
  } else {
    transaction = await verifyRes.json();
    if (transaction.status !== "APPROVED") return Response.json({ error: "Payment not approved" }, { status: 400 });
    isACH = !transaction.cardToken && (transaction.bankToken || transaction.bankAccountNumber);
  }

  const paymentMethod = isACH ? "ach" : "card";
  const db = getDb(env);

  // Create payment record
  const [paymentRecord] = await db.insert(payments).values({
    userId: user.id,
    householdId: user.householdId || null,
    amount: sessionAmount.toFixed(2),
    paymentMethod,
    helcimTransactionId: String(transactionId),
    last4: isACH ? transaction.bankAccountNumber?.slice(-4) : transaction.cardNumber?.slice(-4),
    cardType: isACH ? null : transaction.cardType,
    bankName: isACH ? (transaction.bankName || "Bank Account") : null,
    status: "pending",
    appliedAmount: "0",
    unappliedAmount: sessionAmount.toFixed(2),
    source: "online",
    notes: `Online payment - ${paymentMethod.toUpperCase()}`,
  }).returning();

  // Apply payment to oldest pending dues
  const pendingDues = await db.select().from(duesPayments)
    .where(and(eq(duesPayments.userId, user.id), eq(duesPayments.status, "pending")))
    .orderBy(duesPayments.dueDate);

  let remaining = sessionAmount;
  const paidDuesIds: string[] = [];

  for (const dues of pendingDues) {
    if (remaining <= 0) break;
    const duesAmount = parseFloat(dues.amount);
    const applyAmount = Math.min(remaining, duesAmount);

    await db.insert(paymentApplications).values({
      paymentId: paymentRecord.id,
      duesPaymentId: dues.id,
      amount: applyAmount.toFixed(2),
    });

    if (applyAmount >= duesAmount) {
      await db.update(duesPayments).set({
        status: "payment_pending",
        helcimTransactionId: String(transactionId),
        updatedAt: new Date().toISOString(),
      }).where(eq(duesPayments.id, dues.id));
      paidDuesIds.push(dues.id);
    }

    remaining -= applyAmount;
  }

  // Update payment applied amounts
  const applied = sessionAmount - remaining;
  await db.update(payments).set({
    appliedAmount: applied.toFixed(2),
    unappliedAmount: remaining.toFixed(2),
    updatedAt: new Date().toISOString(),
  }).where(eq(payments.id, paymentRecord.id));

  // Clean up KV checkout state
  await env.SESSIONS.delete(`checkout:${user.id}`);

  return Response.json({
    paymentId: paymentRecord.id,
    transactionId,
    applied: applied.toFixed(2),
    paidDuesCount: paidDuesIds.length,
  });
});
