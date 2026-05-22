import { useState } from 'react'
import { Trophy } from 'lucide-react'
import NumberBall from './NumberBall'
import AdditionalBall from './AdditionalBall'
import { useDrawData } from '../../hooks/useDrawData'

const PRIZE_RANKS = [
  { rank: 1, label: 'Jackpot',  desc: '6 main numbers',          main: 6, bonus: false },
  { rank: 2, label: 'Rank 2',   desc: '5 main + bonus number',   main: 5, bonus: true  },
  { rank: 3, label: 'Rank 3',   desc: '5 main numbers',          main: 5, bonus: false },
  { rank: 4, label: 'Rank 4',   desc: '4 main numbers',          main: 4, bonus: false },
  { rank: 5, label: 'Rank 5',   desc: '3 main numbers',          main: 3, bonus: false },
]

const RANK_STYLE = {
  1: { badge: 'bg-[#f59e0b] text-[#0f172a]',   ring: 'border-[#f59e0b]',    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]' },
  2: { badge: 'bg-slate-300 text-[#0f172a]',   ring: 'border-slate-400',    glow: '' },
  3: { badge: 'bg-amber-700 text-white',        ring: 'border-amber-700',    glow: '' },
  4: { badge: 'bg-[#1e293b] text-slate-300 border border-slate-600', ring: 'border-slate-500', glow: '' },
  5: { badge: 'bg-[#1e293b] text-slate-400 border border-slate-700', ring: 'border-slate-600', glow: '' },
}

function calculatePrize(ticket, draw) {
  const mainMatches = ticket.numbers.filter(n => draw.numbers.includes(n)).length
  const bonusMatch  = ticket.additional === draw.additional

  for (const prize of PRIZE_RANKS) {
    if (mainMatches >= prize.main && (!prize.bonus || bonusMatch)) {
      return { ...prize, mainMatches, bonusMatch }
    }
  }
  return { rank: null, label: 'No Prize', desc: `${mainMatches} main number${mainMatches !== 1 ? 's' : ''} matched`, mainMatches, bonusMatch }
}

