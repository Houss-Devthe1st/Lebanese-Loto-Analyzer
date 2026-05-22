import { createContext, useContext, useEffect } from 'react'
import { create } from 'zustand'
import { parseCsvText, parseCsvFile } from '../utils/csvParser'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

const useLotoStore = create((set) => ({
  draws: [],
  isLoading: false,
  error: null,       // CSV/sample load errors shown inline
  apiError: null,    // API fetch error — persists so UI can warn user
  dataSource: null,

  loadFromApi: async () => {
    set({ isLoading: true, error: null, apiError: null })
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)
      const res = await fetch(`${API_BASE}/api/draws?limit=500`, {
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (res.status === 404) throw new Error('Backend not found — is the server running on port 8000?')
      if (!res.ok) throw new Error(`Server returned ${res.status}`)

      const data = await res.json()
      const draws = (data.draws || []).map(d => ({
        drawNumber: d.draw_number,
        drawDate: d.draw_date,
        numbers: [d.n1, d.n2, d.n3, d.n4, d.n5, d.n6].sort((a, b) => a - b),
        additional: d.additional,
        jackpotLbp: d.jackpot_lbp ?? null,
      }))

      if (draws.length === 0) throw new Error('Backend is running but has no draws yet. Run the scraper first.')

      set({ draws, dataSource: 'api', isLoading: false, apiError: null })
    } catch (err) {
      const msg = err.name === 'AbortError'
        ? 'Request timed out — backend unreachable.'
        : err.message || 'Could not connect to backend.'
      set({ isLoading: false, apiError: msg })
      await useLotoStore.getState().loadSampleData()
    }
  },

  loadFromCsv: async (file) => {
    set({ isLoading: true, error: null })
    try {
      const draws = await parseCsvFile(file)
      if (draws.length === 0) throw new Error('No valid draws found in CSV. Check the column format.')
      set({ draws, dataSource: 'csv', isLoading: false, apiError: null })
    } catch (err) {
      set({ error: err.message, isLoading: false })
    }
  },

  loadSampleData: async () => {
    set({ isLoading: true })
    try {
      const res = await fetch('/sample-data.csv')
      if (!res.ok) throw new Error('Could not load sample data.')
      const text = await res.text()
      const draws = parseCsvText(text)
      set({ draws, dataSource: 'sample', isLoading: false })
    } catch (err) {
      set({ error: err.message, isLoading: false })
    }
  },

  dismissApiError: () => set({ apiError: null }),
}))

const LotoContext = createContext(null)

export function LotoProvider({ children }) {
  const store = useLotoStore()

  useEffect(() => {
    store.loadFromApi()
  }, [])

  return <LotoContext.Provider value={store}>{children}</LotoContext.Provider>
}

export function useLoto() {
  return useContext(LotoContext)
}
