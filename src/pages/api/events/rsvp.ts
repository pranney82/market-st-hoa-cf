import type { APIRoute } from "astro";
import { getDb } from "../../../lib/db";
import { events, eventRsvps } from "../../../../shared/schema";
import { eq, and, sql } from "drizzle-orm";

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const user = locals.user!;
  const env = locals.runtime.env;
  const form = await request.formData();
  const eventId = form.get("eventId") as string;

  if (!eventId) return redirect("/events");

  const { db, pool } = getDb(env);

  try {
    const [event] = await db.select().from(events).where(eq(events.id, eventId));
    if (!event) return redirect("/events");

    const [existing] = await db
      .select()
      .from(eventRsvps)
      .where(and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.userId, user.id)));

    if (existing) {
      const newStatus = existing.status === "attending" ? "cancelled" : "attending";

      if (newStatus === "attending" && event.maxCapacity) {
        const [{ count }] = await db
          .select({ count: sql<number>`COUNT(*)::int` })
          .from(eventRsvps)
          .where(and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.status, "attending")));
        if (count >= parseInt(event.maxCapacity)) return redirect("/events");
      }

      await db
        .update(eventRsvps)
        .set({ status: newStatus, updatedAt: new Date() })
        .where(eq(eventRsvps.id, existing.id));
    } else {
      if (event.maxCapacity) {
        const [{ count }] = await db
          .select({ count: sql<number>`COUNT(*)::int` })
          .from(eventRsvps)
          .where(and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.status, "attending")));
        if (count >= parseInt(event.maxCapacity)) return redirect("/events");
      }

      await db.insert(eventRsvps).values({
        eventId,
        userId: user.id,
        status: "attending",
      });
    }

    return redirect("/events");
  } finally {
    await pool.end();
  }
};
