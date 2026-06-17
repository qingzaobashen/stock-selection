import { supabase } from "@/lib/supabase";
import type { Industry, Stock } from "@/lib/types";
import { notFound } from "next/navigation";
import { StockDetailContent } from "./StockDetailContent";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const { data: stock } = await supabase
    .from("stocks")
    .select("name")
    .eq("code", code)
    .single();

  if (!stock) return { title: "股票未找到" };

  return {
    title: `${stock.name}(${code}) - 个股详情 | 选股助手`,
    description: `${stock.name}(${code}) 行情、财务指标、AI 分析`,
  };
}

interface StockDetail {
  stock: Stock
  industry: Industry | null
  quote: {
    close: number | null
    change_pct: number | null
    open: number | null
    high: number | null
    low: number | null
    volume: number | null
    amount: number | null
    turnover: number | null
  } | null
  financial: {
    roe: number | null
    pe_ttm: number | null
    pb: number | null
    revenue_growth: number | null
    profit_growth: number | null
    gross_margin: number | null
  } | null
}

async function getStockDetail(code: string): Promise<StockDetail | null> {
  const { data: stock } = await supabase
    .from("stocks")
    .select("*")
    .eq("code", code)
    .single() as { data: Stock | null };

  if (!stock) return null;

  const today = new Date().toISOString().slice(0, 10);

  const [{ data: quotes }, { data: financials }, { data: industry }] = await Promise.all([
    supabase
      .from("daily_quotes")
      .select("close, change_pct, open, high, low, volume, amount, turnover")
      .eq("stock_code", code)
      .eq("trade_date", today)
      .maybeSingle(),
    supabase
      .from("financial_metrics")
      .select("roe, pe_ttm, pb, revenue_growth, profit_growth, gross_margin")
      .eq("stock_code", code)
      .eq("report_type", "annual")
      .maybeSingle(),
    stock.industry_code
      ? supabase
          .from("industries")
          .select("*")
          .eq("code", stock.industry_code)
          .single()
      : Promise.resolve({ data: null }),
  ]);

  return {
    stock,
    industry: (industry as Industry | null) ?? null,
    quote: quotes
      ? {
          close: (quotes as Record<string, unknown>).close as number | null,
          change_pct: (quotes as Record<string, unknown>).change_pct as number | null,
          open: (quotes as Record<string, unknown>).open as number | null,
          high: (quotes as Record<string, unknown>).high as number | null,
          low: (quotes as Record<string, unknown>).low as number | null,
          volume: (quotes as Record<string, unknown>).volume as number | null,
          amount: (quotes as Record<string, unknown>).amount as number | null,
          turnover: (quotes as Record<string, unknown>).turnover as number | null,
        }
      : null,
    financial: financials
      ? {
          roe: (financials as Record<string, unknown>).roe as number | null,
          pe_ttm: (financials as Record<string, unknown>).pe_ttm as number | null,
          pb: (financials as Record<string, unknown>).pb as number | null,
          revenue_growth: (financials as Record<string, unknown>).revenue_growth as number | null,
          profit_growth: (financials as Record<string, unknown>).profit_growth as number | null,
          gross_margin: (financials as Record<string, unknown>).gross_margin as number | null,
        }
      : null,
  };
}

export default async function StockDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const detail = await getStockDetail(code);

  if (!detail) notFound();

  return <StockDetailContent detail={detail} />;
}
