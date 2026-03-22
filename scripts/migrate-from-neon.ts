import pg from "pg";
import fs from "fs";

const NEON_URL = process.env.DATABASE_URL || "";

const TABLES = [
  "households", "users", "password_reset_tokens", "invitations",
  "announcements", "documents", "events", "event_rsvps",
  "architectural_requests", "request_comments", "request_votes",
  "dues_payments", "payments", "payment_applications",
  "bylaws", "account_categories", "transactions", "budgets",
  "reconciliations", "transaction_codings",
  "ballots", "ballot_options", "household_votes", "system_settings",
];

function convert(val: any): string {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "boolean") return val ? "1" : "0";
  if (val instanceof Date) return `'${val.toISOString()}'`;
  if (Array.isArray(val)) return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
  if (typeof val === "object") return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
  if (typeof val === "number") return String(val);
  return `'${String(val).replace(/'/g, "''")}'`;
}

async function main() {
  console.log("Connecting to Neon...");
  const client = new pg.Client({ connectionString: NEON_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const lines: string[] = ["PRAGMA foreign_keys = OFF;"];
  let total = 0;

  for (const table of TABLES) {
    try {
      const { rows } = await client.query(`SELECT * FROM "${table}"`);
      if (rows.length === 0) { console.log(`  ${table}: 0 rows`); continue; }
      console.log(`  ${table}: ${rows.length} rows`);
      total += rows.length;
      for (const row of rows) {
        const cols = Object.keys(row).join(", ");
        const vals = Object.values(row).map(convert).join(", ");
        lines.push(`INSERT OR IGNORE INTO ${table} (${cols}) VALUES (${vals});`);
      }
    } catch (e: any) {
      console.log(`  ${table}: skipped — ${e.message?.slice(0, 60)}`);
    }
  }

  lines.push("PRAGMA foreign_keys = ON;");
  await client.end();
  fs.writeFileSync("migrations/0001_import_data.sql", lines.join("\n"));
  console.log(`\nDone: ${total} rows → migrations/0001_import_data.sql`);
  console.log("Run: npx wrangler d1 execute market-st-hoa --remote --file=./migrations/0001_import_data.sql");
}
main().catch(console.error);