export default function PrizeCalculator() {
  const { draws } = useDrawData()
  const [selected, setSelected] = useState([])
  const [bonus, setBonus] = useState(null)
  const [drawIdx, setDrawIdx] = useState(0)

  const sorted = [...draws].sort((a, b) => new Date(b.drawDate) - new Date(a.drawDate))
  const checkDraw = sorted[drawIdx]

  const toggleNum = (n) => {
    if (selected.includes(n)) {
      setSelected(s => s.filter(x => x !== n))
      if (bonus === n) setBonus(null)
    } else if (selected.length < 6) {
      setSelected(s => [...s, n])
    }
  }

  const toggleBonus = (n) => {
    if (!selected.includes(n)) return
    setBonus(b => b === n ? null : n)
  }

  const isReady = selected.length === 6 && bonus !== null
  const result  = isReady && checkDraw
    ? calculatePrize({ numbers: [...selected].sort((a, b) => a - b), additional: bonus }, checkDraw)
    : null

  const style = result?.rank ? RANK_STYLE[result.rank] : null

  return (
    <div className="rounded-xl bg-[#1e293b] p-5 space-y-5">
      <div className="flex items-center gap-2">
        <Trophy size={16} className="text-[#f59e0b]" />
        <h2 className="text-white font-semibold">Prize Calculator</h2>
        <p className="text-xs text-slate-500 ml-1">— check what prize your numbers would have won</p>
      </div>

      {/* Step 1: pick ticket numbers */}
      <div>
        <p className="text-xs text-slate-400 mb-2">
          Step 1: Select 6 numbers, then click one to set it as your bonus number.
        </p>
        <div className="grid grid-cols-7 gap-1.5 mb-3">
          {Array.from({ length: 42 }, (_, i) => i + 1).map(n => (
            <NumberBall
              key={n}
              number={n}
              size="sm"
              variant={bonus === n ? 'cold' : selected.includes(n) ? 'selected' : 'neutral'}
              onClick={() => selected.includes(n) ? toggleBonus(n) : toggleNum(n)}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          {[...selected].sort((a, b) => a - b).map(n => (
            <NumberBall
              key={n}
              number={n}
              size="sm"
              variant={n === bonus ? 'cold' : 'selected'}
              onClick={() => toggleNum(n)}
            />
          ))}
          {selected.length < 6 && (
            <span className="text-slate-600">{6 - selected.length} more to select</span>
          )}
          {selected.length === 6 && !bonus && (
            <span className="text-amber-400">Now click a selected number to set it as bonus</span>
          )}
        </div>
      </div>

      {/* Step 2: choose which draw to check against */}
      <div>
        <p className="text-xs text-slate-400 mb-2">Step 2: Choose a draw to check against.</p>
        <select
          value={drawIdx}
          onChange={e => setDrawIdx(Number(e.target.value))}
          className="w-full rounded-md border border-[#334155] bg-[#0f172a] text-slate-200 text-sm px-3 py-2 focus:outline-none focus:border-[#f59e0b]"
        >
          {sorted.map((d, i) => (
            <option key={d.drawNumber} value={i}>
              Draw #{d.drawNumber} — {d.drawDate} ({d.numbers.join(', ')} + {d.additional})
            </option>
          ))}
        </select>
      </div>

      {/* Result */}
      {result && checkDraw && (
        <div className={[
          'rounded-xl border-2 p-5 transition-all',
          style ? style.ring : 'border-[#334155]',
          style ? style.glow : '',
        ].join(' ')}>
          <div className="flex items-center gap-3 mb-4">
            {style && (
              <span className={['text-xs font-bold px-2.5 py-1 rounded-full', style.badge].join(' ')}>
                {result.label}
              </span>
            )}
            <p className="text-white font-semibold">{result.desc}</p>
            {result.rank === null && (
              <span className="ml-auto text-slate-500 text-xs">Better luck next time</span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-slate-500 mb-2">Your numbers</p>
              <div className="flex flex-wrap gap-1.5">
                {[...selected].sort((a, b) => a - b).map(n => (
                  <NumberBall
                    key={n}
                    number={n}
                    size="sm"
                    variant={checkDraw.numbers.includes(n) ? 'hot' : 'neutral'}
                  />
                ))}
                <AdditionalBall number={bonus} size="sm" />
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-2">Draw #{checkDraw.drawNumber} result</p>
              <div className="flex flex-wrap gap-1.5">
                {checkDraw.numbers.map(n => (
                  <NumberBall
                    key={n}
                    number={n}
                    size="sm"
                    variant={selected.includes(n) ? 'hot' : 'neutral'}
                  />
                ))}
                <AdditionalBall number={checkDraw.additional} size="sm" />
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500 mt-3">
            {result.mainMatches} main number{result.mainMatches !== 1 ? 's' : ''} matched
            {result.bonusMatch ? ' · bonus number matched' : ''}
          </p>
        </div>
      )}

      {/* Prize table reference */}
      <details className="text-xs">
        <summary className="text-slate-500 cursor-pointer hover:text-slate-300 transition-colors">
          View prize rank table
        </summary>
        <div className="mt-2 rounded-lg border border-[#334155] overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#0f172a] text-slate-400">
                <th className="px-3 py-2 text-left">Rank</th>
                <th className="px-3 py-2 text-left">Match required</th>
              </tr>
            </thead>
            <tbody>
              {PRIZE_RANKS.map(p => (
                <tr key={p.rank} className="border-t border-[#0f172a] text-slate-300">
                  <td className="px-3 py-1.5 font-semibold">{p.label}</td>
                  <td className="px-3 py-1.5">{p.desc}</td>
                </tr>
              ))}
              <tr className="border-t border-[#0f172a] text-slate-500">
                <td className="px-3 py-1.5">No prize</td>
                <td className="px-3 py-1.5">Fewer than 3 main numbers</td>
              </tr>
            </tbody>
          </table>
        </div>
      </details>
    </div>
  )
}
