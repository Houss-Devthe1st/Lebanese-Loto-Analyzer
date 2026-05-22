import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, Download } from 'lucide-react'
import NumberBall from '../shared/NumberBall'
import AdditionalBall from '../shared/AdditionalBall'
import { useDrawData } from '../../hooks/useDrawData'

const PAGE_SIZE = 20

function exportCsv(rows) {
  const header = 'draw_number,draw_date,n1,n2,n3,n4,n5,n6,additional'
  const lines = rows.map(d =>
    `${d.drawNumber},${d.drawDate},${d.numbers.join(',')},${d.additional}`
  )
  const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'lldj-draws.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export default function DrawTable() {
  const { draws } = useDrawData()
  const [sortKey, setSortKey] = useState('drawDate')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(1)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [searchNum, setSearchNum] = useState('')

  const sorted = useMemo(() => {
    let rows = [...draws]

    if (fromDate) rows = rows.filter(d => d.drawDate >= fromDate)
    if (toDate) rows = rows.filter(d => d.drawDate <= toDate)

    const num = parseInt(searchNum, 10)
    if (!isNaN(num) && num >= 1 && num <= 42) {
      rows = rows.filter(d => d.numbers.includes(num) || d.additional === num)
    }

    rows.sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey]
      if (sortKey === 'sum') {
        va = a.numbers.reduce((s, n) => s + n, 0)
        vb = b.numbers.reduce((s, n) => s + n, 0)
      }
      if (sortKey === 'oddCount') {
        va = a.numbers.filter(n => n % 2 !== 0).length
        vb = b.numbers.filter(n => n % 2 !== 0).length
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return rows
  }, [draws, sortKey, sortDir, fromDate, toDate, searchNum])

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageRows = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const SortIcon = ({ k }) =>
    sortKey === k ? (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-slate-500 mb-1">From date</label>
          <input
            type="date"
            value={fromDate}
            onChange={e => { setFromDate(e.target.value); setPage(1) }}
            className="rounded-md border border-[#334155] bg-[#0f172a] text-slate-200 text-sm px-3 py-1.5 focus:outline-none focus:border-[#f59e0b]"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">To date</label>
          <input
            type="date"
            value={toDate}
            onChange={e => { setToDate(e.target.value); setPage(1) }}
            className="rounded-md border border-[#334155] bg-[#0f172a] text-slate-200 text-sm px-3 py-1.5 focus:outline-none focus:border-[#f59e0b]"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Search number (1-42)</label>
          <input
            type="number"
            min="1"
            max="42"
            value={searchNum}
            onChange={e => { setSearchNum(e.target.value); setPage(1) }}
            placeholder="e.g. 7"
            className="w-24 rounded-md border border-[#334155] bg-[#0f172a] text-slate-200 text-sm px-3 py-1.5 focus:outline-none focus:border-[#f59e0b]"
          />
        </div>
        <button
          onClick={() => exportCsv(sorted)}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm border border-[#334155] bg-[#1e293b] text-slate-300 hover:border-[#f59e0b] hover:text-[#f59e0b] transition-colors"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-[#1e293b] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#0f172a] text-slate-400 text-xs">
                {[
                  ['drawNumber', 'Draw #'],
                  ['drawDate', 'Date'],
                  [null, 'Numbers'],
                  ['sum', 'Sum'],
                  ['oddCount', 'Odd'],
                ].map(([key, label]) => (
                  <th
                    key={label}
                    className={[
                      'px-4 py-3 text-left',
                      key ? 'cursor-pointer hover:text-white select-none' : '',
                    ].join(' ')}
                    onClick={() => key && toggleSort(key)}
                  >
                    <span className="flex items-center gap-1">
                      {label}
                      {key && <SortIcon k={key} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((draw, idx) => {
                const sum = draw.numbers.reduce((a, b) => a + b, 0)
                const odd = draw.numbers.filter(n => n % 2 !== 0).length
                return (
                  <tr
                    key={draw.drawNumber}
                    className={[
                      'border-b border-[#0f172a]/50 hover:bg-[#0f172a]/40 transition-colors',
                      idx % 2 === 0 ? '' : 'bg-[#0f172a]/20',
                    ].join(' ')}
                  >
                    <td className="px-4 py-2.5 font-mono text-slate-300 text-xs">#{draw.drawNumber}</td>
                    <td className="px-4 py-2.5 text-slate-400 text-xs whitespace-nowrap">{draw.drawDate}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {draw.numbers.map(n => (
                          <NumberBall key={n} number={n} size="sm" variant="neutral" />
                        ))}
                        <span className="text-slate-600 text-xs">+</span>
                        <AdditionalBall number={draw.additional} size="sm" />
                      </div>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-300 text-xs">{sum}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-300 text-xs">{odd}</td>
                  </tr>
                )
              })}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No draws match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>{sorted.length} draws found</span>
        <div className="flex items-center gap-2">
          <button
            disabled={safePage === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-3 py-1 rounded border border-[#334155] disabled:opacity-30 hover:border-[#f59e0b] hover:text-[#f59e0b] transition-colors"
          >
            Prev
          </button>
          <span className="font-mono text-xs">{safePage} / {totalPages}</span>
          <button
            disabled={safePage === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1 rounded border border-[#334155] disabled:opacity-30 hover:border-[#f59e0b] hover:text-[#f59e0b] transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
