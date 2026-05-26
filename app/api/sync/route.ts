import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { HYPOTHESES } from "@/lib/hypotheses";
import { getGlobalQuote } from "@/lib/alphavantage";

export async function POST() {
  const results = [];
  let errors = 0;

  for (const h of HYPOTHESES) {
    // MC (LVMH) is manual — skip auto-sync
    if (h.ticker === "MC") {
      results.push({ ticker: "MC", skipped: true, reason: "Manual (Paris-listed)" });
      continue;
    }

    try {
      const quote = await getGlobalQuote(h.ticker);

      if (quote.error || quote.price === 0) {
        errors++;
        results.push({ ticker: h.ticker, error: quote.error });
        continue;
      }

      await prisma.priceSync.create({
        data: {
          ticker: h.ticker,
          price: quote.price,
          changePct: quote.changePct,
          source: "alphavantage",
        },
      });

      results.push({ ticker: h.ticker, price: quote.price, changePct: quote.changePct });

      // Rate limit: 5 requests/min on free tier
      await new Promise((r) => setTimeout(r, 12000));
    } catch (err) {
      errors++;
      results.push({ ticker: h.ticker, error: String(err) });
    }
  }

  return NextResponse.json({
    synced: results.filter((r) => "price" in r).length,
    errors,
    timestamp: new Date().toISOString(),
    results,
  });
}

// Allow manual price update for MC
export async function PUT(req: Request) {
  const { ticker, price } = await req.json();
  if (!ticker || !price) {
    return NextResponse.json({ error: "ticker and price required" }, { status: 400 });
  }

  await prisma.priceSync.create({
    data: { ticker, price: parseFloat(price), source: "manual" },
  });

  return NextResponse.json({ ok: true, ticker, price });
}
