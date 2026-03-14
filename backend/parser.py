"""
O.L.E.A. — Oltek Logistics Extraction Automation
backend/parser.py

Pure regex + PDF extraction engine. No paid APIs, no OCR, no ML models.
Primary extractor: PyMuPDF (fitz) — 10-20x faster than pdfplumber.
Fallback extractor: pdfplumber — used only if PyMuPDF is unavailable.
"""

import re
import time
from typing import Optional

# Try PyMuPDF first (much faster), fall back to pdfplumber
try:
    import fitz as _fitz          # PyMuPDF
    _USE_FITZ = True
except ImportError:
    import pdfplumber as _pdfplumber
    _USE_FITZ = False


# ---------------------------------------------------------------------------
# Confidence helpers
# ---------------------------------------------------------------------------

def field(value, confidence: float, status: str = None) -> dict:
    """Wrap any extracted value with its confidence metadata."""
    if status is None:
        if confidence >= 1.0:
            status = "EXTRACTED"
        elif confidence > 0:
            status = "PARTIAL"
        else:
            status = "MISSING"
    return {"value": value, "confidence": confidence, "status": status}


def extracted(value) -> dict:
    return field(value, 1.0, "EXTRACTED")


def partial(value) -> dict:
    return field(value, 0.5, "PARTIAL")


def missing() -> dict:
    return field(None, 0.0, "MISSING")


# ---------------------------------------------------------------------------
# Text extraction
# ---------------------------------------------------------------------------

def _fitz_page_to_text(page) -> str:
    """
    Reconstruct page text from PyMuPDF word-level data, grouping words by
    Y-coordinate so table columns that live on the same horizontal row are
    joined into a single line (matching the format pdfplumber produces).

    Without this, PyMuPDF outputs each table cell as a separate line, which
    breaks the rate-row regex patterns.
    """
    from collections import defaultdict

    words = page.get_text("words")   # (x0,y0,x1,y1,text,block,line,word)
    if not words:
        return ""

    # Quantise Y to 3-pt buckets to handle sub-pixel alignment differences
    rows = defaultdict(list)
    for w in words:
        y_bucket = round(w[1] / 3) * 3
        rows[y_bucket].append((w[0], w[4]))   # (x0, text)

    # Sort each row by X, join into a line
    lines = []
    for y in sorted(rows):
        row_tokens = sorted(rows[y], key=lambda t: t[0])
        lines.append(" ".join(tok for _, tok in row_tokens))

    return "\n".join(lines)


def extract_full_text(pdf_path: str) -> tuple[str, list[str]]:
    """
    Returns (full_concatenated_text, list_of_page_texts).
    Uses PyMuPDF word-grouping when available — 10-20x faster than pdfplumber
    AND correctly reconstructs multi-column table rows into single lines.
    Falls back to pdfplumber transparently.
    """
    pages = []

    if _USE_FITZ:
        doc = _fitz.open(pdf_path)
        for page in doc:
            pages.append(_fitz_page_to_text(page))
        doc.close()
    else:
        with _pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                pages.append(page.extract_text() or "")

    full = "\f".join(pages)
    return full, pages


# ---------------------------------------------------------------------------
# Header extraction
# ---------------------------------------------------------------------------

