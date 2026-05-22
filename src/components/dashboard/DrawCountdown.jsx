import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

// Draws: Monday (1) and Thursday (4) at 19:30 Beirut time (UTC+3)
const DRAW_DAYS = [1, 4] // JS getDay(): 0=Sun,1=Mon,...,4=Thu
const DRAW_HOUR_BEIRUT = 19
const DRAW_MINUTE_BEIRUT = 30
const BEIRUT_OFFSET_MS = 3 * 60 * 60 * 1000

function getNextDrawTime() {
  const nowUTC = Date.now()
  const nowBeirut = new Date(nowUTC + BEIRUT_OFFSET_MS)

  // Clone to find candidates
  for (let daysAhead = 0; daysAhead <= 7; daysAhead++) {
    const candidate = new Date(nowBeirut)
    candidate.setDate(candidate.getDate() + daysAhead)
    candidate.setHours(DRAW_HOUR_BEIRUT, DRAW_MINUTE_BEIRUT, 0, 0)

    if (DRAW_DAYS.includes(candidate.getDay())) {
      // Convert candidate (Beirut) back to UTC ms
      const candidateUTC = candidate.getTime() - BEIRUT_OFFSET_MS
      if (candidateUTC > nowUTC) {
        return { utcMs: candidateUTC, label: candidate.getDay() === 1 ? 'Monday' : 'Thursday' }
      }
    }
  }
  return null
}

function formatCountdown(ms) {
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  const totalSeconds = Math.floor(ms / 1000)
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}

function Digit({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-mono font-bold text-2xl text-white tabular-nums w-10 text-center">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{label}</span>
    </div>
  )
}

export default function DrawCountdown() {
  const [remaining, setRemaining] = useState(null)
  const [nextDraw, setNextDraw] = useState(null)

  useEffect(() => {
    const update = () => {
      const next = getNextDrawTime()
      setNextDraw(next)
      setRemaining(next ? next.utcMs - Date.now() : null)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  const { days, hours, minutes, seconds } = formatCountdown(remaining ?? 0)
  const isImminent = remaining !== null && remaining < 30 * 60 * 1000 // < 30 min

  return (
    <div className={[
      'rounded-xl p-5 border transition-colors',
      isImminent
        ? 'bg-[#f59e0b]/10 border-[#f59e0b]/40'
        : 'bg-[#1e293b] border-transparent',
    ].join(' ')}>
      <div className="flex items-center gap-2 mb-3">
        <Clock size={14} className={isImminent ? 'text-[#f59e0b]' : 'text-slate-500'} />
        <span className="text-xs text-slate-400 uppercase tracking-wider">Next Draw</span>
        {nextDraw && (
          <span className="text-xs text-slate-500 ml-auto">{nextDraw.label} · 19:30 Beirut</span>
        )}
      </div>

      {remaining !== null ? (
        <div className="flex items-center gap-3">
          <Digit value={days} label="days" />
          <span className="text-slate-600 text-xl font-mono mb-3">:</span>
          <Digit value={hours} label="hrs" />
          <span className="text-slate-600 text-xl font-mono mb-3">:</span>
          <Digit value={minutes} label="min" />
          <span className="text-slate-600 text-xl font-mono mb-3">:</span>
          <Digit value={seconds} label="sec" />
        </div>
      ) : (
        <p className="text-slate-500 text-sm">Calculating…</p>
      )}

      {isImminent && (
        <p className="text-xs text-[#f59e0b] mt-2 animate-pulse">Draw is starting soon</p>
      )}
    </div>
  )
}
