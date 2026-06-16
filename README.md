# Stock Selection — A股散户智能决策助手

为普通散户提供"一眼看懂股票和行业"的分析工具，降低信息门槛，辅助投资决策。

## 核心功能

- **行业看板** — 申万一级行业热力图、板块轮动追踪、行业成分股分析
- **智能选股** — 多维度筛选（基本面/技术面/资金面），AI 辅助解读
- **AI 分析** — 大模型生成行业解读、选股结论，用大白话讲清楚数据含义

## 技术栈

| 层 | 技术 |
|---|------|
| 前端 | Next.js 15 (App Router) + TypeScript + Tailwind CSS |
| UI | Ant Design + ECharts |
| 数据库 | Supabase (PostgreSQL) |
| 数据采集 | Python + AKShare (GitHub Actions 定时任务) |
| AI | 国产大模型 API (DeepSeek/Qwen/GLM) |
| 部署 | Vercel |

## 项目结构

```
stock-selection/
├── frontend/                  # Next.js 应用 (Vercel)
│   ├── src/
│   │   ├── app/               # App Router 页面
│   │   ├── components/        # 共享组件
│   │   └── lib/               # 工具库 (Supabase, AI, Types)
│   ├── tailwind.config.ts
│   └── package.json
├── collector/                 # Python 数据采集
│   ├── main.py                # 主流程
│   ├── industries.py          # 行业数据
│   ├── stocks.py              # 个股数据
│   └── requirements.txt
├── .github/workflows/         # CI/CD
│   └── daily_collect.yml      # 每日数据采集
├── supabase/migrations/       # 数据库迁移
│   └── 001_init.sql
└── docs/                      # 文档
    ├── architecture.md
    ├── supabase-setup.md
    ├── development-guide.md
    ├── deployment.md
    └── data-collection.md
```

## 快速开始

```bash
# 1. 前端
cd frontend
cp .env.example .env.local   # 填写 Supabase 和 AI API 配置
npm install
npm run dev

# 2. 数据采集 (可选)
cd collector
pip install -r requirements.txt
python main.py
```

## 迭代路线

- **Phase 1 (MVP)**: 行业看板 + 智能选股 + AI 解读
- **Phase 2**: 个股诊股 + 持仓看板 + 市场雷达
- **Phase 3**: 港股/美股扩展 + 移动端 (React Native)
