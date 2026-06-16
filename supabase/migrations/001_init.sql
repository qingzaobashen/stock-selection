-- ============================================
-- Stock Selection - 数据库初始化脚本
-- 版本: 1.0
-- 说明: 在 Supabase SQL Editor 中逐段执行
-- ============================================

-- 1. 行业信息表 (申万行业分类)
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

-- 2. 股票基本信息表
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

-- 3. 每日行情数据
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

-- 4. 财务指标表
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

-- 5. AI 分析缓存表
CREATE TABLE ai_insights (
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('industry', 'stock', 'screener')),
    target_id   VARCHAR(50) NOT NULL,
    insight     TEXT NOT NULL,
    model       VARCHAR(50),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (target_type, target_id)
);

-- 6. 采集日志表
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

-- 7. Row Level Security
ALTER TABLE industries      ENABLE ROW LEVEL SECURITY;
ALTER TABLE stocks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_quotes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_anon_select_industries"       ON industries      FOR SELECT USING (true);
CREATE POLICY "allow_anon_select_stocks"           ON stocks          FOR SELECT USING (true);
CREATE POLICY "allow_anon_select_daily_quotes"     ON daily_quotes    FOR SELECT USING (true);
CREATE POLICY "allow_anon_select_financial_metrics" ON financial_metrics FOR SELECT USING (true);
CREATE POLICY "allow_anon_select_ai_insights"      ON ai_insights     FOR SELECT USING (true);

-- 8. updated_at 自动更新
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_industries_updated_at
    BEFORE UPDATE ON industries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_stocks_updated_at
    BEFORE UPDATE ON stocks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_financial_metrics_updated_at
    BEFORE UPDATE ON financial_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
