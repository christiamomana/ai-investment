import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getHypothesis } from "@/lib/hypotheses";
import { computeSignal } from "@/lib/signals";
import { HypothesisDetail } from "@/components/HypothesisDetail";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ ticker: string }>;
}

export default async function HypothesisPage({ params }: Props) {
  const { ticker } = await params;
  const h = getHypothesis(ticker.toUpperCase());
  if (!h) notFound();

  const latestPrice = await prisma.priceSync.findFirst({
    where: { ticker: h.ticker },
    orderBy: { syncedAt: "desc" },
  });

  const cachedAnalysis = await prisma.aiAnalysis.findFirst({
    where: { ticker: h.ticker, isCurrent: true },
    orderBy: { generatedAt: "desc" },
  });

  const signal = computeSignal(h, latestPrice?.price ?? null);

  return (
    <HypothesisDetail
      hypothesis={h}
      currentPrice={latestPrice?.price ?? null}
      changePct={latestPrice?.changePct ?? null}
      signal={signal}
      cachedAnalysis={cachedAnalysis?.content ?? null}
      analysisGeneratedAt={cachedAnalysis?.generatedAt?.toISOString() ?? null}
    />
  );
}
