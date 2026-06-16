import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const industryCodes = searchParams.getAll("industry_codes");
    const peTtmMin = searchParams.get("pe_ttm_min");
    const peTtmMax = searchParams.get("pe_ttm_max");
    const roeMin = searchParams.get("roe_min");
    const revenueGrowthMin = searchParams.get("revenue_growth_min");

    // Build query
    let query = supabase
      .from("stocks")
      .select("code, name, industry_code, market");

    if (industryCodes.length > 0) {
      query = query.in("industry_code", industryCodes);
    }

    const { data: stocks } = await query;

    if (!stocks || stocks.length === 0) {
      return NextResponse.json({ stocks: [] });
    }

    const stockCodes = stocks.map((s) => s.code);

    // Get latest daily quotes
    const today = new Date().toISOString().slice(0, 10);
    const { data: quotes } = await supabase
      .from("daily_quotes")
      .select("stock_code, close, change_pct, volume, amount")
      .eq("trade_date", today)
      .in("stock_code", stockCodes);

    // Get financial metrics
    const { data: financials } = await supabase
      .from("financial_metrics")
      .select("stock_code, roe, pe_ttm, pb, revenue_growth")
      .eq("report_type", "annual")
      .in("stock_code", stockCodes);

    const quoteMap = new Map(
      (quotes ?? []).map((q) => [q.stock_code, q])
    );
    const finMap = new Map(
      (financials ?? []).map((f) => [f.stock_code, f])
    );

    let results = stocks.map((s) => {
      const q = quoteMap.get(s.code);
      const f = finMap.get(s.code);
      return {
        ...s,
        close: q?.close ?? null,
        change_pct: q?.change_pct ?? null,
        volume: q?.volume ?? null,
        amount: q?.amount ?? null,
        pe_ttm: f?.pe_ttm ?? null,
        pb: f?.pb ?? null,
        roe: f?.roe ?? null,
        revenue_growth: f?.revenue_growth ?? null,
      };
    });

    // Apply post-filtering for financial fields
    if (peTtmMin) {
      const min = parseFloat(peTtmMin);
      results = results.filter((s) => s.pe_ttm !== null && s.pe_ttm >= min);
    }
    if (peTtmMax) {
      const max = parseFloat(peTtmMax);
      results = results.filter((s) => s.pe_ttm !== null && s.pe_ttm <= max);
    }
    if (roeMin) {
      const min = parseFloat(roeMin);
      results = results.filter((s) => s.roe !== null && s.roe >= min);
    }
    if (revenueGrowthMin) {
      const min = parseFloat(revenueGrowthMin);
      results = results.filter(
        (s) => s.revenue_growth !== null && s.revenue_growth >= min
      );
    }

    // Sort by change_pct descending
    results.sort((a, b) => (b.change_pct ?? 0) - (a.change_pct ?? 0));

    return NextResponse.json({ stocks: results });
  } catch (error) {
    console.error("Screener error:", error);
    return NextResponse.json({ stocks: [], error: "查询失败" }, { status: 500 });
  }
}
