"""Data collection main entry point"""

import argparse
import sys
from datetime import datetime, timezone

from supabase_client import supabase


def log_task(task_name: str, status: str, rows_count: int = 0, error_msg: str = ""):
    """记录采集日志到 collection_log 表"""
    now = datetime.now(timezone.utc).isoformat()
    supabase.table("collection_log").insert({
        "task_name": task_name,
        "status": status,
        "rows_count": rows_count,
        "error_msg": error_msg,
        "started_at": now,
        "finished_at": now,
    }).execute()


def main():
    parser = argparse.ArgumentParser(description="Stock data collector")
    parser.add_argument(
        "--tasks",
        default="industries,stocks,quotes",
        help="Comma-separated tasks: industries, stocks, quotes (default: all)",
    )
    parser.add_argument(
        "--date",
        default=None,
        help="Trade date for quotes (YYYY-MM-DD, default: today)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Dry run - print what would be done without writing to DB",
    )
    args = parser.parse_args()

    tasks = [t.strip() for t in args.tasks.split(",")]
    total_rows = 0

    if args.dry_run:
        print("DRY RUN MODE - no data will be written to database")
        print(f"Tasks: {tasks}")
        if args.date:
            print(f"Date: {args.date}")
        return

    for task_name in tasks:
        try:
            print(f"\n{'='*50}")
            print(f"Starting task: {task_name}")
            print(f"{'='*50}")

            if task_name == "industries":
                from industries import run as run_industries
                rows = run_industries()
            elif task_name == "stocks":
                from stocks import run as run_stocks
                rows = run_stocks(args.date)
            elif task_name == "quotes":
                from stocks import collect_daily_quotes
                rows = collect_daily_quotes(args.date)
            else:
                print(f"Unknown task: {task_name}")
                continue

            log_task(task_name, "success", rows)
            total_rows += rows
            print(f"Task '{task_name}' completed: {rows} rows")

        except Exception as e:
            error_msg = str(e)[:500]
            log_task(task_name, "failed", error_msg=error_msg)
            print(f"Task '{task_name}' failed: {error_msg}", file=sys.stderr)

    print(f"\nAll done. Total rows affected: {total_rows}")


if __name__ == "__main__":
    main()
