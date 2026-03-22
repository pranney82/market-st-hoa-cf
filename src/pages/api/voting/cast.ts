import { formHandler } from "../../../lib/api";
import { getDb } from "../../../lib/db";
import { ballots, ballotOptions, householdVotes } from "../../../../shared/schema";
import { eq, and } from "drizzle-orm";

export const POST = formHandler(async ({ request, locals, redirect }) => {
  const user = locals.user!;
  const form = await request.formData();
  const ballotId = form.get("ballotId") as string;
  const optionId = form.get("optionId") as string;

  if (!ballotId || !optionId || !user.householdId) return redirect("/voting");

  const db = getDb(locals.runtime.env);
  const [ballot] = await db.select().from(ballots).where(eq(ballots.id, ballotId));
  if (!ballot || ballot.status !== "active") return redirect("/voting");

  const now = new Date();
  if (now < new Date(ballot.startsAt) || now > new Date(ballot.endsAt)) return redirect("/voting");

  const [option] = await db.select().from(ballotOptions).where(and(eq(ballotOptions.id, optionId), eq(ballotOptions.ballotId, ballotId)));
  if (!option) return redirect("/voting");

  const [existing] = await db.select().from(householdVotes).where(and(eq(householdVotes.ballotId, ballotId), eq(householdVotes.householdId, user.householdId)));
  if (existing) return redirect("/voting");

  await db.insert(householdVotes).values({ ballotId, householdId: user.householdId, optionId, votedBy: user.id });
  return redirect("/voting");
}, "/voting");
