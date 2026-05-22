import DrawTable from '../components/history/DrawTable'
import FileUploader from '../components/shared/FileUploader'
import { useDrawData } from '../hooks/useDrawData'

export default function History() {
  const { draws } = useDrawData()

  const sorted = [...draws].sort((a, b) => new Date(b.drawDate) - new Date(a.drawDate))
  const years = [...new Set(draws.map(d => d.drawDate.slice(0, 4)))].sort()

  return (
    <div className="space-y-5 pb-16">
      {/* Summary */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="rounded-lg bg-[#1e293b] px-4 py-3">
          <p className="text-xs text-slate-500">Total Draws</p>
          <p className="text-xl font-mono font-bold text-white">{draws.length}</p>
        </div>
        {sorted.length > 0 && (
          <>
            <div className="rounded-lg bg-[#1e293b] px-4 py-3">
              <p className="text-xs text-slate-500">Earliest</p>
              <p className="text-sm font-mono text-slate-300">{sorted[sorted.length - 1].drawDate}</p>
            </div>
            <div className="rounded-lg bg-[#1e293b] px-4 py-3">
              <p className="text-xs text-slate-500">Latest</p>
              <p className="text-sm font-mono text-slate-300">{sorted[0].drawDate}</p>
            </div>
          </>
        )}
        {years.length > 0 && (
          <div className="rounded-lg bg-[#1e293b] px-4 py-3">
            <p className="text-xs text-slate-500">Years</p>
            <p className="text-sm font-mono text-slate-300">{years.join(', ')}</p>
          </div>
        )}
      </div>

      <DrawTable />

      <div className="rounded-xl bg-[#1e293b] p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Import Your Own Data</h3>
        <FileUploader />
      </div>
    </div>
  )
}
