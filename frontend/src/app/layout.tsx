import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "选股助手 - A股智能分析",
  description:
    "为散户打造的A股智能分析工具，一眼看懂行业趋势和个股价值，辅助投资决策。",
  keywords: ["A股", "选股", "行业分析", "股票分析", "智能选股"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
