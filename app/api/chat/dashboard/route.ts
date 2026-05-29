import { streamText, convertToModelMessages } from "ai";
import { openai } from "@ai-sdk/openai";
import { buildDashboardChatSystemPrompt } from "@/lib/prompts";

export async function POST(req: Request) {
  const { messages, rows } = await req.json();

  const systemPrompt = buildDashboardChatSystemPrompt(rows);

  const result = streamText({
    model: openai.chat("gpt-4o"),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
