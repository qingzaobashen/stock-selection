# Project: Stock Selection（选股助手）

## Goal
Build an A-share stock analysis web app for retail investors, with industry board + smart stock screener + AI-powered insights.

## Tech Stack
- **Frontend**: Next.js 16.2.9, Ant Design 6.4.4 (antd), Tailwind CSS 4, ECharts
- **Backend**: Next.js API Routes (no separate FastAPI)
- **Database**: Supabase (PostgreSQL, Singapore region, bgwfkpxzerlihitexzzc.supabase.co)
- **Data Collection**: Python AKShare, runs via GitHub Actions daily 15:30 CST
- **AI**: apihub.agnes-ai.com/v1, model agnes-2.0-flash
- **Deployment**: Vercel + Supabase
- **Access**: Tailscale IP 100.107.49.116:3000 (dev), LAN 192.168.31.100:3000

## Architecture Decision
- No separate FastAPI service. Python (AKShare) runs only as scheduled GitHub Actions scripts.
- Data collected by Python → inserted into Supabase via service_role key → Next.js reads via anon key (RLS: public SELECT).

## Project Structure
```
stock-selection/
├── frontend/           # Next.js app
│   ├── src/
│   │   ├── app/        # App Router pages + API routes
│   │   ├── components/ # Shared client components
│   │   └── lib/        # Utils: supabase client, types, AI client
│   ├── .env.local      # Supabase keys, AI key
│   └── package.json
├── collector/          # Python data collection scripts
│   └── main.py
├── supabase/
│   └── migrations/
│       └── 001_init.sql
├── AGENTS.md
└── README.md
```

## Key Files
- `frontend/src/app/page.tsx` — Home page (Server Component, fetches data, renders `<HomeContent>`)
- `frontend/src/app/HomeContent.tsx` — Home page UI ("use client", renders Ant Design + ECharts)
- `frontend/src/app/layout.tsx` — Root layout (Server, metadata, wraps in `<Providers>`)
- `frontend/src/app/industries/page.tsx` — Industry board (Server, fetches data, renders `<IndustriesContent>`)
- `frontend/src/app/industries/[code]/page.tsx` — Industry detail (Server, fetches data + stocks, renders `<IndustryDetailContent>`)
- `frontend/src/app/screener/ScreenerClient.tsx` — Screener UI ("use client")
- `frontend/src/app/api/ai/route.ts` — AI proxy endpoint
- `frontend/src/app/api/screener/route.ts` — Stock screener API endpoint
- `frontend/src/components/Providers.tsx` — Ant Design ConfigProvider + Layout ("use client")
- `frontend/src/components/Header.tsx` — Nav header ("use client")
- `frontend/src/components/AIInsight.tsx` — AI insight card component
- `frontend/src/lib/supabase.ts` — Supabase client init
- `frontend/src/lib/ai.ts` — AI API client (Agnes format)

## Database Tables (Supabase)
- `industries` — code (PK), name, level, member_count, pe_static, pe_ttm, pb, dividend_rate, updated_at
- `stocks` — code (PK), name, industry_code → industries, market
- `daily_quotes` — id (PK), stock_code → stocks, trade_date, open/close/high/low/volume/amount/change_pct
- `financial_metrics` — id (PK), stock_code → stocks, report_date, report_type, roe, pe_ttm, pb, revenue/profit
- `ai_insights` — id (PK), target_type, target_id, insight_text, confidence, created_at
- `collection_log` — id (PK), task_name, status, started_at, finished_at, message

## Critical Patterns

### Ant Design v6 in Server Components
**Root cause**: Ant Design v6 attaches `.Title`, `.Text`, `.Content`, `.Item` etc. as static properties on `"use client"` components. Next.js Server Components only get the base function, not those properties → `Typography.Title` = `undefined`.

**Fix pattern**: Server Component never imports from `"antd"`. Instead:
- Server page fetches data (async, directly uses `supabase`), returns a Client Component
- Client Component (`"use client"`) imports `{ Typography, Descriptions, Tag, Table, Layout }` and uses compound sub-components

Example:
```tsx
// page.tsx — Server Component
export default async function Page() {
  const data = await getData()
  return <ClientUI data={data} />
}

// ClientUI.tsx — Client Component
"use client"
import { Typography, Table } from "antd"
export function ClientUI({ data }) {
  return <><Typography.Title>{data.name}</Typography.Title>...</>
}
```

### Layout.Content wrapper
`Layout.Content` must be in a Client Component. The root layout in `layout.tsx` wraps children in `<Providers>`, which contains `<Layout><Content>...</Content></Layout>`. Individual pages should NOT wrap in `<Layout>` again.

### Supabase URL
Use `https://bgwfkpxzerlihitexzzc.supabase.co` (NO `/rest/v1/` suffix). The supabase-js SDK appends it automatically.

### ISR Strategy
- Home page: `revalidate = 1800` (30 min)
- Industry board: `revalidate = 3600` (1 hr)
- Industry detail: `revalidate = 3600` (1 hr)
- `/screener`: fully dynamic (no revalidate)
- `/api/*`: fully dynamic

### AI API Format
Endpoint: `https://apihub.agnes-ai.com/v1/chat/completions`
Model: `agnes-2.0-flash`
Standard OpenAI-compatible chat format. The key is in `.env.local` as `AI_API_KEY`.

### TypeScript Build Speed
Full build takes ~2 min (116s compile + 30s TS check). Cleaning `.next` before build is sometimes needed.

## Dev Commands
```bash
# Start dev server
npm run dev          # = next dev -p 3000

# Type check only (fast, ~10s)
npx tsc --noEmit

# Build (slow, ~2min)
npm run build

# Prod preview
npm run start        # = next start -p 3000
```

## Status (as of Jun 17, 2026)
- ✅ All dependencies installed (Next.js 16.2.9, antd 6.4.4, echarts, supabase-js, tailwindcss 4)
- ✅ Database tables created + seed data (15 industries, 15 stocks, 15 quotes, 15 financial records)
- ✅ All page/layout/API files written with correct server/client split
- ✅ Build passes (0 errors)
- ✅ AI API config fixed (defaults: apihub.agnes-ai.com/v1, agnes-2.0-flash)
- ✅ Home page aggregates industry-level quotes from daily_quotes
- ✅ Stock detail page created (`/stocks/[code]`) with quote + financial + AI insight
- ✅ StockTable links to stock detail page
- ✅ Redundant prompt code cleaned from lib/ai.ts
- ✅ Git pushed to github.com/qingzaobashen/stock-selection
- ✅ GitHub Actions Secrets configured (SUPABASE_URL, SUPABASE_SERVICE_KEY, AI_API_KEY)
- 🔜 Data collection Actions triggered — verify run status at GitHub Actions tab
- 🔜 Verify all routes render correctly in browser at http://100.107.49.116:3000
- 🔜 Verify AI insight cards work with real API key
