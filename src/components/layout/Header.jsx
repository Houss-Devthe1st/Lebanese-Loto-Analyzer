import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { RefreshCw, AlertTriangle, X, Download, Menu } from 'lucide-react'
import FileUploader from '../shared/FileUploader'
import { useDrawData } from '../../hooks/useDrawData'

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/generator': 'Number Generator',
  '/history': 'Draw History',
  '/tracker': 'Ticket Tracker',
}

const SOURCE_BADGE = {
  api:    { label: 'Live API',     cls: 'bg-[#14b8a6]/10 text-[#14b8a6] border-[#14b8a6]/30' },
  sample: { label: 'Sample Data', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  csv:    { label: 'Your CSV',    cls: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

function useScraperStatus(enabled) {
  const [status, setStatus] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState(null)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    const poll = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/scraper/status`)
        if (!cancelled && res.ok) setStatus(await res.json())
      } catch { /* backend offline — silent */ }
    }
    poll()
    const id = setInterval(poll, 30_000)
    return () => { cancelled = true; clearInterval(id) }
  }, [enabled])

  const triggerScrape = async () => {
    setSyncing(true)
    setSyncMsg(null)
    try {
      const res = await fetch(`${API_BASE}/api/scrape`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Scrape failed')
      setSyncMsg({ ok: true, text: `Synced — ${data.draws_upserted} draw(s) upserted` })
      // refresh status
      const s = await fetch(`${API_BASE}/api/scraper/status`)
      if (s.ok) setStatus(await s.json())
    } catch (err) {
      setSyncMsg({ ok: false, text: err.message })
    } finally {
      setSyncing(false)
      setTimeout(() => setSyncMsg(null), 5000)
    }
  }

  return { status, syncing, syncMsg, triggerScrape }
}

function fmtRelative(isoStr) {
  if (!isoStr) return null
  const diff = Date.now() - new Date(isoStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function Header({ onMenuClick }) {
  const { pathname } = useLocation()
  const { draws, isLoading, dataSource, apiError, loadFromApi, dismissApiError } = useDrawData()
  const title = PAGE_TITLES[pathname] ?? 'LLDJ Loto Analyzer'
  const badge = SOURCE_BADGE[dataSource]
  const isLiveApi = dataSource === 'api'

  const { status, syncing, syncMsg, triggerScrape } = useScraperStatus(isLiveApi)

  return (
    <div className="shrink-0">
      <header className="flex items-center gap-3 px-4 md:px-6 py-3 bg-[#1e293b] border-b border-[#0f172a]">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-[#0f172a] transition-colors"
        >
          <Menu size={18} />
        </button>

        <h1 className="text-base md:text-lg font-semibold text-white truncate flex-1">{title}</h1>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Data source badge */}
          {badge && (
            <span className={['hidden sm:inline text-xs px-2.5 py-1 rounded-full border font-mono', badge.cls].join(' ')}>
              {badge.label} · {draws.length}
            </span>
          )}

          {/* Scraper status (live API only) */}
          {isLiveApi && status && (
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500">
              {status.last_error ? (
                <span className="text-amber-400" title={status.last_error}>⚠ Scrape error</span>
              ) : status.last_run ? (
                <span title={new Date(status.last_run).toLocaleString()}>
                  Synced {fmtRelative(status.last_run)}
                </span>
              ) : (
                <span>Never synced</span>
              )}
              {status.next_run && (
                <span className="text-slate-600">· next {fmtRelative(status.next_run)}</span>
              )}
            </div>
          )}

          {/* Sync feedback */}
          {syncMsg && (
            <span className={['text-xs font-mono', syncMsg.ok ? 'text-[#14b8a6]' : 'text-red-400'].join(' ')}>
              {syncMsg.text}
            </span>
          )}

          {/* Sync Now button (live API only) */}
          {isLiveApi && (
            <button
              onClick={triggerScrape}
              disabled={syncing || status?.running}
              title="Sync latest draw data from LLDJ"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs border border-[#334155] text-slate-400 hover:border-[#14b8a6] hover:text-[#14b8a6] disabled:opacity-40 transition-colors"
            >
              <Download size={13} className={syncing ? 'animate-bounce' : ''} />
              {syncing ? 'Syncing…' : 'Sync Now'}
            </button>
          )}

          {/* Retry / refresh */}
          <button
            onClick={loadFromApi}
            disabled={isLoading}
            title="Retry live data fetch"
            className="p-1.5 rounded-md text-slate-500 hover:text-[#f59e0b] hover:bg-[#f59e0b]/10 transition-colors disabled:opacity-40"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
          </button>

          <FileUploader compact />
        </div>
      </header>

      {/* API error banner */}
      {apiError && (() => {
        const isEmptyDb = apiError.includes('no draws yet')
        return (
          <div className="flex items-start gap-3 px-4 md:px-6 py-2.5 bg-amber-950/60 border-b border-amber-800/40 text-amber-300 text-xs">
            <AlertTriangle size={14} className="shrink-0 mt-0.5 text-amber-400" />
            <div className="flex-1 min-w-0">
              {isEmptyDb ? (
                <>
                  <span className="font-semibold text-amber-400">Database is empty — showing sample data. </span>
                  <span className="text-amber-300/80">Run </span>
                  <code className="font-mono bg-amber-900/40 px-1 rounded">python scraper.py</code>
                  <span className="text-amber-300/80"> inside the </span>
                  <code className="font-mono bg-amber-900/40 px-1 rounded">backend/</code>
                  <span className="text-amber-300/80"> folder to populate it, then </span>
                  <button onClick={loadFromApi} className="underline hover:text-amber-200 transition-colors">
                    retry
                  </button>.
                </>
              ) : (
                <>
                  <span className="font-semibold text-amber-400">Backend unavailable — showing sample data. </span>
                  <span className="text-amber-300/80">{apiError} </span>
                  <span className="text-amber-500">
                    Start it with{' '}
                    <code className="font-mono bg-amber-900/40 px-1 rounded">uvicorn main:app --reload</code>
                    {' '}then{' '}
                    <button onClick={loadFromApi} className="underline hover:text-amber-200 transition-colors">
                      retry
                    </button>.
                  </span>
                </>
              )}
            </div>
            <button onClick={dismissApiError} className="shrink-0 text-amber-500 hover:text-amber-300 transition-colors">
              <X size={13} />
            </button>
          </div>
        )
      })()}
    </div>
  )
}
