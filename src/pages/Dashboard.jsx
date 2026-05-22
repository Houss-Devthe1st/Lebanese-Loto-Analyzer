import FrequencyChart from '../components/dashboard/FrequencyChart'
import HeatmapGrid from '../components/dashboard/HeatmapGrid'
import GapAnalysis from '../components/dashboard/GapAnalysis'
import OddEvenChart from '../components/dashboard/OddEvenChart'
import SumDistribution from '../components/dashboard/SumDistribution'
import AdditionalFrequency from '../components/dashboard/AdditionalFrequency'
import PairFrequency from '../components/dashboard/PairFrequency'
import DrawCountdown from '../components/dashboard/DrawCountdown'
import NumberBall from '../components/shared/NumberBall'
import AdditionalBall from '../components/shared/AdditionalBall'
import { useDrawData } from '../hooks/useDrawData'

const LBP_PER_USD = 89_500

function formatLBP(amount) {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(2)}B`
  if (amount >= 1_000_000)     return `${(amount / 1_000_000).toFixed(1)}M`
  return amount.toLocaleString()
}

function formatUSD(lbp) {
  const usd = lbp / LBP_PER_USD
  if (usd >= 1_000_000) return `${(usd / 1_000_000).toFixed(2)}M`
  return usd.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

export default function Dashboard() {
  const { draws, isLoading, dataSource } = useDrawData()

  if (isLoading && draws.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#f59e0b] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p>Loading draw data…</p>
        </div>
      </div>
    )
  }

  if (draws.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <p>No draw data available. Upload a CSV or check the backend connection.</p>
      </div>
    )
  }

  const sorted = [...draws].sort((a, b) => new Date(b.drawDate) - new Date(a.drawDate))
  const latest = sorted[0]
  const dateRange = `${sorted[sorted.length - 1].drawDate} → ${sorted[0].drawDate}`

  return (
    <div className="space-y-5 pb-16">
      {/* Latest draw winner card */}
      {latest && (
        <div className="rounded-xl bg-[#1e293b] border border-[#f59e0b]/20 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest">Latest Draw</p>
              <p className="text-white font-semibold text-lg mt-0.5">
                Draw <span className="text-[#f59e0b] font-mono">#{latest.drawNumber}</span>
              </p>
            </div>
            <p className="text-sm text-slate-400 font-mono">{latest.drawDate}</p>
          </div>

          <div className="flex flex-wrap items-end gap-3 mb-4">
            {latest.numbers.map(n => (
              <NumberBall key={n} number={n} variant="hot" size="lg" />
            ))}
            <span className="text-slate-600 text-2xl self-center pb-4">+</span>
            <AdditionalBall number={latest.additional} size="lg" />
          </div>

          {/* Prize section */}
          <div className="border-t border-[#0f172a] pt-4 mt-2">
            {latest.jackpotLbp != null ? (
              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Jackpot Prize</p>
                  <p className="text-2xl font-mono font-bold text-[#f59e0b]">
                    {formatLBP(latest.jackpotLbp)}
                    <span className="text-sm font-normal text-slate-400 ml-1">LBP</span>
                  </p>
                  <p className="text-sm text-slate-400 font-mono mt-0.5">
                    ≈ <span className="text-[#14b8a6]">${formatUSD(latest.jackpotLbp)}</span>
                    <span className="text-slate-600 text-xs ml-1">USD</span>
                    <span className="text-slate-600 text-xs ml-2">@ 89,500 LBP/USD</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <p className="text-xs text-slate-500">
                  Prize data not available in {dataSource === 'api' ? 'scraped data yet' : 'sample data'}.
                </p>
                <a
                  href="https://www.lldj.com/en/LatestResults/Loto"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#14b8a6] underline hover:text-[#2dd4bf] transition-colors"
                >
                  View prizes on lldj.com →
                </a>
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-3 text-xs text-slate-500">
            <span>Sum: <span className="font-mono text-slate-300">{latest.numbers.reduce((a, b) => a + b, 0)}</span></span>
            <span>Odd: <span className="font-mono text-slate-300">{latest.numbers.filter(n => n % 2 !== 0).length}</span></span>
            <span>Low (1–21): <span className="font-mono text-slate-300">{latest.numbers.filter(n => n <= 21).length}</span></span>
          </div>
        </div>
      )}

      {/* Summary bar + countdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <div className="flex gap-4">
          <div className="rounded-lg bg-[#1e293b] px-4 py-3 flex-1">
            <p className="text-xs text-slate-500">Total Draws</p>
            <p className="text-xl font-mono font-bold text-white">{draws.length}</p>
          </div>
          <div className="rounded-lg bg-[#1e293b] px-4 py-3 flex-1">
            <p className="text-xs text-slate-500">Date Range</p>
            <p className="text-xs font-mono text-slate-300 mt-1">{dateRange}</p>
          </div>
        </div>
        <div className="sm:col-span-1 xl:col-span-2">
          <DrawCountdown />
        </div>
      </div>

      {/* Row 1: full-width frequency */}
      <FrequencyChart />

      {/* Row 2: heatmap + odd/even */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <HeatmapGrid />
        </div>
        <OddEvenChart />
      </div>

      {/* Row 3: gap + sum */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <GapAnalysis />
        <SumDistribution />
      </div>

      {/* Row 4: bonus frequency + pairs */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <AdditionalFrequency />
        <PairFrequency />
      </div>
    </div>
  )
}
