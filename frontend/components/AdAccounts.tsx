"use client";

import { Plus, Link2, TrendingUp, Eye, MousePointer, X, ExternalLink, Settings, Pause, Play } from "lucide-react";
import { useState } from "react";

type AccStatus = "Active" | "Paused" | "Not Connected";
interface Account { id: string; name: string; platform: string; spend: number; leads: number; status: AccStatus; color: string; bg: string; initial: string; }

const INITIAL: Account[] = [
  { id: "ADS-001", name: "Google Ads",    platform: "google",    spend: 24500, leads: 342, status: "Active",        color: "#4285f4", bg: "#e8f0fe", initial: "G"  },
  { id: "ADS-002", name: "Facebook Ads", platform: "facebook",  spend: 18200, leads: 218, status: "Active",        color: "#1877f2", bg: "#e7f3ff", initial: "f"  },
  { id: "ADS-003", name: "Instagram Ads",platform: "instagram", spend: 9800,  leads: 98,  status: "Paused",        color: "#e1306c", bg: "#fce4ec", initial: "I"  },
  { id: "ADS-004", name: "LinkedIn Ads", platform: "linkedin",  spend: 0,     leads: 0,   status: "Not Connected", color: "#0077b5", bg: "#e3f2fd", initial: "in" },
];

const CONNECT_URLS: Record<string, string> = {
  google:    "https://ads.google.com",
  facebook:  "https://business.facebook.com",
  instagram: "https://business.facebook.com",
  linkedin:  "https://business.linkedin.com",
};

