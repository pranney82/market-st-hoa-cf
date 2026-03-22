import bcryptjs from "bcryptjs";
import { users } from "../../shared/schema";
import { eq } from "drizzle-orm";
import type { Db } from "./db";

const COOKIE = "sid";
const TTL = 30 * 24 * 60 * 60; // 30 days

interface Session {
  userId: string;
  email: string;
  role: string;
}

// ── Password ────────────────────────────────────────────────────
export const hash = (pw: string) => bcryptjs.hash(pw, 10);
export const verify = (pw: string, h: string) => bcryptjs.compare(pw, h);

// ── Sessions ────────────────────────────────────────────────────
function generateId() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function sign(id: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(id));
  return `${id}.${btoa(String.fromCharCode(...new Uint8Array(sig)))}`;
}

async function unsign(signed: string, secret: string): Promise<string | null> {
  const dot = signed.lastIndexOf(".");
  if (dot === -1) return null;
  const id = signed.slice(0, dot);
  return (await sign(id, secret)) === signed ? id : null;
}

export async function getSession(request: Request, env: Env): Promise<Session | null> {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(new RegExp(`${COOKIE}=([^;]+)`));
  if (!match) return null;

  const id = await unsign(match[1], env.SESSION_SECRET);
  if (!id) return null;

  const raw = await env.SESSIONS.get(`session:${id}`);
  return raw ? JSON.parse(raw) : null;
}

export async function createSession(env: Env, data: Session): Promise<string> {
  const id = generateId();
  await env.SESSIONS.put(`session:${id}`, JSON.stringify(data), { expirationTtl: TTL });
  const signed = await sign(id, env.SESSION_SECRET);
  return `${COOKIE}=${signed}; HttpOnly; Secure; SameSite=Lax; Max-Age=${TTL}; Path=/`;
}

export async function destroySession(request: Request, env: Env): Promise<string> {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(new RegExp(`${COOKIE}=([^;]+)`));
  if (match) {
    const id = await unsign(match[1], env.SESSION_SECRET);
    if (id) await env.SESSIONS.delete(`session:${id}`);
  }
  return `${COOKIE}=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/`;
}

// ── User hydration ──────────────────────────────────────────────
export async function getUser(db: Db, session: Session) {
  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  return user ?? null;
}
