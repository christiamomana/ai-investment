const BASE_URL = "https://www.alphavantage.co/query";

export interface QuoteResult {
  ticker: string;
  price: number;
  changePct: number;
  error?: string;
}

export async function getGlobalQuote(ticker: string): Promise<QuoteResult> {
  const key = process.env.ALPHA_VANTAGE_KEY;
  if (!key || key === "your_key_here") {
    return { ticker, price: 0, changePct: 0, error: "No API key configured" };
  }

  const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${key}`;

  try {
    const res = await fetch(url, { next: { revalidate: 0 } });
    const data = await res.json();

    const quote = data["Global Quote"];
    if (!quote || !quote["05. price"]) {
      return { ticker, price: 0, changePct: 0, error: "No data returned" };
    }

    return {
      ticker,
      price: parseFloat(quote["05. price"]),
      changePct: parseFloat(quote["10. change percent"]?.replace("%", "") ?? "0"),
    };
  } catch {
    return { ticker, price: 0, changePct: 0, error: "Fetch failed" };
  }
}

export async function batchQuotes(tickers: string[]): Promise<QuoteResult[]> {
  // Alpha Vantage free tier: sequential to avoid rate limits
  const results: QuoteResult[] = [];
  for (const ticker of tickers) {
    const result = await getGlobalQuote(ticker);
    results.push(result);
    // Respect rate limit (5 req/min on free tier)
    if (results.length < tickers.length) {
      await new Promise((r) => setTimeout(r, 12000));
    }
  }
  return results;
}