export default function AdAccounts() {
  const [accounts,    setAccounts]    = useState<Account[]>(INITIAL);
  const [showConnect, setShowConnect] = useState<Account | null>(null);
  const [showManage,  setShowManage]  = useState<Account | null>(null);
  const [toast,       setToast]       = useState<string | null>(null);
  const [connecting,  setConnecting]  = useState(false);
  const [accountId,   setAccountId]   = useState("");
  const [budget,      setBudget]      = useState("");

  const showMsg = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleConnect = async () => {
    if (!accountId.trim()) { showMsg("Please enter your account ID."); return; }
    setConnecting(true);
    await new Promise(r => setTimeout(r, 1500));
    setAccounts(prev => prev.map(a => a.id === showConnect?.id ? { ...a, status: "Active" } : a));
    showMsg(`✓ ${showConnect?.name} connected successfully!`);
    setShowConnect(null); setAccountId(""); setConnecting(false);
  };

  const handleToggle = (id: string) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, status: a.status === "Active" ? "Paused" : "Active" } : a));
    const acc = accounts.find(a => a.id === id);
    showMsg(`${acc?.name} ${acc?.status === "Active" ? "paused" : "resumed"}.`);
    setShowManage(null);
  };

  const handleDisconnect = (id: string) => {
    if (!confirm("Disconnect this ad account?")) return;
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, status: "Not Connected", spend: 0, leads: 0 } : a));
    showMsg("Account disconnected.");
    setShowManage(null);
  };

  const handleUpdateBudget = () => {
    if (!budget) return;
    showMsg(`✓ Daily budget updated to ₹${budget} for ${showManage?.name}.`);
    setBudget(""); setShowManage(null);
  };

  const connected = accounts.filter(a => a.status !== "Not Connected");
  const totalSpend = accounts.reduce((s, a) => s + a.spend, 0);
  const totalLeads = accounts.reduce((s, a) => s + a.leads, 0);
  const avgCpl = totalLeads > 0 ? Math.round(totalSpend / totalLeads) : 0;

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh", overflowY: "auto" }}>
      <div style={{ padding: "28px 36px" }}>

        {toast && (
          <div style={{ position: "fixed", top: 16, right: 16, zIndex: 300, background: toast.startsWith("✓") ? "#f0fdf4" : "#fef2f2", border: `1px solid ${toast.startsWith("✓") ? "#bbf7d0" : "#fca5a5"}`, color: toast.startsWith("✓") ? "#15803d" : "#dc2626", borderRadius: 10, padding: "12px 16px", fontSize: 13, fontWeight: 500, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", maxWidth: 360 }}>
            {toast}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 }}>Ad Accounts</h1>
            <p style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>Connect and manage your advertising accounts.</p>
          </div>
          <button onClick={() => showMsg("Select an account below to connect it.")}
            style={{ display: "flex", alignItems: "center", gap: 7, background: "#111827", color: "#fff", border: "none", borderRadius: 9, padding: "9px 18px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            <Plus size={14} /> Connect Account
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
          {[
            { label: "Total Ad Spend",  value: `₹${totalSpend.toLocaleString("en-IN")}`, icon: TrendingUp,   color: "#3b82f6", bg: "#eff6ff" },
            { label: "Total Leads",     value: String(totalLeads),                         icon: MousePointer, color: "#10b981", bg: "#f0fdf4" },
            { label: "Avg CPL",         value: avgCpl > 0 ? `₹${avgCpl}` : "—",           icon: Eye,          color: "#8b5cf6", bg: "#f5f3ff" },
            { label: "Active Accounts", value: String(connected.filter(a => a.status === "Active").length), icon: Link2, color: "#f59e0b", bg: "#fffbeb" },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "16px 18px" }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                  <Icon size={16} color={s.color} />
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 3 }}>{s.label}</div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
          {accounts.map(acc => (
            <div key={acc.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: acc.bg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: acc.color }}>{acc.initial}</div>
                  <div>
                    <div style={{ fontWeight: 600, color: "#111827", fontSize: 14 }}>{acc.name}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>{acc.id}</div>
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999,
                  background: acc.status === "Active" ? "#dcfce7" : acc.status === "Paused" ? "#fef3c7" : "#f3f4f6",
                  color: acc.status === "Active" ? "#15803d" : acc.status === "Paused" ? "#d97706" : "#6b7280" }}>
                  {acc.status}
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 14 }}>
                {[
                  { label: "Spend",  value: acc.spend > 0 ? `₹${acc.spend.toLocaleString("en-IN")}` : "—" },
                  { label: "Leads",  value: String(acc.leads) },
                  { label: "CPL",    value: acc.leads > 0 ? `₹${Math.round(acc.spend / acc.leads)}` : "—" },
                ].map(m => (
                  <div key={m.label} style={{ background: "#f9fafb", borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>{m.value}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{m.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {acc.status === "Not Connected" ? (
                  <button onClick={() => setShowConnect(acc)}
                    style={{ flex: 1, padding: "8px", border: "none", borderRadius: 8, background: acc.color, color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                    <Link2 size={12} /> Connect
                  </button>
                ) : (
                  <>
                    <button onClick={() => setShowManage(acc)}
                      style={{ flex: 1, padding: "8px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", color: "#374151", fontWeight: 600, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                      <Settings size={12} /> Manage
                    </button>
                    <button onClick={() => window.open(CONNECT_URLS[acc.platform], "_blank")}
                      style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", color: "#6b7280", cursor: "pointer", display: "flex", alignItems: "center" }}>
                      <ExternalLink size={12} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Connect modal */}
        {showConnect && (
          <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} onClick={() => setShowConnect(null)} />
            <div style={{ position: "relative", background: "#fff", borderRadius: 16, padding: "28px", width: 440, zIndex: 10, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: showConnect.bg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: showConnect.color }}>{showConnect.initial}</div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>Connect {showConnect.name}</h3>
                </div>
                <button onClick={() => setShowConnect(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}><X size={18} /></button>
              </div>
              <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>Enter your {showConnect.name} account ID to link it with GrowEasy CRM.</p>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Account ID</label>
              <input value={accountId} onChange={e => setAccountId(e.target.value)} placeholder={`e.g. ${showConnect.id.replace("ADS", "ACC")}-XXXXXX`}
                style={{ width: "100%", padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", color: "#111827", boxSizing: "border-box", marginBottom: 16 }} />
              <a href={CONNECT_URLS[showConnect.platform]} target="_blank" rel="noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: showConnect.color, fontWeight: 600, marginBottom: 20, textDecoration: "none" }}>
                <ExternalLink size={12} /> Open {showConnect.name} dashboard to find your Account ID
              </a>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowConnect(null)} style={{ flex: 1, padding: "10px", border: "1px solid #e5e7eb", borderRadius: 9, background: "#fff", color: "#374151", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Cancel</button>
                <button onClick={handleConnect} disabled={connecting}
                  style={{ flex: 2, padding: "10px", border: "none", borderRadius: 9, background: connecting ? "#9ca3af" : showConnect.color, color: "#fff", fontWeight: 600, fontSize: 13, cursor: connecting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  {connecting ? <><div style={{ width: 13, height: 13, border: "2px solid #fff4", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Connecting...</> : <><Link2 size={13} /> Connect Account</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Manage modal */}
        {showManage && (
          <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} onClick={() => setShowManage(null)} />
            <div style={{ position: "relative", background: "#fff", borderRadius: 16, padding: "28px", width: 420, zIndex: 10, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>Manage {showManage.name}</h3>
                <button onClick={() => setShowManage(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}><X size={18} /></button>
              </div>
              <div style={{ background: "#f9fafb", borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  {[
                    { label: "Spend", value: `₹${showManage.spend.toLocaleString("en-IN")}` },
                    { label: "Leads", value: String(showManage.leads) },
                    { label: "Status", value: showManage.status },
                  ].map(m => (
                    <div key={m.label}>
                      <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 2 }}>{m.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Update Daily Budget (₹)</label>
              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                <input value={budget} onChange={e => setBudget(e.target.value)} type="number" placeholder="e.g. 2000"
                  style={{ flex: 1, padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", color: "#111827" }} />
                <button onClick={handleUpdateBudget} style={{ padding: "9px 16px", background: "#111827", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Update</button>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => handleToggle(showManage.id)}
                  style={{ flex: 1, padding: "10px", border: "1px solid #e5e7eb", borderRadius: 9, background: "#fff", color: "#374151", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  {showManage.status === "Active" ? <><Pause size={13} /> Pause</> : <><Play size={13} /> Resume</>}
                </button>
                <button onClick={() => handleDisconnect(showManage.id)}
                  style={{ flex: 1, padding: "10px", border: "1px solid #fecaca", borderRadius: 9, background: "#fff", color: "#dc2626", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                  Disconnect
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
