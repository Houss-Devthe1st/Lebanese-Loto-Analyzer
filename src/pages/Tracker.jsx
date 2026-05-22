import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import NumberBall from '../components/shared/NumberBall'
import AdditionalBall from '../components/shared/AdditionalBall'
import PrizeCalculator from '../components/shared/PrizeCalculator'
import { useDrawData } from '../hooks/useDrawData'

const STORAGE_KEY = 'lldj_tracker_combos'

function loadCombos() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function matchScore(combo, draw) {
  const mainMatches = combo.numbers.filter(n => draw.numbers.includes(n)).length
  const bonusMatch = combo.additional === draw.additional
  return { mainMatches, bonusMatch }
}

export default function Tracker() {
  const { draws } = useDrawData()
  const [combos, setCombos] = useState(loadCombos)
  const [selected, setSelected] = useState([])
  const [selectedBonus, setSelectedBonus] = useState(null)
  const [checking, setChecking] = useState(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(combos))
  }, [combos])

  const toggleNumber = (n) => {
    if (selected.includes(n)) {
      setSelected(s => s.filter(x => x !== n))
      if (selectedBonus === n) setSelectedBonus(null)
    } else if (selected.length < 6) {
      setSelected(s => [...s, n])
    }
  }

  const toggleBonus = (n) => {
    if (!selected.includes(n)) return
    setSelectedBonus(b => b === n ? null : n)
  }

  const saveCombo = () => {
    if (selected.length !== 6 || !selectedBonus) return
    const combo = {
      id: Date.now(),
      numbers: [...selected].sort((a, b) => a - b),
      additional: selectedBonus,
    }
    setCombos(c => [combo, ...c])
    setSelected([])
    setSelectedBonus(null)
  }

  const deleteCombo = (id) => setCombos(c => c.filter(x => x.id !== id))

  const matches = checking
    ? draws
        .map(d => ({ draw: d, ...matchScore(checking, d) }))
        .filter(r => r.mainMatches >= 2)
        .sort((a, b) => b.mainMatches - a.mainMatches || (b.bonusMatch ? 1 : 0) - (a.bonusMatch ? 1 : 0))
    : []

  return (
    <div className="space-y-6 pb-16">
      <div className="rounded-xl bg-[#1e293b] p-5">
        <h2 className="text-sm font-semibold text-white mb-1">Build a Combination</h2>
        <p className="text-xs text-slate-500 mb-4">
          Select 6 numbers, then click one of them to set it as your bonus number.
        </p>

        <div className="grid grid-cols-7 gap-1.5 mb-4">
          {Array.from({ length: 42 }, (_, i) => i + 1).map(n => (
            <div key={n} className="flex flex-col items-center gap-0.5">
              <NumberBall
                number={n}
                size="sm"
                variant={selectedBonus === n ? 'cold' : selected.includes(n) ? 'selected' : 'neutral'}
                onClick={() => {
                  if (selected.includes(n)) toggleBonus(n)
                  else toggleNumber(n)
                }}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1.5 flex-wrap min-h-8">
            {[...selected].sort((a, b) => a - b).map(n => (
              <NumberBall
                key={n}
                number={n}
                size="sm"
                variant={n === selectedBonus ? 'cold' : 'selected'}
                onClick={() => toggleNumber(n)}
              />
            ))}
          </div>
          <p className="text-xs text-slate-500">
            {selected.length}/6 selected
            {selectedBonus ? ` · Bonus: ${selectedBonus}` : ' · Click a selected number to set bonus'}
          </p>
          <button
            onClick={saveCombo}
            disabled={selected.length !== 6 || !selectedBonus}
            className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#f59e0b] text-[#0f172a] font-semibold text-sm disabled:opacity-40 hover:bg-[#fbbf24] transition-colors"
          >
            <Plus size={15} /> Save Combination
          </button>
        </div>
      </div>

      {combos.length > 0 && (
        <div className="rounded-xl bg-[#1e293b] p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Saved Combinations</h2>
          <div className="space-y-3">
            {combos.map(combo => (
              <div key={combo.id} className="rounded-lg border border-[#334155] p-3 flex flex-wrap items-center gap-3">
                <div className="flex gap-1.5 flex-wrap">
                  {combo.numbers.map(n => (
                    <NumberBall key={n} number={n} size="sm" variant={n === combo.additional ? 'cold' : 'neutral'} />
                  ))}
                  <AdditionalBall number={combo.additional} size="sm" />
                </div>
                <div className="ml-auto flex gap-2">
                  <button
                    onClick={() => setChecking(checking?.id === combo.id ? null : combo)}
                    className={[
                      'px-3 py-1.5 rounded-md text-xs transition-colors border',
                      checking?.id === combo.id
                        ? 'border-[#f59e0b] bg-[#f59e0b]/10 text-[#f59e0b]'
                        : 'border-[#334155] text-slate-400 hover:border-[#f59e0b] hover:text-[#f59e0b]',
                    ].join(' ')}
                  >
                    {checking?.id === combo.id ? 'Hide matches' : 'Check history'}
                  </button>
                  <button
                    onClick={() => deleteCombo(combo.id)}
                    className="p-1.5 text-slate-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {checking && (
        <div className="rounded-xl bg-[#1e293b] p-5">
          <h2 className="text-sm font-semibold text-white mb-1">
            Historical matches for combination #{checking.id}
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Showing draws with 2+ main number matches (purely retrospective — this is not a validation of future outcomes).
          </p>
          {matches.length === 0 ? (
            <p className="text-slate-500 text-sm">No draws with 2+ matches found.</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {matches.map(({ draw, mainMatches, bonusMatch }) => (
                <div key={draw.drawNumber} className="flex items-center gap-3 py-2 border-b border-[#0f172a]">
                  <span className="text-xs text-slate-500 font-mono w-16">#{draw.drawNumber}</span>
                  <span className="text-xs text-slate-400 w-24">{draw.drawDate}</span>
                  <div className="flex gap-1">
                    {draw.numbers.map(n => (
                      <NumberBall
                        key={n}
                        number={n}
                        size="sm"
                        variant={checking.numbers.includes(n) ? 'hot' : 'neutral'}
                      />
                    ))}
                    <AdditionalBall number={draw.additional} size="sm" />
                  </div>
                  <span className="text-xs ml-auto">
                    <span className="text-[#f59e0b] font-bold font-mono">{mainMatches}</span>
                    <span className="text-slate-500"> main</span>
                    {bonusMatch && <span className="text-[#14b8a6] ml-1 font-bold">+ bonus</span>}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="rounded-lg border border-[#334155] px-4 py-3 text-xs text-slate-500">
        Retrospective matching is for entertainment only. Past matches do not indicate future performance. All lottery draws are independent random events.
      </div>

      <PrizeCalculator />
    </div>
  )
}
