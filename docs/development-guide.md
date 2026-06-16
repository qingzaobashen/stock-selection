# 本地开发指南

## 前置条件

- Node.js >= 18
- Python >= 3.10
- pnpm 或 npm
- Supabase 项目（参见 [supabase-setup.md](./supabase-setup.md)）
- AI API Key（DeepSeek / Qwen / GLM 等）

## 1. 前端开发

### 1.1 初始化项目

```bash
cd frontend

# 安装依赖
npm install
# 或
pnpm install
```

主要依赖说明：

| 包 | 用途 |
|---|------|
| `next` | 框架，版本 15.x |
| `react` / `react-dom` | UI 库 |
| `antd` | UI 组件库 |
| `@ant-design/icons` | 图标库 |
| `echarts` / `echarts-for-react` | 图表（热力图、K线等） |
| `@supabase/supabase-js` | Supabase 客户端 |
| `tailwindcss` | 工具类 CSS |
| `dayjs` | 日期处理 |

### 1.2 环境变量配置

创建 `frontend/.env.local`：

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# AI API (以 DeepSeek 为例)
AI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
AI_API_BASE_URL=https://api.deepseek.com
AI_MODEL=deepseek-chat
```

> `.env.local` 已加入 `.gitignore`，不会提交到仓库

### 1.3 启动开发服务

```bash
npm run dev
# 访问 http://localhost:3000
```

### 1.4 Supabase 客户端封装

`frontend/src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 1.5 类型定义

`frontend/src/lib/types.ts`:

```typescript
export interface Industry {
  code: string
  name: string
  level: 1 | 2 | 3
  parent_code: string | null
  member_count: number
  pe_static: number | null
  pe_ttm: number | null
  pb: number | null
  dividend_rate: number | null
  updated_at: string
}

export interface Stock {
  code: string
  name: string
  industry_code: string
  market: 'sh' | 'sz' | 'bj'
  list_date: string | null
  total_shares: number | null
}

export interface DailyQuote {
  stock_code: string
  trade_date: string
  open: number
  high: number
  low: number
  close: number
  pre_close: number
  change_pct: number
  volume: number
  amount: number
  turnover: number
}

export interface FinancialMetric {
  stock_code: string
  report_date: string
  report_type: 'annual' | 'q1' | 'q2' | 'q3'
  roe: number | null
  gross_margin: number | null
  revenue_growth: number | null
  profit_growth: number | null
  pe_ttm: number | null
  pb: number | null
}

export interface AIInsight {
  target_type: 'industry' | 'stock' | 'screener'
  target_id: string
  insight: string
  model: string
  created_at: string
}
```

## 2. 数据采集脚本

### 2.1 环境准备

```bash
cd collector
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或 venv\Scripts\activate  # Windows

pip install -r requirements.txt
```

### 2.2 依赖清单

`collector/requirements.txt`:

```
akshare>=1.15.0
pandas>=2.0.0
supabase>=2.0.0
python-dotenv>=1.0.0
```

### 2.3 配置

创建 `collector/.env`:

```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIs...  # service_role key
```

### 2.4 测试运行

```bash
python main.py --tasks industries,stocks
```

支持的参数：

| 参数 | 说明 |
|------|------|
| `--tasks` | 指定采集任务，逗号分隔，可选: `industries, stocks, quotes, financials` |
| `--date` | 指定行情日期，默认当天，格式: `2025-06-13` |
| `--dry-run` | 试运行模式，只打印不写入数据库 |

## 3. 常见开发命令

```bash
# 前端
npm run dev       # 开发模式
npm run build     # 构建
npm run lint      # 代码检查
npm run typecheck # 类型检查

# 数据采集
python main.py --tasks industries  # 仅采集行业数据
python main.py --dry-run           # 试运行
```

## 4. 代码规范

- **组件**: React Server Component 优先，客户端交互用 `'use client'`
- **样式**: Tailwind CSS 做布局/间距，Ant Design 做组件样式
- **数据获取**: 在 Server Component 中直接查询 Supabase
- **AI 调用**: 通过 API Route (`/api/ai/`) 代理，避免暴露 API Key
