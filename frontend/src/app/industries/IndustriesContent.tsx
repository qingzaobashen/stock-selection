"use client";

import { Typography, Row, Col, Card, Statistic, Tag } from "antd";
import Link from "next/link";
import type { Industry } from "@/lib/types";

export function IndustriesContent({ industries }: { industries: Industry[] }) {
  const sorted = [...industries].sort(
    (a, b) => (b.pe_ttm ?? 999) - (a.pe_ttm ?? 999)
  );

  return (
    <div>
      <Typography.Title level={3} style={{ marginBottom: 4, fontSize: 22 }}>
        行业看板
      </Typography.Title>
      <Typography.Text type="secondary" style={{ marginBottom: 24, display: "block" }}>
        申万一级行业分类 · 共 {industries.length} 个行业
      </Typography.Text>

      <Row gutter={[12, 12]}>
        {sorted.map((ind) => (
          <Col xs={12} sm={8} md={6} lg={4} key={ind.code}>
            <Link href={`/industries/${ind.code}`} style={{ textDecoration: "none" }}>
              <Card
                hoverable
                styles={{ body: { padding: 16 } }}
                style={{
                  background: "var(--color-bg-card)",
                  borderColor: "var(--color-border)",
                  borderTop: "3px solid var(--color-primary)",
                }}
              >
                <Typography.Text
                  strong
                  style={{ fontSize: 14, display: "block", marginBottom: 8 }}
                >
                  {ind.name}
                </Typography.Text>
                <Statistic
                  value={ind.pe_ttm ?? "--"}
                  suffix="PE"
                  valueStyle={{
                    fontSize: 20,
                    fontWeight: 600,
                    color:
                      ind.pe_ttm === null
                        ? "var(--color-text-tertiary)"
                        : ind.pe_ttm < 15
                          ? "var(--color-success)"
                          : ind.pe_ttm < 30
                            ? "var(--color-text)"
                            : "var(--color-danger)",
                  }}
                />
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 12,
                    color: "var(--color-text-tertiary)",
                    display: "flex",
                    gap: 8,
                  }}
                >
                  <span>PB: {ind.pb?.toFixed(2) ?? "--"}</span>
                  <span>股息率: {ind.dividend_rate?.toFixed(2) ?? "--"}%</span>
                </div>
                <div style={{ marginTop: 4 }}>
                  <Tag
                    style={{
                      fontSize: 11,
                      background: "var(--color-border-light)",
                      border: "none",
                      color: "var(--color-text-tertiary)",
                    }}
                  >
                    {ind.member_count} 只成分股
                  </Tag>
                </div>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
}
