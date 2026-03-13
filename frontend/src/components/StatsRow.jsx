import { useEffect, useRef } from 'react'
import { DollarSign, Zap, FileText } from 'lucide-react'

/* Animated count-up hook */
function useCountUp(target, duration = 1200, decimals = 0) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const start = performance.now()
    const num = parseFloat(target.replace(/[^0-9.]/g, ''))
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      const current = (num * eased).toFixed(decimals)
      el.textContent = target.replace(/[\d.]+/, current)
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [])
  return ref
}

function StatCard({ icon: Icon, label, value, sub, accentColor, glowColor }) {
  const countRef = useCountUp(value, 1400, value.includes('.') ? 1 : 0)

  return (
    <div className="glass flex items-center gap-5 px-6 py-5 relative overflow-hidden">
      {/* Background icon watermark */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-[0.04]">
        <Icon size={72} />
      </div>

      {/* Icon circle */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: `rgba(${accentColor},0.12)`,
          border: `1px solid rgba(${accentColor},0.3)`,
          boxShadow: `0 0 16px rgba(${accentColor},0.2)`,
        }}
      >
        <Icon size={22} style={{ color: `rgb(${glowColor})` }} />
      </div>

      {/* Text */}
      <div>
        <div
          className="text-2xl font-bold tabular-nums"
          ref={countRef}
          style={{ color: `rgb(${glowColor})` }}
        >
          {value}
        </div>
        <div className="text-xs text-slate-400 mt-0.5">{label}</div>
        {sub && <div className="text-[10px] text-slate-600 mt-0.5">{sub}</div>}
      </div>
    </div>
  )
}

export default function StatsRow() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <StatCard
        icon={DollarSign}
        label="API Costs Incurred"
        value="$0.00"
        sub="100% local processing"
        accentColor="52,211,153"
        glowColor="52,211,153"
      />
      <StatCard
        icon={Zap}
        label="Avg. Processing Time"
        value="1.2s"
        sub="Sub-3s guaranteed"
        accentColor="34,211,238"
        glowColor="34,211,238"
      />
      <StatCard
        icon={FileText}
        label="Documents Processed"
        value="1,402"
        sub="Across all contracts"
        accentColor="168,85,247"
        glowColor="168,85,247"
      />
    </div>
  )
}
