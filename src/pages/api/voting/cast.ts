import { formHandler } from "../../../lib/api";
import { getDb } from "../../../lib/db";
import { rateLimit } from "../../../lib/rate-limit";
import { audit } from "../../../lib/audit";
import { ballots, ballotOptions, householdVotes, castVoteSchema } from "../../../../shared/schema";
import { eq, and } from "drizzle-orm";

export const POST = formHandler(async ({ request, locals, redirect }) => {
  const user = locals.user!;
  const env = locals.runtime.env;

  // Rate limit: 20 votes per hour
  const rl = await rateLimit(env.SESSIONS, `vote:${user.id}`, 20, 3600);
  if (!rl.allowed) return new Response("Too many requests", { status: 429 });

  if (!user.householdId) return redirect("/voting");

  const form = await request.formData();
  const parsed = castVoteSchema.safeParse({
    ballotId: form.get("ballotId"),
    optionId: form.get("optionId"),
  });

  if (!parsed.success) return redirect("/voting");

  const { ballotId, optionId } = parsed.data;

  const db = getDb(env);

  // Verify ballot is active and within time window
  const [ballot] = await db.select().from(ballots).where(eq(ballots.id, ballotId));
  if (!ballot || ballot.status !== "active") return redirect("/voting");

  const now = new Date();
  if (now < new Date(ballot.startsAt) || now > new Date(ballot.endsAt)) return redirect("/voting");

  // Verify option belongs to this ballot
  const [option] = await db.select().from(ballotOptions).where(and(eq(ballotOptions.id, optionId), eq(ballotOptions.ballotId, ballotId)));
  if (!option) return redirect("/voting");

  // Check if household already voted
  const [existing] = await db.select().from(householdVotes).where(and(eq(householdVotes.ballotId, ballotId), eq(householdVotes.householdId, user.householdId)));
  if (existing) return redirect("/voting");

  try {
    await db.insert(householdVotes).values({
      ballotId,
      householdId: user.householdId,
      optionId,
      votedBy: user.id,
    });
  } catch (err) {
    if (err instanceof Error && err.message.includes("UNIQUE constraint failed")) {
      return redirect("/voting");
    }
    throw err;
  }

  await audit(env, request, user, {
    action: "vote.cast",
    resourceType: "ballot",
    resourceId: ballotId,
    details: { householdId: user.householdId, optionId },
  });

  return redirect("/voting");
}, "/voting");
