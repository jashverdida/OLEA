import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Download, Eye, FileText, TrendingUp, Clock, CheckCircle } from 'lucide-react'

const HISTORY = [
  { id: 'ATL0347N25', shipper: 'Hayahai Co. Ltd',        carrier: 'OLTEK International', lane: 'NAWA WB', eff: '01 Jul 2025', exp: '30 Jun 2026', rows: 1385, conf: 98.4, ms: 1243, status: 'ACTIVE'   },
  { id: 'ATL0312N25', shipper: 'Greenfield Exports',     carrier: 'OLTEK International', lane: 'NAWA WB', eff: '01 Apr 2025', exp: '31 Mar 2026', rows: 1142, conf: 97.1, ms:  984, status: 'ACTIVE'   },
  { id: 'ATL0298N25', shipper: 'Meridian Cargo Partners',carrier: 'OLTEK Lines',         lane: 'TAEB',    eff: '15 Feb 2025', exp: '14 Feb 2026', rows:  876, conf: 94.8, ms: 1102, status: 'ACTIVE'   },
  { id: 'ATL0289N24', shipper: 'Pacific Rim Logistics',  carrier: 'OLTEK International', lane: 'ASWC EB', eff: '01 Jul 2024', exp: '30 Jun 2025', rows:  893, conf: 96.2, ms:  874, status: 'EXPIRED'  },
  { id: 'ATL0276N24', shipper: 'Global Trade Solutions', carrier: 'OLTEK International', lane: 'NAWA WB', eff: '01 Mar 2025', exp: '28 Feb 2026', rows: 1056, conf: 99.1, ms: 1356, status: 'ACTIVE'   },
  { id: 'ATL0263N24', shipper: 'BlueWave Freight Inc.',  carrier: 'OLTEK Lines',         lane: 'ASWC EB', eff: '01 Jan 2025', exp: '31 Mar 2026', rows:  741, conf: 91.3, ms:  763, status: 'ACTIVE'   },
  { id: 'ATL0251N24', shipper: 'Sunrise Manufacturing',  carrier: 'OLTEK International', lane: 'ASWC EB', eff: '01 Jun 2024', exp: '31 May 2025', rows:  768, conf: 95.6, ms:  892, status: 'EXPIRING' },
  { id: 'ATL0238N24', shipper: 'Delta Commodity Group',  carrier: 'OLTEK Shipping',      lane: 'TAEB',    eff: '15 Oct 2024', exp: '14 Oct 2025', rows:  520, conf: 88.9, ms:  641, status: 'EXPIRING' },
  { id: 'ATL0234N24', shipper: 'Atlantic Freight Corp',  carrier: 'OLTEK International', lane: 'TAEB',    eff: '01 Aug 2024', exp: '31 Jul 2025', rows:  634, conf: 97.8, ms:  711, status: 'ACTIVE'   },
  { id: 'ATL0219N23', shipper: 'Horizon Supply Chain',  carrier: 'OLTEK Lines',         lane: 'NAWA WB', eff: '01 Sep 2023', exp: '31 Aug 2024', rows: 1198, conf: 93.4, ms: 1487, status: 'EXPIRED'  },
  { id: 'ATL0204N23', shipper: 'Coastal Import Co.',    carrier: 'OLTEK International', lane: 'ASWC EB', eff: '01 Feb 2023', exp: '31 Jan 2024', rows:  445, conf: 90.1, ms:  532, status: 'EXPIRED'  },
  { id: 'ATL0191N23', shipper: 'Trans-Pacific Traders', carrier: 'OLTEK International', lane: 'NAWA WB', eff: '01 Oct 2023', exp: '30 Sep 2024', rows:  987, conf: 96.9, ms: 1021, status: 'EXPIRED'  },
]

const STATUS_STYLE = {
  ACTIVE:   { bg: 'bg-emerald-900/30', border: 'border-emerald-800/50', text: 'text-emerald-400', label: 'Active'   },
  EXPIRED:  { bg: 'bg-slate-800',      border: 'border-slate-700',      text: 'text-slate-500',   label: 'Expired'  },
  EXPIRING: { bg: 'bg-amber-900/30',   border: 'border-amber-800/50',   text: 'text-amber-400',   label: 'Expiring' },
}

const LANE_COLORS = {
  'NAWA WB': '34,211,238',
  'ASWC EB': '168,85,247',
  'TAEB':    '52,211,153',
}

const FILTERS = ['All', 'Active', 'Expiring', 'Expired']

