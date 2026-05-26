import { streamText, convertToModelMessages } from "ai";
import { openai } from "@ai-sdk/openai";
import { prisma } from "@/lib/db";
import { getHypothesis } from "@/lib/hypotheses";
import { parseStudyHtml } from "@/lib/parser";
import { buildChatSystemPrompt } from "@/lib/prompts";

export async function POST(req: Request) {
  const { messages, ticker } = await req.json();

  const h = getHypothesis(ticker);
  if (!h) {
    return new Response("Hypothesis not found", { status: 404 });
  }

  // Get latest price
  const latestPrice = await prisma.priceSync.findFirst({
    where: { ticker },
    orderBy: { syncedAt: "desc" },
  });

  // Parse study HTML for context
  const studyText = h.htmlFile ? parseStudyHtml(h.htmlFile) : "";

  // Get cached analysis for additional context
  const cachedAnalysis = await prisma.aiAnalysis.findFirst({
    where: { ticker, isCurrent: true },
    orderBy: { generatedAt: "desc" },
  });

  const systemPrompt = buildChatSystemPrompt(
    h,
    studyText,
    latestPrice?.price ?? null,
    cachedAnalysis?.content ?? null
  );

  const result = streamText({
    model: openai("gpt-4o"),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
