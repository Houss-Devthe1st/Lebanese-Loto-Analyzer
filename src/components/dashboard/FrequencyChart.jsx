import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { useFrequency } from '../../hooks/useFrequency'
import { useDrawData } from '../../hooks/useDrawData'

const CustomTooltip = ({ active, payload, label, total }) => {
  if (!active || !payload?.length) return null
  const count = payload[0].value
  const pct = total > 0 ? ((count / total) * 100).toFixed(1) : 0
  return (
    <div className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-sm shadow-xl">
      <p className="text-white font-mono font-bold">Number {label}</p>
      <p className="text-slate-300">
        Drawn <span className="text-[#f59e0b] font-bold">{count}</span> times ({pct}%)
      </p>
    </div>
  )
}

export default function FrequencyChart() {
  const { draws } = useDrawData()
  const { frequency, hotNumbers, coldNumbers } = useFrequency(draws)

  const hotSet = new Set(hotNumbers.slice(0, 10).map(h => h.number))
  const coldSet = new Set(coldNumbers.slice(0, 10).map(c => c.number))

  const data = Array.from({ length: 42 }, (_, i) => ({
    number: i + 1,
    count: frequency.get(i + 1) ?? 0,
  }))

  const getColor = (n) => {
    if (hotSet.has(n)) return '#f59e0b'
    if (coldSet.has(n)) return '#14b8a6'
    return '#334155'
  }

  return (
    <div className="rounded-xl bg-[#1e293b] p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-semibold">Number Frequency</h2>
        <div className="flex gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#f59e0b] inline-block" /> Hot (top 10)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#14b8a6] inline-block" /> Cold (bottom 10)
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="number"
            tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono' }}
            interval={5}
          />
          <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
          <Tooltip content={<CustomTooltip total={draws.length} />} />
          <Bar dataKey="count" radius={[3, 3, 0, 0]}>
            {data.map(entry => (
              <Cell key={entry.number} fill={getColor(entry.number)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
