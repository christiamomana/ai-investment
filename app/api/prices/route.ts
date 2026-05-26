import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { HYPOTHESES } from "@/lib/hypotheses";

export async function GET() {
  const tickers = HYPOTHESES.map((h) => h.ticker);

  const allPrices = await prisma.priceSync.findMany({
    where: { ticker: { in: tickers } },
    orderBy: { syncedAt: "desc" },
  });

  const priceMap: Record<string, { price: number; changePct: number | null; syncedAt: string }> = {};
  for (const row of allPrices) {
    if (!priceMap[row.ticker]) {
      priceMap[row.ticker] = {
        price: row.price,
        changePct: row.changePct,
        syncedAt: row.syncedAt.toISOString(),
      };
    }
  }

  return NextResponse.json(priceMap);
}
