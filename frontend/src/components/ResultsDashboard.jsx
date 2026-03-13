import React, { useState } from "react";
import RateTable from "./RateTable.jsx";

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

export default function ResultsDashboard({ data, rawData, onHeaderEdit, onRateEdit, onExport }) {
  const [activeTab, setActiveTab] = useState("header");

  const headerLabels = {
    contract_no:      "Contract No.",
    carrier:          "Carrier",
    shipper:          "Shipper",
    effective_date:   "Effective Date",
    expiration_date:  "Expiration Date",
    trade_direction:  "Trade Direction",
  };

  const overallConf = rawData?.overall_confidence ?? 0;
  const confColor   = overallConf >= 0.85 ? "text-green-400" : overallConf >= 0.6 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="space-y-6">
      {/* ROI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Processing Time",   value: `${(rawData.processing_time_ms / 1000).toFixed(3)}s`,  color: "blue"  },
          { label: "API Cost Incurred", value: "$0.00",                                                color: "green" },
          { label: "Pages Parsed",      value: String(rawData.page_count ?? "\u2014"),                      color: "blue"  },
          { label: "Rate Rows Found",   value: String(data.rate_records?.length ?? 0),                 color: "blue"  },
        ].map(({ label, value, color }) => (
          <div key={label} className={`bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-1`}>
            <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
            <span className={`text-2xl font-bold font-mono ${color === "green" ? "text-green-400" : "text-brand-light"}`}>{value}</span>
          </div>
        ))}
      </div>

      {/* Overall confidence bar */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Overall Extraction Confidence</span>
          <span className={`text-lg font-bold font-mono ${confColor}`}>{(overallConf * 100).toFixed(1)}%</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${overallConf >= 0.85 ? "bg-green-500" : overallConf >= 0.6 ? "bg-yellow-500" : "bg-red-500"}`}
            style={{ width: `${overallConf * 100}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Fields marked PARTIAL or MISSING can be edited inline before export.
        </p>
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
          onClick={onExport}
          className="ml-auto flex items-center gap-2 px-5 py-2 rounded-lg bg-brand text-white font-semibold text-sm hover:bg-brand-light transition-colors"
        >
          Export Excel
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
