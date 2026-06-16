import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { targetType, targetId, data } = await req.json();

    // Check cache first
    const { data: cached } = await supabase
      .from("ai_insights")
      .select("insight")
      .eq("target_type", targetType)
      .eq("target_id", targetId)
      .single();

    if (cached) {
      return NextResponse.json({ insight: cached.insight, cached: true });
    }

    // Build prompt based on target type
    let prompt = "";
    if (targetType === "industry") {
      prompt = buildIndustryPrompt(data);
    } else if (targetType === "screener") {
      prompt = buildScreenerPrompt(data);
    } else {
      prompt = `请分析以下数据并提供见解：${JSON.stringify(data)}`;
    }

    // Call AI API
    const apiKey = process.env.AI_API_KEY;
    const baseUrl = process.env.AI_API_BASE_URL || "https://api.deepseek.com";
    const model = process.env.AI_MODEL || "deepseek-chat";

    if (!apiKey) {
      return NextResponse.json(
        {
          insight:
            "当前尚未配置 AI API Key，请在环境变量中设置 AI_API_KEY。配置完成后，AI 分析将自动生效。",
        },
        { status: 200 }
      );
    }

    const aiRes = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "你是一位专业的A股市场分析师。请用通俗易懂的语言给散户投资者做分析，避免堆砌专业术语。回答简洁，3-5句话。",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!aiRes.ok) {
      throw new Error(`AI API error: ${aiRes.status}`);
    }

    const aiJson = await aiRes.json();
    const insight = aiJson.choices?.[0]?.message?.content || "分析暂时不可用";

    // Cache the result
    await supabase.from("ai_insights").upsert(
      {
        target_type: targetType,
        target_id: targetId,
        insight,
        model,
        created_at: new Date().toISOString(),
      },
      { onConflict: "target_type,target_id" }
    );

    return NextResponse.json({ insight, cached: false });
  } catch (error) {
    console.error("AI analysis error:", error);
    return NextResponse.json(
      { insight: "AI 分析服务暂时不可用，请稍后再试。" },
      { status: 200 }
    );
  }
}

function buildIndustryPrompt(data: Record<string, unknown>): string {
  const d = data as {
    name: string;
    member_count: number;
    pe_ttm: number | null;
    pb: number | null;
    dividend_rate: number | null;
    change_pct: number | null;
    top_stocks: { name: string; change_pct: number }[];
  };

  return `请对 ${d.name} 板块进行分析。

板块概况：
- 成分股数量：${d.member_count} 只
- 滚动市盈率 (PE-TTM)：${d.pe_ttm?.toFixed(2) ?? "--"}
- 市净率 (PB)：${d.pb?.toFixed(2) ?? "--"}
- 股息率：${d.dividend_rate?.toFixed(2) ?? "--"}%

领涨股：${(d.top_stocks ?? [])
  .slice(0, 5)
  .map((s) => `${s.name}(${s.change_pct.toFixed(2)}%)`)
  .join("、")}

请从以下几个角度分析：
1. 板块整体表现和情绪
2. 估值水平是偏高还是偏低
3. 投资机会和风险提示

输出要求：简洁，3-5句话，让散户能看懂。`;
}

function buildScreenerPrompt(data: Record<string, unknown>): string {
  const d = data as { filters: Record<string, unknown>; resultsCount: number };
  return `用户使用筛选条件选出了 ${d.resultsCount} 只股票。筛选条件：${JSON.stringify(d.filters)}。请简要分析这批股票的整体特征和投资建议，3-5句话。`;
}