def parse_header(full_text: str) -> dict:
    """
    Extract contract-level metadata from the PDF text.

    Expected patterns (from ATL0347N25 Contract):
      Contract No   → "OLTK SERVICE CONTRACT NO. ATL0347N25"
      Carrier       → "OLTEK" (constant for this issuer, but also in doc text)
      Shipper       → "Name of Shipper : Hayahai"
      Effective     → "Effective Date 01 Jul, 2025"
      Expiration    → "Effective Through : 30 JUN, 2026"
    """
    header = {}

    # --- Contract Number ---
    m = re.search(
        r'(?:SERVICE\s+CONTRACT\s+NO\.?\s*)([A-Z]{2,6}\d{4,}[A-Z]\d{2})',
        full_text, re.IGNORECASE
    )
    if m:
        header["contract_no"] = extracted(m.group(1).strip())
    else:
        # Fallback: look for standalone contract-like codes
        m2 = re.search(r'\b([A-Z]{2,6}\d{4,}[A-Z]\d{2})\b', full_text)
        header["contract_no"] = extracted(m2.group(1)) if m2 else missing()

    # --- Carrier ---
    # The contract is issued by Oltek; look for "OLTEK" near the top
    m = re.search(r'\b(OLTEK\s*(?:INTERNATIONAL|LINES|SHIPPING)?)\b', full_text, re.IGNORECASE)
    if m:
        header["carrier"] = extracted(m.group(1).strip().upper())
    else:
        header["carrier"] = partial("OLTEK")  # Known issuer — partial confidence

    # --- Shipper ---
    m = re.search(
        r'Name\s+of\s+Shipper\s*[:\-]\s*([^\n\r]+)',
        full_text, re.IGNORECASE
    )
    if m:
        shipper_val = m.group(1).strip().rstrip(".,;")
        header["shipper"] = extracted(shipper_val)
    else:
        header["shipper"] = missing()

    # --- Effective Date ---
    m = re.search(
        r'Effective\s+Date\s+(\d{1,2}\s+[A-Za-z]+,?\s*\d{4})',
        full_text, re.IGNORECASE
    )
    if m:
        header["effective_date"] = extracted(m.group(1).strip())
    else:
        # Generic date near "effective"
        m2 = re.search(
            r'Effective\s*[:\-]?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
            full_text, re.IGNORECASE
        )
        header["effective_date"] = extracted(m2.group(1)) if m2 else missing()

    # --- Expiration Date ---
    m = re.search(
        r'Effective\s+Through\s*[:\-]\s*(\d{1,2}\s+[A-Za-z]+,?\s*\d{4})',
        full_text, re.IGNORECASE
    )
    if m:
        header["expiration_date"] = extracted(m.group(1).strip())
    else:
        # Try "Expiry" / "Expires" / "Valid Until"
        m2 = re.search(
            r'(?:Expir(?:y|es|ation)\s+Date?|Valid\s+Until|Through)\s*[:\-]\s*'
            r'(\d{1,2}\s+[A-Za-z]+,?\s*\d{4}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
            full_text, re.IGNORECASE
        )
        header["expiration_date"] = extracted(m2.group(1)) if m2 else missing()

    # --- Service Contract Type (bonus field) ---
    m = re.search(r'(WB|EB|TRANSPACIFIC|TRANSATLANTIC)', full_text)
    header["trade_direction"] = extracted(m.group(1)) if m else missing()

    return header


# ---------------------------------------------------------------------------
# Commodity extraction
# ---------------------------------------------------------------------------

def parse_commodities(full_text: str) -> list[dict]:
    """
    Extract commodity declarations.

    Pattern:  "1) COMMODITY : TPWB - FCL Cargo Nos"
    Also handles multi-line commodity blocks and numbered lists.
    """
    commodities = []

    # Primary pattern: numbered commodity entries
    matches = re.finditer(
        r'\d+\)\s*COMMODITY\s*[:\-]\s*([^\n\r]+)',
        full_text, re.IGNORECASE
    )
    for m in matches:
        raw = m.group(1).strip()
        # Sometimes the commodity name bleeds onto the next line before another keyword
        # Truncate at known section keywords
        raw = re.split(r'\s+(?:ORIGIN|NOTE|RATE|SURCHARGE|COMMODITY|SECTION)', raw, flags=re.IGNORECASE)[0]
        commodities.append({
            "description": extracted(raw.strip()),
        })

    # Fallback: look for "COMMODITY :" without a number prefix
    if not commodities:
        matches = re.finditer(
            r'COMMODITY\s*[:\-]\s*([^\n\r]+)',
            full_text, re.IGNORECASE
        )
        for m in matches:
            raw = m.group(1).strip()
            commodities.append({"description": partial(raw)})

    if not commodities:
        commodities.append({"description": missing()})

    return commodities


# ---------------------------------------------------------------------------
# Rate table extraction
# ---------------------------------------------------------------------------

# Anchor regex: the fixed right-side pattern in every rate row.
# Matches: (CY|SD) (Dry|Reefer|Genl) (USD|EUR) 20ft 40ft 40HC [45ft]
RATE_ANCHOR = re.compile(
    r'(CY|SD)\s+'                        # Terminal type
    r'(Dry|Reefer|Genl|General)\s+'      # Cargo type
    r'(USD|EUR|GBP)\s+'                  # Currency
    r'(\d+)\s+'                          # 20'
    r'(\d+)\s+'                          # 40'
    r'(\d+)'                             # 40HC
    r'(?:\s+(\d+))?',                    # 45' (optional)
    re.IGNORECASE
)

# Two-letter country code (all caps, word boundary)
COUNTRY_CODE = re.compile(r'\b([A-Z]{2})\b')

# Trade lane / section header: "[NORTH AMERICA - ASIA (WB)]"
TRADE_LANE_HEADER = re.compile(
    r'\[([A-Z\s\-()]+?)\]',
    re.IGNORECASE
)

