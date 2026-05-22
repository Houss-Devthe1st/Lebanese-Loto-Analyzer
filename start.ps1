# start.ps1 — first-run setup + launch, all in one command
# Usage: .\start.ps1

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
$backend = Join-Path $root "backend"
$venvPy  = Join-Path $backend ".venv\Scripts\python.exe"
$venvPip = Join-Path $backend ".venv\Scripts\pip.exe"

# ── 1. Python venv ────────────────────────────────────────────────────────────
if (-not (Test-Path $venvPy)) {
    Write-Host "[Setup] Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv "$backend\.venv"
    if (-not $?) { Write-Host "ERROR: 'python' not found. Install Python 3.11+ and add it to PATH." -ForegroundColor Red; exit 1 }
}

# ── 2. pip install (fast no-op if already up to date) ────────────────────────
Write-Host "[Setup] Checking Python dependencies..." -ForegroundColor Yellow
& $venvPip install -q -r "$backend\requirements.txt"

# ── 3. npm install (fast no-op if node_modules exists) ───────────────────────
if (-not (Test-Path (Join-Path $root "node_modules"))) {
    Write-Host "[Setup] Installing npm packages..." -ForegroundColor Yellow
    npm install --prefix $root
}

Write-Host ""
Write-Host "Starting LLDJ Loto Analyzer..." -ForegroundColor Cyan
Write-Host ""

# ── 4. Backend in a new window ───────────────────────────────────────────────
Start-Process powershell -ArgumentList @(
    "-NoExit", "-Command",
    "cd '$backend'; .venv\Scripts\Activate.ps1; uvicorn main:app --reload"
)
Write-Host "[Backend]  http://localhost:8000  (auto-scrapes if DB is empty)" -ForegroundColor Green

Start-Sleep -Seconds 2

# ── 5. Frontend in this window ───────────────────────────────────────────────
Write-Host "[Frontend] http://localhost:5173" -ForegroundColor Green
Write-Host ""
Set-Location $root
npm run dev
