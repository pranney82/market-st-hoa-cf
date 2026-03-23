import { apiHandler } from "../../../lib/api";
import { getMercuryAccounts } from "../../../lib/mercury";

export const GET = apiHandler(async ({ locals }) => {
  const user = locals.user;
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const env = locals.runtime.env;

  if (!env.MERCURY_API_TOKEN) {
    return Response.json({ accounts: [], totalBalance: 0 });
  }

  const accounts = await getMercuryAccounts(env);
  const totalBalance = accounts.reduce((sum, a) => sum + a.currentBalance, 0);

  return Response.json({
    accounts: accounts.map(a => ({
      name: a.name,
      balance: a.currentBalance,
      type: a.type,
    })),
    totalBalance,
  });
});
