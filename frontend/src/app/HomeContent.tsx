"use client";

import { Typography, Row, Col, Card, Statistic } from "antd";
import { HeatMap } from "@/components/HeatMap";
import type { IndustryWithQuote } from "@/lib/types";

export function HomeContent({
  industries,
  totalAmount,
  avgChange,
  upCount,
  downCount,
}: {
  industries: IndustryWithQuote[]
  totalAmount: number
  avgChange: number
  upCount: number
  downCount: number
}) {
  return (
    <div>
      <Typography.Title level={3} style={{ marginBottom: 4, fontSize: 22 }}>
        市场总览
      </Typography.Title>
      <Typography.Text type="secondary" style={{ marginBottom: 24, display: "block" }}>
        今日 A 股市场概况
      </Typography.Text>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card
            style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
            styles={{ body: { padding: "16px 20px" } }}
          >
            <Statistic
              title="成交额"
              value={totalAmount / 1e8}
              precision={0}
              suffix="亿"
              valueStyle={{ fontSize: 24, fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
            styles={{ body: { padding: "16px 20px" } }}
          >
            <Statistic
              title="平均涨跌幅"
              value={avgChange}
              precision={2}
              suffix="%"
              valueStyle={{
                fontSize: 24,
                fontWeight: 600,
                color: avgChange >= 0 ? "var(--color-danger)" : "var(--color-success)",
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
            styles={{ body: { padding: "16px 20px" } }}
          >
            <Statistic
              title="上涨"
              value={upCount}
              valueStyle={{ fontSize: 24, fontWeight: 600, color: "var(--color-danger)" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
            styles={{ body: { padding: "16px 20px" } }}
          >
            <Statistic
              title="下跌"
              value={downCount}
              valueStyle={{ fontSize: 24, fontWeight: 600, color: "var(--color-success)" }}
            />
          </Card>
        </Col>
      </Row>

      <Typography.Title level={4} style={{ marginBottom: 16, fontSize: 16 }}>
        行业热力图
      </Typography.Title>

      <HeatMap industries={industries} />
    </div>
  );
}
