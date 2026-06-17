"use client";

import { Typography, Descriptions, Card, Row, Col, Statistic, Tag } from "antd";
import Link from "next/link";
import { AIInsightCard } from "@/components/AIInsight";

interface StockDetail {
  stock: {
    code: string
    name: string
    industry_code: string
    market: string
    list_date: string | null
    total_shares: number | null
  }
  industry: { code: string; name: string } | null
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

export function StockDetailContent({ detail }: { detail: StockDetail }) {
  const { stock, industry, quote, financial } = detail;
  const isUp = (quote?.change_pct ?? 0) >= 0;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
        <Typography.Title level={3} style={{ margin: 0, fontSize: 22 }}>
          {stock.name}
        </Typography.Title>
        <Tag style={{ fontFamily: "monospace", fontSize: 13 }}>{stock.code}</Tag>
        <Tag
          style={{
            background: "var(--color-border-light)",
            border: "none",
            color: "var(--color-text-tertiary)",
          }}
        >
          {stock.market.toUpperCase()}
        </Tag>
        {industry && (
          <Link href={`/industries/${industry.code}`}>
            <Tag
              style={{
                background: "var(--color-border-light)",
                border: "none",
                color: "var(--color-text-tertiary)",
                cursor: "pointer",
              }}
            >
              {industry.name}
            </Tag>
          </Link>
        )}
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card styles={{ body: { padding: "16px 20px" } }}>
            <Statistic
              title="最新价"
              value={quote?.close ?? "--"}
              precision={2}
              valueStyle={{ fontSize: 28, fontWeight: 700, color: isUp ? "var(--color-danger)" : "var(--color-success)" }}
              suffix={
                quote?.change_pct != null ? (
                  <span style={{ fontSize: 14, marginLeft: 8 }}>
                    {isUp ? "+" : ""}{quote.change_pct.toFixed(2)}%
                  </span>
                ) : undefined
              }
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card styles={{ body: { padding: "16px 20px" } }}>
            <Statistic
              title="成交额"
              value={quote?.amount ? (quote.amount >= 1e8 ? (quote.amount / 1e8).toFixed(2) : (quote.amount / 1e4).toFixed(0)) : "--"}
              suffix={quote?.amount ? (quote.amount >= 1e8 ? "亿" : "万") : ""}
              valueStyle={{ fontSize: 24, fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card styles={{ body: { padding: "16px 20px" } }}>
            <Statistic
              title="换手率"
              value={quote?.turnover ? `${quote.turnover.toFixed(2)}%` : "--"}
              valueStyle={{ fontSize: 24, fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card styles={{ body: { padding: "16px 20px" } }}>
            <Statistic
              title="总股本"
              value={stock.total_shares ? (stock.total_shares >= 1e8 ? (stock.total_shares / 1e8).toFixed(2) + "亿" : (stock.total_shares / 1e4).toFixed(0) + "万") : "--"}
              valueStyle={{ fontSize: 24, fontWeight: 600 }}
            />
          </Card>
        </Col>
      </Row>

      <div style={{ marginBottom: 20 }}>
        <AIInsightCard
          targetType="stock"
          targetId={stock.code}
          data={{
            name: stock.name,
            code: stock.code,
            industry: industry?.name ?? null,
            close: quote?.close,
            change_pct: quote?.change_pct,
            pe_ttm: financial?.pe_ttm,
            pb: financial?.pb,
            roe: financial?.roe,
          }}
        />
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} md={12}>
          <Card
            title="行情数据"
            styles={{
              header: { fontSize: 14, fontWeight: 600, padding: "12px 16px" },
              body: { padding: 0 },
            }}
          >
            <Descriptions column={1} size="small" style={{ padding: 16 }}>
              <Descriptions.Item label="开盘价">{quote?.open?.toFixed(2) ?? "--"}</Descriptions.Item>
              <Descriptions.Item label="最高价">{quote?.high?.toFixed(2) ?? "--"}</Descriptions.Item>
              <Descriptions.Item label="最低价">{quote?.low?.toFixed(2) ?? "--"}</Descriptions.Item>
              <Descriptions.Item label="成交量">{quote?.volume ? (quote.volume >= 1e4 ? (quote.volume / 1e4).toFixed(0) + "万手" : quote.volume + "手") : "--"}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            title="财务指标"
            styles={{
              header: { fontSize: 14, fontWeight: 600, padding: "12px 16px" },
              body: { padding: 0 },
            }}
          >
            <Descriptions column={1} size="small" style={{ padding: 16 }}>
              <Descriptions.Item label="PE-TTM">{financial?.pe_ttm?.toFixed(2) ?? "--"}</Descriptions.Item>
              <Descriptions.Item label="PB">{financial?.pb?.toFixed(2) ?? "--"}</Descriptions.Item>
              <Descriptions.Item label="ROE">{financial?.roe != null ? `${financial.roe.toFixed(2)}%` : "--"}</Descriptions.Item>
              <Descriptions.Item label="营收增长率">{financial?.revenue_growth != null ? `${financial.revenue_growth.toFixed(2)}%` : "--"}</Descriptions.Item>
              <Descriptions.Item label="净利润增长率">{financial?.profit_growth != null ? `${financial.profit_growth.toFixed(2)}%` : "--"}</Descriptions.Item>
              <Descriptions.Item label="毛利率">{financial?.gross_margin != null ? `${financial.gross_margin.toFixed(2)}%` : "--"}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
