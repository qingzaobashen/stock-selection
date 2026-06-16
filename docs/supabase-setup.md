# Supabase 项目搭建

## 1. 创建 Supabase 项目

1. 打开 [https://supabase.com](https://supabase.com) 并登录
2. 点击 **New project**
3. 填写项目信息：
   - **Name**: `stock-selection`
   - **Database Password**: 点击生成并**保存到本地密码管理器**
   - **Region**: `Southeast Asia (Singapore)` — 国内访问速度最快
   - **Pricing Plan**: Free 即可（PostgreSQL 10GB + 500MB 数据库）
4. 等待约 1-2 分钟，项目创建完成

## 2. 获取连接信息

创建后进入项目 Dashboard，到左侧 **Project Settings → API** 页面：

| 参数 | 说明 | 位置 |
|------|------|------|
| `Project URL` | Supabase 项目地址 | Settings → API → Project URL |
| `anon public key` | 前端安全读密钥 | Settings → API → anon public |
| `service_role key` | 后端管理密钥（**勿泄露**） | Settings → API → service_role |

记录这三个值，后续配置需要。

## 3. 执行数据库 SQL

进入 **SQL Editor**，点击 **New query**，逐段粘贴执行以下 SQL：

### 3.1 创建行业信息表

```sql
-- 申万行业分类表（支持三级分类）
CREATE TABLE industries (
    code          VARCHAR(20) PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    level         SMALLINT NOT NULL CHECK (level IN (1, 2, 3)),
    parent_code   VARCHAR(20) REFERENCES industries(code),
    member_count  INT DEFAULT 0,
    pe_static     DECIMAL(12, 2),
    pe_ttm        DECIMAL(12, 2),
    pb            DECIMAL(12, 2),
    dividend_rate DECIMAL(8, 4),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_industries_level  ON industries(level);
CREATE INDEX idx_industries_parent ON industries(parent_code);
```

### 3.2 创建股票基本信息表

```sql
CREATE TABLE stocks (
    code           VARCHAR(10) PRIMARY KEY,
    name           VARCHAR(50) NOT NULL,
    industry_code  VARCHAR(20) REFERENCES industries(code),
    market         VARCHAR(5) NOT NULL CHECK (market IN ('sh', 'sz', 'bj')),
    list_date      DATE,
    total_shares   BIGINT,
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stocks_industry ON stocks(industry_code);
CREATE INDEX idx_stocks_market   ON stocks(market);
```

### 3.3 创建每日行情表

```sql
CREATE TABLE daily_quotes (
    stock_code  VARCHAR(10) NOT NULL REFERENCES stocks(code),
    trade_date  DATE NOT NULL,
    open        DECIMAL(12, 2),
    high        DECIMAL(12, 2),
    low         DECIMAL(12, 2),
    close       DECIMAL(12, 2),
    pre_close   DECIMAL(12, 2),
    change_pct  DECIMAL(8, 4),
    volume      BIGINT,
    amount      DECIMAL(16, 2),
    turnover    DECIMAL(8, 4),
    PRIMARY KEY (stock_code, trade_date)
);

CREATE INDEX idx_daily_quotes_date   ON daily_quotes(trade_date);
CREATE INDEX idx_daily_quotes_change ON daily_quotes(change_pct);
```

### 3.4 创建财务指标表

```sql
CREATE TABLE financial_metrics (
    stock_code     VARCHAR(10) NOT NULL REFERENCES stocks(code),
    report_date    DATE NOT NULL,
    report_type    VARCHAR(10) DEFAULT 'annual' CHECK (report_type IN ('annual', 'q1', 'q2', 'q3')),
    roe            DECIMAL(8, 4),
    gross_margin   DECIMAL(8, 4),
    net_margin     DECIMAL(8, 4),
    revenue        DECIMAL(16, 2),
    revenue_growth DECIMAL(8, 4),
    net_profit     DECIMAL(16, 2),
    profit_growth  DECIMAL(8, 4),
    eps            DECIMAL(10, 4),
    bvps           DECIMAL(10, 4),
    pe_ttm         DECIMAL(12, 2),
    pb             DECIMAL(12, 2),
    updated_at     TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (stock_code, report_date, report_type)
);

CREATE INDEX idx_financial_stock  ON financial_metrics(stock_code);
CREATE INDEX idx_financial_report ON financial_metrics(report_date);
```

### 3.5 创建 AI 分析缓存表

```sql
CREATE TABLE ai_insights (
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('industry', 'stock', 'screener')),
    target_id   VARCHAR(50) NOT NULL,
    insight     TEXT NOT NULL,
    model       VARCHAR(50),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (target_type, target_id)
);
```

### 3.6 创建采集日志表

```sql
CREATE TABLE collection_log (
    id          BIGSERIAL PRIMARY KEY,
    task_name   VARCHAR(50) NOT NULL,
    status      VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failed')),
    rows_count  INT,
    error_msg   TEXT,
    started_at  TIMESTAMPTZ,
    finished_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_collection_log_task ON collection_log(task_name, finished_at);
```

### 3.7 开启 Row Level Security (RLS)

```sql
-- 启用 RLS
ALTER TABLE industries      ENABLE ROW LEVEL SECURITY;
ALTER TABLE stocks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_quotes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights     ENABLE ROW LEVEL SECURITY;

-- 公开读权限（前端 anon key 可读）
CREATE POLICY "允许匿名读取" ON industries      FOR SELECT USING (true);
CREATE POLICY "允许匿名读取" ON stocks          FOR SELECT USING (true);
CREATE POLICY "允许匿名读取" ON daily_quotes    FOR SELECT USING (true);
CREATE POLICY "允许匿名读取" ON financial_metrics FOR SELECT USING (true);
CREATE POLICY "允许匿名读取" ON ai_insights     FOR SELECT USING (true);
```

### 3.8 创建自动更新 updated_at 触发器（可选）

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_industries_updated_at
    BEFORE UPDATE ON industries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_stocks_updated_at
    BEFORE UPDATE ON stocks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

## 4. 验证数据库

执行验证 SQL 确认所有表创建成功：

```sql
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

期望输出 6 张表：
```
industries
stocks
daily_quotes
financial_metrics
ai_insights
collection_log
```

## 5. 后续维护

- **数据备份**: Supabase Free 计划自动每日备份，保留 7 天
- **连接池**: Supabase 自动管理连接池，无需额外配置
- **性能监控**: Dashboard → Database → Query performance 可查看慢查询
- **扩容**: 数据量超过 Free 计划后升级到 Pro ($25/月)

## 6. 常见问题

**Q: 表创建失败提示 "relation already exists"**
A: 先执行 `DROP TABLE IF EXISTS ... CASCADE;` 再重新创建

**Q: 中国区域直连 Supabase 慢**
A: 新加坡节点延迟约 80-120ms，可接受。如果需要更快，后续可考虑 Supabase 东京节点或自建

**Q: 数据量预估**
A: Free 计划 10GB 数据库空间。A 股约 5000 只股票，每日行情一行约 80 字节，10 年数据约 1.5GB，Free 计划足够使用 3-5 年
