import re
import httpx
from bs4 import BeautifulSoup
from datetime import datetime
from db import get_conn

LLDJ_URL = "https://www.lldj.com/en/LatestResults/Loto"
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/125.0.0.0 Safari/537.36"
    )
}


def fetch_html() -> str:
    try:
        resp = httpx.get(LLDJ_URL, headers=HEADERS, timeout=15, follow_redirects=True)
    except httpx.ConnectError:
        # Retry once with SSL verification disabled (handles corporate proxy / cert issues)
        resp = httpx.get(LLDJ_URL, headers=HEADERS, timeout=15, follow_redirects=True, verify=False)
    if resp.status_code == 403:
        raise RuntimeError(
            "LLDJ returned 403 Forbidden — the site may be blocking automated requests. "
            "Try again later or upload draw data manually as CSV."
        )
    resp.raise_for_status()
    return resp.text


def _to_iso(date_str: str) -> str:
    for fmt in ("%d/%m/%Y", "%Y-%m-%d"):
        try:
            return datetime.strptime(date_str.strip(), fmt).strftime("%Y-%m-%d")
        except ValueError:
            pass
    return date_str.strip()


def _parse_lbp_amount(text: str) -> int | None:
    """Extract a numeric LBP amount from text like '1,250,000,000 L.L.' or '1.25 Billion'."""
    cleaned = text.replace(",", "").replace(".", "").replace("\xa0", "").strip()
    # Match a plain integer (possibly with whitespace/currency suffix)
    m = re.search(r"(\d{6,})", cleaned)
    if m:
        return int(m.group(1))
    # Handle 'X.XX Billion' / 'X.XX Million' style
    m = re.search(r"([\d.]+)\s*[Bb]illion", text)
    if m:
        return int(float(m.group(1)) * 1_000_000_000)
    m = re.search(r"([\d.]+)\s*[Mm]illion", text)
    if m:
        return int(float(m.group(1)) * 1_000_000)
    return None


def parse_draws(html: str) -> list[dict]:
    soup = BeautifulSoup(html, "html.parser")
    results = []

    for row in soup.find_all("tr"):
        cells = row.find_all("td")
        if len(cells) < 8:
            continue
        texts = [c.get_text(strip=True) for c in cells]
        try:
            draw_number = int(texts[0])
            draw_date = _to_iso(texts[1])
            numbers = [int(texts[i]) for i in range(2, 8)]
            additional = int(texts[8]) if len(texts) > 8 else int(texts[7])
            numbers_sorted = sorted(numbers[:6])

            # Jackpot amount is typically in the cell after the additional number
            jackpot_lbp = None
            for cell_text in texts[8:]:
                amount = _parse_lbp_amount(cell_text)
                if amount and amount > 1_000_000:   # sanity: at least 1M LBP
                    jackpot_lbp = amount
                    break

            results.append({
                "draw_number": draw_number,
                "draw_date": draw_date,
                "n1": numbers_sorted[0],
                "n2": numbers_sorted[1],
                "n3": numbers_sorted[2],
                "n4": numbers_sorted[3],
                "n5": numbers_sorted[4],
                "n6": numbers_sorted[5],
                "additional": additional,
                "jackpot_lbp": jackpot_lbp,
            })
        except (ValueError, IndexError):
            continue

    return results


def upsert_draws(draws: list[dict]):
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


def run_scrape() -> int:
    html = fetch_html()
    draws = parse_draws(html)
    if draws:
        upsert_draws(draws)
    return len(draws)


if __name__ == "__main__":
    count = run_scrape()
    print(f"Scraped and upserted {count} draws.")
