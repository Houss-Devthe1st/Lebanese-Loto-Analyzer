import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { BarChart2, Zap, Clock, Target, ChevronLeft, ChevronRight, X } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/',          label: 'Dashboard', icon: BarChart2 },
  { to: '/generator', label: 'Generator', icon: Zap },
  { to: '/history',   label: 'History',   icon: Clock },
  { to: '/tracker',   label: 'Tracker',   icon: Target },
]

export default function Sidebar({ collapsed, onCollapse, mobileOpen, onMobileClose }) {
  // Close mobile drawer on route change
  useEffect(() => {
    onMobileClose?.()
  }, [])                    // intentionally only on mount

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onMobileClose?.() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onMobileClose])

  const nav = (
    <nav className="flex-1 py-4 space-y-1 px-2">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          onClick={onMobileClose}
          className={({ isActive }) =>
            [
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors relative group',
              isActive
                ? 'text-[#f59e0b] bg-[#f59e0b]/10 border-l-2 border-[#f59e0b]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e293b]',
            ].join(' ')
          }
        >
          <Icon size={18} className="shrink-0" />
          {/* Always show label on mobile drawer; respect collapsed on desktop */}
          <span className={collapsed ? 'hidden md:hidden' : ''}>{label}</span>
          {/* Tooltip when desktop-collapsed */}
          {collapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 rounded bg-[#1e293b] text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 shadow-lg hidden md:block">
              {label}
            </div>
          )}
        </NavLink>
      ))}
    </nav>
  )

  const bottom = (
    <div className="border-t border-[#1e293b] p-3 space-y-3">
      {!collapsed && (
        <div className="flex items-center gap-2 px-2">
          <span className="px-1.5 py-0.5 rounded bg-[#f59e0b]/10 text-[#f59e0b] font-bold text-[10px] border border-[#f59e0b]/30">
            18+
          </span>
          <a
            href="https://www.lldj.com/en/responsible-gaming"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-slate-500 hover:text-[#14b8a6] transition-colors"
          >
            Responsible Gaming
          </a>
        </div>
      )}
      {/* Collapse toggle — desktop only */}
      <button
        onClick={onCollapse}
        className="hidden md:flex w-full items-center justify-center p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-[#1e293b] transition-colors"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </div>
  )

  const logoArea = (
    <div className="flex items-center gap-3 px-4 py-5 border-b border-[#1e293b]">
      <div className="w-8 h-8 rounded-full bg-[#f59e0b] flex items-center justify-center shrink-0">
        <span className="text-[#0f172a] font-bold font-mono text-sm">L</span>
      </div>
      {!collapsed && (
        <div className="flex-1">
          <p className="text-white font-semibold text-sm leading-none">LLDJ Loto</p>
          <p className="text-slate-500 text-xs mt-0.5">Analyzer</p>
        </div>
      )}
      {/* Close button — mobile only */}
      <button
        onClick={onMobileClose}
        className="md:hidden ml-auto p-1 text-slate-500 hover:text-white transition-colors"
      >
        <X size={18} />
      </button>
    </div>
  )

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────────── */}
      <aside
        className={[
          'hidden md:flex flex-col shrink-0 h-screen bg-[#0f172a] border-r border-[#1e293b] transition-all duration-200',
          collapsed ? 'w-16' : 'w-60',
        ].join(' ')}
      >
        {logoArea}
        {nav}
        {bottom}
      </aside>

      {/* ── Mobile overlay + drawer ──────────────────────────────── */}
      {/* Backdrop */}
      <div
        className={[
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity md:hidden',
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        onClick={onMobileClose}
      />
      {/* Drawer */}
      <aside
        className={[
          'fixed top-0 left-0 z-50 flex flex-col h-full w-72 bg-[#0f172a] border-r border-[#1e293b]',
          'transition-transform duration-250 ease-in-out md:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {logoArea}
        {nav}
        {bottom}
      </aside>
    </>
  )
}
