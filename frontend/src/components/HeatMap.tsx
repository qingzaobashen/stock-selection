"use client";

import { Typography, Card, Spin } from "antd";
import dynamic from "next/dynamic";
import type { IndustryWithQuote } from "@/lib/types";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface HeatMapProps {
  industries: IndustryWithQuote[]
  loading?: boolean
  dimension?: "change_pct" | "amount"
  onIndustryClick?: (code: string) => void
}

export function HeatMap({
  industries,
  loading = false,
  dimension = "change_pct",
  onIndustryClick,
}: HeatMapProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <Spin />
      </div>
    );
  }

  const isChange = dimension === "change_pct";
  const values = industries.map((i) => i[dimension] ?? 0);
  const maxVal = Math.max(...values.map(Math.abs));
  const sorted = [...industries].sort((a, b) => (b[dimension] ?? 0) - (a[dimension] ?? 0));

  const gridSize = Math.max(40, Math.min(60, 600 / Math.ceil(Math.sqrt(industries.length))));
  const cols = Math.ceil(Math.sqrt(industries.length));

  const option = {
    grid: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      containLabel: false,
    },
    xAxis: { show: false },
    yAxis: { show: false },
    series: [
      {
        type: "scatter",
        symbolSize: (val: number) => Math.max(gridSize * 0.6, Math.abs(val) / (maxVal || 1) * gridSize * 1.2),
        data: sorted.map((ind, i) => ({
          value: [
            i % cols,
            Math.floor(i / cols),
            ind[dimension] ?? 0,
          ],
          name: ind.name,
          code: ind.code,
        })),
        itemStyle: {
          color: (params: { value: number[] }) => {
            const val = params.value[2];
            if (val > 0) {
              const intensity = Math.min(Math.abs(val) / (maxVal || 1), 1);
              return `rgba(239, 68, 68, ${0.2 + intensity * 0.6})`;
            }
            const intensity = Math.min(Math.abs(val) / (maxVal || 1), 1);
            return `rgba(16, 185, 129, ${0.2 + intensity * 0.6})`;
          },
          borderRadius: 6,
        },
        label: {
          show: true,
          formatter: (params: { name: string; value: number[] }) =>
            `${params.name}\n${isChange ? (params.value[2] > 0 ? "+" : "") + params.value[2].toFixed(2) + "%" : (params.value[2] / 1e8).toFixed(1) + "亿"}`,
          position: "inside",
          fontSize: 10,
          color: "var(--color-text)",
          lineHeight: 16,
        },
        tooltip: {
          formatter: (params: { name: string; value: number[] }) => {
            const ind = sorted.find((s) => s.name === params.name);
            if (!ind) return "";
            return `
              <div style="font-weight:600;margin-bottom:4px">${ind.name}</div>
              <div>成分股: ${ind.member_count} 只</div>
              <div>涨跌幅: ${ind.change_pct?.toFixed(2) ?? "--"}%</div>
              <div>PE-TTM: ${ind.pe_ttm?.toFixed(2) ?? "--"}</div>
              <div>PB: ${ind.pb?.toFixed(2) ?? "--"}</div>
            `;
          },
        },
      },
    ],
  };

  return (
    <Card
      styles={{ body: { padding: 16 } }}
      style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
    >
      <Typography.Text
        type="secondary"
        style={{ fontSize: 12, marginBottom: 8, display: "block" }}
      >
        维度：{isChange ? "涨跌幅" : "成交额"} · 点击方块查看详情
      </Typography.Text>
      <ReactECharts
        option={option}
        style={{ height: 500 }}
        onEvents={{
          click: (params: { value: number[] }) => {
            const idx = sorted.findIndex(
              (_, i) => i % cols === params.value[0] && Math.floor(i / cols) === params.value[1]
            );
            if (idx !== -1 && onIndustryClick) {
              onIndustryClick(sorted[idx].code);
            }
          },
        }}
      />
    </Card>
  );
}
