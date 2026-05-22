const MODES = [
  {
    id: 'random',
    label: 'Pure Random',
    desc: 'Standard random selection from the full pool',
  },
  {
    id: 'frequency',
    label: 'Frequency Weighted',
    desc: 'Proportional to historical draw frequency',
  },
  {
    id: 'gap',
    label: 'Gap Weighted',
    desc: 'Favors numbers with longer gaps since last appearance',
  },
  {
    id: 'balanced',
    label: 'Balanced',
    desc: 'Ensures mixed odd/even, low/high, and moderate sum',
  },
  {
    id: 'pinned',
    label: 'Pin Numbers',
    desc: 'Lock up to 5 numbers, fill the rest randomly',
  },
]

export default function GeneratorModeSelector({ selectedMode, onModeChange }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      {MODES.map(mode => (
        <button
          key={mode.id}
          onClick={() => onModeChange(mode.id)}
          className={[
            'rounded-lg px-3 py-3 text-left border transition-colors',
            selectedMode === mode.id
              ? 'border-[#f59e0b] bg-[#f59e0b]/10 text-[#f59e0b]'
              : 'border-[#334155] bg-[#0f172a] text-slate-400 hover:border-[#475569] hover:text-slate-200',
          ].join(' ')}
        >
          <p className="text-sm font-semibold leading-tight">{mode.label}</p>
          <p className="text-[10px] mt-1 opacity-70 leading-tight">{mode.desc}</p>
        </button>
      ))}
    </div>
  )
}
