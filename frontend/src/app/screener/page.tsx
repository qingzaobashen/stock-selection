import { Typography } from "antd";
import { ScreenerClient } from "./ScreenerClient";

export const dynamic = "force-dynamic";

export default function ScreenerPage() {
  return (
    <div>
      <Typography.Title level={3} style={{ marginBottom: 4, fontSize: 22 }}>
        智能选股
      </Typography.Title>
      <Typography.Text type="secondary" style={{ marginBottom: 24, display: "block" }}>
        多维度筛选 · AI 辅助分析
      </Typography.Text>
      <ScreenerClient />
    </div>
  );
}
