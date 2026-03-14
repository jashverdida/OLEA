import { useState } from 'react'
import { motion } from 'framer-motion'
import { Cpu, FileOutput, Bell, Database, Info, ToggleLeft, ToggleRight } from 'lucide-react'

function Section({ icon: Icon, title, color, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl overflow-hidden"
      style={{ boxShadow: `0 0 0 1px rgba(${color},0.1)` }}
    >
      <div className="flex items-center gap-3 px-6 py-4"
           style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: `rgba(${color},0.04)` }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
             style={{ background: `rgba(${color},0.12)`, border: `1px solid rgba(${color},0.25)` }}>
          <Icon size={14} style={{ color: `rgb(${color})` }} />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: `rgba(${color},0.8)` }}>
          {title}
        </span>
      </div>
      <div className="px-6 py-5 space-y-5">{children}</div>
    </motion.div>
  )
}

function Toggle({ label, sub, value, onChange, color = '34,211,238' }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-300">{label}</p>
        {sub && <p className="text-[11px] text-slate-600 mt-0.5">{sub}</p>}
      </div>
      <button onClick={() => onChange(!value)} className="flex-shrink-0 ml-4">
        {value
          ? <ToggleRight size={28} style={{ color: `rgb(${color})` }} />
          : <ToggleLeft  size={28} className="text-slate-700" />
        }
      </button>
    </div>
  )
}

function SliderRow({ label, sub, value, onChange, min, max, unit, color = '34,211,238' }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-sm text-slate-300">{label}</p>
          {sub && <p className="text-[11px] text-slate-600 mt-0.5">{sub}</p>}
        </div>
        <span className="text-sm font-mono font-semibold" style={{ color: `rgb(${color})` }}>
          {value}{unit}
        </span>
      </div>
      <input type="range" min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ accentColor: `rgb(${color})`, background: `linear-gradient(to right, rgb(${color}) ${((value-min)/(max-min))*100}%, rgba(255,255,255,0.07) 0%)` }}
      />
      <div className="flex justify-between text-[10px] text-slate-700 font-mono mt-1">
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  )
}

function SelectRow({ label, sub, value, onChange, options }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-300">{label}</p>
        {sub && <p className="text-[11px] text-slate-600 mt-0.5">{sub}</p>}
      </div>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="ml-4 text-xs font-mono text-slate-300 rounded-lg px-3 py-1.5 outline-none cursor-pointer"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
        {options.map(o => <option key={o} value={o} style={{ background: '#0d1117' }}>{o}</option>)}
      </select>
    </div>
  )
}

const EXPORT_COLUMNS = [
  'Carrier', 'Contract ID', 'effective_date', 'expiration_date',
  'commodity', 'destination_city', 'destination_via_city',
  'service', 'Remarks', 'Scope',
  'BaseRate 20', 'BaseRate 40', 'BaseRate 40H', 'BaseRate 45',
]

