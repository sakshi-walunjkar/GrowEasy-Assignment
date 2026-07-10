"use client";

import { Users, TrendingUp, CheckCircle, Clock, ArrowUpRight, Upload, RefreshCw } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { leadsAPI } from "@/services/api";
import { StatsResponse, getStatusStyle } from "@/types/crm";

interface Props { onNavigate: (page: string) => void; }

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
      <p style={{ fontWeight: 600, color: "#111827", marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, margin: 0 }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  );
};

export default function Dashboard({ onNavigate }: Props) {
  const [stats,     setStats]     = useState<StatsResponse["data"] | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [lastFetch, setLastFetch] = useState("");

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await leadsAPI.getStats();
      setStats(res.data.data);
      setLastFetch(new Date().toLocaleTimeString("en-IN"));
    } catch { /* backend offline */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // auto-refresh every 30s
    return () => clearInterval(interval);
  }, [fetchStats]);

  const total = stats?.totalLeads ?? 0;
  const good  = stats?.byStatus.GOOD_LEAD_FOLLOW_UP ?? 0;
  const done  = stats?.byStatus.SALE_DONE ?? 0;
  const notd  = stats?.byStatus.DID_NOT_CONNECT ?? 0;
  const bad   = stats?.byStatus.BAD_LEAD ?? 0;
  const other = total - good - done - notd - bad;

  // Build pie from real data
  const statusPie = [
    { name: "Good Lead",  value: good, color: "#10b981" },
    { name: "Sale Done",  value: done, color: "#3b82f6" },
    { name: "Not Dialed", value: notd, color: "#9ca3af" },
    { name: "Bad Lead",   value: bad,  color: "#f87171" },
    ...(other > 0 ? [{ name: "Unset", value: other, color: "#e5e7eb" }] : []),
  ].filter(s => s.value > 0);
  const pieTotal = statusPie.reduce((a, b) => a + b.value, 0);

  // Build import history bar chart (last 7 imports)
  const importBar = (stats?.importHistory ?? [])
    .slice(0, 7)
    .reverse()
    .map((h, i) => ({
      label: `#${i + 1}`,
      imported: h.imported,
      skipped:  h.skipped,
    }));

  // Recent imports list
  const recentImports = (stats?.importHistory ?? []).slice(0, 5);

  const statCards = [
    { label: "Total Leads",    value: total, change: null,  icon: Users,       color: "#3b82f6", bg: "#eff6ff" },
    { label: "Good Leads",     value: good,  change: null,  icon: TrendingUp,  color: "#10b981", bg: "#f0fdf4" },
    { label: "Sales Done",     value: done,  change: null,  icon: CheckCircle, color: "#8b5cf6", bg: "#f5f3ff" },
    { label: "Not Dialed",     value: notd,  change: null,  icon: Clock,       color: "#f59e0b", bg: "#fffbeb" },
  ];

  const Skeleton = ({ w = "100%", h = 20 }: { w?: string | number; h?: number }) => (
    <div style={{ width: w, height: h, background: "#f3f4f6", borderRadius: 6, animation: "pulse 1.5s ease-in-out infinite" }} />
  );

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh", overflowY: "auto" }}>
      <div style={{ padding: "24px 32px" }}>

        {/* Header */}
        <div style={{ marginBottom: 20, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 }}>Dashboard</h1>
            <p style={{ color: "#6b7280", fontSize: 13, marginTop: 3 }}>
              {loading ? "Loading live data..." : `${total} leads in your CRM · updated ${lastFetch}`}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={fetchStats} disabled={loading}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", color: "#374151", border: "1px solid #e5e7eb", borderRadius: 9, padding: "8px 14px", fontWeight: 600, fontSize: 13, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}>
              <RefreshCw size={13} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} /> Refresh
            </button>
            <button onClick={() => onNavigate("lead-sources")}
              style={{ display: "flex", alignItems: "center", gap: 7, background: "#f97316", color: "#fff", border: "none", borderRadius: 9, padding: "8px 16px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              <Upload size={13} /> Import CSV
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
          {statCards.map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={17} color={s.color} />
                  </div>
                </div>
                {loading
                  ? <Skeleton h={28} w={60} />
                  : <div style={{ fontSize: 28, fontWeight: 700, color: "#111827", lineHeight: 1 }}>{s.value.toLocaleString()}</div>}
                <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Row 1: Import history bar + Status donut */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16, marginBottom: 16 }}>

          {/* Import history bar */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ fontWeight: 600, color: "#111827", fontSize: 14, marginBottom: 4 }}>Import History</div>
            <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 16 }}>
              {stats?.importHistory?.length ?? 0} total imports · {total} leads saved
            </div>
            {loading ? (
              <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Skeleton w="100%" h={160} />
              </div>
            ) : importBar.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={importBar} margin={{ top: 0, right: 10, left: -20, bottom: 0 }} barSize={20}>
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9fafb" }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="imported" name="Imported" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="skipped"  name="Skipped"  fill="#f87171" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📂</div>
                <div style={{ fontSize: 13 }}>No imports yet</div>
                <button onClick={() => onNavigate("lead-sources")} style={{ marginTop: 12, fontSize: 12, color: "#f97316", fontWeight: 600, background: "none", border: "1px solid #fed7aa", borderRadius: 7, padding: "5px 14px", cursor: "pointer" }}>
                  Import your first CSV
                </button>
              </div>
            )}
          </div>

          {/* Status donut */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ fontWeight: 600, color: "#111827", fontSize: 14, marginBottom: 8 }}>Lead Status Breakdown</div>
            {loading ? (
              <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Skeleton w={130} h={130} />
              </div>
            ) : total === 0 ? (
              <div style={{ height: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
                <div style={{ fontSize: 13 }}>No data yet</div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <ResponsiveContainer width={130} height={130}>
                  <PieChart>
                    <Pie data={statusPie} cx="50%" cy="50%" innerRadius={38} outerRadius={58} dataKey="value" strokeWidth={0}>
                      {statusPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1 }}>
                  {statusPie.map(s => (
                    <div key={s.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, display: "inline-block" }} />
                        <span style={{ fontSize: 11, color: "#6b7280" }}>{s.name}</span>
                      </div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#111827" }}>{s.value}</span>
                        <span style={{ fontSize: 10, color: "#9ca3af" }}>{pieTotal > 0 ? Math.round(s.value / pieTotal * 100) : 0}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Recent imports + Quick actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>

          {/* Recent imports */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 600, color: "#111827", fontSize: 14 }}>Recent Imports</span>
              <button onClick={() => onNavigate("manage-leads")} style={{ fontSize: 12, color: "#3b82f6", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 3, fontWeight: 500 }}>
                View all <ArrowUpRight size={11} />
              </button>
            </div>
            {loading ? (
              <div style={{ padding: "12px 20px" }}>
                {[1,2,3].map(i => <div key={i} style={{ height: 44, background: "#f3f4f6", borderRadius: 8, marginBottom: 8 }} />)}
              </div>
            ) : recentImports.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
                No imports yet — <button onClick={() => onNavigate("lead-sources")} style={{ color: "#f97316", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>import a CSV</button>
              </div>
            ) : (
              recentImports.map((h, i) => {
                const d    = new Date(h.imported_at);
                const diff = Date.now() - d.getTime();
                const time = diff < 60000 ? "just now" : diff < 3600000 ? `${Math.floor(diff/60000)}m ago` : diff < 86400000 ? `${Math.floor(diff/3600000)}h ago` : d.toLocaleDateString("en-IN");
                return (
                  <div key={h.id} style={{ padding: "11px 20px", borderBottom: i < recentImports.length - 1 ? "1px solid #f9fafb" : "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11, color: "#10b981", flexShrink: 0 }}>
                        {h.imported}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>
                          {h.imported} imported · {h.skipped} skipped
                        </div>
                        <div style={{ fontSize: 11, color: "#9ca3af" }}>{h.total_records} total records</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, background: h.imported > 0 ? "#dcfce7" : "#fee2e2", color: h.imported > 0 ? "#15803d" : "#dc2626", padding: "2px 8px", borderRadius: 999 }}>
                        {h.imported > 0 ? "Success" : "Failed"}
                      </span>
                      <span style={{ fontSize: 10, color: "#9ca3af" }}>{time}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick actions + live stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ fontWeight: 600, color: "#111827", fontSize: 14, marginBottom: 12 }}>Quick Actions</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { label: "Import CSV",     color: "#f97316", bg: "#fff7ed", action: "lead-sources"   },
                  { label: "Manage Leads",   color: "#3b82f6", bg: "#eff6ff", action: "manage-leads"   },
                  { label: "Generate Leads", color: "#8b5cf6", bg: "#f5f3ff", action: "generate-leads" },
                  { label: "API Center",     color: "#10b981", bg: "#f0fdf4", action: "api-center"     },
                ].map(a => (
                  <button key={a.label} onClick={() => onNavigate(a.action)}
                    style={{ padding: "11px 8px", borderRadius: 9, border: `1px solid ${a.color}33`, background: a.bg, color: a.color, fontWeight: 600, fontSize: 12, cursor: "pointer", textAlign: "center" }}>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ fontWeight: 600, color: "#111827", fontSize: 14, marginBottom: 12 }}>Live Status Summary</div>
              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[1,2,3,4].map(i => <Skeleton key={i} h={16} />)}
                </div>
              ) : (
                [
                  { label: "Good Leads",  value: good, color: "#10b981", pct: total > 0 ? good/total : 0 },
                  { label: "Sales Done",  value: done, color: "#3b82f6", pct: total > 0 ? done/total : 0 },
                  { label: "Not Dialed",  value: notd, color: "#9ca3af", pct: total > 0 ? notd/total : 0 },
                  { label: "Bad Leads",   value: bad,  color: "#f87171", pct: total > 0 ? bad/total  : 0 },
                ].map(s => (
                  <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                        <span style={{ fontSize: 12, color: "#374151", fontWeight: 500 }}>{s.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>{s.value}</span>
                      </div>
                      <div style={{ height: 4, background: "#f3f4f6", borderRadius: 999 }}>
                        <div style={{ height: "100%", width: `${Math.round(s.pct * 100)}%`, background: s.color, borderRadius: 999, transition: "width 0.5s ease" }} />
                      </div>
                    </div>
                    <span style={{ fontSize: 11, color: "#9ca3af", width: 32, textAlign: "right" }}>{Math.round(s.pct * 100)}%</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>
    </div>
  );
}
