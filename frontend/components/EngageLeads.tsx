"use client";

import { MessageSquare, Mail, Send, Clock, Plus, X, Play, Pause, Trash2 } from "lucide-react";
import { useState } from "react";

type CampaignStatus = "Active" | "Paused" | "Draft";
interface Campaign { id: number; name: string; channel: string; sent: number; opened: number; replied: number; status: CampaignStatus; }

const INITIAL: Campaign[] = [
  { id: 1, name: "Welcome Series",     channel: "Email",    sent: 284, opened: 198, replied: 43, status: "Active" },
  { id: 2, name: "Follow-up Sequence", channel: "WhatsApp", sent: 156, opened: 142, replied: 89, status: "Active" },
  { id: 3, name: "Re-engagement",      channel: "SMS",      sent: 98,  opened: 67,  replied: 12, status: "Paused" },
  { id: 4, name: "Demo Reminder",      channel: "Email",    sent: 45,  opened: 38,  replied: 21, status: "Draft"  },
];

const CHANNEL_STYLE: Record<string, { color: string; bg: string }> = {
  Email:    { color: "#3b82f6", bg: "#eff6ff" },
  WhatsApp: { color: "#25d366", bg: "#f0fdf4" },
  SMS:      { color: "#8b5cf6", bg: "#f5f3ff" },
};

const STATUS_STYLE: Record<CampaignStatus, { color: string; bg: string }> = {
  Active: { color: "#15803d", bg: "#dcfce7" },
  Paused: { color: "#d97706", bg: "#fef3c7" },
  Draft:  { color: "#6b7280", bg: "#f3f4f6" },
};

