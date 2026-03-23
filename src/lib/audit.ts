import { getDb } from "./db";
import { auditLogs } from "../../shared/schema";
import { getClientIp } from "./sanitize";
import type { User } from "../../shared/schema";

interface AuditEntry {
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, unknown>;
}

export async function audit(
  env: Env,
  request: Request,
  user: User | null,
  entry: AuditEntry
) {
  try {
    const db = getDb(env);
    await db.insert(auditLogs).values({
      userId: user?.id ?? null,
      userEmail: user?.email ?? null,
      action: entry.action,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId ?? null,
      details: entry.details ? JSON.stringify(entry.details) : null,
      ipAddress: getClientIp(request),
    });
  } catch (err) {
    // Audit logging should never break the request
    console.error("[Audit] Failed to log:", err);
  }
}
