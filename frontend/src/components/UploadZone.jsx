import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, AlertCircle, Layers, CheckCircle, Clock, Zap, X } from 'lucide-react'

/* Simulate per-file results for batch mode */
function mockResult() {
  return {
    rows: Math.floor(Math.random() * 700 + 700),
    ms:   Math.floor(Math.random() * 700 + 800),
    conf: (Math.random() * 7 + 92).toFixed(1),
  }
}

/* ── Batch queue row ───────────────────────────────────────────────── */
function QueueRow({ item, index }) {
  const statusMap = {
    queued:     { label: 'Queued',     color: '100,116,139',  bg: 'rgba(100,116,139,0.08)', border: 'rgba(100,116,139,0.2)'  },
    processing: { label: 'Processing', color: '34,211,238',   bg: 'rgba(34,211,238,0.08)',  border: 'rgba(34,211,238,0.35)'  },
    done:       { label: 'Complete',   color: '52,211,153',   bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.3)'   },
    error:      { label: 'Error',      color: '248,113,113',  bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.3)'  },
  }
  const s = statusMap[item.status]

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{ background: s.bg, border: `1px solid ${s.border}` }}
    >
      {/* Icon */}
      <div className="flex-shrink-0">
        {item.status === 'done' ? (
          <CheckCircle size={16} style={{ color: `rgb(${s.color})` }} />
        ) : item.status === 'processing' ? (
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
            <Zap size={16} style={{ color: `rgb(${s.color})` }} />
          </motion.div>
        ) : (
          <FileText size={16} style={{ color: `rgb(${s.color})` }} />
        )}
      </div>

      {/* Filename */}
      <span className="flex-1 text-xs font-mono truncate" style={{ color: 'rgba(203,213,225,0.85)' }}>
        {item.file.name}
      </span>

      {/* Size */}
      <span className="text-[10px] font-mono text-slate-600 flex-shrink-0">
        {(item.file.size / 1024).toFixed(0)} KB
      </span>

      {/* Processing bar (only while processing) */}
      {item.status === 'processing' && (
        <div className="w-20 h-1 rounded-full overflow-hidden flex-shrink-0"
             style={{ background: 'rgba(255,255,255,0.07)' }}>
          <motion.div className="h-full rounded-full"
            style={{ background: `rgb(${s.color})` }}
            initial={{ width: '0%' }} animate={{ width: '100%' }}
            transition={{ duration: 1.4, ease: 'easeInOut' }}
          />
        </div>
      )}

      {/* Done stats */}
      {item.status === 'done' && item.result && (
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-[10px] font-mono text-slate-500">{item.result.rows.toLocaleString()} rows</span>
          <span className="text-[10px] font-mono text-slate-600">{(item.result.ms / 1000).toFixed(2)}s</span>
          <span className="text-[10px] font-mono font-semibold" style={{ color: '#4ade80' }}>
            {item.result.conf}%
          </span>
        </div>
      )}

      {/* Status badge */}
      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0"
            style={{ color: `rgb(${s.color})`, background: s.bg, border: `1px solid ${s.border}` }}>
        {s.label}
      </span>
    </motion.div>
  )
}

