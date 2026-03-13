/**
 * ConfidenceBadge.jsx
 * Renders the green/yellow/red pill badge for a confidence-wrapped field.
 *
 * Usage:
 *   <ConfidenceBadge field={data.header.contract_no} />
 */

import React from "react";

// Status → Tailwind class mapping
const BADGE_CLASS = {
  EXTRACTED: "badge-extracted",
  PARTIAL:   "badge-partial",
  MISSING:   "badge-missing",
};

// Status → emoji indicator
const BADGE_ICON = {
  EXTRACTED: "✓",
  PARTIAL:   "⚠",
  MISSING:   "✗",
};

export default function ConfidenceBadge({ field }) {
  if (!field || typeof field !== "object") {
    return <span className="badge-missing">{BADGE_ICON.MISSING} MISSING</span>;
  }

  const status = field.status || "MISSING";
  const pct    = Math.round((field.confidence ?? 0) * 100);

  return (
    <span className={BADGE_CLASS[status] || "badge-missing"}>
      {BADGE_ICON[status] || "?"} {status} {pct}%
    </span>
  );
}
