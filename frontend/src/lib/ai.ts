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
