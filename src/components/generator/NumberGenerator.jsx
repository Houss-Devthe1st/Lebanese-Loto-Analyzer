import { useState, useCallback } from 'react'
import { Shuffle } from 'lucide-react'
import GeneratorModeSelector from './GeneratorModeSelector'
import NumberBall from '../shared/NumberBall'
import AdditionalBall from '../shared/AdditionalBall'
import Disclaimer from '../shared/Disclaimer'
import { useDrawData } from '../../hooks/useDrawData'
import {
  generateRandom,
  generateFrequencyWeighted,
  generateGapWeighted,
  generateBalanced,
  generateWithPinnedNumbers,
} from '../../utils/numberGenerator'

const MAX_HISTORY = 5

export default function NumberGenerator() {
  const { draws } = useDrawData()
  const [mode, setMode] = useState('random')
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [pinned, setPinned] = useState([])
  const [animKey, setAnimKey] = useState(0)

  const generate = useCallback(() => {
    let generated
    switch (mode) {
      case 'frequency':
        generated = generateFrequencyWeighted(draws)
        break
      case 'gap':
        generated = generateGapWeighted(draws)
        break
      case 'balanced':
        generated = generateBalanced()
        break
      case 'pinned':
        generated = generateWithPinnedNumbers(draws, pinned)
        break
      default:
        generated = generateRandom()
    }
    setResult(generated)
    setAnimKey(k => k + 1)
    setHistory(prev => [generated, ...prev].slice(0, MAX_HISTORY))
  }, [mode, draws, pinned])

  const togglePin = (n) => {
    setPinned(prev =>
      prev.includes(n)
        ? prev.filter(p => p !== n)
        : prev.length < 5 ? [...prev, n] : prev
    )
  }

  return (
    <div className="space-y-6">
      <GeneratorModeSelector selectedMode={mode} onModeChange={setMode} />

      {mode === 'pinned' && (
        <div className="rounded-xl bg-[#1e293b] p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-slate-300">Select up to 5 numbers to lock in</p>
            {pinned.length > 0 && (
              <button
                onClick={() => setPinned([])}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: 42 }, (_, i) => i + 1).map(n => (
              <NumberBall
                key={n}
                number={n}
                size="sm"
                variant={pinned.includes(n) ? 'selected' : 'neutral'}
                onClick={() => togglePin(n)}
              />
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {pinned.length}/5 numbers pinned
          </p>
        </div>
      )}

      <button
        onClick={generate}
        className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-[#f59e0b] text-[#0f172a] font-bold text-lg hover:bg-[#fbbf24] active:bg-[#d97706] transition-colors"
      >
        <Shuffle size={22} />
        Generate Numbers
      </button>

      {result && (
        <div key={animKey} className="rounded-xl bg-[#1e293b] p-6">
          <div className="flex flex-wrap items-end justify-center gap-3">
            {result.numbers.map(n => (
              <NumberBall key={n} number={n} variant="generated" size="lg" />
            ))}
            <div className="flex items-end">
              <span className="text-slate-600 text-xl mx-2 mb-3">+</span>
              <AdditionalBall number={result.additional} size="lg" />
            </div>
          </div>
          <p className="text-center text-xs text-slate-500 mt-4">
            Sum: <span className="font-mono text-slate-300">{result.numbers.reduce((a, b) => a + b, 0)}</span>
            {' · '}
            Odd: <span className="font-mono text-slate-300">{result.numbers.filter(n => n % 2 !== 0).length}</span>
            {' · '}
            Low (1-21): <span className="font-mono text-slate-300">{result.numbers.filter(n => n <= 21).length}</span>
          </p>
        </div>
      )}

      <Disclaimer variant="banner" />

      {history.length > 0 && (
        <div className="rounded-xl bg-[#1e293b] p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Recent Generations</h3>
          <div className="space-y-2">
            {history.map((h, idx) => (
              <div key={idx} className="flex items-center gap-2 py-1.5 border-b border-[#0f172a] last:border-0">
                <span className="text-xs text-slate-600 w-4 font-mono">{idx + 1}</span>
                <div className="flex gap-1.5 flex-wrap">
                  {h.numbers.map(n => (
                    <NumberBall key={n} number={n} size="sm" variant="neutral" />
                  ))}
                  <span className="text-slate-600 text-sm self-center">+</span>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold border-2 border-[#14b8a6] text-[#14b8a6]">
                    {h.additional}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
