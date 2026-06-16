"use client";

import { ReactNode } from "react";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider, Layout, theme } from "antd";
import { Header } from "@/components/Header";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider
        theme={{
          algorithm: theme.defaultAlgorithm,
          token: {
            colorPrimary: "#0ea5a0",
            borderRadius: 8,
            colorBgContainer: "var(--color-bg-card)",
            colorText: "var(--color-text)",
            colorTextSecondary: "var(--color-text-secondary)",
            colorBorder: "var(--color-border)",
            colorBgElevated: "var(--color-bg-elevated)",
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans SC", sans-serif',
          },
          components: {
            Card: { paddingLG: 20 },
            Table: {
              headerBg: "var(--color-bg-card)",
              headerColor: "var(--color-text-secondary)",
              rowHoverBg: "var(--color-border-light)",
              borderColor: "var(--color-border)",
            },
            Menu: {
              itemBg: "transparent",
              horizontalItemSelectedColor: "var(--color-primary)",
              horizontalItemHoverColor: "var(--color-primary)",
              itemColor: "var(--color-text-secondary)",
            },
          },
        }}
      >
        <Layout
          style={{
            minHeight: "100vh",
            background: "var(--color-bg)",
          }}
        >
          <Header />
          <Layout.Content
            style={{
              maxWidth: 1200,
              width: "100%",
              margin: "0 auto",
              padding: "24px 24px 0",
            }}
          >
            {children}
          </Layout.Content>
          <Layout.Footer
            style={{
              textAlign: "center",
              color: "var(--color-text-tertiary)",
              fontSize: 12,
              background: "transparent",
              borderTop: "1px solid var(--color-border-light)",
              marginTop: 48,
              padding: "16px 24px",
            }}
          >
            选股助手 · 数据仅供参考，不构成投资建议
          </Layout.Footer>
        </Layout>
      </ConfigProvider>
    </AntdRegistry>
  );
}
