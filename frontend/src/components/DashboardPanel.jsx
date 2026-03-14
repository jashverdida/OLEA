import { motion } from 'framer-motion'
import { FileText, Globe, BarChart3, Activity, ChevronDown } from 'lucide-react'

const RECENT_CONTRACTS = [
  { id: 'ATL0347N25', shipper: 'Hayahai Co. Ltd',        lane: 'NAWA WB', rows: 1385, status: 'ACTIVE'   },
  { id: 'ATL0312N25', shipper: 'Greenfield Exports',     lane: 'NAWA WB', rows: 1142, status: 'ACTIVE'   },
  { id: 'ATL0289N24', shipper: 'Pacific Rim Logistics',  lane: 'ASWC EB', rows:  893, status: 'EXPIRED'  },
  { id: 'ATL0276N24', shipper: 'Global Trade Solutions', lane: 'NAWA WB', rows: 1056, status: 'ACTIVE'   },
  { id: 'ATL0251N24', shipper: 'Sunrise Manufacturing',  lane: 'ASWC EB', rows:  768, status: 'EXPIRING' },
  { id: 'ATL0234N24', shipper: 'Atlantic Freight Corp',  lane: 'TAEB',    rows:  634, status: 'ACTIVE'   },
]

const TRADE_LANES = [
  { code: 'NAWA WB', label: 'North America → Asia',  pct: 62, color: '34,211,238' },
  { code: 'ASWC EB', label: 'Asia → US West Coast',  pct: 21, color: '168,85,247' },
  { code: 'TAEB',    label: 'Trans-Atlantic EB',      pct: 11, color: '52,211,153' },
  { code: 'OTHER',   label: 'All Other Lanes',        pct:  6, color: '251,191,36' },
]

const HERO_STATS = [
  { val: '47',     lbl: 'Active Contracts'     },
  { val: '18,432', lbl: 'Rate Rows Indexed'    },
  { val: '$0.00',  lbl: 'API Costs Incurred'   },
  { val: '1.3s',   lbl: 'Avg. Processing Time' },
]

