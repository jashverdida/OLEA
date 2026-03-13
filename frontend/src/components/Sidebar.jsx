import { LayoutDashboard, ScanText, ClockIcon, Settings, Zap } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'dashboard',   icon: LayoutDashboard, label: 'Dashboard'         },
  { id: 'extraction',  icon: ScanText,        label: 'Extraction Engine' },
  { id: 'history',     icon: ClockIcon,       label: 'Contract History'  },
  { id: 'settings',    icon: Settings,        label: 'Settings'          },
]

export default function Sidebar({ active = 'extraction', onNav }) {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
             style={{ background: 'linear-gradient(135deg,rgba(34,211,238,0.3),rgba(59,130,246,0.3))', border: '1px solid rgba(34,211,238,0.4)', boxShadow: '0 0 16px rgba(34,211,238,0.2)' }}>
          <Zap size={18} className="text-cyan-400" />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col items-center gap-1 flex-1">
        {NAV_ITEMS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onNav?.(id)}
            className={`nav-item ${active === id ? 'active' : ''}`}
            aria-label={label}
          >
            <Icon size={20} />
            <span className="tooltip">{label}</span>
          </button>
        ))}
      </nav>

      {/* Version */}
      <div className="text-[9px] font-mono text-slate-600 mb-1 tracking-widest">v1.0</div>
    </aside>
  )
}