# Origin block: "ORIGIN : CHARLESTON, SC, UNITED STATES(CY)"
ORIGIN_PATTERN = re.compile(
    r'ORIGIN\s*[:\-]\s*([^\n\r]+)',
    re.IGNORECASE
)


def _clean_port_name(raw: str) -> str:
    """Remove trailing /, comma, whitespace from a port name token."""
    return raw.strip().strip(",/").strip()


def _parse_destination_from_prefix(prefix: str) -> tuple[str, str, Optional[str], Optional[str]]:
    """
    Given the text prefix before the rate anchor, extract:
      dest_name, dest_country, via_name (or None), via_country (or None)

    Strategy:
      - Find all 2-letter ALL-CAPS tokens with word boundaries.
      - If 1 country code found → destination only (no via)
      - If 2 country codes found → second is via country, last segment between them is via name
    """
    # Remove leading/trailing whitespace
    prefix = prefix.strip()

    country_matches = list(COUNTRY_CODE.finditer(prefix))

    if not country_matches:
        # No country codes found — return prefix as best-effort destination
        return _clean_port_name(prefix), "", None, None

    if len(country_matches) == 1:
        cc = country_matches[0]
        dest_country = cc.group(1)
        dest_name = _clean_port_name(prefix[:cc.start()])
        return dest_name, dest_country, None, None

    # Two or more country codes — first belongs to destination, second to via
    cc1 = country_matches[0]
    cc2 = country_matches[1]

    dest_name = _clean_port_name(prefix[:cc1.start()])
    dest_country = cc1.group(1)

    via_raw = prefix[cc1.end():cc2.start()]
    via_name = _clean_port_name(via_raw)
    via_country = cc2.group(1)

    return dest_name, dest_country, via_name if via_name else None, via_country


def parse_rate_tables(full_text: str) -> list[dict]:
    """
    Extract all rate tables as a list of route/rate records.

    Each record:
    {
        "trade_lane":   {"value": "...", "confidence": ..., "status": "..."},
        "commodity":    {"value": "...", "confidence": ..., "status": "..."},
        "origin":       {"value": "...", "confidence": ..., "status": "..."},
        "destination":  {"value": "...", "confidence": ..., "status": "..."},
        "dest_country": {"value": "...", "confidence": ..., "status": "..."},
        "via":          {"value": "...", "confidence": ..., "status": "..."},
        "via_country":  {"value": "...", "confidence": ..., "status": "..."},
        "terminal":     {"value": "CY|SD", "confidence": ..., "status": "..."},
        "cargo_type":   {"value": "Dry|Reefer", "confidence": ..., "status": "..."},
        "currency":     {"value": "USD", "confidence": ..., "status": "..."},
        "rate_20":      {"value": 360, "confidence": ..., "status": "..."},
        "rate_40":      {"value": 450, "confidence": ..., "status": "..."},
        "rate_40hc":    {"value": 450, "confidence": ..., "status": "..."},
        "rate_45":      {"value": 800, "confidence": ..., "status": "..."},
    }
    """
    records = []

    # Split text into lines for line-by-line processing
    lines = full_text.splitlines()

    current_trade_lane = None
    current_commodity = None
    current_origin = None

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        # --- Detect trade lane headers ---
        tl_match = TRADE_LANE_HEADER.search(stripped)
        if tl_match and len(stripped) < 80:  # Headers are short lines
            current_trade_lane = tl_match.group(1).strip()
            continue

        # --- Detect commodity lines ---
        comm_match = re.search(
            r'(?:\d+\))?\s*COMMODITY\s*[:\-]\s*([^\n\r]+)',
            stripped, re.IGNORECASE
        )
        if comm_match:
            current_commodity = comm_match.group(1).strip()
            # Strip trailing section keywords that may appear on the same line
            current_commodity = re.split(
                r'\s+(?:ORIGIN|NOTE|SECTION|RATE)',
                current_commodity, flags=re.IGNORECASE
            )[0].strip()
            # Strip trailing origin-city text that got Y-merged onto the same line
            # Pattern: "CITY NAME, ST, COUNTRY" or "CITY NAME, ST, COUNTRY(CY)"
            city_match = re.search(
                r'\s+[A-Z][A-Z\s]+,\s+[A-Z]{2},',
                current_commodity
            )
            if city_match:
                # Recover the origin from this line if not already set
                raw_origin = current_commodity[city_match.start():].strip()
                raw_origin = re.sub(r'\s*\([^)]*\)\s*$', '', raw_origin).strip()
                if not current_origin:
                    current_origin = raw_origin
                current_commodity = current_commodity[:city_match.start()].strip()
            continue

        # --- Detect origin lines ---
        orig_match = ORIGIN_PATTERN.search(stripped)
        if orig_match and "VIA" not in stripped.upper()[:20]:
            current_origin = orig_match.group(1).strip()
            current_origin = re.sub(r'\s*\([^)]*\)\s*$', '', current_origin).strip()
            continue

        # --- Detect rate rows via anchor ---
        anchor = RATE_ANCHOR.search(stripped)
        if not anchor:
            continue

        # Everything before the anchor is the destination (and optional via) prefix
        prefix = stripped[:anchor.start()].strip()
        if not prefix:
            continue  # Malformed line — skip

        dest_name, dest_country, via_name, via_country = _parse_destination_from_prefix(prefix)

        terminal   = anchor.group(1).upper()
        cargo_type = anchor.group(2).capitalize()
        currency   = anchor.group(3).upper()
        r20        = int(anchor.group(4))
        r40        = int(anchor.group(5))
        r40hc      = int(anchor.group(6))
        r45_raw    = anchor.group(7)
        r45        = int(r45_raw) if r45_raw else None

        records.append({
            "trade_lane":   extracted(current_trade_lane) if current_trade_lane else missing(),
            "commodity":    extracted(current_commodity)  if current_commodity  else missing(),
            "origin":       extracted(current_origin)     if current_origin     else missing(),
            "destination":  extracted(dest_name)          if dest_name          else missing(),
            "dest_country": extracted(dest_country)       if dest_country       else missing(),
            "via":          extracted(via_name)           if via_name           else field(None, 1.0, "EXTRACTED"),
            "via_country":  extracted(via_country)        if via_country        else field(None, 1.0, "EXTRACTED"),
            "terminal":     extracted(terminal),
            "cargo_type":   extracted(cargo_type),
            "currency":     extracted(currency),
            "rate_20":      extracted(r20),
            "rate_40":      extracted(r40),
            "rate_40hc":    extracted(r40hc),
            "rate_45":      extracted(r45) if r45 is not None else field(None, 0.5, "PARTIAL"),
        })

    return records


