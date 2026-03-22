import { drizzle } from "drizzle-orm/d1";
import * as schema from "../../shared/schema";

// D1 is a native binding — no connection strings, no pools, no cleanup.
// Just pass the binding and go.
export function getDb(env: Env) {
  return drizzle(env.DB, { schema });
}

export type Db = ReturnType<typeof getDb>;
