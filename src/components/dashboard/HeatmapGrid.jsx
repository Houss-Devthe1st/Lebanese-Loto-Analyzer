import { useState } from 'react'
import { useFrequency } from '../../hooks/useFrequency'
import { useDrawData } from '../../hooks/useDrawData'

function getColor(count, min, max) {
  if (max === min) return '#334155'
  const t = (count - min) / (max - min)
  if (t < 0.33) return '#1e40af'
  if (t < 0.66) return '#334155'
  if (t < 0.85) return '#d97706'
  return '#f59e0b'
}

export default function HeatmapGrid() {
  const { draws } = useDrawData()
  const { frequency, gaps } = useFrequency(draws)
  const [hovered, setHovered] = useState(null)

  const counts = Array.from({ length: 42 }, (_, i) => frequency.get(i + 1) ?? 0)
  const min = Math.min(...counts)
  const max = Math.max(...counts)

  const total = draws.length

  return (
    <div className="rounded-xl bg-[#1e293b] p-5">
      <h2 className="text-white font-semibold mb-4">Frequency Heatmap</h2>
      <div className="grid grid-cols-7 gap-1.5 mb-3">
        {Array.from({ length: 42 }, (_, i) => {
          const n = i + 1
          const count = frequency.get(n) ?? 0
          const gap = gaps.get(n) ?? 0
          const color = getColor(count, min, max)
          return (
            <div
              key={n}
              className="flex flex-col items-center gap-0.5 cursor-default"
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(null)}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-transform hover:scale-110"
                style={{ backgroundColor: color, color: '#0f172a' }}
              >
                {n}
              </div>
              <span className="text-[9px] text-slate-500 font-mono">{count}</span>
            </div>
          )
        })}
      </div>

      {hovered && (
        <div className="mt-3 rounded-lg border border-[#334155] bg-[#0f172a] px-4 py-3 text-sm">
          <span className="text-[#f59e0b] font-mono font-bold text-base">#{hovered}</span>
          <span className="text-slate-400 ml-3">
            Drawn <span className="text-white">{frequency.get(hovered) ?? 0}</span> times
            {total > 0 && (
              <span className="ml-1">
                ({(((frequency.get(hovered) ?? 0) / total) * 100).toFixed(1)}%)
              </span>
            )}
          </span>
          <span className="text-slate-400 ml-4">
            Last seen <span className="text-white">{gaps.get(hovered) ?? 0}</span> draws ago
          </span>
        </div>
      )}

      <div className="flex items-center gap-2 mt-3 text-[10px] text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-[#1e40af] inline-block" /> Low freq
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-[#334155] inline-block" /> Mid freq
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-[#f59e0b] inline-block" /> High freq
        </span>
      </div>
    </div>
  )
}
