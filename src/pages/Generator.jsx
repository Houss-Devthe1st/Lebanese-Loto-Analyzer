import NumberGenerator from '../components/generator/NumberGenerator'
import NumberBall from '../components/shared/NumberBall'
import { useDrawData } from '../hooks/useDrawData'
import { useFrequency } from '../hooks/useFrequency'

export default function Generator() {
  const { draws } = useDrawData()
  const { hotNumbers, coldNumbers } = useFrequency(draws)

  return (
    <div className="pb-16 grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2">
        <NumberGenerator />
      </div>

      <div className="space-y-4">
        <div className="rounded-xl bg-[#1e293b] p-5">
          <h3 className="text-sm font-semibold text-[#f59e0b] mb-3">Hot Numbers</h3>
          <div className="flex flex-wrap gap-2">
            {hotNumbers.slice(0, 10).map(({ number, count }) => (
              <div key={number} className="flex flex-col items-center gap-0.5">
                <NumberBall number={number} variant="hot" size="sm" />
                <span className="text-[9px] text-slate-500 font-mono">{count}x</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-[#1e293b] p-5">
          <h3 className="text-sm font-semibold text-[#14b8a6] mb-3">Cold Numbers</h3>
          <div className="flex flex-wrap gap-2">
            {coldNumbers.slice(0, 10).map(({ number, count }) => (
              <div key={number} className="flex flex-col items-center gap-0.5">
                <NumberBall number={number} variant="cold" size="sm" />
                <span className="text-[9px] text-slate-500 font-mono">{count}x</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-[#1e293b] p-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Hot and cold statistics are shown for reference only. They do not influence
            the outcome of future draws. All lottery results are independently random.
          </p>
        </div>
      </div>
    </div>
  )
}
