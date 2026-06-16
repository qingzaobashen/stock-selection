# 部署指南

## 1. Vercel 部署（前端）

### 1.1 准备工作

1. 将代码推送到 GitHub 仓库
2. 登录 [Vercel](https://vercel.com)（推荐用 GitHub 账号登录）

### 1.2 导入项目

1. 点击 **Add New → Project**
2. 选择 `stock-selection` 仓库
3. 配置：
   - **Framework Preset**: 自动检测为 `Next.js`
   - **Root Directory**: `frontend/`（注意选择子目录）
   - **Build Command**: `npm run build`（默认）
   - **Output Directory**: `.next`（默认）

### 1.3 环境变量配置

在 Vercel 项目 Settings → Environment Variables 中添加：

| Name | Value | 环境 |
|------|-------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key | All |
| `AI_API_KEY` | AI API Key | All |
| `AI_API_BASE_URL` | AI API 地址 | All |
| `AI_MODEL` | 模型名 | All |

### 1.4 部署

点击 **Deploy**，Vercel 会自动：
1. 安装依赖 `npm install`
2. 构建 `next build`
3. 部署到 Vercel CDN（全球边缘网络）
4. 分配域名 `stock-selection.vercel.app`

### 1.5 自定义域名

1. 在 Vercel 项目 Settings → Domains 中填写你的域名
2. 在 DNS 服务商处添加 CNAME 记录指向 `cname.vercel.com`
3. Vercel 会自动申请 SSL 证书

### 1.6 预览部署

每次推送到 GitHub，Vercel 会自动创建 Preview Deployment：
- 每个 PR 生成一个预览 URL
- 可用于联调和测试

## 2. ISR 缓存策略

`frontend/next.config.ts`:

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // ISR 稳定输出
  output: 'standalone',
  // 图片优化
  images: {
    formats: ['image/avif', 'image/webp'],
  },
}

export default nextConfig
```

各页面 ISR 配置：

```typescript
// 行业看板页 - 1小时刷新
export const revalidate = 3600

// 行业详情页 - 1小时刷新
export const revalidate = 3600

// 首页 - 30分钟刷新
export const revalidate = 1800

// 选股页面 - 不缓存（按需 SSR）
export const dynamic = 'force-dynamic'
```

## 3. Google AdSense 集成

在 `frontend/src/components/AdUnit.tsx`:

```tsx
'use client'

import Script from 'next/script'

export function AdUnit({ slot }: { slot: string }) {
  return (
    <>
      <Script
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
        strategy="afterInteractive"
      />
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-xxxxxxxxxxxxxx"
        data-ad-slot={slot}
        data-ad-format="auto"
      />
      <Script id="adsense-init">
        {(adsbygoogle = window.adsbygoogle || []).push({})}
      </Script>
    </>
  )
}
```

在需要广告的位置使用：

```tsx
// 仅在 Client Component 中使用
<AdUnit slot="1234567890" />
```

## 4. Vercel Analytics 和 Speed Insights（可选）

在 Vercel Dashboard 中启用：

1. 项目 Settings → Analytics → Enable
2. 项目 Settings → Speed Insights → Enable
3. Vercel 会自动注入分析脚本，无需代码修改

## 5. 部署检查清单

- [ ] Supabase 表已创建（执行 docs/supabase-setup.md 中的 SQL）
- [ ] Supabase RLS 策略已配置
- [ ] GitHub Secrets 已配置（SUPABASE_URL, SUPABASE_SERVICE_KEY）
- [ ] Vercel 环境变量已配置
- [ ] AI API Key 有效
- [ ] GitHub Actions 触发一次数据采集验证
- [ ] 验证前端能正常读取数据
- [ ] 验证 AI 分析能正常返回结果
- [ ] 设置自定义域名（可选）
- [ ] 配置 Google AdSense（可选）

## 6. 域名绑定（可选）

如果你有自己的域名，推荐以下配置：

```
类型: CNAME
主机记录: www
记录值: cname.vercel.com

类型: CNAME
主机记录: @
记录值: cname.vercel.com
```

等待 DNS 生效（通常 10 分钟到 24 小时），Vercel 会自动配置 SSL。
