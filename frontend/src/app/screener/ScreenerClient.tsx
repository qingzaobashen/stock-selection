"use client";

import { useState } from "react";
import {
  Card,
  Row,
  Col,
  InputNumber,
  Select,
  Button,
  Space,
  Typography,
  Collapse,
} from "antd";
import { FilterOutlined, ReloadOutlined } from "@ant-design/icons";
import { StockTable } from "@/components/StockTable";
import { AIInsightCard } from "@/components/AIInsight";
import type { StockWithQuote, ScreenerFilters } from "@/lib/types";

const industryOptions = [
  { label: "银行", value: "801780.SI" },
  { label: "非银金融", value: "801790.SI" },
  { label: "食品饮料", value: "801120.SI" },
  { label: "医药生物", value: "801150.SI" },
  { label: "电子", value: "801080.SI" },
  { label: "计算机", value: "801750.SI" },
  { label: "电力设备", value: "801730.SI" },
  { label: "新能源", value: "801735.SI" },
  { label: "房地产", value: "801180.SI" },
  { label: "汽车", value: "801880.SI" },
  { label: "机械设备", value: "801890.SI" },
  { label: "有色金属", value: "801050.SI" },
  { label: "基础化工", value: "801030.SI" },
  { label: "国防军工", value: "801740.SI" },
  { label: "通信", value: "801770.SI" },
];

const initialFilters: ScreenerFilters = {};

export function ScreenerClient() {
  const [filters, setFilters] = useState<ScreenerFilters>(initialFilters);
  const [results, setResults] = useState<StockWithQuote[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const updateFilter = <K extends keyof ScreenerFilters>(
    key: K,
    value: ScreenerFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, v));
          } else {
            params.append(key, String(value));
          }
        }
      });

      const res = await fetch(`/api/screener?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.stocks ?? []);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilters(initialFilters);
    setResults([]);
    setSearched(false);
  };

  return (
    <div>
      <Card
        style={{
          background: "var(--color-bg-card)",
          borderColor: "var(--color-border)",
          marginBottom: 20,
        }}
        styles={{ body: { padding: 20 } }}
      >
        <Collapse
          ghost
          defaultActiveKey={["filters"]}
          items={[
            {
              key: "filters",
              label: (
                <Space>
                  <FilterOutlined />
                  <span>筛选条件</span>
                </Space>
              ),
              children: (
                <div>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={8}>
                      <div style={{ marginBottom: 4 }}>
                        <Typography.Text
                          style={{ fontSize: 12, color: "var(--color-text-secondary)" }}
                        >
                          行业
                        </Typography.Text>
                      </div>
                      <Select
                        mode="multiple"
                        placeholder="全部行业"
                        style={{ width: "100%" }}
                        options={industryOptions}
                        value={filters.industry_codes}
                        onChange={(v) => updateFilter("industry_codes", v)}
                        maxTagCount={2}
                        allowClear
                      />
                    </Col>
                    <Col xs={12} sm={6} md={4}>
                      <div style={{ marginBottom: 4 }}>
                        <Typography.Text
                          style={{ fontSize: 12, color: "var(--color-text-secondary)" }}
                        >
                          PE-TTM 最小值
                        </Typography.Text>
                      </div>
                      <InputNumber
                        placeholder="不限"
                        style={{ width: "100%" }}
                        min={0}
                        value={filters.pe_ttm_min}
                        onChange={(v) =>
                          updateFilter("pe_ttm_min", v ?? undefined)
                        }
                      />
                    </Col>
                    <Col xs={12} sm={6} md={4}>
                      <div style={{ marginBottom: 4 }}>
                        <Typography.Text
                          style={{ fontSize: 12, color: "var(--color-text-secondary)" }}
                        >
                          PE-TTM 最大值
                        </Typography.Text>
                      </div>
                      <InputNumber
                        placeholder="不限"
                        style={{ width: "100%" }}
                        min={0}
                        value={filters.pe_ttm_max}
                        onChange={(v) =>
                          updateFilter("pe_ttm_max", v ?? undefined)
                        }
                      />
                    </Col>
                    <Col xs={12} sm={6} md={4}>
                      <div style={{ marginBottom: 4 }}>
                        <Typography.Text
                          style={{ fontSize: 12, color: "var(--color-text-secondary)" }}
                        >
                          ROE 最小值 (%)
                        </Typography.Text>
                      </div>
                      <InputNumber
                        placeholder="不限"
                        style={{ width: "100%" }}
                        min={0}
                        max={100}
                        value={filters.roe_min}
                        onChange={(v) => updateFilter("roe_min", v ?? undefined)}
                      />
                    </Col>
                    <Col xs={12} sm={6} md={4}>
                      <div style={{ marginBottom: 4 }}>
                        <Typography.Text
                          style={{ fontSize: 12, color: "var(--color-text-secondary)" }}
                        >
                          营收增速最小值 (%)
                        </Typography.Text>
                      </div>
                      <InputNumber
                        placeholder="不限"
                        style={{ width: "100%" }}
                        value={filters.revenue_growth_min}
                        onChange={(v) =>
                          updateFilter("revenue_growth_min", v ?? undefined)
                        }
                      />
                    </Col>
                  </Row>
                  <Space style={{ marginTop: 16 }}>
                    <Button
                      type="primary"
                      icon={<FilterOutlined />}
                      onClick={handleSearch}
                      loading={loading}
                    >
                      开始筛选
                    </Button>
                    <Button icon={<ReloadOutlined />} onClick={handleReset}>
                      重置
                    </Button>
                  </Space>
                </div>
              ),
            },
          ]}
        />
      </Card>

      {searched && results.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <AIInsightCard
            targetType="screener"
            targetId={JSON.stringify(filters)}
            data={{ filters, resultsCount: results.length }}
          />
        </div>
      )}

      {searched && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Typography.Title level={4} style={{ fontSize: 16, margin: 0 }}>
              筛选结果
            </Typography.Title>
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              共 {results.length} 只股票
            </Typography.Text>
          </div>
          <StockTable
            stocks={results}
            loading={loading}
            showIndustry
          />
        </>
      )}

      {searched && results.length === 0 && !loading && (
        <Card
          style={{
            background: "var(--color-bg-card)",
            borderColor: "var(--color-border)",
            textAlign: "center",
            padding: 48,
          }}
          styles={{ body: { padding: 48 } }}
        >
          <Typography.Text type="secondary">
            {loading ? "筛选中..." : "未找到符合条件的股票，请调整筛选条件"}
          </Typography.Text>
        </Card>
      )}
    </div>
  );
}