export default function EngageLeads() {
  const [campaigns,  setCampaigns]  = useState<Campaign[]>(INITIAL);
  const [showNew,    setShowNew]    = useState(false);
  const [name,       setName]       = useState("");
  const [channel,    setChannel]    = useState("Email");
  const [toast,      setToast]      = useState<string | null>(null);
  const [creating,   setCreating]   = useState(false);

  const showMsg = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleCreate = async () => {
    if (!name.trim()) { showMsg("Enter a campaign name."); return; }
    setCreating(true);
    await new Promise(r => setTimeout(r, 800));
    setCampaigns(prev => [...prev, { id: Date.now(), name: name.trim(), channel, sent: 0, opened: 0, replied: 0, status: "Draft" }]);
    showMsg(`✓ Campaign "${name}" created as Draft.`);
    setShowNew(false); setName(""); setChannel("Email"); setCreating(false);
  };

  const handleToggle = (id: number) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: c.status === "Active" ? "Paused" : "Active" } : c));
  };

  const handleDelete = (id: number) => {
    const c = campaigns.find(c => c.id === id);
    if (!confirm(`Delete campaign "${c?.name}"?`)) return;
    setCampaigns(prev => prev.filter(c => c.id !== id));
    showMsg("Campaign deleted.");
  };

  const totalSent    = campaigns.reduce((s, c) => s + c.sent, 0);
  const totalOpened  = campaigns.reduce((s, c) => s + c.opened, 0);
  const totalReplied = campaigns.reduce((s, c) => s + c.replied, 0);
  const openRate     = totalSent > 0 ? Math.round(totalOpened / totalSent * 100) : 0;
  const replyRate    = totalSent > 0 ? Math.round(totalReplied / totalSent * 100) : 0;

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh", overflowY: "auto" }}>
      <div style={{ padding: "28px 36px" }}>

        {toast && (
          <div style={{ position: "fixed", top: 16, right: 16, zIndex: 300, background: toast.startsWith("✓") ? "#f0fdf4" : "#fef2f2", border: `1px solid ${toast.startsWith("✓") ? "#bbf7d0" : "#fca5a5"}`, color: toast.startsWith("✓") ? "#15803d" : "#dc2626", borderRadius: 10, padding: "12px 16px", fontSize: 13, fontWeight: 500, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", maxWidth: 360 }}>
            {toast}
          </div>
        )}

        <div style={{ marginBottom: 24, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 }}>Engage Leads</h1>
            <p style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>Manage campaigns and follow-ups across all channels.</p>
          </div>
          <button onClick={() => setShowNew(true)}
            style={{ display: "flex", alignItems: "center", gap: 8, background: "#111827", color: "#fff", border: "none", borderRadius: 10, padding: "9px 18px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            <Plus size={14} /> New Campaign
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
          {[
            { label: "Messages Sent", value: String(totalSent),    icon: Send,          color: "#3b82f6", bg: "#eff6ff" },
            { label: "Open Rate",     value: `${openRate}%`,       icon: Mail,          color: "#10b981", bg: "#f0fdf4" },
            { label: "Reply Rate",    value: `${replyRate}%`,      icon: MessageSquare, color: "#8b5cf6", bg: "#f5f3ff" },
            { label: "Campaigns",     value: String(campaigns.length), icon: Clock,     color: "#f59e0b", bg: "#fffbeb" },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "16px 18px" }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                  <Icon size={16} color={s.color} />
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#111827" }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>{s.label}</div>
              </div>
            );
          })}
        </div>

        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 600, color: "#111827", fontSize: 14 }}>Campaigns</span>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>{campaigns.length} total</span>
          </div>
          <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f3f4f6", background: "#f9fafb" }}>
                {["CAMPAIGN","CHANNEL","SENT","OPENED","REPLIED","STATUS","ACTIONS"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.map(c => {
                const ch = CHANNEL_STYLE[c.channel] || CHANNEL_STYLE.Email;
                const st = STATUS_STYLE[c.status];
                return (
                  <tr key={c.id} style={{ borderBottom: "1px solid #f9fafb" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#fafafa"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                    <td style={{ padding: "12px 16px", fontWeight: 500, color: "#111827" }}>{c.name}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, background: ch.bg, color: ch.color, padding: "2px 8px", borderRadius: 999 }}>{c.channel}</span>
                    </td>
                    <td style={{ padding: "12px 16px", color: "#6b7280" }}>{c.sent}</td>
                    <td style={{ padding: "12px 16px", color: "#6b7280" }}>{c.opened} {c.sent > 0 && <span style={{ fontSize: 10, color: "#9ca3af" }}>({Math.round(c.opened/c.sent*100)}%)</span>}</td>
                    <td style={{ padding: "12px 16px", color: "#6b7280" }}>{c.replied} {c.sent > 0 && <span style={{ fontSize: 10, color: "#9ca3af" }}>({Math.round(c.replied/c.sent*100)}%)</span>}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, background: st.bg, color: st.color, padding: "2px 8px", borderRadius: 999 }}>{c.status}</span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => handleToggle(c.id)} title={c.status === "Active" ? "Pause" : "Resume"}
                          style={{ padding: "4px 8px", border: "1px solid #e5e7eb", borderRadius: 6, background: "#fff", color: "#374151", cursor: "pointer", display: "flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 500 }}>
                          {c.status === "Active" ? <><Pause size={10} /> Pause</> : <><Play size={10} /> Resume</>}
                        </button>
                        <button onClick={() => handleDelete(c.id)}
                          style={{ padding: "4px 6px", border: "1px solid #fecaca", borderRadius: 6, background: "#fff", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center" }}>
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* New campaign modal */}
        {showNew && (
          <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} onClick={() => setShowNew(false)} />
            <div style={{ position: "relative", background: "#fff", borderRadius: 16, padding: "28px", width: 420, zIndex: 10, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>New Campaign</h3>
                <button onClick={() => setShowNew(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}><X size={18} /></button>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Campaign Name *</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Summer Follow-up"
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", color: "#111827", boxSizing: "border-box" }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Channel</label>
                <select value={channel} onChange={e => setChannel(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, color: "#111827", outline: "none" }}>
                  <option>Email</option><option>WhatsApp</option><option>SMS</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowNew(false)} style={{ flex: 1, padding: "10px", border: "1px solid #e5e7eb", borderRadius: 9, background: "#fff", color: "#374151", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Cancel</button>
                <button onClick={handleCreate} disabled={creating}
                  style={{ flex: 2, padding: "10px", border: "none", borderRadius: 9, background: creating ? "#9ca3af" : "#111827", color: "#fff", fontWeight: 600, fontSize: 13, cursor: creating ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  {creating ? "Creating..." : <><Plus size={13} /> Create Campaign</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
