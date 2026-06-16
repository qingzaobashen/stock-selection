import { supabase } from "@/lib/supabase";
import type { Industry, DailyQuote, FinancialMetric } from "@/lib/types";
import { notFound } from "next/navigation";
import { IndustryDetailContent } from "./IndustryDetailContent";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const { data: industry } = await supabase
    .from("industries")
    .select("name")
    .eq("code", code)
    .single();

  if (!industry) return { title: "行业未找到" };

  return {
    title: `${industry.name} - 行业分析 | 选股助手`,
    description: `${industry.name}板块分析：估值水平、成分股表现、投资机会`,
  };
}

interface StockRow { code: string; name: string; industry_code: string; market: string }
interface QuoteRow { stock_code: string; close: number; change_pct: number; volume: number; amount: number }
interface FinRow { stock_code: string; roe: number; pe_ttm: number; pb: number }

async function getIndustryData(code: string) {
  const { data: industry } = await supabase
    .from("industries")
    .select("*")
    .eq("code", code)
    .single();

  if (!industry) return null;

  const { data: stocks } = await supabase
    .from("stocks")
    .select("code, name, industry_code, market")
    .eq("industry_code", code) as { data: StockRow[] | null };

  const today = new Date().toISOString().slice(0, 10);
  const stockCodes = (stocks ?? []).map((s) => s.code);

  const { data: quotes } = await supabase
    .from("daily_quotes")
    .select("stock_code, close, change_pct, volume, amount")
    .eq("trade_date", today)
    .in("stock_code", stockCodes) as { data: QuoteRow[] | null };

  const { data: financials } = await supabase
    .from("financial_metrics")
    .select("stock_code, roe, pe_ttm, pb")
    .eq("report_type", "annual")
    .in("stock_code", stockCodes) as { data: FinRow[] | null };

  const quoteMap = new Map(
    (quotes ?? []).map((q) => [q.stock_code, q])
  );
  const finMap = new Map(
    (financials ?? []).map((f) => [f.stock_code, f])
  );

  const stocksWithData = (stocks ?? []).map((s) => {
    const q = quoteMap.get(s.code);
    const f = finMap.get(s.code);
    return {
      code: s.code,
      name: s.name,
      industry_code: s.industry_code,
      market: s.market,
      close: q?.close ?? null,
      change_pct: q?.change_pct ?? null,
      volume: q?.volume ?? null,
      amount: q?.amount ?? null,
      pe_ttm: f?.pe_ttm ?? null,
      pb: f?.pb ?? null,
      roe: f?.roe ?? null,
    };
  });

  const topStocks = [...stocksWithData]
    .sort((a, b) => (b.change_pct ?? 0) - (a.change_pct ?? 0))
    .slice(0, 10);

  return {
    industry: industry as Industry,
    stocks: stocksWithData,
    topStocks,
  };
}

export default async function IndustryDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const data = await getIndustryData(code);

  if (!data) notFound();

  return (
    <IndustryDetailContent
      industry={data.industry}
      stocks={data.stocks}
      topStocks={data.topStocks}
    />
  );
}
