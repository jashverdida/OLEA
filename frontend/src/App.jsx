import { useState, useCallback, useRef, useEffect } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, X } from 'lucide-react'

import Sidebar         from './components/Sidebar'
import StatsRow        from './components/StatsRow'
import UploadZone      from './components/UploadZone'
import ResultsDashboard from './components/ResultsDashboard'
import DashboardPanel  from './components/DashboardPanel'
import ContractHistory from './components/ContractHistory'
import SettingsPanel   from './components/SettingsPanel'

import LoginPage from './components/LoginPage'
import RegisterPage from './components/RegisterPage'
import ForgotPasswordPage from './components/ForgotPasswordPage'

export default function App() {
  const [nav,          setNav]          = useState('extraction')
  const [appState,     setAppState]     = useState('idle')
  const [parseResult,  setParseResult]  = useState(null)
  const [editedData,   setEditedData]   = useState(null)
  const [errorMsg,     setErrorMsg]     = useState('')
  const [exportBusy,   setExportBusy]   = useState(false)
  const [dashScrolled, setDashScrolled] = useState(false)
  const [authPage, setAuthPage] = useState('login'); // 'login' | 'register' | 'forgot'
  const [isAuth, setIsAuth] = useState(false); // fake auth state for demo
  const [showLogoutPopover, setShowLogoutPopover] = useState(false);
  const logoutBtnRef = useRef(null);
  const popoverRef = useRef(null);

  // Click outside to close popover
  useEffect(() => {
    if (!showLogoutPopover) return;
    function handleClick(e) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        logoutBtnRef.current &&
        !logoutBtnRef.current.contains(e.target)
      ) {
        setShowLogoutPopover(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showLogoutPopover]);
  const mainRef = useRef(null)

  // Logout handler
  const handleLogout = () => {
    setIsAuth(false);
    setAuthPage('login');
    setShowLogoutModal(false);
  }

  /* Reset scroll + header state whenever the nav tab changes */
  useEffect(() => {
    setDashScrolled(false)
    if (mainRef.current) mainRef.current.scrollTop = 0
  }, [nav])

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

  /* ── Header field edit ──────────────────────────────────── */
  const handleHeaderEdit = useCallback((key, value) => {
    setEditedData(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      if (next.header[key]) {
        next.header[key].value      = value
        next.header[key].status     = 'EXTRACTED'
        next.header[key].confidence = 1.0
      }
      return next
    })
  }, [])

  /* ── Rate row edit ───────────────────────────────────────── */
  const handleRateEdit = useCallback((idx, col, value) => {
    setEditedData(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      if (next.rate_records[idx]?.[col]) {
        next.rate_records[idx][col].value      = value
        next.rate_records[idx][col].status     = 'EXTRACTED'
        next.rate_records[idx][col].confidence = 1.0
      }
      return next
    })
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

  /* ── Dashboard scroll tracking ───────────────────────────── */
  const handleMainScroll = useCallback((e) => {
    setDashScrolled(e.currentTarget.scrollTop > 72)
  }, [])


  // ── Auth Pages ──
  if (!isAuth) {
    if (authPage === 'login') {
      return <LoginPage onNavigate={page => setAuthPage(page)} onLogin={() => setIsAuth(true)} />;
    }
    if (authPage === 'register') {
      return <RegisterPage onNavigate={page => setAuthPage(page)} />;
    }
    if (authPage === 'forgot') {
      return <ForgotPasswordPage onNavigate={page => setAuthPage(page)} />;
    }
  }

  // ── Main App Content ──
  const renderContent = () => {
    if (nav === 'dashboard') return <DashboardPanel />
    if (nav === 'history')  return <ContractHistory />
    if (nav === 'settings') return <SettingsPanel />

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
        onHeaderEdit={handleHeaderEdit}
        onRateEdit={handleRateEdit}
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

  const isDash = nav === 'dashboard'

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

        {/* Top bar — fixed overlay on Dashboard, normal flow elsewhere */}
        <header
          className={`flex items-center justify-between px-8 py-4 z-20 ${isDash ? 'absolute inset-x-0 top-0' : 'flex-shrink-0'}`}
          style={{
            background: 'rgba(5,8,16,0.88)',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 1px 0 rgba(34,211,238,0.12)',
            ...(isDash && {
              transform: dashScrolled ? 'translateY(0)' : 'translateY(-110%)',
              transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }),
          }}
        >
          <div>
            <h1 className="text-gradient-title font-black text-lg tracking-tight leading-none">
              O.L.E.A.
            </h1>
            <p className="text-slate-500 text-[11px] font-mono mt-0.5">Oltek Logistics Extraction Automation</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Status badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                 style={{ background:'rgba(52,211,153,0.10)', border:'1px solid rgba(52,211,153,0.25)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                    style={{ animation:'dot-pulse 2s ease-in-out infinite', boxShadow:'0 0 6px rgba(52,211,153,0.9)' }} />
              <span className="text-emerald-300 text-xs font-semibold tracking-wide">Local Engine Online</span>
            </div>
            {/* Logout button */}
            <div className="relative">
              <button
                ref={logoutBtnRef}
                onClick={() => setShowLogoutPopover(v => !v)}
                className="px-4 py-1.5 rounded-lg font-semibold text-sm border border-red-500 text-red-300 bg-transparent hover:bg-red-900/30 hover:text-white transition-colors shadow-sm"
                style={{ minWidth: 90 }}
              >
                Logout
              </button>
              {/* Logout Popover */}
              {showLogoutPopover && (
                <div
                  ref={popoverRef}
                  className="absolute right-0 mt-2 w-64 bg-[#101624] border border-[var(--border)] rounded-lg shadow-2xl z-50 flex flex-col items-stretch animate-fadein"
                  style={{ top: '100%' }}
                >
                  <div className="px-5 pt-4 pb-3 text-base font-normal text-slate-100 text-center select-none" style={{fontWeight: 500}}>
                    Are you sure you want to logout?
                  </div>
                  <div className="flex flex-row gap-3 px-4 pb-4">
                    <button
                      onClick={handleLogout}
                      className="flex-1 py-2 rounded-md font-semibold text-sm bg-emerald-400 text-[#101624] hover:bg-emerald-300 transition-colors border-none shadow"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setShowLogoutPopover(false)}
                      className="flex-1 py-2 rounded-md font-medium text-sm border border-[var(--border)] text-slate-200 bg-transparent hover:bg-slate-700/40 transition-colors shadow-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Scrollable content — no padding on dashboard (hero is full-bleed) */}
        <main
          ref={mainRef}
          className={`flex-1 overflow-y-auto ${isDash ? '' : 'px-8 py-8'}`}
          onScroll={handleMainScroll}
        >

          {/* Stats row — visible on extraction/history/settings only */}
          {!isDash && (
            <div className="mb-8">
              <StatsRow />
            </div>
          )}

          {!isDash && (
            <div className="mb-8" style={{ height:'1px', background:'linear-gradient(90deg, transparent 0%, rgba(34,211,238,0.4) 30%, rgba(168,85,247,0.4) 70%, transparent 100%)' }} />
          )}

          {/* Nav section heading */}
          {!isDash && (
            <div className="mb-6 flex items-center gap-3">
              <div className="w-1 h-5 rounded-full"
                   style={{ background:'linear-gradient(180deg, #22d3ee, #a855f7)', boxShadow:'0 0 10px rgba(34,211,238,0.6)' }} />
              <h2 className="text-sm font-bold text-gradient-cyan uppercase tracking-widest">
                {nav === 'extraction' ? 'Extraction Engine' :
                 nav === 'history'    ? 'Contract History'  : 'Settings'}
              </h2>
            </div>
          )}

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

          {/* Footer — non-dashboard pages */}
          {!isDash && (
            <div className="mt-16 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex flex-col items-center gap-5">
                <p className="text-[11px] font-mono uppercase tracking-[0.4em] text-slate-700 text-center">
                  Precision Extraction. Zero Cost. Total Control.
                </p>
                <div className="w-full flex items-center gap-5">
                  <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05))' }} />
                  <span className="text-[10px] font-mono font-bold tracking-[0.3em] text-slate-700">O.L.E.A.</span>
                  <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.05), transparent)' }} />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <p className="text-[11px] text-slate-600 font-mono">
                    Built with precision by{' '}
                    <span className="text-slate-500 font-semibold">Team JAE</span>
                  </p>
                  <div className="flex items-center gap-4 text-[10px] font-mono text-slate-700">
                    <span>Jashmine Verdida</span>
                    <span className="w-px h-3 bg-slate-800" />
                    <span>Eijay Pepito</span>
                  </div>
                  <p className="text-[9px] font-mono text-slate-800 mt-1 uppercase tracking-widest">
                    © 2026 OLTEK Group · All rights reserved
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
