import { supabase } from "@/lib/supabase";
import type { Industry, DailyQuote, IndustryWithQuote } from "@/lib/types";
import { HomeContent } from "./HomeContent";

export const revalidate = 1800;

async function getMarketOverview() {
  const { data: industries } = await supabase
    .from("industries")
    .select("*")
    .eq("level", 1)
    .order("name");

  const today = new Date().toISOString().slice(0, 10);
  const { data: quotes } = await supabase
    .from("daily_quotes")
    .select("stock_code, change_pct, amount")
    .eq("trade_date", today)
    .limit(5000);

  return {
    industries: (industries ?? []) as Industry[],
    quotes: (quotes ?? []) as DailyQuote[],
  };
}

export default async function HomePage() {
  const { industries, quotes } = await getMarketOverview();

  const totalAmount = quotes.reduce((sum, q) => sum + (q.amount ?? 0), 0);
  const avgChange =
    quotes.length > 0
      ? quotes.reduce((sum, q) => sum + (q.change_pct ?? 0), 0) / quotes.length
      : 0;
  const upCount = quotes.filter((q) => (q.change_pct ?? 0) > 0).length;
  const downCount = quotes.filter((q) => (q.change_pct ?? 0) < 0).length;

  const industriesWithQuotes: IndustryWithQuote[] = industries.map((ind) => ({
    ...ind,
    change_pct: null,
    amount: null,
  }));

  return (
    <HomeContent
      industries={industriesWithQuotes}
      totalAmount={totalAmount}
      avgChange={avgChange}
      upCount={upCount}
      downCount={downCount}
    />
  );
}
