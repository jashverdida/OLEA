import { motion } from 'framer-motion'
import { FileText, Globe, BarChart3, Activity, Ship } from 'lucide-react'

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

function KPICard({ icon: Icon, label, value, sub, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass px-6 py-5 relative overflow-hidden"
      style={{ boxShadow: `0 0 0 1px rgba(${color},0.20), 0 4px 24px rgba(${color},0.08)` }}
    >
      <div className="absolute right-3 top-3 opacity-[0.05]"><Icon size={60} /></div>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
           style={{ background: `rgba(${color},0.12)`, border: `1px solid rgba(${color},0.3)` }}>
        <Icon size={20} style={{ color: `rgb(${color})` }} />
      </div>
      <div className="text-2xl font-bold font-mono"
           style={{ color: `rgb(${color})`, textShadow: `0 0 20px rgba(${color},0.4)` }}>
        {value}
      </div>
      <div className="text-xs text-slate-400 mt-0.5">{label}</div>
      {sub && <div className="text-[10px] text-slate-600 mt-1">{sub}</div>}
    </motion.div>
  )
}

export default function DashboardPanel() {
  return (
    <div className="space-y-6">

      {/* Hero banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl px-8 py-7 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(34,211,238,0.07) 0%, rgba(168,85,247,0.07) 100%)',
          border: '1px solid rgba(34,211,238,0.18)',
          boxShadow: '0 0 60px rgba(168,85,247,0.06)',
        }}
      >
        {/* Decorative route lines */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          {[22, 45, 68, 88].map(y => (
            <div key={y} className="absolute h-px" style={{
              top: `${y}%`, left: 0, right: 0,
              background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.07) 20%, rgba(34,211,238,0.12) 50%, rgba(168,85,247,0.07) 80%, transparent)',
            }} />
          ))}
          <div className="absolute right-10 top-4 w-44 h-44 rounded-full"
               style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.07) 0%, transparent 70%)' }} />
          <div className="absolute right-28 bottom-0 w-28 h-28 rounded-full"
               style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 70%)' }} />
        </div>

        <div className="relative flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Ship size={16} style={{ color: 'rgba(34,211,238,0.7)' }} />
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-widest">Platform Overview</span>
            </div>
            <h2 className="text-2xl font-black text-gradient-title mb-1">
              OLTEK Logistics Intelligence
            </h2>
            <p className="text-slate-400 text-sm">
              Westbound &amp; Eastbound service contracts · Pacific &amp; Atlantic trade lanes · FY 2024–2026
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                 style={{ background: 'rgba(52,211,153,0.10)', border: '1px solid rgba(52,211,153,0.25)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                    style={{ animation: 'dot-pulse 2s ease-in-out infinite', boxShadow: '0 0 6px rgba(52,211,153,0.9)' }} />
              <span className="text-emerald-300 text-xs font-semibold">All Systems Operational</span>
            </div>
            <span className="text-slate-600 text-[11px] font-mono">Last synced: Mar 2026</span>
          </div>
        </div>
      </motion.div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={FileText}  label="Active Contracts"  value="47"     sub="↑ 3 from last quarter"  color="34,211,238"  delay={0.05} />
        <KPICard icon={Globe}     label="Trade Lanes"       value="12"     sub="Pacific · Atlantic · All" color="168,85,247" delay={0.10} />
        <KPICard icon={BarChart3} label="Rate Rows Indexed" value="18,432" sub="≈ 392 rows / contract"   color="52,211,153"  delay={0.15} />
        <KPICard icon={Activity}  label="Avg. Confidence"   value="98.2%"  sub="EXTRACTED across all"   color="251,191,36"  delay={0.20} />
      </div>

      {/* Body: contracts table + trade lane breakdown */}
      <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 280px' }}>

        {/* Recent contracts table */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass rounded-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4"
               style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Contracts</h3>
            <span className="text-[11px] text-slate-500 font-mono">Sorted by date desc</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-slate-600"
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
                  <tr key={c.id}
                      className="transition-colors hover:bg-white/[0.02]"
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.03)',
                        animation: `fadeInUp 0.3s ${i * 0.05}s both`,
                      }}>
                    <td className="px-6 py-3.5">
                      <span className="font-mono font-medium" style={{ color: 'rgba(34,211,238,0.9)' }}>{c.id}</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-300">{c.shipper}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono"
                            style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)', color: 'rgba(34,211,238,0.9)' }}>
                        {c.lane}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-400">{c.rows.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-center">
                      {c.status === 'ACTIVE'   && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-900/40 border border-green-700/50 text-green-300">Active</span>}
                      {c.status === 'EXPIRED'  && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-800 border border-gray-700 text-slate-400">Expired</span>}
                      {c.status === 'EXPIRING' && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-900/40 border border-yellow-700/50 text-yellow-300">Expiring</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <style>{`@keyframes fadeInUp { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:none } }`}</style>
        </motion.div>

        {/* Trade lane breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass rounded-2xl p-6 flex flex-col gap-5"
        >
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Trade Distribution</h3>

          {TRADE_LANES.map(lane => (
            <div key={lane.code}>
              <div className="flex items-center justify-between mb-1.5">
                <div>
                  <span className="text-xs font-mono font-bold" style={{ color: `rgb(${lane.color})` }}>{lane.code}</span>
                  <span className="text-[10px] text-slate-600 ml-2">{lane.label}</span>
                </div>
                <span className="text-xs font-bold font-mono" style={{ color: `rgb(${lane.color})` }}>{lane.pct}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${lane.pct}%` }}
                  transition={{ delay: 0.4, duration: 0.7, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, rgba(${lane.color},0.9), rgba(${lane.color},0.4))`,
                    boxShadow: `0 0 8px rgba(${lane.color},0.5)`,
                  }}
                />
              </div>
            </div>
          ))}

          {/* Footer summary */}
          <div className="mt-auto pt-4 grid grid-cols-2 gap-3"
               style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              { val: '47', lbl: 'Contracts' },
              { val: '6',  lbl: 'Carriers'  },
            ].map(({ val, lbl }) => (
              <div key={lbl} className="text-center">
                <div className="text-lg font-bold font-mono text-white">{val}</div>
                <div className="text-[10px] text-slate-600 uppercase tracking-wider">{lbl}</div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  )
}
