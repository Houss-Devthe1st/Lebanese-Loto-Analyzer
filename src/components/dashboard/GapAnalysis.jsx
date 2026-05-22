import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { useFrequency } from '../../hooks/useFrequency'
import { useDrawData } from '../../hooks/useDrawData'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-sm shadow-xl">
      <p className="text-white font-mono font-bold">Number {label}</p>
      <p className="text-slate-300">
        Last seen <span className="text-[#f59e0b] font-bold">{payload[0].value}</span> draws ago
      </p>
    </div>
  )
}

export default function GapAnalysis() {
  const { draws } = useDrawData()
  const { gaps } = useFrequency(draws)

  const data = Array.from({ length: 42 }, (_, i) => ({
    number: i + 1,
    gap: gaps.get(i + 1) ?? 0,
  })).sort((a, b) => b.gap - a.gap).slice(0, 20)

  const maxGap = Math.max(...data.map(d => d.gap), 1)

  return (
    <div className="rounded-xl bg-[#1e293b] p-5">
      <h2 className="text-white font-semibold mb-1">Gap Analysis</h2>
      <p className="text-xs text-slate-500 mb-4">Draws since each number last appeared (top 20)</p>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
          <XAxis
            dataKey="number"
            tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono' }}
          />
          <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="gap" radius={[3, 3, 0, 0]}>
            {data.map(entry => (
              <Cell
                key={entry.number}
                fill={entry.gap / maxGap > 0.7 ? '#f59e0b' : entry.gap / maxGap > 0.4 ? '#d97706' : '#334155'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
