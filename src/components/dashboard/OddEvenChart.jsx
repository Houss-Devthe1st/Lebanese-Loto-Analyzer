import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { useFrequency } from '../../hooks/useFrequency'
import { useDrawData } from '../../hooks/useDrawData'

function SmallBar({ data, title, color }) {
  return (
    <div>
      <p className="text-xs text-slate-400 mb-2 text-center">{title}</p>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 9 }} />
          <YAxis tick={{ fill: '#64748b', fontSize: 9 }} />
          <Tooltip
            contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
            itemStyle={{ color: '#f1f5f9' }}
          />
          <Bar dataKey="count" radius={[3, 3, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={color} opacity={0.4 + 0.6 * (entry.count / Math.max(...data.map(d => d.count), 1))} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function OddEvenChart() {
  const { draws } = useDrawData()
  const { oddEvenRatio, lowHighRatio } = useFrequency(draws)

  const oddEvenData = oddEvenRatio.labels.map((label, i) => ({
    label,
    count: oddEvenRatio.counts[i] ?? 0,
  }))

  const lowHighData = lowHighRatio.labels.map((label, i) => ({
    label,
    count: lowHighRatio.counts[i] ?? 0,
  }))

  const mostCommonOE = oddEvenData.reduce((a, b) => (a.count > b.count ? a : b), { label: '-', count: 0 })
  const mostCommonLH = lowHighData.reduce((a, b) => (a.count > b.count ? a : b), { label: '-', count: 0 })

  return (
    <div className="rounded-xl bg-[#1e293b] p-5">
      <h2 className="text-white font-semibold mb-4">Odd / Even & Low / High Split</h2>

      <div className="grid grid-cols-2 gap-4 mb-3">
        <SmallBar data={oddEvenData} title="Odd vs Even" color="#f59e0b" />
        <SmallBar data={lowHighData} title="Low (1-21) vs High (22-42)" color="#14b8a6" />
      </div>

      <div className="flex gap-4 text-xs text-slate-400">
        <span>Most common odd/even: <span className="text-[#f59e0b] font-mono">{mostCommonOE.label}</span></span>
        <span>Most common low/high: <span className="text-[#14b8a6] font-mono">{mostCommonLH.label}</span></span>
      </div>
    </div>
  )
}
