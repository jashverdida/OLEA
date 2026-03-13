import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, AlertCircle } from 'lucide-react'

export default function UploadZone({ onUpload }) {
  const [isDragging, setIsDragging] = useState(false)
  const [scanning,   setScanning]   = useState(false)
  const [scanFile,   setScanFile]   = useState(null)
  const [fileError,  setFileError]  = useState('')
  const inputRef = useRef(null)

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
    // Run the scan animation, then fire the actual upload
    setTimeout(() => {
      setScanning(false)
      onUpload(file)
    }, 2000)
  }, [onUpload])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    submit(e.dataTransfer.files?.[0])
  }, [submit])

  return (
    <div className="flex flex-col items-center gap-10 w-full max-w-3xl mx-auto">

      {/* Heading */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-3">Extraction Engine</h2>
        <p className="text-slate-400 text-base max-w-lg mx-auto leading-relaxed">
          Drop a digital OLTK Service Contract PDF. All header fields and rate tables
          extracted in under 3 seconds — locally, at zero cost.
        </p>
      </div>

      {/* Zone toggles between drop + scanning states */}
      <AnimatePresence mode="wait">
        {scanning ? (
          <motion.div key="scanning" initial={{ opacity:0, scale:0.96 }}
            animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }} className="w-full">
            <div className="glass w-full rounded-2xl p-14 flex flex-col items-center gap-6"
                 style={{ border:'1px solid rgba(34,211,238,0.4)', boxShadow:'0 0 50px rgba(34,211,238,0.12)' }}>

              {/* Animating document */}
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
                  <span className="w-2 h-2 rounded-full bg-cyan-400"
                        style={{ animation:'dot-pulse 0.8s ease-in-out infinite' }} />
                  Scanning Document…
                </div>
                <p className="text-slate-500 text-sm mt-1">{scanFile?.name}</p>
              </div>

              <div className="font-mono text-xs text-slate-600 space-y-1.5 text-left">
                <p style={{ animation:'fadeInUp 0.4s 0.1s both' }}>▸ pdfplumber: extracting text layer…</p>
                <p style={{ animation:'fadeInUp 0.4s 0.6s both' }}>▸ regex: matching header fields…</p>
                <p style={{ animation:'fadeInUp 0.4s 1.1s both' }}>▸ parser: resolving rate rows…</p>
              </div>
            </div>
            <style>{`
              @keyframes fadeInUp {
                from { opacity:0; transform:translateY(6px) }
                to   { opacity:1; transform:none }
              }
            `}</style>
          </motion.div>
        ) : (
          <motion.div key="drop" initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
            exit={{ opacity:0 }} className="w-full">
            <div
              role="button" tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              className={['w-full rounded-2xl p-16 flex flex-col items-center gap-5 cursor-pointer transition-all duration-300',
                          !isDragging ? 'drop-idle' : ''].join(' ')}
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
                {isDragging
                  ? <FileText size={36} className="text-cyan-400" />
                  : <Upload size={36} style={{ color:'rgba(34,211,238,0.65)' }} />
                }
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
      </AnimatePresence>

      {/* Feature chips */}
      <div className="flex flex-wrap justify-center gap-3">
        {[
          { e:'⚡', t:'< 3s processing' },
          { e:'🔒', t:'100% local'      },
          { e:'💵', t:'$0.00 API cost'  },
          { e:'✏️', t:'Human-in-the-loop'},
          { e:'📊', t:'One-click Excel' },
        ].map(({ e, t }) => (
          <span key={t} className="flex items-center gap-2 px-4 py-2 rounded-full text-xs text-slate-400"
                style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
            {e} {t}
          </span>
        ))}
      </div>
    </div>
  )
}
