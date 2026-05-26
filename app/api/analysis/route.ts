import { NextResponse } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { prisma } from "@/lib/db";
import { getHypothesis } from "@/lib/hypotheses";
import { parseStudyHtml } from "@/lib/parser";
import { buildAnalysisSystemPrompt } from "@/lib/prompts";

export async function POST(req: Request) {
  const { ticker, forceRefresh } = await req.json();

  const h = getHypothesis(ticker);
  if (!h) return NextResponse.json({ error: "Hypothesis not found" }, { status: 404 });

  // Return cached analysis if recent (< 24h) and not forcing refresh
  if (!forceRefresh) {
    const cached = await prisma.aiAnalysis.findFirst({
      where: { ticker, isCurrent: true },
      orderBy: { generatedAt: "desc" },
    });

    if (cached) {
      const ageMs = Date.now() - cached.generatedAt.getTime();
      if (ageMs < 24 * 60 * 60 * 1000) {
        return NextResponse.json({ content: cached.content, cached: true });
      }
    }
  }

  // Get latest price
  const latestPrice = await prisma.priceSync.findFirst({
    where: { ticker },
    orderBy: { syncedAt: "desc" },
  });

  // Parse study HTML
  const studyText = h.htmlFile ? parseStudyHtml(h.htmlFile) : "";

  const systemPrompt = buildAnalysisSystemPrompt(h, studyText, latestPrice?.price ?? null);

  const { text } = await generateText({
    model: openai("gpt-4o"),
    system: systemPrompt,
    prompt: `Genera un análisis estructurado de la hipótesis ${ticker} en formato JSON con los siguientes campos:
{
  "summary": "Resumen ejecutivo en 3-5 oraciones",
  "thesisStatus": "¿La tesis sigue vigente? Evaluación actual",
  "signal": "Oportunidad | En rango | Fuera de rango | Revisar tesis",
  "risks": ["riesgo 1", "riesgo 2", "riesgo 3"],
  "catalysts": ["catalizador 1", "catalizador 2"],
  "priceContext": "Contextualización del precio actual vs zonas de valoración",
  "suggestedQuestions": ["pregunta 1", "pregunta 2", "pregunta 3"]
}`,
  });

  // Mark previous analyses as not current
  await prisma.aiAnalysis.updateMany({
    where: { ticker, isCurrent: true },
    data: { isCurrent: false },
  });

  // Save new analysis
  await prisma.aiAnalysis.create({
    data: {
      ticker,
      model: "gpt-4o",
      content: text,
      priceUsed: latestPrice?.price ?? null,
      isCurrent: true,
    },
  });

  return NextResponse.json({ content: text, cached: false });
}
