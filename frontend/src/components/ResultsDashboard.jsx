import React, { useState } from "react";
import RateTable from "./RateTable.jsx";
import { motion } from "framer-motion";

function ConfidenceRing({ value }) {
  const r     = 44
  const circ  = 2 * Math.PI * r          // 276.46
  const color = value >= 0.85 ? '#4ade80' : value >= 0.6 ? '#facc15' : '#f87171'
  const pct   = Math.round(value * 100)

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-28 h-28 flex-shrink-0">
        <svg viewBox="0 0 112 112" width="112" height="112" style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle cx="56" cy="56" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          {/* Arc */}
          <motion.circle
            cx="56" cy="56" r={r}
            fill="none" stroke={color} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ * (1 - value) }}
            transition={{ duration: 1.1, ease: 'easeOut', delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="text-xl font-bold font-mono" style={{ color }}
          >{pct}%</motion.span>
          <span className="text-[9px] text-slate-600 uppercase tracking-wider mt-0.5">conf.</span>
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-300 mb-1">Extraction Confidence</p>
        <p className="text-xs text-slate-600 leading-relaxed max-w-xs">
          {value >= 0.85
            ? 'All critical fields extracted with high certainty.'
            : value >= 0.6
            ? 'Some fields are partial — review before exporting.'
            : 'Low confidence — manual review recommended.'}
        </p>
        <p className="text-[10px] text-slate-700 mt-2">
          Fields marked PARTIAL or MISSING can be edited inline.
        </p>
      </div>
    </div>
  )
}

