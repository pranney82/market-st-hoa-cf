import { getDb } from "./db";
import { duesPayments, users, households, payments, systemSettings } from "../../shared/schema";
import { eq, and, lte, sql } from "drizzle-orm";
import { sendDuesNotificationEmail } from "./email";

export async function handleScheduled(event: ScheduledEvent, env: Env) {
  const db = getDb(env);

  switch (event.cron) {
    case "1 0 1 * *": return generateMonthlyDues(db, env);
    case "0 1 * * *": return updateOverdueDues(db);
    case "0 9 15 * *": return sendReminders(db, env);
    case "0 2 5 * *": return console.log("[Cron] Mercury import — TODO");
    case "0 * * * *": return settlePendingPayments(db, env);
    default: console.warn(`[Cron] Unknown: ${event.cron}`);
  }
}

async function generateMonthlyDues(db: ReturnType<typeof getDb>, env: Env) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  // Get monthly dues amount from settings
  const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.key, "monthly_dues_amount"));
  const amount = setting?.value || "150";

  // Get all active households
  const activeHouseholds = await db.select().from(households).where(eq(households.isActive, true));

  let created = 0;
  for (const household of activeHouseholds) {
    // Get primary contact or first member
    const members = await db.select().from(users).where(eq(users.householdId, household.id));
    const primary = members.find(m => m.id === household.primaryContactId) || members[0];
    if (!primary) continue;

    // Check if dues already exist for this period
    const periodStart = new Date(year, month, 1).toISOString();
    const periodEnd = new Date(year, month + 1, 0).toISOString();
    const dueDate = new Date(year, month, 1).toISOString();

    const [existing] = await db.select().from(duesPayments).where(
      and(eq(duesPayments.userId, primary.id), eq(duesPayments.periodStart, periodStart))
    );
    if (existing) continue;

    await db.insert(duesPayments).values({
      userId: primary.id,
      paymentType: "monthly",
      amount,
      periodStart,
      periodEnd,
      dueDate,
      status: "pending",
      description: `Monthly Dues - ${now.toLocaleString("default", { month: "long" })} ${year}`,
    });
    created++;

    // Send notification email
    if (primary.email && primary.emailNotifications) {
      await sendDuesNotificationEmail(env, primary.email, primary.firstName || "Homeowner", amount, new Date(dueDate).toLocaleDateString());
    }
  }

  console.log(`[Cron] Generated ${created} monthly dues records`);
}

async function updateOverdueDues(db: ReturnType<typeof getDb>) {
  const now = new Date().toISOString();
  const result = await db.update(duesPayments)
    .set({ status: "overdue", updatedAt: now })
    .where(and(eq(duesPayments.status, "pending"), lte(duesPayments.dueDate, now)));
  console.log("[Cron] Updated overdue dues");
}

async function sendReminders(db: ReturnType<typeof getDb>, env: Env) {
  const pending = await db.select({ dues: duesPayments, user: users })
    .from(duesPayments)
    .innerJoin(users, eq(duesPayments.userId, users.id))
    .where(eq(duesPayments.status, "pending"));

  let sent = 0;
  for (const { dues, user } of pending) {
    if (!user.email || !user.emailNotifications) continue;
    await sendDuesNotificationEmail(env, user.email, user.firstName || "Homeowner", dues.amount, new Date(dues.dueDate).toLocaleDateString());
    sent++;
  }
  console.log(`[Cron] Sent ${sent} reminder emails`);
}

async function settlePendingPayments(db: ReturnType<typeof getDb>, env: Env) {
  // Find payments in "pending" status and check with Helcim if settled
  const pendingPayments = await db.select().from(payments).where(eq(payments.status, "pending"));

  for (const payment of pendingPayments) {
    try {
      // Check card transaction first, then bank
      let res = await fetch(`https://api.helcim.com/v2/card-transactions/${payment.helcimTransactionId}`, {
        headers: { accept: "application/json", "api-token": env.HELCIM_API_TOKEN },
      });

      if (!res.ok) {
        res = await fetch(`https://api.helcim.com/v2/bank-transactions/${payment.helcimTransactionId}`, {
          headers: { accept: "application/json", "api-token": env.HELCIM_API_TOKEN },
        });
      }

      if (!res.ok) continue;

      const tx = await res.json();
      const settled = tx.status === "APPROVED" || tx.statusClearing === "SETTLED" || tx.statusClearing === 3;

      if (settled) {
        await db.update(payments).set({
          status: "settled", settledAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        }).where(eq(payments.id, payment.id));

        // Update linked dues to "paid"
        await db.update(duesPayments).set({
          status: "paid", paidDate: new Date().toISOString(), updatedAt: new Date().toISOString(),
        }).where(eq(duesPayments.helcimTransactionId, payment.helcimTransactionId));

        console.log(`[Cron] Settled payment ${payment.id}`);
      }
    } catch (err) {
      console.error(`[Cron] Error checking payment ${payment.id}:`, err);
    }
  }
}