export default function DashboardPanel() {
  return (
    <div>

      {/* ── Hero — full-bleed, fills viewport height ─────────────────── */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
        className="min-h-screen flex flex-col justify-between px-12 py-10 relative overflow-hidden"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Subtle structural lines */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute left-12 top-0 bottom-0 w-px"
               style={{ background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.04) 30%, rgba(255,255,255,0.04) 70%, transparent)' }} />
          <div className="absolute right-12 top-0 bottom-0 w-px"
               style={{ background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.03) 30%, rgba(255,255,255,0.03) 70%, transparent)' }} />
          <div className="absolute bottom-24 left-0 right-0 h-px"
               style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05) 20%, rgba(255,255,255,0.05) 80%, transparent)' }} />
        </div>

        {/* Top row: company + status */}
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-[0.3em]">OLTEK Group</span>
            <span className="w-px h-3 bg-slate-700" />
            <span className="text-[11px] font-mono text-slate-600 uppercase tracking-widest">Maritime Services</span>
          </div>
          <div className="flex items-center gap-6 text-[11px] font-mono text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                    style={{ animation: 'dot-pulse 2s ease-in-out infinite' }} />
              <span className="text-emerald-400">All Systems Operational</span>
            </span>
            <span>March 2026</span>
          </div>
        </div>

        {/* Centre: wordmark */}
        <div className="relative flex-1 flex flex-col justify-center py-12">
          <motion.p
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="text-[11px] font-mono uppercase tracking-[0.35em] text-slate-500 mb-8"
          >
            Contract Intelligence Platform
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="font-black leading-none text-white mb-6 select-none"
            style={{ fontSize: 'clamp(5rem, 12vw, 9rem)', letterSpacing: '-0.02em' }}
          >
            O.L.E.A.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="text-slate-400 font-light mb-5"
            style={{ fontSize: 'clamp(1rem, 2vw, 1.375rem)' }}
          >
            Oltek Logistics Extraction Automation
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="text-sm text-slate-600 max-w-lg leading-relaxed"
          >
            Intelligent PDF extraction for OLTK service contracts. Processes header
            fields, commodity declarations, and rate tables in under 3 seconds —
            entirely on-premise, at zero API cost.
          </motion.p>
        </div>

        {/* Bottom row: quick stats + scroll cue */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="relative flex items-end justify-between"
        >
          <div className="flex gap-10">
            {HERO_STATS.map(({ val, lbl }) => (
              <div key={lbl}>
                <div className="text-2xl font-bold font-mono text-white tracking-tight">{val}</div>
                <div className="text-[10px] text-slate-600 uppercase tracking-[0.15em] mt-1">{lbl}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center gap-1.5 text-slate-700 pb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest">Scroll</span>
            <ChevronDown size={14} style={{ animation: 'bounce-slow 2s ease-in-out infinite' }} />
          </div>
        </motion.div>
      </motion.div>

      {/* ── Below the fold: KPI cards + contracts table ──────────────── */}
      <div className="px-12 py-12 space-y-8">

        {/* Section label */}
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-[0.3em]">Portfolio Overview</span>
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: FileText,  label: 'Active Contracts',  value: '47',     sub: '↑ 3 from last quarter',  color: '34,211,238'  },
            { icon: Globe,     label: 'Trade Lanes',       value: '12',     sub: 'Pacific · Atlantic · All', color: '168,85,247' },
            { icon: BarChart3, label: 'Rate Rows Indexed', value: '18,432', sub: '≈ 392 rows / contract',   color: '52,211,153'  },
            { icon: Activity,  label: 'Avg. Confidence',   value: '98.2%',  sub: 'EXTRACTED across all',    color: '251,191,36'  },
          ].map(({ icon: Icon, label, value, sub, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="glass px-6 py-5 relative overflow-hidden"
              style={{ boxShadow: `0 0 0 1px rgba(${color},0.18), 0 4px 24px rgba(${color},0.07)` }}
            >
              <div className="absolute right-3 top-3 opacity-[0.04]"><Icon size={56} /></div>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
                   style={{ background: `rgba(${color},0.10)`, border: `1px solid rgba(${color},0.25)` }}>
                <Icon size={17} style={{ color: `rgb(${color})` }} />
              </div>
              <div className="text-2xl font-bold font-mono"
                   style={{ color: `rgb(${color})` }}>
                {value}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">{label}</div>
              <div className="text-[10px] text-slate-600 mt-1">{sub}</div>
            </motion.div>
          ))}
        </div>

        {/* Contracts table + trade distribution */}
        <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 268px' }}>

          {/* Contracts table */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass rounded-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4"
                 style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Recent Contracts</span>
              <span className="text-[11px] text-slate-600 font-mono">Sorted by date desc</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-slate-600"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <th className="px-6 py-3 text-left">Contract No.</th>
                  <th className="px-4 py-3 text-left">Shipper</th>
                  <th className="px-4 py-3 text-left">Lane</th>
                  <th className="px-4 py-3 text-right">Rate Rows</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_CONTRACTS.map((c, i) => (
                  <tr key={c.id} className="transition-colors hover:bg-white/[0.02]"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', animation: `fadeInUp 0.3s ${i * 0.04}s both` }}>
                    <td className="px-6 py-3.5">
                      <span className="font-mono font-medium text-slate-300">{c.id}</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 text-xs">{c.shipper}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(148,163,184,0.9)' }}>
                        {c.lane}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-500 text-xs">{c.rows.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-center">
                      {c.status === 'ACTIVE'   && <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-900/30 border border-emerald-800/50 text-emerald-400">Active</span>}
                      {c.status === 'EXPIRED'  && <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 border border-slate-700 text-slate-500">Expired</span>}
                      {c.status === 'EXPIRING' && <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-900/30 border border-amber-800/50 text-amber-400">Expiring</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}} @keyframes bounce-slow{0%,100%{transform:translateY(0)}50%{transform:translateY(4px)}}`}</style>
          </motion.div>

          {/* Trade distribution */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="glass rounded-2xl p-6 flex flex-col gap-5"
          >
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Trade Distribution</span>
            {TRADE_LANES.map(lane => (
              <div key={lane.code}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-300">{lane.code}</span>
                    <div className="text-[10px] text-slate-600 mt-0.5">{lane.label}</div>
                  </div>
                  <span className="text-xs font-mono text-slate-400">{lane.pct}%</span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${lane.pct}%` }}
                    transition={{ delay: 0.5, duration: 0.7, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: `rgba(${lane.color},0.6)` }}
                  />
                </div>
              </div>
            ))}
            <div className="mt-auto pt-4 grid grid-cols-2 gap-3"
                 style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              {[{ val: '47', lbl: 'Contracts' }, { val: '6', lbl: 'Carriers' }].map(({ val, lbl }) => (
                <div key={lbl} className="text-center">
                  <div className="text-lg font-bold font-mono text-white">{val}</div>
                  <div className="text-[10px] text-slate-600 uppercase tracking-widest">{lbl}</div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}
