"use client";

import { X, CheckCircle, AlertCircle, SkipForward, Users } from "lucide-react";
import { CRMRecord } from "@/types/crm";

interface SkippedRecord {
  index: number;
  reason: string;
  record: Record<string, string>;
}

interface Props {
  imported: CRMRecord[];
  skipped: SkippedRecord[];
  onClose: () => void;
  onViewLeads: () => void;
}

const CRM_FIELDS: (keyof CRMRecord)[] = [
  "created_at", "name", "email", "country_code", "mobile_without_country_code",
  "company", "city", "state", "country", "lead_owner", "crm_status", "crm_note",
  "data_source", "possession_time", "description",
];

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  GOOD_LEAD_FOLLOW_UP: { bg: "#dcfce7", color: "#15803d" },
  DID_NOT_CONNECT:     { bg: "#fef3c7", color: "#d97706" },
  BAD_LEAD:            { bg: "#fee2e2", color: "#dc2626" },
  SALE_DONE:           { bg: "#dbeafe", color: "#1d4ed8" },
};

export default function ResultModal({ imported, skipped, onClose, onViewLeads }: Props) {
  const total = imported.length + skipped.length;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)" }} onClick={onClose} />

      <div style={{
        position: "relative", background: "#fff", borderRadius: 16,
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)", width: "100%", maxWidth: 960,
        margin: "0 16px", zIndex: 10, display: "flex", flexDirection: "column", maxHeight: "92vh",
      }}>

        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f3f4f6", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: 0 }}>Import Complete</h2>
              <p style={{ fontSize: 13, color: "#6b7280", marginTop: 3, marginBottom: 0 }}>
                AI has processed your CSV and extracted CRM records.
              </p>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4, marginLeft: 12 }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div style={{ padding: "16px 24px 0", flexShrink: 0 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
              <CheckCircle size={22} color="#15803d" />
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#15803d" }}>{imported.length}</div>
                <div style={{ fontSize: 12, color: "#166534" }}>Successfully Imported</div>
              </div>
            </div>
            <div style={{ background: skipped.length > 0 ? "#fef3c7" : "#f9fafb", border: `1px solid ${skipped.length > 0 ? "#fde68a" : "#e5e7eb"}`, borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
              <SkipForward size={22} color={skipped.length > 0 ? "#d97706" : "#9ca3af"} />
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: skipped.length > 0 ? "#d97706" : "#6b7280" }}>{skipped.length}</div>
                <div style={{ fontSize: 12, color: skipped.length > 0 ? "#92400e" : "#9ca3af" }}>Skipped Records</div>
              </div>
            </div>
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
              <Users size={22} color="#3b82f6" />
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#1d4ed8" }}>{total}</div>
                <div style={{ fontSize: 12, color: "#1e40af" }}>Total Records</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs content */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0, padding: "16px 24px 0" }}>

          {/* Imported records table */}
          {imported.length > 0 && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexShrink: 0 }}>
                <CheckCircle size={14} color="#15803d" />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
                  Successfully Parsed Records ({imported.length})
                </span>
              </div>
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "auto", flex: 1 }}>
                <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse", minWidth: "max-content" }}>
                  <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
                    <tr style={{ background: "#1f2937" }}>
                      <th style={{ padding: "9px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#9ca3af", whiteSpace: "nowrap", borderRight: "1px solid #374151", width: 36 }}>#</th>
                      {CRM_FIELDS.map(f => (
                        <th key={f} style={{ padding: "9px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#e5e7eb", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap", borderRight: "1px solid #374151" }}>
                          {f.replace(/_/g, " ")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {imported.map((row, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                        <td style={{ padding: "9px 12px", color: "#d1d5db", fontSize: 11, borderRight: "1px solid #f3f4f6", textAlign: "center" }}>{i + 1}</td>
                        {CRM_FIELDS.map(f => (
                          <td key={f} style={{ padding: "9px 14px", whiteSpace: "nowrap", borderRight: "1px solid #f9fafb", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis" }} title={String(row[f] || "")}>
                            {f === "crm_status" && row[f] ? (
                              <span style={{
                                fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
                                background: STATUS_COLORS[row[f] as string]?.bg ?? "#f3f4f6",
                                color: STATUS_COLORS[row[f] as string]?.color ?? "#6b7280",
                              }}>
                                {String(row[f]).replace(/_/g, " ")}
                              </span>
                            ) : (
                              <span style={{ color: row[f] ? "#374151" : "#d1d5db" }}>
                                {String(row[f] || "—")}
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Skipped records */}
          {skipped.length > 0 && (
            <div style={{ flexShrink: 0, marginTop: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <AlertCircle size={14} color="#d97706" />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
                  Skipped Records ({skipped.length})
                </span>
                <span style={{ fontSize: 11, color: "#9ca3af" }}>— no email or mobile found</span>
              </div>
              <div style={{ border: "1px solid #fde68a", borderRadius: 10, overflow: "auto", maxHeight: 160, background: "#fffbeb" }}>
                <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse", minWidth: "max-content" }}>
                  <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
                    <tr style={{ background: "#fef3c7" }}>
                      <th style={{ padding: "8px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#92400e", whiteSpace: "nowrap", borderRight: "1px solid #fde68a" }}>#</th>
                      <th style={{ padding: "8px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#92400e", whiteSpace: "nowrap", borderRight: "1px solid #fde68a" }}>REASON</th>
                      {skipped[0] && Object.keys(skipped[0].record).slice(0, 6).map(k => (
                        <th key={k} style={{ padding: "8px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#92400e", textTransform: "uppercase", whiteSpace: "nowrap", borderRight: "1px solid #fde68a" }}>{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {skipped.map((s, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #fef3c7" }}>
                        <td style={{ padding: "8px 12px", color: "#d97706", fontSize: 11, borderRight: "1px solid #fef3c7", textAlign: "center" }}>{s.index + 1}</td>
                        <td style={{ padding: "8px 14px", color: "#dc2626", fontSize: 11, whiteSpace: "nowrap", borderRight: "1px solid #fef3c7" }}>{s.reason}</td>
                        {Object.keys(skipped[0].record).slice(0, 6).map(k => (
                          <td key={k} style={{ padding: "8px 14px", color: "#78350f", whiteSpace: "nowrap", borderRight: "1px solid #fef3c7", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis" }} title={s.record[k]}>
                            {s.record[k] || "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 24px 20px", borderTop: "1px solid #f3f4f6", flexShrink: 0, display: "flex", gap: 10, marginTop: 16 }}>
          <button onClick={onClose}
            style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", color: "#374151", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
            Close
          </button>
          <button onClick={onViewLeads}
            style={{ flex: 2, padding: "11px 0", borderRadius: 10, border: "none", background: "#f97316", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Users size={15} /> View in Manage Leads
          </button>
        </div>
      </div>
    </div>
  );
}
