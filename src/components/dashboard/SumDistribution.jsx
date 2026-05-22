import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { useFrequency } from '../../hooks/useFrequency'
import { useDrawData } from '../../hooks/useDrawData'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-sm shadow-xl">
      <p className="text-white font-mono">Sum {label}</p>
      <p className="text-slate-300">
        <span className="text-[#f59e0b] font-bold">{payload[0].value}</span> draws
      </p>
    </div>
  )
}

export default function SumDistribution() {
  const { draws } = useDrawData()
  const { sumDistribution } = useFrequency(draws)

  const data = sumDistribution.labels.map((label, i) => ({
    label,
    count: sumDistribution.counts[i] ?? 0,
  }))

  return (
    <div className="rounded-xl bg-[#1e293b] p-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-white font-semibold">Sum Distribution</h2>
        {sumDistribution.avgSum > 0 && (
          <span className="text-xs text-slate-400">
            Avg sum: <span className="text-[#f59e0b] font-mono">{sumDistribution.avgSum}</span>
          </span>
        )}
      </div>
      <p className="text-xs text-slate-500 mb-4">Distribution of the sum of 6 main numbers per draw</p>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="sumGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 9 }} interval={1} />
          <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#f59e0b"
            fill="url(#sumGrad)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
