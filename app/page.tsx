import { prisma } from "@/lib/db";
import { HYPOTHESES } from "@/lib/hypotheses";
import { computeSignal } from "@/lib/signals";
import { HypothesisList } from "@/components/HypothesisList";
import { DashboardHeader } from "@/components/DashboardHeader";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Get latest price per ticker (manual dedup — distinct+orderBy unsupported in SQLite adapter)
  const allPrices = await prisma.priceSync.findMany({
    orderBy: { syncedAt: "desc" },
  });

  const priceMap: Record<string, { price: number; changePct: number | null; syncedAt: Date }> = {};
  for (const p of allPrices) {
    if (!priceMap[p.ticker]) {
      priceMap[p.ticker] = { price: p.price, changePct: p.changePct, syncedAt: p.syncedAt };
    }
  }

  const rows = HYPOTHESES.map((h) => {
    const priceData = priceMap[h.ticker];
    const currentPrice = priceData?.price ?? null;
    const signal = computeSignal(h, currentPrice);

    return {
      ...h,
      currentPrice,
      changePct: priceData?.changePct ?? null,
      lastSync: priceData?.syncedAt ?? null,
      signal,
    };
  });

  const lastSyncDate = allPrices.length > 0
    ? new Date(Math.max(...allPrices.map((p) => p.syncedAt.getTime())))
    : null;

  return (
    <div className="min-h-screen bg-zinc-50">
      <DashboardHeader lastSync={lastSyncDate} />
      <main className="max-w-[1400px] mx-auto px-4 py-6">
        <HypothesisList rows={rows} />
      </main>
    </div>
  );
}
