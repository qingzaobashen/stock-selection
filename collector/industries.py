"""Industry data collection - 申万行业分类"""

import pandas as pd
import akshare as ak
from supabase_client import supabase


def collect_first_level():
    """采集申万一级行业信息"""
    print("Collecting Shenwan first-level industries...")
    df = ak.sw_index_first_info()

    records = []
    for _, row in df.iterrows():
        records.append({
            "code": row["行业代码"],
            "name": row["行业名称"],
            "level": 1,
            "parent_code": None,
            "member_count": int(row["成份个数"]) if pd.notna(row["成份个数"]) else 0,
            "pe_static": float(row["静态市盈率"]) if pd.notna(row["静态市盈率"]) else None,
            "pe_ttm": float(row["滚动市盈率"]) if pd.notna(row.get("滚动市盈率", row["静态市盈率"])) else None,
            "pb": float(row["市净率"]) if pd.notna(row["市净率"]) else None,
            "dividend_rate": float(row["静态股息率"]) if pd.notna(row["静态股息率"]) else None,
        })

    result = supabase.table("industries").upsert(records).execute()
    print(f"  Inserted/updated {len(records)} first-level industries")
    return len(records)


def collect_second_level():
    """采集申万二级行业信息"""
    print("Collecting Shenwan second-level industries...")
    df = ak.sw_index_second_info()

    records = []
    for _, row in df.iterrows():
        records.append({
            "code": row["行业代码"],
            "name": row["行业名称"],
            "level": 2,
            "parent_code": None,  # 二级行业上级需要从名称推断或使用其他接口
            "member_count": int(row["成份个数"]) if pd.notna(row["成份个数"]) else 0,
            "pe_static": float(row["静态市盈率"]) if pd.notna(row["静态市盈率"]) else None,
            "pe_ttm": float(row["滚动市盈率"]) if pd.notna(row["滚动市盈率"]) else None,
            "pb": float(row["市净率"]) if pd.notna(row["市净率"]) else None,
            "dividend_rate": float(row["静态股息率"]) if pd.notna(row["静态股息率"]) else None,
        })

    result = supabase.table("industries").upsert(records).execute()
    print(f"  Inserted/updated {len(records)} second-level industries")
    return len(records)


def run():
    count1 = collect_first_level()
    count2 = collect_second_level()
    return count1 + count2


if __name__ == "__main__":
    run()
