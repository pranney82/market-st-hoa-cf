import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "../../shared/schema";

export function getDb(env: Env) {
  const pool = new Pool({ connectionString: env.HYPERDRIVE.connectionString });
  return { db: drizzle({ client: pool, schema }), pool };
}

export type Db = ReturnType<typeof getDb>["db"];
