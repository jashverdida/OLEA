import { useState, useCallback } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, X } from 'lucide-react'

import Sidebar         from './components/Sidebar'
import StatsRow        from './components/StatsRow'
import UploadZone      from './components/UploadZone'
import ResultsDashboard from './components/ResultsDashboard'

/* ── Placeholder panels for non-active nav items ── */
function PlaceholderPanel({ title, description }) {
  return (
    <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
      className="flex flex-col items-center justify-center h-96 gap-4">
      <div className="text-5xl opacity-20">🚧</div>
      <h2 className="text-white font-semibold text-xl">{title}</h2>
      <p className="text-slate-500 text-sm max-w-md text-center">{description}</p>
    </motion.div>
  )
}

export default function App() {
  const [nav,          setNav]          = useState('extraction')
  const [appState,     setAppState]     = useState('idle')
  const [parseResult,  setParseResult]  = useState(null)
  const [editedData,   setEditedData]   = useState(null)
  const [errorMsg,     setErrorMsg]     = useState('')
  const [exportBusy,   setExportBusy]   = useState(false)

  /* ── Upload ─────────────────────────────────────────────── */
  const handleUpload = useCallback(async (file) => {
    setAppState('uploading')
    setErrorMsg('')
    const form = new FormData()
    form.append('file', file)
    try {
      const { data } = await axios.post('/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setParseResult(data)
      setEditedData(JSON.parse(JSON.stringify(data)))
      setAppState('results')
    } catch (err) {
      setErrorMsg(err?.response?.data?.detail || err?.message || 'Parsing failed.')
      setAppState('error')
    }
  }, [])

  /* ── Export ─────────────────────────────────────────────── */
  const handleExport = useCallback(async (payload) => {
    setExportBusy(true)
    try {
      const resp = await axios.post('/export', payload, { responseType: 'blob' })
      const cd   = resp.headers['content-disposition'] || ''
      const fn   = (cd.match(/filename="?([^"]+)"?/) || [])[1] || 'OLEA_export.xlsx'
      const url  = URL.createObjectURL(new Blob([resp.data]))
      const a    = Object.assign(document.createElement('a'), { href: url, download: fn })
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setErrorMsg('Export failed: ' + (err?.message || 'unknown'))
    } finally {
      setExportBusy(false)
    }
  }, [])

  /* ── Reset ──────────────────────────────────────────────── */
  const handleReset = useCallback(() => {
    setAppState('idle')
    setParseResult(null)
    setEditedData(null)
    setErrorMsg('')
  }, [])

  /* ── Body for active nav ────────────────────────────────── */
  const renderContent = () => {
    if (nav === 'dashboard') return (
      <PlaceholderPanel title="Dashboard" description="Overview metrics and contract summaries coming soon." />
    )
    if (nav === 'history') return (
      <PlaceholderPanel title="Contract History" description="Previously processed contracts and audit logs coming soon." />
    )
    if (nav === 'settings') return (
      <PlaceholderPanel title="Settings" description="Parser configuration and output template management coming soon." />
    )

    /* Extraction Engine */
    if (appState === 'uploading') return (
      <div className="flex flex-col items-center justify-center h-80 gap-6">
        <div className="w-14 h-14 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <div className="text-center">
          <p className="text-slate-300 font-semibold">Sending to parser…</p>
          <p className="text-slate-600 text-sm mt-1">Running pdfplumber + regex engine locally</p>
          <p className="text-cyan-600 text-xs mt-2 font-mono">API Cost: $0.00</p>
        </div>
      </div>
    )
    if (appState === 'results' && editedData) return (
      <ResultsDashboard
        data={editedData}
        rawData={parseResult}
        onExport={handleExport}
        onReset={handleReset}
        exportBusy={exportBusy}
      />
    )
    if (appState === 'error') return (
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
        className="flex flex-col items-center justify-center h-80 gap-5">
        <div className="text-5xl">⚠️</div>
        <p className="text-red-400 font-semibold text-lg">Parsing Error</p>
        <p className="text-slate-500 text-sm max-w-md text-center">{errorMsg}</p>
        <button onClick={handleReset} className="btn-cyan mt-2">Try Again</button>
      </motion.div>
    )
    return <UploadZone onUpload={handleUpload} />
  }

  return (
    <div className="relative flex h-screen overflow-hidden bg-[#050810]">

      {/* ── Animated background ─────────────────────── */}
      <div className="bg-orbs" aria-hidden>
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>
      <div className="bg-grid" aria-hidden />

      {/* ── Sidebar ─────────────────────────────────── */}
      <Sidebar active={nav} onNav={(id) => { setNav(id); if (id === 'extraction') handleReset() }} />

      {/* ── Main area ───────────────────────────────── */}
      <div className="relative z-10 flex flex-col flex-1 ml-[72px] overflow-hidden">

        {/* Top bar */}
        <header className="flex-shrink-0 flex items-center justify-between px-8 py-4"
                style={{
                  background: 'rgba(5,8,16,0.75)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 1px 0 rgba(34,211,238,0.15), 0 2px 0 rgba(168,85,247,0.06)',
                }}>
          <div>
            <h1 className="text-gradient-title font-black text-lg tracking-tight leading-none">
              O.L.E.A.
            </h1>
            <p className="text-slate-500 text-[11px] font-mono mt-0.5">Oltek Logistics Extraction Automation</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
               style={{ background:'rgba(52,211,153,0.10)', border:'1px solid rgba(52,211,153,0.25)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                  style={{ animation:'dot-pulse 2s ease-in-out infinite', boxShadow:'0 0 6px rgba(52,211,153,0.9)' }} />
            <span className="text-emerald-300 text-xs font-semibold tracking-wide">Local Engine Online</span>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto px-8 py-8">

          {/* Stats row — always visible */}
          <div className="mb-8">
            <StatsRow />
          </div>

          <div className="mb-8" style={{ height:'1px', background:'linear-gradient(90deg, transparent 0%, rgba(34,211,238,0.4) 30%, rgba(168,85,247,0.4) 70%, transparent 100%)' }} />

          {/* Nav section heading */}
          <div className="mb-6 flex items-center gap-3">
            <div className="w-1 h-5 rounded-full"
                 style={{ background:'linear-gradient(180deg, #22d3ee, #a855f7)', boxShadow:'0 0 10px rgba(34,211,238,0.6)' }} />
            <h2 className="text-sm font-bold text-gradient-cyan uppercase tracking-widest">
              {nav === 'extraction' ? 'Extraction Engine' :
               nav === 'dashboard'  ? 'Dashboard'         :
               nav === 'history'    ? 'Contract History'  : 'Settings'}
            </h2>
          </div>

          {/* Main panel with error toast */}
          <AnimatePresence>
            {errorMsg && appState !== 'error' && (
              <motion.div
                initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
                className="flex items-center gap-3 mb-5 px-4 py-3 rounded-xl text-sm text-red-300"
                style={{ background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.3)' }}
              >
                <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                <span className="flex-1">{errorMsg}</span>
                <button onClick={() => setErrorMsg('')}><X size={14} /></button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div key={`${nav}-${appState}`}
              initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
              exit={{ opacity:0 }} transition={{ duration:0.2 }}>
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