export default function SettingsPanel() {
  const [engine,      setEngine]      = useState('PyMuPDF (fitz)')
  const [confThresh,  setConfThresh]  = useState(85)
  const [yBucket,     setYBucket]     = useState(3)
  const [verboseLog,  setVerboseLog]  = useState(false)
  const [autoExport,  setAutoExport]  = useState(false)
  const [filenameTPL, setFilenameTPL] = useState('{contract_id}_extracted')
  const [alertDays,   setAlertDays]   = useState(30)
  const [alertExpiry, setAlertExpiry] = useState(true)
  const [alertLow,    setAlertLow]    = useState(true)
  const [cols,        setCols]        = useState(new Set(EXPORT_COLUMNS))

  const toggleCol = (col) => {
    setCols(prev => { const n = new Set(prev); n.has(col) ? n.delete(col) : n.add(col); return n })
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 max-w-3xl">

      {/* Parser Configuration */}
      <Section icon={Cpu} title="Parser Configuration" color="34,211,238">
        <SelectRow
          label="Extraction Engine"
          sub="Primary PDF text extraction library"
          value={engine} onChange={setEngine}
          options={['PyMuPDF (fitz)', 'pdfplumber (fallback)']}
        />
        <div className="h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
        <SliderRow
          label="Confidence Threshold"
          sub="Fields below this value are flagged as PARTIAL"
          value={confThresh} onChange={setConfThresh}
          min={50} max={100} unit="%" color="34,211,238"
        />
        <div className="h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
        <SliderRow
          label="Y-Bucket Size"
          sub="Word grouping tolerance for multi-column table reconstruction (pts)"
          value={yBucket} onChange={setYBucket}
          min={1} max={8} unit=" pt" color="34,211,238"
        />
        <div className="h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
        <Toggle
          label="Verbose Parsing Log"
          sub="Print regex match trace to backend console"
          value={verboseLog} onChange={setVerboseLog}
        />
      </Section>

      {/* Export Template */}
      <Section icon={FileOutput} title="Export Template" color="168,85,247">
        <div>
          <p className="text-sm text-slate-300 mb-1">Output Filename Pattern</p>
          <p className="text-[11px] text-slate-600 mb-2">Variables: {'{contract_id}'}, {'{date}'}, {'{shipper}'}</p>
          <input value={filenameTPL} onChange={e => setFilenameTPL(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm font-mono text-slate-300 outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
          />
          <p className="text-[10px] text-slate-700 mt-1.5 font-mono">Preview: ATL0347N25_extracted.xlsx</p>
        </div>
        <div className="h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
        <Toggle
          label="Auto-export on scan complete"
          sub="Immediately download .xlsx without clicking Export"
          value={autoExport} onChange={setAutoExport} color="168,85,247"
        />
        <div className="h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
        <div>
          <p className="text-sm text-slate-300 mb-1">Output Columns</p>
          <p className="text-[11px] text-slate-600 mb-3">Toggle columns included in every export</p>
          <div className="grid grid-cols-2 gap-2">
            {EXPORT_COLUMNS.map(col => (
              <label key={col} className="flex items-center gap-2.5 cursor-pointer group">
                <div onClick={() => toggleCol(col)}
                  className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all"
                  style={cols.has(col)
                    ? { background: 'rgba(168,85,247,0.3)', border: '1px solid rgba(168,85,247,0.7)' }
                    : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }
                  }>
                  {cols.has(col) && <span style={{ color: 'rgb(168,85,247)', fontSize: '10px', lineHeight: 1 }}>✓</span>}
                </div>
                <span className="text-xs font-mono" style={{ color: cols.has(col) ? 'rgba(203,213,225,0.9)' : 'rgba(100,116,139,0.6)' }}>
                  {col}
                </span>
              </label>
            ))}
          </div>
        </div>
      </Section>

      {/* Notifications */}
      <Section icon={Bell} title="Alerts" color="251,191,36">
        <Toggle
          label="Contract Expiry Alerts"
          sub="Highlight contracts approaching their expiration date"
          value={alertExpiry} onChange={setAlertExpiry} color="251,191,36"
        />
        <div className="h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
        <SliderRow
          label="Alert Window"
          sub="Flag contracts expiring within this many days"
          value={alertDays} onChange={setAlertDays}
          min={7} max={90} unit=" days" color="251,191,36"
        />
        <div className="h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
        <Toggle
          label="Low Confidence Warnings"
          sub={`Warn when extraction confidence falls below ${confThresh}%`}
          value={alertLow} onChange={setAlertLow} color="251,191,36"
        />
      </Section>

      {/* System Info */}
      <Section icon={Info} title="System Information" color="52,211,153">
        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
          {[
            ['Extraction Engine',    'PyMuPDF 1.24 (fitz)'],
            ['Fallback Engine',      'pdfplumber 0.11'],
            ['Processing Mode',      'Local · On-premise'],
            ['API Cost per Run',     '$0.00'],
            ['Data Leaves Network',  'Never'],
            ['O.L.E.A. Version',     'v1.0.0'],
            ['Backend Framework',    'FastAPI 0.111'],
            ['Frontend Framework',   'React 18 + Vite 6'],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-[10px] text-slate-600 uppercase tracking-wider">{k}</p>
              <p className="text-xs font-mono text-slate-300 mt-0.5">{v}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Data Management */}
      <Section icon={Database} title="Data Management" color="148,163,184">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-300">Export Audit Log</p>
            <p className="text-[11px] text-slate-600 mt-0.5">Download a CSV of all extraction events</p>
          </div>
          <button className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(148,163,184,0.8)' }}>
            Export CSV
          </button>
        </div>
        <div className="h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-300">Clear Contract History</p>
            <p className="text-[11px] text-slate-600 mt-0.5">Remove all locally stored extraction records</p>
          </div>
          <button className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', color: 'rgba(248,113,113,0.8)' }}>
            Clear All
          </button>
        </div>
      </Section>

    </motion.div>
  )
}
