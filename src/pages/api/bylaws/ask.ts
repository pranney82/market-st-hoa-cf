import { apiHandler } from "../../../lib/api";
import { getDb } from "../../../lib/db";
import { rateLimit, rateLimitResponse } from "../../../lib/rate-limit";
import { getClientIp } from "../../../lib/sanitize";
import { bylaws } from "../../../../shared/schema";
import { eq, desc } from "drizzle-orm";
import Anthropic from "@anthropic-ai/sdk";

export const POST = apiHandler(async ({ request, locals }) => {
  const env = locals.runtime.env;
  const user = locals.user;
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit: 10 questions per hour
  const ip = getClientIp(request);
  const rl = await rateLimit(env.SESSIONS, `bylaws:${ip}`, 10, 3600);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  const { question } = await request.json();
  if (!question?.trim()) return Response.json({ error: "Question is required" }, { status: 400 });

  const db = getDb(env);
  const [current] = await db.select().from(bylaws).where(eq(bylaws.isCurrent, true)).orderBy(desc(bylaws.createdAt)).limit(1);
  if (!current) return Response.json({ error: "No bylaws found" }, { status: 404 });

  const anthropic = new Anthropic({ apiKey: env.AI_INTEGRATIONS_ANTHROPIC_API_KEY, baseURL: env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL });
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5", max_tokens: 2048,
    messages: [{ role: "user", content: `You are a helpful HOA assistant. Answer ONLY from the bylaws below. Be concise.\n\nBYLAWS:\n${current.content}\n\nQUESTION:\n${question}` }],
  });

  const answer = message.content.filter(b => b.type === "text").map((b: any) => b.text).join("\n");
  return Response.json({ answer });
});