function FieldRow({ label, field, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState("");

  const value  = field?.value ?? null;
  const status = field?.status ?? "MISSING";
  const conf   = field?.confidence ?? 0;

  const statusColors = {
    EXTRACTED: "text-green-400",
    PARTIAL:   "text-yellow-400",
    MISSING:   "text-red-400",
  };

  const badgeColors = {
    EXTRACTED: "bg-green-900/50 border-green-700 text-green-300",
    PARTIAL:   "bg-yellow-900/50 border-yellow-700 text-yellow-300",
    MISSING:   "bg-red-900/50 border-red-700 text-red-300",
  };

  const start = () => { setDraft(value ?? ""); setEditing(true); };
  const commit = () => { onEdit(draft); setEditing(false); };

  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-800 last:border-0">
      <span className="w-36 text-xs font-medium text-gray-500 uppercase tracking-wider flex-shrink-0">{label}</span>

      {editing ? (
        <input
          autoFocus
          className="flex-1 bg-gray-700 text-white px-3 py-1 rounded-lg text-sm outline-none ring-1 ring-brand"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === "Enter" && commit()}
        />
      ) : (
        <span
          className={`flex-1 text-sm cursor-pointer hover:text-white transition-colors ${value ? "text-gray-200" : "text-gray-600 italic"}`}
          onClick={start}
          title="Click to edit"
        >
          {value ?? "not found"}
        </span>
      )}

      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold flex-shrink-0 ${badgeColors[status] || badgeColors.MISSING}`}>
        {status}
      </span>
      <span className={`text-xs font-mono flex-shrink-0 ${statusColors[status] || "text-gray-500"}`}>
        {(conf * 100).toFixed(0)}%
      </span>
    </div>
  );
}

export default function ResultsDashboard({ data, rawData, onHeaderEdit, onRateEdit, onExport, exportBusy = false }) {
  const [activeTab, setActiveTab] = useState("header");

  const headerLabels = {
    contract_no:      "Contract No.",
    carrier:          "Carrier",
    shipper:          "Shipper",
    effective_date:   "Effective Date",
    expiration_date:  "Expiration Date",
    trade_direction:  "Trade Direction",
  };

  const overallConf = rawData?.overall_confidence ?? 0

  const hrsSaved   = ((data.rate_records?.length ?? 0) * 25 / 3600).toFixed(1)
  const llmCost    = (((rawData?.page_count ?? 0) * 0.02)).toFixed(2)

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Processing Time",    value: `${(rawData.processing_time_ms / 1000).toFixed(2)}s`, color: "cyan"  },
          { label: "API Cost",           value: "$0.00",                                               color: "green" },
          { label: "Pages Parsed",       value: String(rawData.page_count ?? "—"),                     color: "cyan"  },
          { label: "Rate Rows Found",    value: String(data.rate_records?.length ?? 0),                color: "cyan"  },
          { label: "Manual Entry Saved", value: `${hrsSaved} hrs`,                                     color: "purple"},
          { label: "LLM Cost Avoided",   value: `$${llmCost}`,                                         color: "amber" },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass rounded-xl p-4 flex flex-col gap-1"
               style={{ boxShadow: `0 0 0 1px rgba(${
                 color==='cyan'?'34,211,238':color==='green'?'52,211,153':color==='purple'?'168,85,247':'251,191,36'
               },0.15)` }}>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider leading-tight">{label}</span>
            <span className="text-xl font-bold font-mono" style={{ color:
              color==='cyan'?'rgba(34,211,238,0.9)':color==='green'?'rgba(52,211,153,0.9)':color==='purple'?'rgba(168,85,247,0.9)':'rgba(251,191,36,0.9)'
            }}>{value}</span>
          </div>
        ))}
      </div>

      {/* LLM cost context strip */}
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-mono"
           style={{ background:'rgba(251,191,36,0.05)', border:'1px solid rgba(251,191,36,0.15)' }}>
        <span className="text-amber-400 font-semibold">⚡ Zero-cost advantage</span>
        <span className="text-slate-600">—</span>
        <span className="text-slate-500">Equivalent GPT-4 extraction would cost approx. <span className="text-amber-300 font-semibold">${llmCost}</span> per document at scale.</span>
        <span className="ml-auto text-slate-700">Your cost: <span className="text-emerald-400 font-semibold">$0.00</span></span>
      </div>

      {/* Confidence ring */}
      <div className="glass rounded-xl p-5">
        <ConfidenceRing value={overallConf} />
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-gray-800">
        {[
          { id: "header",     label: "Contract Header" },
          { id: "rates",      label: `Rate Table (${data.rate_records?.length ?? 0})` },
          { id: "commodities",label: `Commodities (${data.commodities?.length ?? 0})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? "border-brand text-white"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}

        {/* Export button pushed to the right */}
        <button
          onClick={() => onExport(data)}
          disabled={exportBusy}
          className="ml-auto flex items-center gap-2 px-5 py-2 rounded-lg bg-brand text-white font-semibold text-sm hover:bg-brand-light transition-colors disabled:opacity-50"
        >
          {exportBusy ? (
            <span className="flex flex-row items-center gap-2">
              <svg className="w-5 h-5 animate-spin text-current" viewBox="0 0 20 20" fill="none">
                <circle
                  className="opacity-20"
                  cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="4" />
                <path
                  d="M18 10a8 8 0 01-8 8"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
              <span>Exporting…</span>
            </span>
          ) : 'Export Excel'}
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "header" && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Contract Metadata</h3>
          {Object.entries(headerLabels).map(([key, label]) => (
            <FieldRow
              key={key}
              label={label}
              field={data.header?.[key]}
              onEdit={(v) => onHeaderEdit(key, v)}
            />
          ))}
        </div>
      )}

      {activeTab === "rates" && (
        <RateTable
          records={data.rate_records ?? []}
          onEdit={onRateEdit}
        />
      )}

      {activeTab === "commodities" && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-3">
          {(data.commodities ?? []).map((comm, i) => (
            <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-800 last:border-0">
              <span className="w-8 text-xs text-gray-600 font-mono">{i + 1}</span>
              <span className="flex-1 text-sm text-gray-200">{comm.description?.value ?? "\u2014"}</span>
              <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${
                comm.description?.status === "EXTRACTED" ? "bg-green-900/50 border-green-700 text-green-300"
                : comm.description?.status === "PARTIAL"   ? "bg-yellow-900/50 border-yellow-700 text-yellow-300"
                : "bg-red-900/50 border-red-700 text-red-300"
              }`}>{comm.description?.status ?? "MISSING"}</span>
            </div>
          ))}
          {(data.commodities ?? []).length === 0 && (
            <p className="text-gray-600 text-sm">No commodities extracted.</p>
          )}
        </div>
      )}
    </div>
  );
}
