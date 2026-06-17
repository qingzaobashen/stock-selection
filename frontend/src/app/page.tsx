import { supabase } from "@/lib/supabase";
import type { Industry, DailyQuote, IndustryWithQuote } from "@/lib/types";
import { HomeContent } from "./HomeContent";

export const revalidate = 1800;

async function getMarketOverview() {
  const { data: industries } = await supabase
    .from("industries")
    .select("*")
    .eq("level", 1)
    .order("name") as { data: Industry[] | null };

  const today = new Date().toISOString().slice(0, 10);
  const [quotesRes, stocksRes] = await Promise.all([
    supabase
      .from("daily_quotes")
      .select("stock_code, change_pct, amount")
      .eq("trade_date", today),
    supabase
      .from("stocks")
      .select("code, industry_code"),
  ]);

  const quotes = (quotesRes.data ?? []) as DailyQuote[];
  const stocks = (stocksRes.data ?? []) as { code: string; industry_code: string }[];

  // Build stock_code → industry_code map
  const stockIndustryMap = new Map<string, string>();
  for (const s of stocks) {
    if (s.industry_code) stockIndustryMap.set(s.code, s.industry_code);
  }

  // Group quotes by industry_code
  const industryData = new Map<string, { amounts: number[]; changes: number[] }>();
  for (const q of quotes) {
    const indCode = stockIndustryMap.get(q.stock_code);
    if (!indCode) continue;
    if (!industryData.has(indCode)) {
      industryData.set(indCode, { amounts: [], changes: [] });
    }
    const entry = industryData.get(indCode)!;
    if (q.amount != null) entry.amounts.push(q.amount);
    if (q.change_pct != null) entry.changes.push(q.change_pct);
  }

  const totalAmount = quotes.reduce((sum, q) => sum + (q.amount ?? 0), 0);
  const avgChange =
    quotes.length > 0
      ? quotes.reduce((sum, q) => sum + (q.change_pct ?? 0), 0) / quotes.length
      : 0;
  const upCount = quotes.filter((q) => (q.change_pct ?? 0) > 0).length;
  const downCount = quotes.filter((q) => (q.change_pct ?? 0) < 0).length;

  const indList = industries ?? [];
  const industriesWithQuotes: IndustryWithQuote[] = indList.map((ind) => {
    const d = industryData.get(ind.code);
    const changes = d?.changes ?? [];
    const amounts = d?.amounts ?? [];
    return {
      ...ind,
      change_pct: changes.length > 0
        ? changes.reduce((s, v) => s + v, 0) / changes.length
        : null,
      amount: amounts.length > 0
        ? amounts.reduce((s, v) => s + v, 0)
        : null,
    };
  });

  return {
    industries: industriesWithQuotes,
    totalAmount,
    avgChange,
    upCount,
    downCount,
  };
}

export default async function HomePage() {
  const overview = await getMarketOverview();

  return (
    <HomeContent
      industries={overview.industries}
      totalAmount={overview.totalAmount}
      avgChange={overview.avgChange}
      upCount={overview.upCount}
      downCount={overview.downCount}
    />
  );
}
