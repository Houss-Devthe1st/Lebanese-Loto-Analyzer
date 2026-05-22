# LLDJ Loto Analyzer

A statistical analysis web app for the Lebanese Loto. Browse historical draw results, visualize number frequency, and generate statistically-sampled combinations.

**The app works without a backend** — sample data loads automatically on first launch.

---

## Quick Start

```powershell
npm install
npm run dev
```

Open **http://localhost:5173**. That's it.

---

## Enabling Live Data

The backend scrapes draw results from [lldj.com](https://www.lldj.com) and serves them over a local API. You need two terminals running at the same time.

**Terminal 1 — start the API**

```powershell
cd backend
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload
```

**Terminal 2 — start the frontend**

```powershell
npm run dev
```

The app detects the backend automatically and switches to live data. If it can't connect, it shows an amber warning banner and falls back to sample data.

### Populate the database

The database starts empty. Run the scraper once to pull in the latest draws:

```powershell
cd backend
.venv\Scripts\Activate.ps1
python scraper.py
```

After that, the scheduler keeps it up to date automatically — it runs every **Monday and Thursday at 20:00 Beirut time**, 30 minutes after each draw is broadcast.

You can also trigger a sync at any time using the **Sync Now** button in the app header.

### Check the API is running

```powershell
curl http://localhost:8000/api/health
# → {"status":"ok","draw_count":116}
```

---

## How Data Gets In

The app tries three sources in order:

| Priority | Source | Condition |
|:---:|---|---|
| 1 | **Live API** — `localhost:8000` | Backend is running and the database has draws |
| 2 | **Sample data** — `public/sample-data.csv` | Backend is unreachable (warning shown) |
| 3 | **Your CSV** | Uploaded manually via the header button or History page |

---

## Uploading Your Own Data

Go to the **History** page and upload a CSV with this exact format:

```csv
draw_number,draw_date,n1,n2,n3,n4,n5,n6,additional
2416,2026-05-21,11,16,19,26,30,41,37
2415,2026-05-19,3,8,14,22,35,40,12
```

| Column | Description |
|---|---|
| `draw_number` | Sequential draw ID |
| `draw_date` | Date in `YYYY-MM-DD` format |
| `n1`–`n6` | The 6 main numbers, ascending, each between 1–42 |
| `additional` | The bonus number (1–42, must differ from the 6 main numbers) |

---

## Features

| Page | What it does |
|---|---|
| **Dashboard** | Frequency heatmap, hot/cold numbers, gap analysis, pair frequency, draw countdown, latest draw result with jackpot prize |
| **Generator** | Generate 6 numbers using 5 modes: Random, Frequency Weighted, Gap Weighted, Balanced, or Pin Numbers |
| **History** | Sortable and filterable table of all draws, with CSV export |
| **Tracker** | Save number combinations, check them against historical draws, and calculate prize rank |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, Recharts, Zustand |
| Backend | Python, FastAPI, SQLite |
| Scraper | httpx, BeautifulSoup4, APScheduler |

---

## Responsible Gaming

Lottery draws are random. This tool is for statistical exploration only. You must be 18+ to participate. [Play Responsibly →](https://www.lldj.com/en/responsible-gaming)