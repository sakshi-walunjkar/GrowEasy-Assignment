"use client";

import { X, FileText, Sparkles, AlertTriangle, CheckCircle } from "lucide-react";

interface Props {
  data: Record<string, string>[];
  filename: string;
  filesize: string;
  onClose: () => void;
  onConfirm: () => void;
}

const CRM_FIELDS = ["name","email","mobile","phone","country_code","company","city","state","country","lead_owner","crm_status","crm_note","data_source","possession_time","description","created_at","date","full name","contact","mobile_without_country_code"];

function analyzeCSV(data: Record<string, string>[]) {
  if (!data.length) return [];
  const warnings: { type: "warn" | "info"; message: string }[] = [];
  const headers = Object.keys(data[0]).map(h => h.toLowerCase().trim());

  // Check for email/phone columns
  const hasEmail  = headers.some(h => h.includes("email") || h.includes("mail"));
  const hasPhone  = headers.some(h => h.includes("phone") || h.includes("mobile") || h.includes("contact") || h.includes("mob") || h.includes("tel"));
  if (!hasEmail && !hasPhone)
    warnings.push({ type: "warn", message: "No email or phone column detected — all rows may be skipped (both are required for a valid lead)." });
  else if (!hasEmail)
    warnings.push({ type: "info", message: "No email column found — leads will be identified by phone number only." });
  else if (!hasPhone)
    warnings.push({ type: "info", message: "No phone column found — leads will be identified by email only." });

  // Check for name column
  const hasName = headers.some(h => h.includes("name") || h.includes("contact") || h.includes("customer"));
  if (!hasName)
    warnings.push({ type: "info", message: "No name column detected — the name field may be left blank after import." });

  // Check for empty rows
  const emptyRows = data.filter(row => Object.values(row).every(v => !v?.trim())).length;
  if (emptyRows > 0)
    warnings.push({ type: "warn", message: `${emptyRows} completely empty row${emptyRows > 1 ? "s" : ""} detected — these will be skipped.` });

  // Check for unknown columns
  const unknownCols = Object.keys(data[0]).filter(h => !CRM_FIELDS.some(f => h.toLowerCase().includes(f) || f.includes(h.toLowerCase())));
  if (unknownCols.length > 0 && unknownCols.length <= 5)
    warnings.push({ type: "info", message: `${unknownCols.length} unrecognized column${unknownCols.length > 1 ? "s" : ""} (${unknownCols.slice(0,3).join(", ")}${unknownCols.length > 3 ? "..." : ""}) — AI will attempt to map these automatically.` });

  // Large file warning
  if (data.length > 200)
    warnings.push({ type: "info", message: `Large file: ${data.length} rows will be processed in ${Math.ceil(data.length / 15)} batches. This may take a minute.` });

  return warnings;
}

export default function PreviewModal({ data, filename, filesize, onClose, onConfirm }: Props) {
  const headers  = data.length > 0 ? Object.keys(data[0]) : [];
  const preview  = data.slice(0, 100);
  const warnings = analyzeCSV(data);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} onClick={onClose} />

      <div style={{
        position: "relative",
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        width: "100%",
        maxWidth: 860,
        margin: "0 16px",
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        maxHeight: "90vh",
      }}>

        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f3f4f6", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: 0 }}>CSV Preview</h2>
              <p style={{ fontSize: 13, color: "#6b7280", marginTop: 3, marginBottom: 0 }}>
                Review your data before AI processing. All {data.length} rows will be sent to Gemini AI.
              </p>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4, marginLeft: 12 }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* File info */}
        <div style={{ padding: "12px 24px 0", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid #e5e7eb", borderRadius: 10, padding: "10px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <FileText size={16} color="#f97316" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{filename}</div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>{filesize} · {data.length} rows · {headers.length} columns</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0", borderRadius: 999, padding: "3px 10px" }}>
                ✓ Valid CSV
              </span>
            </div>
          </div>
        </div>

        {/* Validation warnings */}
        {warnings.length > 0 && (
          <div style={{ padding: "0 24px 12px", flexShrink: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {warnings.map((w, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "9px 12px", borderRadius: 8, background: w.type === "warn" ? "#fef3c7" : "#eff6ff", border: `1px solid ${w.type === "warn" ? "#fde68a" : "#bfdbfe"}` }}>
                  {w.type === "warn"
                    ? <AlertTriangle size={14} color="#d97706" style={{ flexShrink: 0, marginTop: 1 }} />
                    : <CheckCircle   size={14} color="#3b82f6" style={{ flexShrink: 0, marginTop: 1 }} />}
                  <span style={{ fontSize: 12, color: w.type === "warn" ? "#92400e" : "#1e40af", lineHeight: 1.5 }}>{w.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Table */}
        <div style={{ padding: "12px 24px", flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "auto", flex: 1 }}>
            <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse", minWidth: "max-content" }}>
              <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
                <tr style={{ background: "#1f2937" }}>
                  <th style={{ padding: "9px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#9ca3af", whiteSpace: "nowrap", borderRight: "1px solid #374151", width: 40 }}>#</th>
                  {headers.map((h) => (
                    <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#e5e7eb", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap", borderRight: "1px solid #374151" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                    <td style={{ padding: "9px 12px", color: "#d1d5db", fontSize: 11, borderRight: "1px solid #f3f4f6", textAlign: "center" }}>{i + 1}</td>
                    {headers.map((h) => (
                      <td key={h} style={{ padding: "9px 14px", color: row[h] ? "#374151" : "#d1d5db", whiteSpace: "nowrap", borderRight: "1px solid #f9fafb", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }} title={row[h]}>
                        {row[h] || "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.length > 100 && (
            <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 6, textAlign: "right" }}>
              Showing first 100 of {data.length} rows. All rows will be processed.
            </p>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 24px 20px", borderTop: "1px solid #f3f4f6", flexShrink: 0, display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", color: "#374151", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{ flex: 2, padding: "11px 0", borderRadius: 10, border: "none", background: "#f97316", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            <Sparkles size={15} />
            Confirm & Import with AI ({data.length} records)
          </button>
        </div>
      </div>
    </div>
  );
}
