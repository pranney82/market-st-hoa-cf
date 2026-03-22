import { getDb } from "./db";
import { duesPayments, users, households, systemSettings } from "../../shared/schema";
import { eq, and, lte, sql } from "drizzle-orm";

export async function handleScheduled(event: ScheduledEvent, env: Env) {
  const db = getDb(env);

  switch (event.cron) {
    case "1 0 1 * *": return generateMonthlyDues(db, env);
    case "0 1 * * *": return updateOverdueDues(db);
    case "0 9 15 * *": return sendReminders(db, env);
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

  // Get all members at once instead of querying per household
  const allMembers = await db.select().from(users).where(sql`${users.householdId} IS NOT NULL`);
  const membersByHousehold = new Map<string, (typeof allMembers)[number][]>();
  for (const m of allMembers) {
    const arr = membersByHousehold.get(m.householdId!) || [];
    arr.push(m);
    membersByHousehold.set(m.householdId!, arr);
  }

  // Get all existing dues for this period to avoid per-household check
  const periodStart = new Date(year, month, 1).toISOString();
  const periodEnd = new Date(year, month + 1, 0).toISOString();
  const dueDate = new Date(year, month, 1).toISOString();
  const existingDues = await db.select().from(duesPayments).where(eq(duesPayments.periodStart, periodStart));
  const existingUserIds = new Set(existingDues.map(d => d.userId));

  let created = 0;
  for (const household of activeHouseholds) {
    const members = membersByHousehold.get(household.id) || [];
    const primary = members.find(m => m.id === household.primaryContactId) || members[0];
    if (!primary) continue;

    // Skip if dues already exist for this user and period
    if (existingUserIds.has(primary.id)) continue;

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

    // Queue notification email
    if (primary.email && primary.emailNotifications) {
      await env.EMAIL_QUEUE.send({
        type: "dues_notification",
        to: primary.email,
        name: primary.firstName || "Homeowner",
        amount,
        dueDate: new Date(dueDate).toLocaleDateString(),
      });
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

  let queued = 0;
  for (const { dues, user } of pending) {
    if (!user.email || !user.emailNotifications) continue;
    await env.EMAIL_QUEUE.send({
      type: "dues_reminder",
      to: user.email,
      name: user.firstName || "Homeowner",
      amount: dues.amount,
      dueDate: new Date(dues.dueDate).toLocaleDateString(),
    });
    queued++;
  }
  console.log(`[Cron] Queued ${queued} reminder emails`);
}
