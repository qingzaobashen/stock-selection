"use client";

import { Typography, Descriptions, Tag, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { AIInsightCard } from "@/components/AIInsight";
import type { Industry } from "@/lib/types";

interface StockRow {
  code: string
  name: string
  close: number | null
  change_pct: number | null
  pe_ttm: number | null
  pb: number | null
  roe: number | null
  amount: number | null
}

export function IndustryDetailContent({
  industry,
  stocks,
  topStocks,
}: {
  industry: Industry
  stocks: StockRow[]
  topStocks: StockRow[]
}) {
  const columns: ColumnsType<StockRow> = [
    {
      title: "代码",
      dataIndex: "code",
      key: "code",
      width: 100,
      render: (v: string) => (
        <span style={{ fontFamily: "monospace", fontSize: 13 }}>{v}</span>
      ),
    },
    {
      title: "名称",
      dataIndex: "name",
      key: "name",
      width: 120,
      render: (v: string) => (
        <span style={{ fontWeight: 600, fontSize: 13 }}>{v}</span>
      ),
    },
    {
      title: "涨跌幅",
      dataIndex: "change_pct",
      key: "change_pct",
      width: 100,
      align: "right",
      sorter: (a, b) => (a.change_pct ?? 0) - (b.change_pct ?? 0),
      render: (val: number | null) => {
        if (val === null) return "--";
        const color = val >= 0 ? "var(--color-danger)" : "var(--color-success)";
        return (
          <span style={{ color, fontWeight: 600 }}>
            {val >= 0 ? "+" : ""}
            {val.toFixed(2)}%
          </span>
        );
      },
    },
    {
      title: "PE-TTM",
      dataIndex: "pe_ttm",
      key: "pe_ttm",
      width: 100,
      align: "right",
      render: (val: number | null) => val?.toFixed(2) ?? "--",
    },
    {
      title: "PB",
      dataIndex: "pb",
      key: "pb",
      width: 80,
      align: "right",
      render: (val: number | null) => val?.toFixed(2) ?? "--",
    },
    {
      title: "成交额",
      dataIndex: "amount",
      key: "amount",
      width: 120,
      align: "right",
      render: (val: number | null) => {
        if (!val) return "--";
        if (val >= 1e8) return (val / 1e8).toFixed(2) + "亿";
        return (val / 1e4).toFixed(0) + "万";
      },
    },
  ];

  return (
    <div>
      <Typography.Title level={3} style={{ marginBottom: 4, fontSize: 22 }}>
        {industry.name}
      </Typography.Title>
      <Tag
        style={{
          background: "var(--color-border-light)",
          border: "none",
          color: "var(--color-text-tertiary)",
          marginBottom: 16,
        }}
      >
        {industry.code} · {industry.member_count} 只成分股 · 申万{" "}
        {industry.level === 1
          ? "一级"
          : industry.level === 2
            ? "二级"
            : "三级"}{" "}
        行业
      </Tag>

      <div style={{ marginBottom: 20 }}>
        <Descriptions
          column={{ xs: 1, sm: 2, md: 4 }}
          size="small"
          styles={{
            label: { color: "var(--color-text-secondary)", fontSize: 13 },
            content: { fontSize: 14, fontWeight: 600 },
          }}
        >
          <Descriptions.Item label="静态 PE">
            {industry.pe_static?.toFixed(2) ?? "--"}
          </Descriptions.Item>
          <Descriptions.Item label="滚动 PE (TTM)">
            {industry.pe_ttm?.toFixed(2) ?? "--"}
          </Descriptions.Item>
          <Descriptions.Item label="PB">
            {industry.pb?.toFixed(2) ?? "--"}
          </Descriptions.Item>
          <Descriptions.Item label="股息率">
            {industry.dividend_rate != null
              ? `${industry.dividend_rate.toFixed(2)}%`
              : "--"}
          </Descriptions.Item>
        </Descriptions>
      </div>

      <div style={{ marginBottom: 20 }}>
        <AIInsightCard
          targetType="industry"
          targetId={industry.code}
          data={{
            name: industry.name,
            member_count: industry.member_count,
            pe_ttm: industry.pe_ttm,
            pb: industry.pb,
            dividend_rate: industry.dividend_rate,
            change_pct: topStocks.length > 0 ? topStocks[0].change_pct : null,
            top_stocks: topStocks.map((s) => ({
              name: s.name,
              change_pct: s.change_pct ?? 0,
            })),
          }}
        />
      </div>

      <Typography.Title level={4} style={{ fontSize: 16, marginBottom: 12 }}>
        成分股列表
      </Typography.Title>

      <Table<StockRow>
        columns={columns}
        dataSource={stocks}
        rowKey="code"
        size="small"
        pagination={{ pageSize: 20, showTotal: (t: number) => `共 ${t} 只` }}
      />
    </div>
  );
}
