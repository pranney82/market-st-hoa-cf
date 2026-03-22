import type { APIRoute } from "astro";
import { getDb } from "../../../lib/db";
import { bylaws } from "../../../../shared/schema";
import { eq, desc } from "drizzle-orm";
import Anthropic from "@anthropic-ai/sdk";

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const { question } = await request.json();

  if (!question?.trim()) {
    return Response.json({ error: "Question is required" }, { status: 400 });
  }

  const db = getDb(env);

  try {
    const [current] = await db
      .select()
      .from(bylaws)
      .where(eq(bylaws.isCurrent, true))
      .orderBy(desc(bylaws.createdAt))
      .limit(1);

    if (!current) {
      return Response.json({ error: "No bylaws found" }, { status: 404 });
    }

    const anthropic = new Anthropic({
      apiKey: env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
      baseURL: env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
    });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: `You are a helpful assistant for a Homeowners Association. Answer based ONLY on the bylaws below. Quote specific sections when relevant. Be concise but thorough.

HOA BYLAWS:
${current.content}

QUESTION:
${question}`,
        },
      ],
    });

    const answer = message.content
      .filter((b) => b.type === "text")
      .map((b: any) => b.text)
      .join("\n");

    return Response.json({ answer, model: message.model });
  } catch (error) {
    console.error("Bylaws AI error:", error);
    return Response.json({ error: "Failed to get response" }, { status: 500 });
};
