import { getDb } from "./db";
import { transactions, systemSettings } from "../../shared/schema";
import { eq, inArray } from "drizzle-orm";

const MERCURY_API_BASE = "https://api.mercury.com/api/v1";

interface MercuryTransaction {
  id: string;
  amount: number;
  counterpartyName: string;
  note: string | null;
  externalMemo: string | null;
  postedAt: string | null;
  createdAt: string;
  status: string;
  kind: string; // "debit" | "credit"
}

interface MercuryAccount {
  id: string;
  name: string;
  currentBalance: number;
  availableBalance: number;
  accountNumber: string;
  routingNumber: string;
  type: string;
  status: string;
}

export async function getMercuryAccounts(env: Env): Promise<MercuryAccount[]> {
  const res = await fetch(`${MERCURY_API_BASE}/accounts`, {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${env.MERCURY_API_TOKEN}`,
    },
  });

  if (!res.ok) {
    console.error("[Mercury] Failed to fetch accounts:", res.status, await res.text());
    return [];
  }

  const data = await res.json();
  return data.accounts || [];
}

export async function syncMercuryTransactions(env: Env): Promise<{ synced: number; total: number }> {
  const accounts = await getMercuryAccounts(env);
  if (accounts.length === 0) return { synced: 0, total: 0 };

  const db = getDb(env);

  // Use a dedicated setting for last Mercury sync date (not latest transaction date)
  const [lastSyncSetting] = await db.select().from(systemSettings)
    .where(eq(systemSettings.key, "mercury_last_sync_date"));

  // Default to 90 days ago if never synced
  const since = lastSyncSetting?.value
    || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  let synced = 0;
  let total = 0;

  for (const account of accounts) {
    let offset = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      const url = new URL(`${MERCURY_API_BASE}/account/${account.id}/transactions`);
      url.searchParams.set("limit", String(limit));
      url.searchParams.set("offset", String(offset));
      url.searchParams.set("start", since);
      url.searchParams.set("status", "sent");

      const res = await fetch(url.toString(), {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${env.MERCURY_API_TOKEN}`,
        },
      });

      if (!res.ok) {
        console.error("[Mercury] Failed to fetch transactions:", res.status);
        break;
      }

      const data = await res.json();
      const txns: MercuryTransaction[] = data.transactions || [];
      total += txns.length;

      if (txns.length === 0) {
        hasMore = false;
        break;
      }

      // Batch dedup: fetch all existing references in one query instead of N+1
      const refs = txns.map(tx => tx.id);
      const existingRows = await db.select({ reference: transactions.reference })
        .from(transactions)
        .where(inArray(transactions.reference, refs));
      const existingRefs = new Set(existingRows.map(r => r.reference));

      // Batch insert new transactions
      const newTxns = txns
        .filter(tx => !existingRefs.has(tx.id))
        .map(tx => ({
          date: (tx.postedAt || tx.createdAt).split("T")[0],
          description: tx.counterpartyName || tx.note || tx.externalMemo || "Unknown",
          amount: Math.abs(tx.amount).toFixed(2),
          type: tx.kind === "credit" ? "income" as const : "expense" as const,
          reference: tx.id,
          notes: tx.externalMemo || tx.note || null,
        }));

      if (newTxns.length > 0) {
        await db.insert(transactions).values(newTxns);
        synced += newTxns.length;
      }

      if (txns.length < limit) {
        hasMore = false;
      } else {
        offset += limit;
      }
    }
  }

  // Update last sync date
  const today = new Date().toISOString().split("T")[0];
  if (lastSyncSetting) {
    await db.update(systemSettings)
      .set({ value: today })
      .where(eq(systemSettings.key, "mercury_last_sync_date"));
  } else {
    await db.insert(systemSettings).values({
      key: "mercury_last_sync_date",
      value: today,
    });
  }

  console.log(`[Mercury] Synced ${synced} new transactions out of ${total} fetched`);
  return { synced, total };
}
