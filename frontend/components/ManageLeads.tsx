"use client";

import { Search, RefreshCw, Upload, Trash2, ChevronDown, X, Filter, Eye, AlertCircle, Download } from "lucide-react";
import { CRMRecord, StatsResponse, getStatusStyle, CRM_STATUS_OPTIONS } from "@/types/crm";
import { useState, useEffect, useRef, useCallback } from "react";
import { leadsAPI } from "@/services/api";

interface Props {
  refreshKey?: number;
  onReset?: () => void;
  onImportClick?: () => void;
}

const PAGE_SIZE = 15;

export default function ManageLeads({ refreshKey = 0, onReset, onImportClick }: Props) {
  const [searchInput,  setSearchInput]  = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page,         setPage]         = useState(1);
  const [leads,        setLeads]        = useState<CRMRecord[]>([]);
  const [total,        setTotal]        = useState(0);
  const [stats,        setStats]        = useState<StatsResponse["data"] | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [loadingMore,  setLoadingMore]  = useState(false);
  const [updating,     setUpdating]     = useState<string | null>(null);
  const [deleting,     setDeleting]     = useState<string | null>(null);
  const [selected,     setSelected]     = useState<CRMRecord | null>(null);
  const [fetchError,   setFetchError]   = useState<string | null>(null);

  const prevRefreshKey = useRef(refreshKey);
  const fetchId = useRef(0);

  const fetchData = useCallback(async (search: string, status: string) => {
    const id = ++fetchId.current;
    setLoading(true);
    setFetchError(null);
    try {
      const [leadsRes, statsRes] = await Promise.all([
        leadsAPI.getAll({ q: search || undefined, status: status || undefined, page: 1, limit: PAGE_SIZE }),
        leadsAPI.getStats(),
      ]);
      if (fetchId.current !== id) return; // stale
      setLeads(leadsRes.data.data);
      setTotal(leadsRes.data.total);
      setStats(statsRes.data.data);
      setPage(1);
    } catch (err: unknown) {
      if (fetchId.current !== id) return;
      const msg = (err as { message?: string })?.message || "Failed to load leads";
      setFetchError(msg);
    } finally {
      if (fetchId.current === id) setLoading(false);
    }
  }, []);

  // Single effect handles: mount, refreshKey change, search/filter change
  useEffect(() => {
    if (prevRefreshKey.current !== refreshKey) {
      prevRefreshKey.current = refreshKey;
      setActiveSearch(""); setSearchInput(""); setFilterStatus(""); setSelected(null);
      fetchData("", "");
    } else {
      fetchData(activeSearch, filterStatus);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, activeSearch, filterStatus]);

  const refreshStats = async () => {
    try { const r = await leadsAPI.getStats(); setStats(r.data.data); } catch { /* silent */ }
  };

  const handleSearch = () => setActiveSearch(searchInput);

  const handleFilterStatus = (s: string) => setFilterStatus(prev => prev === s ? "" : s);

  const handleRefresh = () => {
    setSearchInput(""); setActiveSearch(""); setFilterStatus("");
    fetchData("", "");
  };

  const handleLoadMore = async () => {
    const next = page + 1;
    setLoadingMore(true);
    try {
      const res = await leadsAPI.getAll({
        q: activeSearch || undefined, status: filterStatus || undefined,
        page: next, limit: PAGE_SIZE,
      });
      setLeads(prev => [...prev, ...res.data.data]);
      setPage(next);
    } catch { /* silent */ }
    setLoadingMore(false);
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    if (!id) return;
    setUpdating(id);
    try {
      await leadsAPI.update(id, { crm_status: newStatus });
      setLeads(prev => prev.map(r => r.id === id ? { ...r, crm_status: newStatus } : r));
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, crm_status: newStatus } : prev);
      refreshStats();
    } catch { /* silent */ }
    setUpdating(null);
  };

  const handleDelete = async (id: string) => {
    if (!id || !confirm("Delete this lead? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await leadsAPI.delete(id);
      setLeads(prev => prev.filter(r => r.id !== id));
      setTotal(prev => prev - 1);
      if (selected?.id === id) setSelected(null);
      refreshStats();
    } catch { /* silent */ }
    setDeleting(null);
  };

  const handleExport = () => {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const url  = `${base}/leads/export${filterStatus ? `?status=${filterStatus}` : ""}`;
    window.open(url, "_blank");
  };

  const handleClearAll = async () => {
    if (!confirm("Clear ALL leads and import history? This cannot be undone.")) return;
    try {
      await leadsAPI.clearAll();
      setLeads([]); setTotal(0); setStats(null); setSelected(null);
      onReset?.();
    } catch { /* silent */ }
  };

  const hasMore = leads.length < total;
  const isEmpty = !loading && leads.length === 0 && !fetchError;

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ padding: "28px 36px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 }}>Manage Leads</h1>
          <p style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>View, search, filter and update all your imported CRM leads.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {total > 0 && (
            <>
              <button onClick={handleExport} style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", color: "#059669", border: "1px solid #a7f3d0", borderRadius: 9, padding: "9px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                <Download size={13} /> Export CSV
              </button>
              <button onClick={handleClearAll} style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 9, padding: "9px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                <Trash2 size={13} /> Clear All
              </button>
            </>
          )}
          <button onClick={onImportClick} style={{ display: "flex", alignItems: "center", gap: 7, background: "#f97316", color: "#fff", border: "none", borderRadius: 9, padding: "9px 18px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            <Upload size={13} /> Import CSV
          </button>
        </div>
      </div>

      {/* Error banner */}
      {fetchError && (
        <div style={{ margin: "16px 36px 0", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <AlertCircle size={15} color="#dc2626" />
          <span style={{ fontSize: 13, color: "#dc2626", flex: 1 }}>{fetchError} — make sure the backend is running on port 5000</span>
          <button onClick={handleRefresh} style={{ fontSize: 12, color: "#dc2626", fontWeight: 600, background: "none", border: "1px solid #fecaca", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>Retry</button>
        </div>
      )}

      {/* Stats cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14, padding: "20px 36px 0" }}>
        {[
          { label: "Total Leads", value: stats?.totalLeads ?? total,                   color: "#111827", bg: "#fff",    border: "#e5e7eb", filter: "" },
          { label: "Good Leads",  value: stats?.byStatus.GOOD_LEAD_FOLLOW_UP ?? 0,     color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0", filter: "GOOD_LEAD_FOLLOW_UP" },
          { label: "Sales Done",  value: stats?.byStatus.SALE_DONE ?? 0,               color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe", filter: "SALE_DONE" },
          { label: "Not Dialed",  value: stats?.byStatus.DID_NOT_CONNECT ?? 0,         color: "#6b7280", bg: "#f9fafb", border: "#e5e7eb", filter: "DID_NOT_CONNECT" },
          { label: "Bad Leads",   value: stats?.byStatus.BAD_LEAD ?? 0,                color: "#dc2626", bg: "#fef2f2", border: "#fecaca", filter: "BAD_LEAD" },
        ].map(s => (
          <button key={s.label} onClick={() => handleFilterStatus(s.filter)}
            style={{ background: s.bg, border: `1px solid ${filterStatus === s.filter && s.filter ? s.color : s.border}`, borderRadius: 12, padding: "14px 16px", textAlign: "left", cursor: "pointer", outline: "none", boxShadow: filterStatus === s.filter && s.filter ? `0 0 0 2px ${s.color}33` : "none", transition: "all 0.15s" }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.color, lineHeight: 1 }}>{loading ? "—" : s.value}</div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 5 }}>{s.label}</div>
          </button>
        ))}
      </div>

      {/* Table card */}
      <div style={{ margin: "16px 36px 36px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>

        {/* Toolbar */}
        <div style={{ padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f3f4f6" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 600, color: "#111827", fontSize: 14 }}>Leads</span>
            {total > 0 && <span style={{ fontSize: 12, color: "#9ca3af", background: "#f3f4f6", borderRadius: 999, padding: "2px 8px" }}>{total}</span>}
            {filterStatus && (
              <button onClick={() => handleFilterStatus("")} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#f97316", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 999, padding: "2px 8px", cursor: "pointer" }}>
                <Filter size={10} /> {CRM_STATUS_OPTIONS.find(s => s.value === filterStatus)?.label} <X size={9} />
              </button>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
              <input
                type="text"
                placeholder="Search name, email, phone, company..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                style={{ fontSize: 13, padding: "7px 12px", outline: "none", width: 260, color: "#374151", border: "none", background: "#fff" }}
              />
              <button onClick={handleSearch} style={{ background: "#1f2937", padding: "7px 12px", color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}>
                <Search size={13} />
              </button>
            </div>
            <button onClick={handleRefresh} title="Refresh" style={{ padding: "7px 8px", color: "#9ca3af", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center" }}>
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div style={{ padding: "16px 20px" }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ height: 44, background: "#f3f4f6", borderRadius: 8, marginBottom: 8, opacity: 1 - i * 0.15 }} />
            ))}
          </div>
        )}

        {/* Table */}
        {!loading && leads.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse", minWidth: 860 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f3f4f6", background: "#f9fafb" }}>
                  {["LEAD NAME","EMAIL","CONTACT","COMPANY","LOCATION","DATE","STATUS",""].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map((row, i) => {
                  const st    = getStatusStyle(row.crm_status);
                  const isUpd = updating === row.id;
                  const isDel = deleting === row.id;
                  const isSel = selected?.id === row.id;
                  return (
                    <tr key={row.id ?? i}
                      style={{ borderBottom: "1px solid #f9fafb", opacity: isDel ? 0.4 : 1, cursor: "pointer", background: isSel ? "#fffbeb" : "transparent", transition: "background 0.1s" }}
                      onClick={() => setSelected(isSel ? null : row)}
                      onMouseEnter={e => { if (!isSel) (e.currentTarget as HTMLElement).style.background = "#fafafa"; }}
                      onMouseLeave={e => { if (!isSel) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      <td style={{ padding: "12px 14px", fontWeight: 500, color: "#111827", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11, color: "#3b82f6", flexShrink: 0 }}>
                            {row.name?.[0]?.toUpperCase() || "?"}
                          </div>
                          <span style={{ maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis" }}>{row.name || "—"}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px", color: "#6b7280", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={row.email}>
                        {row.email || <span style={{ color: "#d1d5db" }}>—</span>}
                      </td>
                      <td style={{ padding: "12px 14px", color: "#6b7280", whiteSpace: "nowrap" }}>
                        {row.mobile_without_country_code
                          ? `${row.country_code || "+91"} ${row.mobile_without_country_code}`
                          : <span style={{ color: "#d1d5db" }}>—</span>}
                      </td>
                      <td style={{ padding: "12px 14px", color: "#6b7280", whiteSpace: "nowrap", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis" }}>
                        {row.company || <span style={{ color: "#d1d5db" }}>—</span>}
                      </td>
                      <td style={{ padding: "12px 14px", color: "#6b7280", whiteSpace: "nowrap" }}>
                        {[row.city, row.state].filter(Boolean).join(", ") || <span style={{ color: "#d1d5db" }}>—</span>}
                      </td>
                      <td style={{ padding: "12px 14px", color: "#9ca3af", whiteSpace: "nowrap", fontSize: 11 }}>
                        {row.imported_at
                          ? (() => { try { return new Date(row.imported_at!).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); } catch { return "—"; } })()
                          : <span style={{ color: "#d1d5db" }}>—</span>}
                      </td>
                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ width: 7, height: 7, borderRadius: "50%", background: st.color, display: "inline-block", flexShrink: 0 }} />
                          <select
                            value={row.crm_status || ""}
                            disabled={isUpd || !row.id}
                            onChange={e => row.id && handleStatusUpdate(row.id, e.target.value)}
                            style={{ padding: "3px 6px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: st.bg, color: st.color, border: `1px solid ${st.border}`, cursor: row.id ? "pointer" : "default", outline: "none", opacity: isUpd ? 0.6 : 1 }}
                          >
                            <option value="">— Select —</option>
                            {CRM_STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                          </select>
                          {isUpd && <div style={{ width: 10, height: 10, border: "2px solid #e5e7eb", borderTopColor: "#f97316", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />}
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button onClick={() => setSelected(isSel ? null : row)} title="View details"
                            style={{ padding: "5px 7px", color: "#6b7280", border: "1px solid #e5e7eb", borderRadius: 7, background: isSel ? "#f3f4f6" : "#fff", cursor: "pointer", display: "inline-flex", alignItems: "center" }}>
                            <Eye size={12} />
                          </button>
                          <button onClick={() => row.id && handleDelete(row.id)} disabled={isDel || !row.id} title="Delete"
                            style={{ padding: "5px 7px", color: "#ef4444", border: "1px solid #fecaca", borderRadius: 7, background: "#fff", cursor: "pointer", display: "inline-flex", alignItems: "center", opacity: isDel ? 0.5 : 1 }}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty state */}
        {isEmpty && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>📋</div>
            <p style={{ color: "#374151", fontWeight: 600, fontSize: 15, margin: 0 }}>No leads found</p>
            <p style={{ color: "#9ca3af", fontSize: 13, marginTop: 6 }}>
              {activeSearch || filterStatus ? "Try adjusting your search or filter." : "Import a CSV file to get started."}
            </p>
            {!activeSearch && !filterStatus && (
              <button onClick={onImportClick} style={{ marginTop: 16, background: "#f97316", color: "#fff", border: "none", borderRadius: 9, padding: "10px 22px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                Import CSV
              </button>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{ padding: "12px 20px", borderTop: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>Showing {leads.length} of {total} leads</span>
          {hasMore ? (
            <button onClick={handleLoadMore} disabled={loadingMore}
              style={{ display: "flex", alignItems: "center", gap: 6, color: "#f97316", fontWeight: 600, fontSize: 13, background: "none", border: "1px solid #fed7aa", borderRadius: 8, padding: "6px 16px", cursor: loadingMore ? "not-allowed" : "pointer", opacity: loadingMore ? 0.6 : 1 }}>
              {loadingMore
                ? <><div style={{ width: 12, height: 12, border: "2px solid #fed7aa", borderTopColor: "#f97316", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Loading...</>
                : <><ChevronDown size={13} /> Load more</>}
            </button>
          ) : (
            total > 0 && <span style={{ color: "#d1d5db", fontSize: 12 }}>All {total} leads loaded</span>
          )}
        </div>
      </div>

      {/* Lead detail drawer */}
      {selected && (
        <div style={{ position: "fixed", right: 0, top: 0, bottom: 0, width: 340, background: "#fff", borderLeft: "1px solid #e5e7eb", zIndex: 40, overflowY: "auto", boxShadow: "-4px 0 24px rgba(0,0,0,0.1)" }}>
          <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: "#3b82f6" }}>
                {selected.name?.[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: "#111827", fontSize: 14, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selected.name || "Unknown"}</div>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>Lead Details</div>
              </div>
            </div>
            <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }}><X size={16} /></button>
          </div>
          <div style={{ padding: "16px 20px" }}>
            {selected.crm_status && (() => {
              const st = getStatusStyle(selected.crm_status);
              return <div style={{ marginBottom: 16 }}><span style={{ fontSize: 12, fontWeight: 600, background: st.bg, color: st.color, border: `1px solid ${st.border}`, borderRadius: 999, padding: "4px 12px" }}>{st.label}</span></div>;
            })()}
            {[
              { label: "Email",       value: selected.email },
              { label: "Phone",       value: selected.mobile_without_country_code ? `${selected.country_code || "+91"} ${selected.mobile_without_country_code}` : "" },
              { label: "Company",     value: selected.company },
              { label: "City",        value: selected.city },
              { label: "State",       value: selected.state },
              { label: "Country",     value: selected.country },
              { label: "Data Source", value: selected.data_source },
              { label: "Lead Owner",  value: selected.lead_owner },
              { label: "Possession",  value: selected.possession_time },
              { label: "Imported",    value: selected.imported_at ? (() => { try { return new Date(selected.imported_at!).toLocaleString("en-IN"); } catch { return selected.imported_at; } })() : "" },
            ].filter(f => f.value).map(f => (
              <div key={f.label} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>{f.label}</div>
                <div style={{ fontSize: 13, color: "#374151", wordBreak: "break-word" }}>{f.value}</div>
              </div>
            ))}
            {selected.crm_note && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>Notes</div>
                <div style={{ fontSize: 13, color: "#374151", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", lineHeight: 1.6 }}>{selected.crm_note}</div>
              </div>
            )}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #f3f4f6" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Update Status</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {CRM_STATUS_OPTIONS.map(s => (
                  <button key={s.value}
                    onClick={() => selected.id && handleStatusUpdate(selected.id, s.value)}
                    disabled={updating === selected.id}
                    style={{ padding: "7px 8px", borderRadius: 8, border: `1px solid ${selected.crm_status === s.value ? s.color : s.border}`, background: selected.crm_status === s.value ? s.bg : "#fff", color: s.color, fontWeight: 600, fontSize: 11, cursor: "pointer", opacity: updating === selected.id ? 0.6 : 1 }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => selected.id && handleDelete(selected.id)}
              style={{ marginTop: 16, width: "100%", padding: "9px", border: "1px solid #fecaca", borderRadius: 9, background: "#fff", color: "#dc2626", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Trash2 size={13} /> Delete Lead
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
