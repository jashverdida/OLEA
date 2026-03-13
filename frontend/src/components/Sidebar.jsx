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
             style={{
               background: 'linear-gradient(135deg, rgba(34,211,238,0.25) 0%, rgba(168,85,247,0.25) 100%)',
               border: '1px solid rgba(34,211,238,0.5)',
               boxShadow: '0 0 20px rgba(34,211,238,0.35), 0 0 40px rgba(168,85,247,0.15), inset 0 1px 0 rgba(255,255,255,0.12)',
             }}>
          <Zap size={18} style={{ color: '#22d3ee', filter: 'drop-shadow(0 0 5px rgba(34,211,238,0.9))' }} />
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
      <div className="text-[9px] font-mono mb-1 tracking-widest"
           style={{ color: 'rgba(34,211,238,0.4)' }}>v1.0</div>
    </aside>
  )
}