export default function ContractHistory() {
  const [filter,  setFilter]  = useState('All')
  const [search,  setSearch]  = useState('')

  const visible = HISTORY.filter(c => {
    const matchesFilter = filter === 'All' || c.status === filter.toUpperCase()
    const q = search.toLowerCase()
    const matchesSearch = !q || c.id.toLowerCase().includes(q) || c.shipper.toLowerCase().includes(q) || c.lane.toLowerCase().includes(q)
    return matchesFilter && matchesSearch
  })

  const totalRows = HISTORY.reduce((s, c) => s + c.rows, 0)
  const avgConf   = (HISTORY.reduce((s, c) => s + c.conf, 0) / HISTORY.length).toFixed(1)
  const avgMs     = Math.round(HISTORY.reduce((s, c) => s + c.ms, 0) / HISTORY.length)

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: FileText,    label: 'Total Contracts',    value: String(HISTORY.length), color: '34,211,238'  },
          { icon: TrendingUp,  label: 'Rate Rows Indexed',  value: totalRows.toLocaleString(), color: '168,85,247' },
          { icon: CheckCircle, label: 'Avg. Confidence',    value: `${avgConf}%`, color: '52,211,153'  },
          { icon: Clock,       label: 'Avg. Process Time',  value: `${(avgMs/1000).toFixed(2)}s`, color: '251,191,36'  },
        ].map(({ icon: Icon, label, value, color }, i) => (
          <motion.div key={label}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="glass rounded-xl px-5 py-4 flex items-center gap-4"
            style={{ boxShadow: `0 0 0 1px rgba(${color},0.15)` }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                 style={{ background: `rgba(${color},0.1)`, border: `1px solid rgba(${color},0.25)` }}>
              <Icon size={16} style={{ color: `rgb(${color})` }} />
            </div>
            <div>
              <div className="text-xl font-bold font-mono" style={{ color: `rgb(${color})` }}>{value}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search + filter bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by ID, shipper, lane…"
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm text-slate-300 placeholder-slate-600 outline-none"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          />
        </div>
        <div className="flex items-center gap-1">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={filter === f
                ? { background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.35)', color: 'rgb(34,211,238)' }
                : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(148,163,184,0.7)' }
              }>{f}</button>
          ))}
        </div>
        <span className="text-[11px] text-slate-600 font-mono ml-auto">{visible.length} contracts</span>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-slate-600"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <th className="px-5 py-3 text-left">Contract</th>
              <th className="px-4 py-3 text-left">Shipper</th>
              <th className="px-4 py-3 text-left">Lane</th>
              <th className="px-4 py-3 text-left">Effective</th>
              <th className="px-4 py-3 text-left">Expires</th>
              <th className="px-4 py-3 text-right">Rate Rows</th>
              <th className="px-4 py-3 text-right">Confidence</th>
              <th className="px-4 py-3 text-right">Time</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((c, i) => {
              const st = STATUS_STYLE[c.status]
              const lc = LANE_COLORS[c.lane] || '148,163,184'
              const confColor = c.conf >= 96 ? '#4ade80' : c.conf >= 90 ? '#facc15' : '#f87171'
              return (
                <motion.tr key={c.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="transition-colors hover:bg-white/[0.02]"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td className="px-5 py-3.5">
                    <span className="font-mono font-semibold text-slate-200 text-xs">{c.id}</span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-400 text-xs max-w-[160px] truncate">{c.shipper}</td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                          style={{ background: `rgba(${lc},0.08)`, border: `1px solid rgba(${lc},0.2)`, color: `rgba(${lc},0.9)` }}>
                      {c.lane}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 text-xs font-mono">{c.eff}</td>
                  <td className="px-4 py-3.5 text-xs font-mono"
                      style={{ color: c.status === 'EXPIRING' ? 'rgba(251,191,36,0.8)' : 'rgba(100,116,139,0.8)' }}>
                    {c.exp}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-slate-400 text-xs">{c.rows.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-right font-mono text-xs font-semibold" style={{ color: confColor }}>
                    {c.conf}%
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-slate-500 text-xs">
                    {(c.ms / 1000).toFixed(2)}s
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${st.bg} ${st.border} ${st.text}`}>
                      {st.label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-2">
                      <button title="View" className="p-1.5 rounded-lg transition-colors hover:bg-white/[0.06]"
                              style={{ color: 'rgba(100,116,139,0.7)' }}>
                        <Eye size={13} />
                      </button>
                      <button title="Re-export" className="p-1.5 rounded-lg transition-colors hover:bg-white/[0.06]"
                              style={{ color: 'rgba(100,116,139,0.7)' }}>
                        <Download size={13} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>

        {visible.length === 0 && (
          <div className="py-16 flex flex-col items-center gap-3">
            <FileText size={32} className="text-slate-700" />
            <p className="text-slate-600 text-sm">No contracts match your filter.</p>
          </div>
        )}
      </div>

    </motion.div>
  )
}
