import { useState } from 'react'
import NumberBall from '../shared/NumberBall'
import { useFrequency } from '../../hooks/useFrequency'
import { useDrawData } from '../../hooks/useDrawData'

export default function PairFrequency() {
  const { draws } = useDrawData()
  const { pairFrequency } = useFrequency(draws)
  const [showAll, setShowAll] = useState(false)

  const pairs = [...pairFrequency.entries()].map(([key, count]) => {
    const [a, b] = key.split('-').map(Number)
    return { a, b, count, key }
  })

  const displayed = showAll ? pairs : pairs.slice(0, 10)
  const maxCount = pairs[0]?.count ?? 1

  return (
    <div className="rounded-xl bg-[#1e293b] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-white font-semibold">Most Common Pairs</h2>
          <p className="text-xs text-slate-500 mt-0.5">Number pairs that appear together most often</p>
        </div>
        <span className="text-xs text-slate-500 font-mono">{pairs.length} unique pairs</span>
      </div>

      <div className="space-y-2">
        {displayed.map(({ a, b, count, key }, idx) => (
          <div key={key} className="flex items-center gap-3">
            <span className="text-xs text-slate-600 font-mono w-5 text-right">{idx + 1}</span>
            <div className="flex items-center gap-1.5">
              <NumberBall number={a} size="sm" variant="hot" />
              <NumberBall number={b} size="sm" variant="hot" />
            </div>
            <div className="flex-1 h-2 bg-[#0f172a] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#f59e0b] rounded-full transition-all"
                style={{ width: `${(count / maxCount) * 100}%` }}
              />
            </div>
            <span className="text-xs font-mono text-slate-300 w-8 text-right">{count}x</span>
          </div>
        ))}
      </div>

      {pairs.length > 10 && (
        <button
          onClick={() => setShowAll(v => !v)}
          className="mt-4 text-xs text-[#f59e0b] hover:text-[#fbbf24] transition-colors"
        >
          {showAll ? 'Show less' : `Show all ${pairs.length} pairs`}
        </button>
      )}
    </div>
  )
}
