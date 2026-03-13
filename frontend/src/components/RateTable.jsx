import React, { useState, useMemo } from "react";

function ConfBadge({ status }) {
  const map = {
    EXTRACTED: "bg-green-900/60 text-green-300 border-green-700",
    PARTIAL:   "bg-yellow-900/60 text-yellow-300 border-yellow-700",
    MISSING:   "bg-red-900/60   text-red-300   border-red-700",
  };
  const icons = { EXTRACTED: "OK", PARTIAL: "~", MISSING: "X" };
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${map[status] || map.MISSING}`}
      title={status}
    >
      {icons[status] || "?"}
    </span>
  );
}

function EditableCell({ field, onEdit, numeric = false }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState("");
  const value  = field?.value ?? null;
  const status = field?.status ?? "MISSING";

  const start = () => {
    setDraft(value === null ? "" : String(value));
    setEditing(true);
  };

  const commit = () => {
    const final = numeric ? (isNaN(Number(draft)) ? value : Number(draft)) : draft;
    onEdit(final);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        autoFocus
        className="w-full bg-gray-700 text-white px-2 py-0.5 rounded text-sm outline-none ring-1 ring-brand"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && commit()}
      />
    );
  }

  return (
    <div className="flex items-center gap-1.5 cursor-pointer group" onClick={start} title="Click to edit">
      <span className={`text-sm ${value === null ? "text-gray-600 italic" : "text-gray-200"}`}>
        {value === null ? "\u2014" : String(value)}
      </span>
      <ConfBadge status={status} />
    </div>
  );
}

export default function RateTable({ records, onEdit }) {
  const [search, setSearch]   = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage]       = useState(0);
  const PAGE_SIZE = 50;

  const COLS = [
    { key: "trade_lane",   label: "Trade Lane",  numeric: false },
    { key: "origin",       label: "Origin",      numeric: false },
    { key: "destination",  label: "Destination", numeric: false },
    { key: "dest_country", label: "CC",          numeric: false },
    { key: "via",          label: "Via",         numeric: false },
    { key: "terminal",     label: "Terminal",    numeric: false },
    { key: "cargo_type",   label: "Type",        numeric: false },
    { key: "currency",     label: "Cur",         numeric: false },
    { key: "rate_20",      label: "20ft",        numeric: true  },
    { key: "rate_40",      label: "40ft",        numeric: true  },
    { key: "rate_40hc",    label: "40HC",        numeric: true  },
    { key: "rate_45",      label: "45ft",        numeric: true  },
  ];

  const getVal = (rec, key) => rec[key]?.value ?? null;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return records.filter((rec) =>
      !q || COLS.some((c) => String(getVal(rec, c.key) ?? "").toLowerCase().includes(q))
    );
  }, [records, search]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const av = getVal(a, sortKey) ?? "";
      const bv = getVal(b, sortKey) ?? "";
      const cmp = typeof av === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sortAsc ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortAsc]);

  const paginated  = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);

  const toggleSort = (key) => {
    if (sortKey === key) setSortAsc((a) => !a);
    else { setSortKey(key); setSortAsc(true); }
  };

  const confSummary = useMemo(() => {
    let high = 0, mid = 0, low = 0;
    records.forEach((rec) => {
      const avg = ["destination", "rate_20", "rate_40", "rate_40hc"]
        .reduce((s, k) => s + (rec[k]?.confidence ?? 0), 0) / 4;
      if (avg >= 0.9) high++;
      else if (avg >= 0.5) mid++;
      else low++;
    });
    return { high, mid, low };
  }, [records]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <span className="text-gray-400 font-mono">{records.length} rate rows</span>
        <div className="flex gap-2">
          <span className="px-2 py-0.5 rounded bg-green-900/50 text-green-300 text-xs border border-green-800">{confSummary.high} high</span>
          <span className="px-2 py-0.5 rounded bg-yellow-900/50 text-yellow-300 text-xs border border-yellow-800">{confSummary.mid} partial</span>
          {confSummary.low > 0 && (
            <span className="px-2 py-0.5 rounded bg-red-900/50 text-red-300 text-xs border border-red-800">{confSummary.low} low</span>
          )}
        </div>
        <input
          type="text"
          placeholder="Search rates..."
          className="ml-auto bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-navy">
              {COLS.map((c) => (
                <th
                  key={c.key}
                  className="px-3 py-2.5 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white select-none whitespace-nowrap"
                  onClick={() => toggleSort(c.key)}
                >
                  {c.label}{sortKey === c.key && <span className="ml-1">{sortAsc ? "^" : "v"}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((rec, i) => {
              const globalIdx = page * PAGE_SIZE + i;
              const rowAvg = ((rec.destination?.confidence ?? 0) + (rec.rate_20?.confidence ?? 0)) / 2;
              const rowClass = rowAvg >= 0.9 ? "bg-gray-900 hover:bg-gray-800"
                : rowAvg >= 0.5 ? "bg-yellow-950/30 hover:bg-yellow-950/50"
                : "bg-red-950/30 hover:bg-red-950/50";
              return (
                <tr key={globalIdx} className={`${rowClass} border-t border-gray-800 transition-colors`}>
                  {COLS.map((c) => (
                    <td key={c.key} className="px-3 py-2 whitespace-nowrap">
                      <EditableCell field={rec[c.key]} numeric={c.numeric} onEdit={(v) => onEdit(globalIdx, c.key, v)} />
                    </td>
                  ))}
                </tr>
              );
            })}
            {paginated.length === 0 && (
              <tr><td colSpan={COLS.length} className="text-center text-gray-600 py-10">{search ? "No rows match your search." : "No rate rows extracted."}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Showing {page * PAGE_SIZE + 1}&ndash;{Math.min((page + 1) * PAGE_SIZE, sorted.length)} of {sorted.length}</span>
          <div className="flex gap-1">
            <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="px-2 py-1 rounded bg-gray-800 disabled:opacity-30 hover:bg-gray-700">Prev</button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => (
              <button key={i} onClick={() => setPage(i)} className={`px-2 py-1 rounded ${i === page ? "bg-brand text-white" : "bg-gray-800 hover:bg-gray-700"}`}>{i + 1}</button>
            ))}
            <button disabled={page === totalPages - 1} onClick={() => setPage((p) => p + 1)} className="px-2 py-1 rounded bg-gray-800 disabled:opacity-30 hover:bg-gray-700">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