# ---------------------------------------------------------------------------
# Overall confidence score
# ---------------------------------------------------------------------------

def compute_overall_confidence(header: dict, rate_records: list[dict]) -> float:
    """
    Compute a weighted overall confidence score [0.0 – 1.0].
    Header fields are weighted higher than individual rate rows.
    """
    scores = [v["confidence"] for v in header.values() if isinstance(v, dict)]

    for rec in rate_records[:50]:  # Cap at 50 rows to keep it O(1) effectively
        for v in rec.values():
            if isinstance(v, dict):
                scores.append(v["confidence"])

    return round(sum(scores) / len(scores), 4) if scores else 0.0


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------

def parse_contract(pdf_path: str) -> dict:
    """
    Parse a Service Contract PDF and return structured data with confidence scores.

    Returns:
    {
        "processing_time_ms": float,
        "api_cost_usd": 0.00,
        "overall_confidence": float,
        "header": { ... },
        "commodities": [ ... ],
        "rate_records": [ ... ],
        "page_count": int,
    }
    """
    t_start = time.perf_counter()

    full_text, pages = extract_full_text(pdf_path)

    header      = parse_header(full_text)
    commodities = parse_commodities(full_text)
    rate_records = parse_rate_tables(full_text)

    t_end = time.perf_counter()
    elapsed_ms = round((t_end - t_start) * 1000, 2)

    overall_conf = compute_overall_confidence(header, rate_records)

    return {
        "processing_time_ms": elapsed_ms,
        "api_cost_usd": 0.00,
        "overall_confidence": overall_conf,
        "page_count": len(pages),
        "header": header,
        "commodities": commodities,
        "rate_records": rate_records,
    }


# ---------------------------------------------------------------------------
# CLI test harness
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import sys, json

    if len(sys.argv) < 2:
        print("Usage: python parser.py <path_to_contract.pdf>")
        sys.exit(1)

    result = parse_contract(sys.argv[1])
    print(json.dumps(result, indent=2, default=str))
    print(f"\n--- Summary ---")
    print(f"Pages:       {result['page_count']}")
    print(f"Rate Rows:   {len(result['rate_records'])}")
    print(f"Confidence:  {result['overall_confidence'] * 100:.1f}%")
    print(f"Time:        {result['processing_time_ms']} ms")
    print(f"API Cost:    ${result['api_cost_usd']:.2f}")