/* ── Main component ────────────────────────────────────────────────── */
export default function UploadZone({ onUpload }) {
  const [isDragging, setIsDragging]   = useState(false)
  const [scanning,   setScanning]     = useState(false)
  const [scanFile,   setScanFile]     = useState(null)
  const [fileError,  setFileError]    = useState('')
  const [batchMode,  setBatchMode]    = useState(false)
  const [queue,      setQueue]        = useState([])   // { id, file, status, result? }
  const [batchRunning, setBatchRunning] = useState(false)
  const [batchDone,    setBatchDone]    = useState(false)
  const inputRef  = useRef(null)

  /* ── Single-mode helpers ── */
  const validate = (file) => {
    if (!file) return 'No file selected.'
    if (!file.name.toLowerCase().endsWith('.pdf')) return 'Only PDF files are accepted.'
    if (file.size > 50 * 1024 * 1024) return 'File exceeds 50 MB limit.'
    return null
  }

  const submit = useCallback((file) => {
    const err = validate(file)
    if (err) { setFileError(err); return }
    setFileError('')
    setScanFile(file)
    setScanning(true)
    setTimeout(() => { setScanning(false); onUpload(file) }, 2000)
  }, [onUpload])

  const onDrop = useCallback((e) => {
    e.preventDefault(); setIsDragging(false)
    if (batchMode) {
      const files = [...e.dataTransfer.files].filter(f => f.name.toLowerCase().endsWith('.pdf'))
      if (!files.length) return
      setQueue(prev => [...prev, ...files.map(f => ({ id: crypto.randomUUID(), file: f, status: 'queued' }))])
      setBatchDone(false)
    } else {
      submit(e.dataTransfer.files?.[0])
    }
  }, [batchMode, submit])

  const addBatchFiles = (fileList) => {
    const files = [...fileList].filter(f => f.name.toLowerCase().endsWith('.pdf'))
    if (!files.length) return
    setQueue(prev => [...prev, ...files.map(f => ({ id: crypto.randomUUID(), file: f, status: 'queued' }))])
    setBatchDone(false)
  }

  const removeQueued = (id) => setQueue(prev => prev.filter(i => i.id !== id))

  /* ── Batch run simulation ── */
  const runBatch = async () => {
    if (!queue.length || batchRunning) return
    setBatchRunning(true)
    setBatchDone(false)
    for (const item of queue) {
      if (item.status === 'done') continue
      setQueue(prev => prev.map(i => i.id === item.id ? { ...i, status: 'processing' } : i))
      await new Promise(r => setTimeout(r, 1400 + Math.random() * 600))
      setQueue(prev => prev.map(i => i.id === item.id ? { ...i, status: 'done', result: mockResult() } : i))
    }
    setBatchRunning(false)
    setBatchDone(true)
  }

  const resetBatch = () => { setQueue([]); setBatchDone(false); setBatchRunning(false) }

  /* ── Derived batch stats ── */
  const doneItems    = queue.filter(i => i.status === 'done')
  const totalRows    = doneItems.reduce((s, i) => s + (i.result?.rows ?? 0), 0)
  const totalMs      = doneItems.reduce((s, i) => s + (i.result?.ms  ?? 0), 0)
  const avgConf      = doneItems.length
    ? (doneItems.reduce((s, i) => s + parseFloat(i.result?.conf ?? 0), 0) / doneItems.length).toFixed(1)
    : '—'

  /* ── Toggle handler ── */
  const handleToggle = () => {
    setBatchMode(v => !v)
    setQueue([]); setBatchDone(false); setBatchRunning(false); setFileError('')
  }

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-3xl mx-auto">

      {/* Heading */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-3">Extraction Engine</h2>
        <p className="text-slate-400 text-base max-w-lg mx-auto leading-relaxed">
          Drop a Digital Service Contract PDF.
        </p>
      </div>

      {/* ── Batch Mode Toggle ───────────────────────────────────────── */}
      <div className="w-full flex items-center justify-between px-5 py-4 rounded-2xl"
           style={{
             background: batchMode ? 'rgba(168,85,247,0.06)' : 'rgba(255,255,255,0.02)',
             border: `1px solid ${batchMode ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.07)'}`,
             transition: 'all 0.3s ease',
           }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
               style={{ background: batchMode ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${batchMode ? 'rgba(168,85,247,0.4)' : 'rgba(255,255,255,0.08)'}` }}>
            <Layers size={15} style={{ color: batchMode ? 'rgb(168,85,247)' : 'rgba(100,116,139,0.7)' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-200">Batch Processing</span>
              <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.35)', color: 'rgba(168,85,247,0.9)' }}>
                BETA
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Process multiple contracts in a single run — zero extra cost
            </p>
          </div>
        </div>

        {/* Toggle pill */}
        <button onClick={handleToggle} className="relative flex-shrink-0 w-12 h-6 rounded-full transition-all duration-300"
                style={{ background: batchMode ? 'rgba(168,85,247,0.8)' : 'rgba(255,255,255,0.1)', boxShadow: batchMode ? '0 0 12px rgba(168,85,247,0.5)' : 'none' }}>
          <motion.div animate={{ x: batchMode ? 24 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute top-1 w-4 h-4 rounded-full bg-white"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }} />
        </button>
      </div>

      {/* ── Zone ───────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">

        {/* SINGLE — scanning state */}
        {!batchMode && scanning && (
          <motion.div key="scanning" initial={{ opacity:0, scale:0.96 }} animate={{ opacity:1, scale:1 }}
            exit={{ opacity:0 }} className="w-full">
            <div className="glass w-full rounded-2xl p-14 flex flex-col items-center gap-6"
                 style={{ border:'1px solid rgba(34,211,238,0.4)', boxShadow:'0 0 50px rgba(34,211,238,0.12)' }}>
              <div className="relative w-24 h-28">
                <div className="absolute inset-0 rounded-lg overflow-hidden"
                     style={{ background:'rgba(34,211,238,0.05)', border:'1px solid rgba(34,211,238,0.2)' }}>
                  {[0,1,2,3,4].map(i => (
                    <div key={i} className="mx-3 h-1.5 rounded"
                         style={{ background:'rgba(34,211,238,0.12)', marginTop: i === 0 ? 10 : 5 }} />
                  ))}
                </div>
                <div className="scan-laser" />
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-cyan-400 font-semibold text-lg">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" style={{ animation:'dot-pulse 0.8s ease-in-out infinite' }} />
                  Scanning Document…
                </div>
                <p className="text-slate-500 text-sm mt-1">{scanFile?.name}</p>
              </div>
              <div className="font-mono text-xs text-slate-600 space-y-1.5 text-left">
                <p style={{ animation:'fadeInUp 0.4s 0.1s both' }}>▸ PyMuPDF: extracting text layer…</p>
                <p style={{ animation:'fadeInUp 0.4s 0.6s both' }}>▸ regex: matching header fields…</p>
                <p style={{ animation:'fadeInUp 0.4s 1.1s both' }}>▸ parser: resolving rate rows…</p>
              </div>
            </div>
            <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}`}</style>
          </motion.div>
        )}

        {/* SINGLE — drop state */}
        {!batchMode && !scanning && (
          <motion.div key="drop-single" initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
            exit={{ opacity:0 }} className="w-full">
            <div role="button" tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              className="w-full rounded-2xl p-16 flex flex-col items-center gap-5 cursor-pointer transition-all duration-300"
              style={{
                background: isDragging ? 'rgba(34,211,238,0.06)' : 'rgba(255,255,255,0.02)',
                border: `2px dashed ${isDragging ? 'rgba(34,211,238,0.7)' : 'rgba(34,211,238,0.2)'}`,
                transform: isDragging ? 'scale(1.015)' : undefined,
                boxShadow: isDragging ? '0 0 50px rgba(34,211,238,0.2)' : undefined,
              }}>
              <input ref={inputRef} type="file" accept=".pdf" className="hidden"
                     onChange={(e) => { submit(e.target.files?.[0]); e.target.value='' }} />
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300"
                   style={{ background: isDragging ? 'rgba(34,211,238,0.15)' : 'rgba(34,211,238,0.06)',
                            border:'1px solid rgba(34,211,238,0.25)',
                            boxShadow: isDragging ? '0 0 24px rgba(34,211,238,0.3)' : undefined }}>
                {isDragging ? <FileText size={36} className="text-cyan-400" /> : <Upload size={36} style={{ color:'rgba(34,211,238,0.65)' }} />}
              </div>
              <div className="text-center">
                <p className="text-white font-semibold text-xl mb-1.5">
                  {isDragging ? 'Release to parse' : 'Drop your contract PDF here'}
                </p>
                <p className="text-slate-500 text-sm">
                  or <span className="text-cyan-400 underline underline-offset-2">click to browse</span>
                  {' '}— PDF only, max 50 MB
                </p>
              </div>
              {fileError && (
                <div className="flex items-center gap-2 text-red-400 text-sm px-4 py-2 rounded-lg"
                     style={{ background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.3)' }}>
                  <AlertCircle size={14} /> {fileError}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* BATCH mode */}
        {batchMode && (
          <motion.div key="drop-batch" initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
            exit={{ opacity:0 }} className="w-full space-y-4">

            {/* Batch drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className="w-full rounded-2xl p-10 flex flex-col items-center gap-4 cursor-pointer transition-all duration-300"
              style={{
                background: isDragging ? 'rgba(168,85,247,0.07)' : 'rgba(255,255,255,0.015)',
                border: `2px dashed ${isDragging ? 'rgba(168,85,247,0.7)' : 'rgba(168,85,247,0.25)'}`,
                transform: isDragging ? 'scale(1.01)' : undefined,
                boxShadow: isDragging ? '0 0 40px rgba(168,85,247,0.15)' : undefined,
              }}>
              <input ref={inputRef} type="file" accept=".pdf" multiple className="hidden"
                     onChange={(e) => { addBatchFiles(e.target.files); e.target.value='' }} />
              <div className="flex items-center gap-3">
                {[0,1,2].map(i => (
                  <div key={i} className="rounded-xl flex items-center justify-center transition-all duration-300"
                       style={{
                         width: 52 - i * 6, height: 60 - i * 6,
                         background: isDragging ? 'rgba(168,85,247,0.15)' : 'rgba(168,85,247,0.06)',
                         border: '1px solid rgba(168,85,247,0.25)',
                         opacity: 1 - i * 0.25,
                         marginLeft: i > 0 ? -10 : 0,
                       }}>
                    {i === 0 && <Layers size={22} style={{ color: isDragging ? 'rgb(168,85,247)' : 'rgba(168,85,247,0.65)' }} />}
                  </div>
                ))}
              </div>
              <div className="text-center">
                <p className="text-white font-semibold text-lg mb-1">
                  {isDragging ? 'Drop to add to queue' : 'Drop multiple PDFs here'}
                </p>
                <p className="text-slate-500 text-sm">
                  or <span className="text-purple-400 underline underline-offset-2">click to browse</span>
                  {' '}— select as many as you need
                </p>
              </div>
            </div>

            {/* Queue */}
            <AnimatePresence>
              {queue.length > 0 && (
                <motion.div initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                  className="glass rounded-2xl overflow-hidden"
                  style={{ border: '1px solid rgba(168,85,247,0.15)' }}>

                  {/* Queue header */}
                  <div className="flex items-center justify-between px-5 py-3"
                       style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(168,85,247,0.04)' }}>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        Queue
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                            style={{ background:'rgba(168,85,247,0.12)', border:'1px solid rgba(168,85,247,0.25)', color:'rgba(168,85,247,0.9)' }}>
                        {queue.length} file{queue.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Summary stats when done */}
                    {batchDone && (
                      <div className="flex items-center gap-4 text-[10px] font-mono">
                        <span className="text-slate-500">{totalRows.toLocaleString()} rows</span>
                        <span className="text-slate-600">{(totalMs/1000).toFixed(2)}s total</span>
                        <span className="text-emerald-400 font-semibold">avg {avgConf}% conf</span>
                        <span className="text-emerald-400 font-semibold">$0.00</span>
                      </div>
                    )}

                    {!batchRunning && (
                      <button onClick={resetBatch}
                        className="text-[10px] font-mono text-slate-600 hover:text-slate-400 transition-colors ml-4">
                        Clear all
                      </button>
                    )}
                  </div>

                  {/* File rows */}
                  <div className="p-3 space-y-2">
                    {queue.map((item, i) => (
                      <div key={item.id} className="relative group">
                        <QueueRow item={item} index={i} />
                        {item.status === 'queued' && !batchRunning && (
                          <button onClick={() => removeQueued(item.id)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
                            style={{ color: 'rgba(100,116,139,0.7)' }}>
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Start button */}
                  {!batchDone && (
                    <div className="px-4 pb-4">
                      <button onClick={runBatch} disabled={batchRunning || queue.every(i => i.status === 'done')}
                        className="w-full py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 disabled:opacity-40"
                        style={{
                          background: batchRunning ? 'rgba(168,85,247,0.15)' : 'linear-gradient(135deg, rgba(168,85,247,0.8), rgba(139,64,210,0.9))',
                          border: '1px solid rgba(168,85,247,0.4)',
                          color: 'white',
                          boxShadow: batchRunning ? 'none' : '0 0 20px rgba(168,85,247,0.25)',
                        }}>
                        {batchRunning
                          ? <span className="flex items-center justify-center gap-2">
                              <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ display: 'inline-block' }}>⚙</motion.span>
                              Processing {doneItems.length} / {queue.length}…
                            </span>
                          : `Start Batch — ${queue.length} Contract${queue.length !== 1 ? 's' : ''}`
                        }
                      </button>
                    </div>
                  )}

                  {/* Batch complete summary */}
                  {batchDone && (
                    <motion.div initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }}
                      className="mx-4 mb-4 px-4 py-3 rounded-xl flex items-center gap-4"
                      style={{ background:'rgba(52,211,153,0.07)', border:'1px solid rgba(52,211,153,0.25)' }}>
                      <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-emerald-300">Batch Complete</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {queue.length} contracts · {totalRows.toLocaleString()} rate rows · {(totalMs/1000).toFixed(2)}s · $0.00
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                                style={{ background:'rgba(52,211,153,0.12)', border:'1px solid rgba(52,211,153,0.3)', color:'rgba(52,211,153,0.9)' }}>
                          Export All
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
