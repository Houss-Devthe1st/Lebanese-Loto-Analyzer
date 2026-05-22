import sqlite3
from pathlib import Path
from contextlib import contextmanager

DB_PATH = Path(__file__).parent / "loto.db"


def init_db():
    with get_conn() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS draws (
                draw_number  INTEGER PRIMARY KEY,
                draw_date    TEXT NOT NULL,
                n1 INTEGER, n2 INTEGER, n3 INTEGER,
                n4 INTEGER, n5 INTEGER, n6 INTEGER,
                additional   INTEGER,
                jackpot_lbp  INTEGER
            )
        """)
        # Add column if upgrading from an older schema that didn't have it
        try:
            conn.execute("ALTER TABLE draws ADD COLUMN jackpot_lbp INTEGER")
        except Exception:
            pass  # column already exists
        conn.commit()


@contextmanager
def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


init_db()
