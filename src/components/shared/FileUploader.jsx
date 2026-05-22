import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { useDrawData } from '../../hooks/useDrawData'

export default function FileUploader({ compact = false }) {
  const { loadFromCsv, dataSource, draws } = useDrawData()
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState(null)

  const handleFile = async (file) => {
    setError(null)
    if (!file?.name.endsWith('.csv')) {
      setError('Please upload a .csv file')
      return
    }
    try {
      await loadFromCsv(file)
    } catch {
      setError('Failed to parse CSV. Check the file format.')
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm border border-[#334155] bg-[#1e293b] text-slate-300 hover:border-[#f59e0b] hover:text-[#f59e0b] transition-colors"
        >
          <Upload size={14} />
          Upload CSV
        </button>
        {dataSource === 'csv' && (
          <span className="text-xs text-purple-400 font-mono">
            Your CSV · {draws.length} draws
          </span>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={e => handleFile(e.target.files[0])}
        />
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={[
          'rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-colors',
          isDragging
            ? 'border-[#f59e0b] bg-[#f59e0b]/5'
            : 'border-[#334155] bg-[#1e293b]/40 hover:border-[#f59e0b]/50',
        ].join(' ')}
      >
        <Upload className="mx-auto mb-2 text-slate-500" size={24} />
        <p className="text-sm text-slate-400">
          Drag & drop a CSV file, or <span className="text-[#f59e0b]">browse</span>
        </p>
        <p className="text-xs text-slate-600 mt-1">
          Format: draw_number, draw_date, n1–n6, additional
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={e => handleFile(e.target.files[0])}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      {dataSource === 'csv' && (
        <p className="text-xs text-purple-400 font-mono">
          Loaded from your CSV · {draws.length} draws
        </p>
      )}
    </div>
  )
}
