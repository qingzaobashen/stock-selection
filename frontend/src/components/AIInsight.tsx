"use client";

import { Card, Typography, Spin } from "antd";
import { BulbOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { getAIInsight } from "@/lib/ai";

interface AIInsightProps {
  targetType: "industry" | "stock" | "screener"
  targetId: string
  data: Record<string, unknown>
}

export function AIInsightCard({ targetType, targetId, data }: AIInsightProps) {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    getAIInsight(targetType, targetId, data)
      .then(setInsight)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [targetType, targetId]);

  return (
    <Card
      style={{
        background: "var(--color-bg-card)",
        borderColor: "var(--color-border)",
        borderLeft: "3px solid var(--color-primary)",
      }}
      styles={{ body: { padding: 16 } }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <BulbOutlined
          style={{ fontSize: 20, color: "var(--color-primary)", marginTop: 2 }}
        />
        <div style={{ flex: 1 }}>
          <Typography.Text
            strong
            style={{ fontSize: 14, display: "block", marginBottom: 8 }}
          >
            AI 分析
          </Typography.Text>
          {loading ? (
            <Spin size="small" />
          ) : error ? (
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              AI 分析暂时不可用，请稍后再试
            </Typography.Text>
          ) : (
            <Typography.Paragraph
              style={{
                fontSize: 13,
                lineHeight: 1.8,
                color: "var(--color-text-secondary)",
                margin: 0,
                whiteSpace: "pre-wrap",
              }}
            >
              {insight}
            </Typography.Paragraph>
          )}
        </div>
      </div>
    </Card>
  );
}
