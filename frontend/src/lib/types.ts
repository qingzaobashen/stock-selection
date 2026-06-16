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
  market: "sh" | "sz" | "bj"
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
  report_type: "annual" | "q1" | "q2" | "q3"
  roe: number | null
  gross_margin: number | null
  revenue_growth: number | null
  profit_growth: number | null
  pe_ttm: number | null
  pb: number | null
}

export interface AIInsight {
  target_type: "industry" | "stock" | "screener"
  target_id: string
  insight: string
  model: string
  created_at: string
}

export interface IndustryWithQuote extends Industry {
  change_pct: number | null
  amount: number | null
}

export interface StockWithQuote extends Stock {
  close: number | null
  change_pct: number | null
  volume: number | null
  amount: number | null
  pe_ttm: number | null
  pb: number | null
  roe: number | null
}

export interface ScreenerFilters {
  industry_codes?: string[]
  pe_ttm_min?: number
  pe_ttm_max?: number
  pb_min?: number
  pb_max?: number
  roe_min?: number
  revenue_growth_min?: number
  profit_growth_min?: number
  change_pct_min?: number
  change_pct_max?: number
}
