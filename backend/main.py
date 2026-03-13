"""
O.L.E.A. — Oltek Logistics Extraction Automation
backend/main.py

FastAPI application — two endpoints:
  POST /upload   → accepts PDF upload, returns parsed JSON with confidence data
  POST /export   → accepts parsed JSON, returns .xlsx download

Run locally:
  uvicorn main:app --reload --port 8000
"""

import io
import os
import tempfile
import time

import pandas as pd
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Any

from parser import parse_contract


# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

app = FastAPI(
    title="O.L.E.A. API",
    description="Oltek Logistics Extraction Automation — zero-cost local PDF parsing",
    version="1.0.0",
)

# Allow the Vite dev server (port 5173) and any localhost origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# POST /upload — parse a PDF and return structured JSON
# ---------------------------------------------------------------------------

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    """
    Accept a PDF upload, run it through the extraction engine, return JSON.

    Response shape:
    {
        "processing_time_ms": 1243.5,
        "api_cost_usd": 0.00,
        "overall_confidence": 0.94,
        "page_count": 94,
        "filename": "ATL0347N25.pdf",
        "header": { contract_no, carrier, shipper, effective_date, expiration_date, ... },
        "commodities": [ { description: {...} }, ... ],
        "rate_records": [ { origin, destination, terminal, rate_20, ... }, ... ],
    }
    """
    # Validate file type
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    # Write upload to a temp file (pdfplumber needs a real file path)
    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    try:
        result = parse_contract(tmp_path)
        result["filename"] = file.filename
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Parsing failed: {str(exc)}")
    finally:
        # Always clean up the temp file
        os.unlink(tmp_path)


# ---------------------------------------------------------------------------
# POST /export — convert parsed data to Excel (.xlsx) download
# ---------------------------------------------------------------------------

class ExportPayload(BaseModel):
    """The full JSON object returned from /upload — sent back for Excel export."""
    filename: str = "contract"
    header: dict[str, Any]
    commodities: list[dict[str, Any]]
    rate_records: list[dict[str, Any]]
    processing_time_ms: float = 0
    api_cost_usd: float = 0.00
    overall_confidence: float = 0
    page_count: int = 0


def _unwrap(v: Any) -> Any:
    """Extract the raw .value from a confidence-wrapped field dict, else passthrough."""
    if isinstance(v, dict) and "value" in v:
        return v["value"]
    return v


@app.post("/export")
async def export_excel(payload: ExportPayload):
    """
    Build an Excel workbook from the parsed contract data and stream it back.

    Workbook structure:
       Sheet 1 — Header      (field | value)
       Sheet 2 — Commodities (description)
       Sheet 3 — Rate Table  (all columns matching the OLTK template)
    """
    output = io.BytesIO()

    with pd.ExcelWriter(output, engine="openpyxl") as writer:

        # ---- Sheet 1: Header ------------------------------------------------
        header_rows = []
        field_labels = {
            "contract_no":      "Contract Number",
            "carrier":          "Carrier",
            "shipper":          "Shipper",
            "effective_date":   "Effective Date",
            "expiration_date":  "Expiration Date",
            "trade_direction":  "Trade Direction",
        }
        for key, label in field_labels.items():
            cell = payload.header.get(key, {})
            header_rows.append({
                "Field":      label,
                "Value":      _unwrap(cell),
                "Confidence": cell.get("confidence", ""),
                "Status":     cell.get("status", ""),
            })

        pd.DataFrame(header_rows).to_excel(
            writer, sheet_name="Header", index=False
        )

        # ---- Sheet 2: Commodities -------------------------------------------
        commodity_rows = [
            {"Description": _unwrap(c.get("description", {}))}
            for c in payload.commodities
        ]
        pd.DataFrame(commodity_rows).to_excel(
            writer, sheet_name="Commodities", index=False
        )

        # ---- Sheet 3: Rate Table -------------------------------------------
        rate_columns = [
            "trade_lane", "commodity", "origin",
            "destination", "dest_country",
            "via", "via_country",
            "terminal", "cargo_type", "currency",
            "rate_20", "rate_40", "rate_40hc", "rate_45",
        ]
        rate_labels = {
            "trade_lane":   "Trade Lane",
            "commodity":    "Commodity",
            "origin":       "Origin",
            "destination":  "Destination",
            "dest_country": "Cntry",
            "via":          "Destination Via",
            "via_country":  "Via Cntry",
            "terminal":     "Term",
            "cargo_type":   "Type",
            "currency":     "Cur",
            "rate_20":      "20'",
            "rate_40":      "40'",
            "rate_40hc":    "40HC",
            "rate_45":      "45'",
        }

        flat_rows = []
        for rec in payload.rate_records:
            flat_rows.append({
                rate_labels[col]: _unwrap(rec.get(col, {}))
                for col in rate_columns
            })

        pd.DataFrame(flat_rows).to_excel(
            writer, sheet_name="Rates", index=False
        )

    output.seek(0)

    safe_name = os.path.splitext(payload.filename)[0] or "contract"
    download_name = f"{safe_name}_extracted.xlsx"

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{download_name}"'},
    )


# ---------------------------------------------------------------------------
# Health-check
# ---------------------------------------------------------------------------

@app.get("/health")
def health():
    return {"status": "ok", "service": "O.L.E.A.", "api_cost_usd": 0.00}
