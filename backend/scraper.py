import re
import time
import logging
import httpx
from bs4 import BeautifulSoup
from datetime import datetime
from db import get_conn

logger = logging.getLogger(__name__)

BASE_URL = "https://www.lebanon-lotto.com/lebanese-loto-results/draw-number/{}.php"
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/125.0.0.0 Safari/537.36"
    )
}

# Matches _04.gif, _30.gif etc. at end of image filename
_NUMBER_RE = re.compile(r'_(\d{1,2})\.gif', re.IGNORECASE)
# Known recent draw to start probing from
_PROBE_START = 2416


def _get(draw_number: int) -> str | None:
    """Fetch one draw page. Returns None on 404, raises on other errors."""
    url = BASE_URL.format(draw_number)
    try:
        resp = httpx.get(url, headers=HEADERS, timeout=15, follow_redirects=True)
    except httpx.RequestError as exc:
        raise RuntimeError(f"Network error fetching draw {draw_number}: {exc}") from exc
    if resp.status_code == 404:
        return None
    resp.raise_for_status()
    return resp.text


def _parse_date(soup: BeautifulSoup) -> str | None:
    text = soup.get_text(" ", strip=True)
    # ISO format: 2026-05-21
    m = re.search(r'\b(\d{4}-\d{2}-\d{2})\b', text)
    if m:
        return m.group(1)
    # Ordinal format: "21st May 2026", "18th May 2026"
    m = re.search(r'(\d{1,2})(?:st|nd|rd|th)\s+(\w+)\s+(\d{4})', text, re.IGNORECASE)
    if m:
        try:
            return datetime.strptime(
                f"{m.group(1)} {m.group(2)} {m.group(3)}", "%d %B %Y"
            ).strftime("%Y-%m-%d")
        except ValueError:
            pass
    return None


def _parse_numbers(soup: BeautifulSoup) -> tuple[list[int], int | None]:
    """
    Returns (sorted_main_6, additional_or_None).
    Lotto balls live in images/lotto_balls* directories.
    Zeed balls live in images/zeed_numbers — excluded.
    """
    imgs = [
        img for img in soup.find_all("img")
        if "lotto_balls" in str(img.get("src", "")).lower()
        and "zeed" not in str(img.get("src", "")).lower()
    ]
    numbers = []
    for img in imgs:
        m = _NUMBER_RE.search(str(img.get("src", "")))
        if m:
            n = int(m.group(1))
            if 1 <= n <= 42:
                numbers.append(n)

    if len(numbers) < 6:
        return [], None

    main = sorted(numbers[:6])
    additional = numbers[6] if len(numbers) >= 7 else None
    return main, additional


def _parse_jackpot(soup: BeautifulSoup) -> int | None:
    """Return jackpot prize in LBP if there was at least one winner, else None."""
    text = soup.get_text(" ", strip=True)
    m = re.search(
        r'jackpot.*?(\d[\d,]+)\s*(?:L\.?L\.?|LBP|Lebanese)',
        text, re.IGNORECASE | re.DOTALL
    )
    if m:
        try:
            amount = int(m.group(1).replace(",", ""))
            if amount > 1_000_000:
                return amount
        except ValueError:
            pass
    return None


def _parse_draw(html: str, draw_number: int) -> dict | None:
    soup = BeautifulSoup(html, "html.parser")

    draw_date = _parse_date(soup)
    if not draw_date:
        logger.warning("Draw %d: could not parse date — skipping", draw_number)
        return None

    main, additional = _parse_numbers(soup)
    if len(main) < 6:
        logger.warning("Draw %d: only %d numbers found — skipping", draw_number, len(main))
        return None

    return {
        "draw_number": draw_number,
        "draw_date":   draw_date,
        "n1": main[0], "n2": main[1], "n3": main[2],
        "n4": main[3], "n5": main[4], "n6": main[5],
        "additional":  additional,
        "jackpot_lbp": _parse_jackpot(soup),
    }


def _upsert(draws: list[dict]) -> None:
    with get_conn() as conn:
        conn.executemany(
            """
            INSERT OR REPLACE INTO draws
                (draw_number, draw_date, n1, n2, n3, n4, n5, n6, additional, jackpot_lbp)
            VALUES
                (:draw_number, :draw_date, :n1, :n2, :n3, :n4, :n5, :n6, :additional, :jackpot_lbp)
            """,
            draws,
        )
        conn.commit()


def _find_latest_draw() -> int:
    """Walk upward from _PROBE_START until we hit a 404."""
    probe = _PROBE_START
    while True:
        html = _get(probe + 1)
        if html is None:
            return probe
        probe += 1


def run_scrape(max_history: int = 500) -> int:
    """
    Fetch draws from lebanon-lotto.com and upsert into DB.

    - Empty DB:        bulk fetch up to max_history draws backwards from latest.
    - DB has data:     fetch new draws forward + backfill backwards if below max_history.
    - Up to date:      no-op, returns 0.
    Returns the number of draws upserted.
    """
    with get_conn() as conn:
        row = conn.execute(
            "SELECT MAX(draw_number), MIN(draw_number), COUNT(*) FROM draws"
        ).fetchone()
        latest_in_db   = row[0]  # None if empty
        earliest_in_db = row[1]
        count_in_db    = row[2]

    latest_on_site = _find_latest_draw()
    logger.info("Latest on site: %d | Latest in DB: %s | Count: %d",
                latest_on_site, latest_in_db, count_in_db)

    to_fetch: list[int] = []

    if count_in_db == 0:
        # First run — fetch backwards from latest up to max_history draws
        to_fetch = list(range(latest_on_site, max(0, latest_on_site - max_history), -1))
    else:
        # Forward: any draws newer than what we have
        if latest_on_site > latest_in_db:
            to_fetch += list(range(latest_on_site, latest_in_db, -1))

        # Backward: fill history if we're still under the cap
        if count_in_db < max_history:
            need = max_history - count_in_db
            backfill_start = earliest_in_db - 1
            to_fetch += list(range(backfill_start, max(0, backfill_start - need), -1))

    if not to_fetch:
        logger.info("DB already up to date.")
        return 0

    draws = []
    for draw_num in to_fetch:
        html = _get(draw_num)
        if html is None:
            logger.debug("Draw %d returned 404 — skipping", draw_num)
            continue
        draw = _parse_draw(html, draw_num)
        if draw:
            draws.append(draw)
            logger.info("  ✓ Draw %d  %s", draw_num, draw["draw_date"])
        time.sleep(0.3)  # polite rate limiting

    if draws:
        _upsert(draws)

    logger.info("Scraped and upserted %d draw(s).", len(draws))
    return len(draws)


if __name__ == "__main__":
    import logging as _log
    _log.basicConfig(level=logging.INFO)
    count = run_scrape()
    print(f"Done — {count} draw(s) upserted.")
