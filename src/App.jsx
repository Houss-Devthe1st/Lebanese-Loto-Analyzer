import { useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { LotoProvider } from './context/LotoContext'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import Disclaimer from './components/shared/Disclaimer'
import Dashboard from './pages/Dashboard'
import Generator from './pages/Generator'
import History from './pages/History'
import Tracker from './pages/Tracker'

function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  // Close mobile drawer on navigation
  const handleMobileClose = () => setMobileOpen(false)

  return (
    <div className="flex h-screen bg-[#0f172a] text-white overflow-hidden">
      <Sidebar
        collapsed={collapsed}
        onCollapse={() => setCollapsed(c => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={handleMobileClose}
      />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Header onMenuClick={() => setMobileOpen(o => !o)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Routes>
            <Route path="/"          element={<Dashboard />} />
            <Route path="/generator" element={<Generator />} />
            <Route path="/history"   element={<History />} />
            <Route path="/tracker"   element={<Tracker />} />
          </Routes>
        </main>
      </div>
      <Disclaimer variant="footer" />
    </div>
  )
}

export default function App() {
  return (
    <LotoProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </LotoProvider>
  )
}
