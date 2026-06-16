export async function getAIInsight(
  targetType: "industry" | "stock" | "screener",
  targetId: string,
  data: Record<string, unknown>
): Promise<string> {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ targetType, targetId, data }),
  });

  if (!res.ok) throw new Error("AI analysis failed");
  const json = await res.json();
  return json.insight;
}

export function buildIndustryPrompt(industry: {
  name: string
  member_count: number
  pe_ttm: number | null
  pb: number | null
  dividend_rate: number | null
  change_pct: number | null
  top_stocks: { name: string; change_pct: number }[]
}): string {
  return `你是一位专业的A股市场分析师。请用通俗易懂的语言，对 ${industry.name} 板块进行分析。

板块概况：
- 成分股数量：${industry.member_count} 只
- 板块涨跌幅：${industry.change_pct?.toFixed(2) ?? "--"}%
- 滚动市盈率 (PE-TTM)：${industry.pe_ttm?.toFixed(2) ?? "--"}
- 市净率 (PB)：${industry.pb?.toFixed(2) ?? "--"}
- 股息率：${industry.dividend_rate?.toFixed(2) ?? "--"}%

领涨股：${industry.top_stocks.slice(0, 5).map(s => `${s.name}(${s.change_pct.toFixed(2)}%)`).join("、")}

请从以下几个角度分析：
1. 板块整体表现和情绪
2. 估值水平（PE/PB 是高是低，和历史比如何）
3. 投资机会和风险提示

输出要求：简洁，3-5句话，避免专业术语堆砌，让散户能看懂。`;
}

export function buildScreenerPrompt(filters: Record<string, unknown>, resultsCount: number): string {
  return `你是一位A股市场分析师。用户使用以下条件筛选出了 ${resultsCount} 只股票：

筛选条件：${JSON.stringify(filters, null, 2)}

请简要分析：
1. 这批股票的整体特征（行业分布、估值风格）
2. 在当前市场环境下，这类股票的机会和风险
3. 给散户的投资建议

输出要求：简洁，3-5句话。`;
}
