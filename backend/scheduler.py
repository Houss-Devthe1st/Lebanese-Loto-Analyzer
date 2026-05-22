import logging
from datetime import datetime, timezone
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

logger = logging.getLogger(__name__)
_scheduler = BackgroundScheduler(timezone="Asia/Beirut")

_status = {
    "last_run": None,       # ISO string UTC
    "last_count": None,     # draws upserted
    "last_error": None,     # error message or None
    "running": False,
}


def get_status() -> dict:
    job = _scheduler.get_job("lldj_scrape")
    next_run = None
    if job and job.next_run_time:
        next_run = job.next_run_time.isoformat()
    return {**_status, "next_run": next_run}


def _scrape_job():
    _status["running"] = True
    _status["last_error"] = None
    try:
        from scraper import run_scrape
        count = run_scrape()
        _status["last_count"] = count
        _status["last_run"] = datetime.now(timezone.utc).isoformat()
        logger.info("Scheduled scrape completed: %d draws upserted.", count)
    except Exception as exc:
        _status["last_error"] = str(exc)
        _status["last_run"] = datetime.now(timezone.utc).isoformat()
        logger.error("Scheduled scrape failed: %s", exc)
    finally:
        _status["running"] = False


def start_scheduler():
    _scheduler.add_job(
        _scrape_job,
        CronTrigger(day_of_week="mon,thu", hour=20, minute=0, timezone="Asia/Beirut"),
        id="lldj_scrape",
        replace_existing=True,
    )
    _scheduler.start()
    logger.info("Scheduler started.")


def shutdown_scheduler():
    if _scheduler.running:
        _scheduler.shutdown(wait=False)
        logger.info("Scheduler stopped.")


if __name__ == "__main__":
    import time
    logging.basicConfig(level=logging.INFO)
    start_scheduler()
    print("Scheduler running. Press Ctrl+C to stop.")
    try:
        while True:
            time.sleep(60)
    except KeyboardInterrupt:
        shutdown_scheduler()
