import { getDb } from "./db";
import { duesPayments, users, households, systemSettings } from "../../shared/schema";
import { eq, and, lte, sql } from "drizzle-orm";
import { syncMercuryTransactions } from "./mercury";

export async function handleScheduled(event: ScheduledEvent, env: Env) {
  const db = getDb(env);

  switch (event.cron) {
    case "1 0 1 * *": return generateMonthlyDues(db, env);
    case "0 1 * * *": return updateOverdueDues(db);
    case "0 9 15 * *": return sendReminders(db, env);
    case "0 6 * * *": return syncMercury(env);
    default: console.warn(`[Cron] Unknown: ${event.cron}`);
  }
}

async function syncMercury(env: Env) {
  if (!env.MERCURY_API_TOKEN) {
    console.log("[Cron] Mercury API not configured, skipping sync");
    return;
  }
  try {
    const result = await syncMercuryTransactions(env);
    console.log(`[Cron] Mercury sync: ${result.synced} new, ${result.total} checked`);
  } catch (err) {
    console.error("[Cron] Mercury sync failed:", err);
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

  // Get all members at once instead of querying per household
  const allMembers = await db.select().from(users).where(sql`${users.householdId} IS NOT NULL`);
  const membersByHousehold = new Map<string, (typeof allMembers)[number][]>();
  for (const m of allMembers) {
    const arr = membersByHousehold.get(m.householdId!) || [];
    arr.push(m);
    membersByHousehold.set(m.householdId!, arr);
  }

  // Get all existing dues for this period to avoid duplicates
  const periodStart = new Date(year, month, 1).toISOString();
  const periodEnd = new Date(year, month + 1, 0).toISOString();
  const dueDate = new Date(year, month, 1).toISOString();
  const existingDues = await db.select().from(duesPayments).where(eq(duesPayments.periodStart, periodStart));
  const existingUserIds = new Set(existingDues.map(d => d.userId));

  // Collect all new dues records to insert as a batch
  const newDues: { userId: string; email: string | null; emailNotifications: boolean | null; firstName: string | null }[] = [];

  for (const household of activeHouseholds) {
    const members = membersByHousehold.get(household.id) || [];
    const primary = members.find(m => m.id === household.primaryContactId) || members[0];
    if (!primary) continue;

    // Skip if dues already exist for this user and period (idempotent)
    if (existingUserIds.has(primary.id)) continue;

    newDues.push({ userId: primary.id, email: primary.email, emailNotifications: primary.emailNotifications, firstName: primary.firstName });
  }

  if (newDues.length === 0) {
    console.log("[Cron] No new dues to generate");
    return;
  }

  // Batch insert all dues at once for atomicity
  await db.insert(duesPayments).values(
    newDues.map(d => ({
      userId: d.userId,
      paymentType: "monthly" as const,
      amount,
      periodStart,
      periodEnd,
      dueDate,
      status: "pending" as const,
      description: `Monthly Dues - ${now.toLocaleString("en-US", { month: "long" })} ${year}`,
    }))
  );

  // Queue notification emails (non-critical, ok to fail independently)
  for (const d of newDues) {
    if (d.email && d.emailNotifications) {
      try {
        await env.EMAIL_QUEUE.send({
          type: "dues_notification",
          to: d.email,
          name: d.firstName || "Homeowner",
          amount,
          dueDate: new Date(dueDate).toLocaleDateString("en-US"),
        });
      } catch (err) {
        console.error(`[Cron] Failed to queue dues notification for ${d.userId}:`, err);
      }
    }
  }

  console.log(`[Cron] Generated ${newDues.length} monthly dues records`);
}

async function updateOverdueDues(db: ReturnType<typeof getDb>) {
  const now = new Date().toISOString();
  await db.update(duesPayments)
    .set({ status: "overdue", updatedAt: now })
    .where(and(eq(duesPayments.status, "pending"), lte(duesPayments.dueDate, now)));
  console.log("[Cron] Updated overdue dues");
}

async function sendReminders(db: ReturnType<typeof getDb>, env: Env) {
  const pending = await db.select({ dues: duesPayments, user: users })
    .from(duesPayments)
    .innerJoin(users, eq(duesPayments.userId, users.id))
    .where(eq(duesPayments.status, "pending"));

  let queued = 0;
  for (const { dues, user } of pending) {
    if (!user.email || !user.emailNotifications) continue;
    try {
      await env.EMAIL_QUEUE.send({
        type: "dues_reminder",
        to: user.email,
        name: user.firstName || "Homeowner",
        amount: dues.amount,
        dueDate: new Date(dues.dueDate).toLocaleDateString("en-US"),
      });
      queued++;
    } catch (err) {
      console.error(`[Cron] Failed to queue reminder for ${user.id}:`, err);
    }
  }
  console.log(`[Cron] Queued ${queued} reminder emails`);
}
