import asyncio
import logging
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from db import get_conn, init_db
from scheduler import start_scheduler, shutdown_scheduler, get_status, _scrape_job

logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    start_scheduler()
    yield
    shutdown_scheduler()


app = FastAPI(title="LLDJ Loto API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4173"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


def row_to_dict(row) -> dict:
    return dict(row)


@app.get("/api/health")
def health():
    with get_conn() as conn:
        count = conn.execute("SELECT COUNT(*) FROM draws").fetchone()[0]
    return {"status": "ok", "draw_count": count}


@app.get("/api/draws")
def get_draws(
    limit: int = Query(500, ge=1, le=2000),
    offset: int = Query(0, ge=0),
    from_date: Optional[str] = Query(None),
    to_date: Optional[str] = Query(None),
):
    conditions = []
    params: list = []

    if from_date:
        conditions.append("draw_date >= ?")
        params.append(from_date)
    if to_date:
        conditions.append("draw_date <= ?")
        params.append(to_date)

    where = ("WHERE " + " AND ".join(conditions)) if conditions else ""

    with get_conn() as conn:
        total = conn.execute(
            f"SELECT COUNT(*) FROM draws {where}", params
        ).fetchone()[0]

        rows = conn.execute(
            f"SELECT * FROM draws {where} ORDER BY draw_date DESC LIMIT ? OFFSET ?",
            [*params, limit, offset],
        ).fetchall()

    return {"total": total, "draws": [row_to_dict(r) for r in rows]}


@app.get("/api/draws/latest")
def get_latest_draw():
    with get_conn() as conn:
        row = conn.execute(
            "SELECT * FROM draws ORDER BY draw_date DESC, draw_number DESC LIMIT 1"
        ).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="No draws in database yet.")
    return row_to_dict(row)


@app.get("/api/scraper/status")
def scraper_status():
    return get_status()


@app.post("/api/scrape")
async def trigger_scrape():
    status = get_status()
    if status["running"]:
        raise HTTPException(status_code=409, detail="Scrape already in progress.")
    await asyncio.to_thread(_scrape_job)
    updated = get_status()
    if updated["last_error"]:
        raise HTTPException(status_code=502, detail=updated["last_error"])
    return {"draws_upserted": updated["last_count"]}
