import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { useFrequency } from '../../hooks/useFrequency'
import { useDrawData } from '../../hooks/useDrawData'

export default function AdditionalFrequency() {
  const { draws } = useDrawData()
  const { additionalFrequency } = useFrequency(draws)

  const maxCount = Math.max(...additionalFrequency.map(d => d.count), 1)
  const top5 = new Set(
    [...additionalFrequency].sort((a, b) => b.count - a.count).slice(0, 5).map(d => d.number)
  )

  return (
    <div className="rounded-xl bg-[#1e293b] p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-semibold">Bonus Number Frequency</h2>
        <span className="text-xs text-slate-400">Top 5 highlighted in teal</span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={additionalFrequency} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="number"
            tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            interval={4}
          />
          <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
            formatter={(v, _, props) => [`${v} draws`, `Number ${props.payload.number}`]}
            labelFormatter={() => ''}
          />
          <Bar dataKey="count" radius={[3, 3, 0, 0]}>
            {additionalFrequency.map(entry => (
              <Cell
                key={entry.number}
                fill={top5.has(entry.number) ? '#14b8a6' : '#334155'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
