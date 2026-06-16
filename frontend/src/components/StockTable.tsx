"use client";

import { Table, Typography, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { StockWithQuote } from "@/lib/types";

interface StockTableProps {
  stocks: StockWithQuote[]
  loading?: boolean
  showIndustry?: boolean
}

export function StockTable({ stocks, loading = false, showIndustry = false }: StockTableProps) {
  const columns: ColumnsType<StockWithQuote> = [
    {
      title: "代码",
      dataIndex: "code",
      key: "code",
      width: 100,
      render: (code: string) => (
        <Typography.Text copyable={{ text: code }} style={{ fontFamily: "monospace", fontSize: 13 }}>
          {code}
        </Typography.Text>
      ),
    },
    {
      title: "名称",
      dataIndex: "name",
      key: "name",
      width: 120,
      render: (name: string) => (
        <Typography.Text strong style={{ fontSize: 13 }}>
          {name}
        </Typography.Text>
      ),
    },
    ...(showIndustry
      ? [
          {
            title: "行业",
            dataIndex: "industry_code",
            key: "industry_code",
            width: 120,
          } as ColumnsType<StockWithQuote>[number],
        ]
      : []),
    {
      title: "最新价",
      dataIndex: "close",
      key: "close",
      width: 100,
      align: "right" as const,
      render: (val: number | null) => val?.toFixed(2) ?? "--",
    },
    {
      title: "涨跌幅",
      dataIndex: "change_pct",
      key: "change_pct",
      width: 100,
      align: "right" as const,
      sorter: (a: StockWithQuote, b: StockWithQuote) => (a.change_pct ?? 0) - (b.change_pct ?? 0),
      render: (val: number | null) => {
        if (val === null || val === undefined) return "--";
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
      align: "right" as const,
      sorter: (a: StockWithQuote, b: StockWithQuote) => (a.pe_ttm ?? 0) - (b.pe_ttm ?? 0),
      render: (val: number | null) => val?.toFixed(2) ?? "--",
    },
    {
      title: "PB",
      dataIndex: "pb",
      key: "pb",
      width: 80,
      align: "right" as const,
      render: (val: number | null) => val?.toFixed(2) ?? "--",
    },
    {
      title: "ROE",
      dataIndex: "roe",
      key: "roe",
      width: 80,
      align: "right" as const,
      render: (val: number | null) => {
        if (val === null || val === undefined) return "--";
        return (
          <Tag color={val > 15 ? "green" : val > 5 ? "blue" : "default"}>
            {val.toFixed(1)}%
          </Tag>
        );
      },
    },
    {
      title: "成交额",
      dataIndex: "amount",
      key: "amount",
      width: 120,
      align: "right" as const,
      render: (val: number | null) => {
        if (!val) return "--";
        if (val >= 1e8) return (val / 1e8).toFixed(2) + "亿";
        return (val / 1e4).toFixed(0) + "万";
      },
    },
  ];

  return (
    <Table<StockWithQuote>
      columns={columns}
      dataSource={stocks}
      rowKey="code"
      loading={loading}
      size="small"
      pagination={{
        pageSize: 20,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 只`,
      }}
      style={{ fontFamily: "var(--font-sans)" }}
    />
  );
}
