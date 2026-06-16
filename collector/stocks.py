"""Stock and daily quote data collection"""

import pandas as pd
import akshare as ak
from datetime import date, datetime
from supabase_client import supabase


def collect_stocks():
    """采集A股股票列表（实时行情接口包含基本信息）"""
    print("Collecting A-share stock list...")
    df = ak.stock_zh_a_spot_em()

    records = []
    for _, row in df.iterrows():
        records.append({
            "code": row["代码"],
            "name": row["名称"],
            "industry_code": None,  # 行业代码需要单独映射
            "market": _detect_market(row["代码"]),
            "list_date": None,
            "total_shares": int(row["总股本"]) if pd.notna(row["总股本"]) else None,
        })

    # Upsert in batches of 500
    batch_size = 500
    total = 0
    for i in range(0, len(records), batch_size):
        batch = records[i : i + batch_size]
        supabase.table("stocks").upsert(batch, ignore_duplicates=True).execute()
        total += len(batch)
        print(f"  Upserted {total}/{len(records)} stocks")

    print(f"  Total stocks: {len(records)}")
    return len(records)


def _detect_market(code: str) -> str:
    """根据股票代码判断市场"""
    if code.startswith("6") or code.startswith("9"):
        return "sh"
    elif code.startswith("0") or code.startswith("3"):
        return "sz"
    elif code.startswith("8") or code.startswith("4"):
        return "bj"
    return "sh"


def collect_daily_quotes(trade_date: str | None = None):
    """采集每日行情数据"""
    if trade_date is None:
        trade_date = date.today().isoformat()

    print(f"Collecting daily quotes for {trade_date}...")

    df = ak.stock_zh_a_spot_em()

    records = []
    for _, row in df.iterrows():
        change_pct = float(row["涨跌幅"]) if pd.notna(row["涨跌幅"]) else None
        records.append({
            "stock_code": row["代码"],
            "trade_date": trade_date,
            "open": float(row["今开"]) if pd.notna(row["今开"]) else None,
            "high": float(row["最高"]) if pd.notna(row["最高"]) else None,
            "low": float(row["最低"]) if pd.notna(row["最低"]) else None,
            "close": float(row["最新价"]) if pd.notna(row["最新价"]) else None,
            "pre_close": float(row["昨收"]) if pd.notna(row["昨收"]) else None,
            "change_pct": change_pct,
            "volume": int(row["成交量"]) if pd.notna(row["成交量"]) else None,
            "amount": float(row["成交额"]) if pd.notna(row["成交额"]) else None,
            "turnover": float(row["换手率"]) if pd.notna(row["换手率"]) else None,
        })

    batch_size = 500
    total = 0
    for i in range(0, len(records), batch_size):
        batch = records[i : i + batch_size]
        supabase.table("daily_quotes").upsert(batch, ignore_duplicates=True).execute()
        total += len(batch)
        print(f"  Upserted {total}/{len(records)} quotes")

    print(f"  Total quotes: {len(records)}")
    return len(records)


def run(date_str: str | None = None):
    stock_count = collect_stocks()
    quote_count = collect_daily_quotes(date_str)
    return stock_count + quote_count


if __name__ == "__main__":
    run()
