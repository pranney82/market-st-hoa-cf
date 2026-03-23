import { apiHandler } from "../../../lib/api";
import { getDb } from "../../../lib/db";
import { rateLimit, rateLimitResponse } from "../../../lib/rate-limit";
import { getClientIp } from "../../../lib/sanitize";
import { bylaws, bylawsAskSchema } from "../../../../shared/schema";
import { eq, desc } from "drizzle-orm";
import Anthropic from "@anthropic-ai/sdk";

export const POST = apiHandler(async ({ request, locals }) => {
  const env = locals.runtime.env;
  const user = locals.user;
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit: 10 questions per hour per IP
  const ip = getClientIp(request);
  const rl = await rateLimit(env.SESSIONS, `bylaws:${ip}`, 10, 3600);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  const body = await request.json();
  const parsed = bylawsAskSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { question } = parsed.data;

  const db = getDb(env);
  const [current] = await db.select().from(bylaws).where(eq(bylaws.isCurrent, true)).orderBy(desc(bylaws.createdAt)).limit(1);
  if (!current) return Response.json({ error: "No bylaws found" }, { status: 404 });

  const anthropic = new Anthropic({ apiKey: env.AI_INTEGRATIONS_ANTHROPIC_API_KEY, baseURL: env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL });
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5", max_tokens: 2048,
    messages: [{ role: "user", content: `You are a helpful HOA assistant. Answer ONLY from the bylaws below. Be concise.\n\nBYLAWS:\n${current.content}\n\nQUESTION:\n${question}` }],
  });

  const answer = message.content.filter((b): b is Anthropic.TextBlock => b.type === "text").map(b => b.text).join("\n");
  return Response.json({ answer });
});
