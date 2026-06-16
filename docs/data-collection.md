# 数据采集方案

## 采集流程

```
每天北京时间 15:30（收盘后）
           │
           ▼
    GitHub Actions 触发
           │
           ▼
   ┌───────────────┐
   │ 采集行业数据    │  ← sw_index_first_info()
   └───────┬───────┘
           ▼
   ┌───────────────┐
   │ 采集股票列表    │  ← stock_zh_a_spot_em()
   └───────┬───────┘
           ▼
   ┌───────────────┐
   │ 采集当日行情    │  ← stock_zh_a_hist()
   └───────┬───────┘
           ▼
   ┌───────────────┐
   │ 采集财务数据    │  ← stock_financial_abstract_ths()
   └───────┬───────┘
           ▼
    写入 Supabase
           │
           ▼
   记录 collection_log
```

## 采集脚本入口

`collector/main.py`：

```python
"""
数据采集主入口
用法：
    python main.py                          # 全量采集
    python main.py --tasks industries       # 仅行业
    python main.py --tasks industries,stocks # 行业+股票
    python main.py --dry-run                # 试运行
"""
```

## AKShare 接口对照

| 数据 | 接口 | 频率 | 说明 |
|------|------|------|------|
| 申万一级行业 | `sw_index_first_info()` | 日 | 31 个一级行业估值数据 |
| 申万二级行业 | `sw_index_second_info()` | 日 | 细分行业 |
| 申万三级行业 | `sw_index_third_info()` | 日 | 三级行业（可选） |
| 行业成分股 | `sw_index_cons(symbol)` | 日 | 指定行业的成分股列表 |
| A股实时行情 | `stock_zh_a_spot_em()` | 日 | 全市场、全字段 |
| 个股历史行情 | `stock_zh_a_hist(symbol, period)` | 日 | 用于补充缺失日 |
| 财务摘要 | `stock_financial_abstract_ths(symbol)` | 季 | 同花顺口径 |
| 板块资金流向 | `stock_sector_fund_flow_rank()` | 日 | 行业资金排名 |
| 个股资金流向 | `stock_individual_fund_flow(stock)` | 日 | 个股资金流 |

## 数据写入策略

### 行业数据
- **写入模式**: `UPSERT` (code)
- **全量覆盖**: 每次采集全量写入，覆盖旧数据

### 股票列表
- **写入模式**: `UPSERT` (code)
- **增量更新**: 新上市股票会自动添加，已退市股票保留标记

### 每日行情
- **写入模式**: `UPSERT` (stock_code, trade_date)
- **只写当日**: 每次只写当天数据，历史数据补全通过单独脚本

### 财务数据
- **写入模式**: `UPSERT` (stock_code, report_date, report_type)
- **按季更新**: 财报发布后更新

## GitHub Actions 配置

文件 `.github/workflows/daily_collect.yml`:

```yaml
name: Daily Data Collection

on:
  schedule:
    # 北京时间 15:30 UTC+8 = 07:30 UTC
    - cron: '30 7 * * 1-5'
  workflow_dispatch:
    inputs:
      tasks:
        description: '采集任务 (逗号分隔)'
        required: false
        default: 'industries,stocks,quotes,financials'
      date:
        description: '行情日期 (YYYY-MM-DD)'
        required: false

jobs:
  collect:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: 'pip'
      - run: pip install -r collector/requirements.txt
      - run: |
          python collector/main.py \
            --tasks ${{ github.event.inputs.tasks || 'industries,stocks,quotes,financials' }} \
            ${{ github.event.inputs.date && format('--date {0}', github.event.inputs.date) || '' }}
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
```

### GitHub Secrets 配置

在 GitHub 仓库的 Settings → Secrets and variables → Actions 中添加：

| Name | Value |
|------|-------|
| `SUPABASE_URL` | Supabase Project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service_role key |

## 手动数据补全

如需补全历史数据：

```bash
# 补全某只股票近 1 年行情
python collector/main.py --tasks quotes --date 2025-01-01

# 补全全市场某日行情
python collector/main.py --tasks quotes --date 2025-05-10
```

## 数据新鲜度检查

查询最后采集时间：

```sql
SELECT task_name, status, rows_count, finished_at
FROM collection_log
ORDER BY finished_at DESC
LIMIT 20;
```

正常工作的采集应每天有一条 `success` 记录，包含已入库的行数。
