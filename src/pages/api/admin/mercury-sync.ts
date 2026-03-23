import { rateLimit } from "../../../lib/rate-limit";
import { audit } from "../../../lib/audit";
import { syncMercuryTransactions } from "../../../lib/mercury";

export const POST = async ({ request, locals, redirect }: import("astro").APIContext) => {
  const user = locals.user;
  if (!user || user.role !== "admin") {
    return Response.json({ message: "Forbidden" }, { status: 403 });
  }

  const env = locals.runtime.env;

  if (!env.MERCURY_API_TOKEN) {
    return Response.json({ message: "Mercury API not configured" }, { status: 500 });
  }

  // Rate limit: 5 syncs per hour
  const rl = await rateLimit(env.SESSIONS, `mercury-sync:${user.id}`, 5, 3600);
  if (!rl.allowed) return Response.json({ message: "Too many requests" }, { status: 429 });

  try {
    const result = await syncMercuryTransactions(env);

    await audit(env, request, user, {
      action: "mercury.sync",
      resourceType: "transaction",
      details: result,
    });

    return redirect(`/financials?success=Synced ${result.synced} new transactions`);
  } catch (err) {
    console.error("[Mercury Sync]", err);
    return redirect("/financials?error=Bank sync failed. Please try again.");
  }
};
