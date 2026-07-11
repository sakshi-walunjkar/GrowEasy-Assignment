"use client";

import { useEffect, useState, useCallback } from "react";
import { Upload, RefreshCw, CheckCircle, SkipForward, Clock } from "lucide-react";

interface ImportRecord {
  id: string;
  imported_at: string;
  total_records: number;
  imported: number;
  skipped: number;
}

interface Props { onImportClick: () => void; }

export default function ImportHistory({ onImportClick }: Props) {
  const [history,  setHistory]  = useState<ImportRecord[]>([]);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [loading,  setLoading]  = useState(true);

  const LIMIT = 15;

  const fetch = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const r = await (await window.fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/leads/import-history?page=${p}&limit=${LIMIT}`
      )).json();
      if (r.success) { setHistory(r.data); setTotal(r.total); }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetch(page); }, [fetch, page]);

  const totalPages = Math.ceil(total / LIMIT);

  const fmt = (iso: string) => {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    if (diff < 60000)    return "just now";
    if (diff < 3600000)  return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const successRate = (imp: number, total: number) =>
    total > 0 ? Math.round((imp / total) * 100) : 0;

  const totalImported = history.reduce((s, h) => s + h.imported, 0);
  const totalSkipped  = history.reduce((s, h) => s + h.skipped, 0);
  const totalRecords  = history.reduce((s, h) => s + h.total_records, 0);

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh", overflowY: "auto" }}>
      <div style={{ padding: "28px 36px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 }}>Import History</h1>
            <p style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>
              {total} total imports · all CSV imports tracked here
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => fetch(page)} disabled={loading}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", color: "#374151", border: "1px solid #e5e7eb", borderRadius: 9, padding: "8px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              <RefreshCw size={13} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} /> Refresh
            </button>
            <button onClick={onImportClick}
              style={{ display: "flex", alignItems: "center", gap: 7, background: "#f97316", color: "#fff", border: "none", borderRadius: 9, padding: "8px 16px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              <Upload size={13} /> New Import
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
          {[
            { label: "Total Imports",   value: total,         color: "#3b82f6", bg: "#eff6ff",  icon: Clock },
            { label: "Records Processed", value: totalRecords, color: "#8b5cf6", bg: "#f5f3ff", icon: Upload },
            { label: "Successfully Imported", value: totalImported, color: "#10b981", bg: "#f0fdf4", icon: CheckCircle },
            { label: "Skipped",         value: totalSkipped,  color: "#f59e0b", bg: "#fffbeb",  icon: SkipForward },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "16px 18px" }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                  <Icon size={16} color={s.color} />
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#111827" }}>{s.value.toLocaleString()}</div>
                <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 3 }}>{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Table */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 600, color: "#111827", fontSize: 14 }}>All Imports</span>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>{total} records</span>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>
              <div style={{ width: 32, height: 32, border: "3px solid #f3f4f6", borderTopColor: "#f97316", borderRadius: "50%", margin: "0 auto 12px", animation: "spin 0.8s linear infinite" }} />
              Loading import history...
            </div>
          ) : history.length === 0 ? (
            <div style={{ padding: "60px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#374151", marginBottom: 6 }}>No imports yet</div>
              <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 20 }}>Upload your first CSV to get started</div>
              <button onClick={onImportClick}
                style={{ background: "#f97316", color: "#fff", border: "none", borderRadius: 9, padding: "10px 20px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                Import CSV
              </button>
            </div>
          ) : (
            <>
              <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                    {["#", "DATE & TIME", "TOTAL RECORDS", "IMPORTED", "SKIPPED", "SUCCESS RATE", "STATUS"].map(h => (
                      <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, i) => {
                    const rate = successRate(h.imported, h.total_records);
                    const ok   = h.imported > 0;
                    return (
                      <tr key={h.id}
                        style={{ borderBottom: "1px solid #f9fafb" }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#fafafa"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                        <td style={{ padding: "13px 16px", color: "#9ca3af", fontSize: 12 }}>
                          {(page - 1) * LIMIT + i + 1}
                        </td>
                        <td style={{ padding: "13px 16px" }}>
                          <div style={{ fontWeight: 500, color: "#111827", fontSize: 13 }}>
                            {new Date(h.imported_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </div>
                          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                            {new Date(h.imported_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} · {fmt(h.imported_at)}
                          </div>
                        </td>
                        <td style={{ padding: "13px 16px", fontWeight: 600, color: "#374151" }}>
                          {h.total_records.toLocaleString()}
                        </td>
                        <td style={{ padding: "13px 16px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "#15803d", fontWeight: 600 }}>
                            <CheckCircle size={13} color="#22c55e" /> {h.imported.toLocaleString()}
                          </span>
                        </td>
                        <td style={{ padding: "13px 16px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: h.skipped > 0 ? "#d97706" : "#9ca3af", fontWeight: 600 }}>
                            <SkipForward size={13} /> {h.skipped.toLocaleString()}
                          </span>
                        </td>
                        <td style={{ padding: "13px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ flex: 1, height: 6, background: "#f3f4f6", borderRadius: 999, minWidth: 60 }}>
                              <div style={{ height: "100%", width: `${rate}%`, background: rate > 80 ? "#22c55e" : rate > 50 ? "#f59e0b" : "#f87171", borderRadius: 999 }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#374151", minWidth: 32 }}>{rate}%</span>
                          </div>
                        </td>
                        <td style={{ padding: "13px 16px" }}>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: ok ? "#dcfce7" : "#fee2e2", color: ok ? "#15803d" : "#dc2626" }}>
                            {ok ? "Success" : "Failed"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ padding: "14px 20px", borderTop: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>
                    Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
                  </span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                      style={{ padding: "6px 14px", borderRadius: 7, border: "1px solid #e5e7eb", background: "#fff", color: page === 1 ? "#d1d5db" : "#374151", fontWeight: 600, fontSize: 12, cursor: page === 1 ? "not-allowed" : "pointer" }}>
                      ← Prev
                    </button>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                      style={{ padding: "6px 14px", borderRadius: 7, border: "1px solid #e5e7eb", background: "#fff", color: page === totalPages ? "#d1d5db" : "#374151", fontWeight: 600, fontSize: 12, cursor: page === totalPages ? "not-allowed" : "pointer" }}>
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
