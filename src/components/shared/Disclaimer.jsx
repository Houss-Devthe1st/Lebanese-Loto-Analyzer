export default function Disclaimer({ variant = 'banner' }) {
  const content = (
    <p className="text-xs text-slate-400 leading-relaxed">
      <span className="inline-flex items-center gap-1 mr-2 px-1.5 py-0.5 rounded bg-[#f59e0b]/10 text-[#f59e0b] font-bold text-[10px] border border-[#f59e0b]/30">
        18+
      </span>
      Lottery draws are random. This tool is for statistical exploration only. No algorithm can
      determine future draw outcomes.{' '}
      <a
        href="https://www.lldj.com/en/responsible-gaming"
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#14b8a6] underline hover:text-[#2dd4bf]"
      >
        Play Responsibly
      </a>
    </p>
  )

  if (variant === 'footer') {
    return (
      <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#1e293b] bg-[#0f172a]/95 backdrop-blur px-6 py-2">
        {content}
      </footer>
    )
  }

  if (variant === 'modal') {
    return (
      <div className="rounded-lg border border-[#f59e0b]/20 bg-[#1e293b] p-4">
        {content}
      </div>
    )
  }

  return (
    <div className="rounded-md border border-slate-700 bg-[#1e293b]/60 px-4 py-3">
      {content}
    </div>
  )
}
