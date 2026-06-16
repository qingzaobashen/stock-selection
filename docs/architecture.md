# 系统架构

## 整体架构

```
                          ┌──────────────────────┐
                          │      用户浏览器        │
                          │ (SEO 爬虫 / AdSense)  │
                          └──────────┬───────────┘
                                     │
                                     ▼
                     ┌───────────────────────────┐
                     │      Vercel (CDN + Edge)   │
                     │         Next.js 15         │
                     │                            │
                     │  Server Components (ISR)    │
                     │  行业看板 / 行业详情 / 选股  │
                     │          +                  │
                     │  API Routes                │
                     │  数据查询 / AI 分析调用     │
                     └──────────┬────────────────┘
                                │
                   ┌────────────┴────────────┐
                   │                         │
                   ▼                         ▼
        ┌──────────────────┐     ┌──────────────────────┐
        │    Supabase       │     │   AI API (国产模型)   │
        │   (PostgreSQL)    │     │   DeepSeek / Qwen    │
        │    + SDK          │     │        / GLM         │
        └──────────────────┘     └──────────────────────┘
                   ▲
                   │
        ┌──────────┴──────────┐
        │  GitHub Actions      │
        │  Python + AKShare    │
        │  每日 15:30 自动采集  │
        └─────────────────────┘
```

## 设计原则

### 1. Server Components 优先

```
页面渲染策略:
├── 行业看板列表  → ISR (revalidate: 3600)  → 1小时刷新一次
├── 行业详情页    → ISR (revalidate: 3600)  → 1小时刷新一次
├── 智能选股页面  → SSR                     → 按需实时渲染
└── 首页市场总览  → ISR (revalidate: 1800)  → 30分钟刷新一次
```

### 2. 数据采集 vs 数据查询分离

```
采集层 (Python):                       查询层 (Next.js):
  AKShare → 清洗 → Supabase            Supabase → Server Component → HTML
  (定时批量写入)                        (按需读取，无计算逻辑)
```

### 3. AI 分析缓存策略

```
用户请求 → 检查 ai_insights 缓存 → 有 → 直接返回
                                → 无 → 调用 AI API → 写入缓存 → 返回
                                   缓存有效期: 行业缓存12h, 选股不缓存
```

## SEO 方案

- **Server Components**: 所有内容页渲染为完整 HTML，爬虫可直接索引
- **generateMetadata()**: 每个页面动态生成 title / description / keywords
- **Sitemap**: 自动生成 sitemap.xml (行业列表 + 行业详情页)
- **ISR**: 页面静态化，加载速度快，利于 Core Web Vitals
- **结构化数据**: 行业页面嵌入 JSON-LD (BreadcrumbList, Dataset)

## 数据流向

```
AKShare API
    │
    ▼
Python 采集脚本 (collector/)
    │  清洗、转换、去重
    ▼
Supabase PostgreSQL
    │
    ▼
Next.js Server Component
    │  查询 + 拼接数据
    ▼
  组装 Prompt → AI API → 生成解读
    │
    ▼
  HTML 响应 (SSR/ISR)
    │
    ▼
  浏览器渲染 + AdSense 广告
```
