"use client";

import { MessageCircle, Plus, CheckCircle, Send, X, ExternalLink, Trash2 } from "lucide-react";
import { useState } from "react";

type TplStatus = "Approved" | "Pending" | "Rejected";
interface Template { id: number; name: string; type: string; status: TplStatus; sent: number; body: string; }

const INITIAL: Template[] = [
  { id: 1, name: "Welcome Message",    type: "Greeting",    status: "Approved", sent: 284, body: "Hi {{name}}, welcome to GrowEasy! We're excited to have you. Reply YES to get started." },
  { id: 2, name: "Follow-up Reminder", type: "Follow-up",   status: "Approved", sent: 156, body: "Hi {{name}}, just following up on your inquiry. Are you still interested? Reply to connect." },
  { id: 3, name: "Demo Invite",        type: "Promotional", status: "Pending",  sent: 0,   body: "Hi {{name}}, we'd love to show you a live demo of GrowEasy CRM. Book a slot: {{link}}" },
  { id: 4, name: "Feedback Request",   type: "Survey",      status: "Approved", sent: 89,  body: "Hi {{name}}, how was your experience with us? Rate us 1-5 and share your feedback." },
];

export default function WhatsAppAccount() {
  const [connected,    setConnected]    = useState(false);
  const [templates,    setTemplates]    = useState<Template[]>(INITIAL);
  const [showConnect,  setShowConnect]  = useState(false);
  const [showNew,      setShowNew]      = useState(false);
  const [showSend,     setShowSend]     = useState<Template | null>(null);
  const [phone,        setPhone]        = useState("");
  const [tplName,      setTplName]      = useState("");
  const [tplType,      setTplType]      = useState("Greeting");
  const [tplBody,      setTplBody]      = useState("");
  const [sendTo,       setSendTo]       = useState("");
  const [connecting,   setConnecting]   = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [sending,      setSending]      = useState(false);
  const [toast,        setToast]        = useState<{ msg: string; ok: boolean } | null>(null);

  const showMsg = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3500); };

  const handleConnect = async () => {
    if (!phone.trim()) { showMsg("Enter your WhatsApp Business phone number.", false); return; }
    setConnecting(true);
    await new Promise(r => setTimeout(r, 1800));
    setConnected(true); setShowConnect(false); setPhone("");
    showMsg("✓ WhatsApp Business connected successfully!");
    setConnecting(false);
  };

  const handleNewTemplate = async () => {
    if (!tplName.trim() || !tplBody.trim()) { showMsg("Fill in template name and message body.", false); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));
    setTemplates(prev => [...prev, { id: Date.now(), name: tplName, type: tplType, status: "Pending", sent: 0, body: tplBody }]);
    showMsg("✓ Template submitted for WhatsApp approval (usually 24–48 hrs).");
    setShowNew(false); setTplName(""); setTplBody(""); setTplType("Greeting");
    setSubmitting(false);
  };

  const handleSend = async () => {
    if (!sendTo.trim()) { showMsg("Enter a phone number to send to.", false); return; }
    if (!connected) { showMsg("Connect WhatsApp first.", false); return; }
    setSending(true);
    await new Promise(r => setTimeout(r, 1000));
    setTemplates(prev => prev.map(t => t.id === showSend?.id ? { ...t, sent: t.sent + 1 } : t));
    showMsg(`✓ "${showSend?.name}" sent to ${sendTo}`);
    setShowSend(null); setSendTo(""); setSending(false);
  };

  const handleDelete = (id: number) => {
    const t = templates.find(t => t.id === id);
    if (!confirm(`Delete template "${t?.name}"?`)) return;
    setTemplates(prev => prev.filter(t => t.id !== id));
    showMsg("Template deleted.");
  };

  const totalSent = templates.reduce((s, t) => s + t.sent, 0);

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh", overflowY: "auto" }}>
      <div style={{ padding: "28px 36px" }}>

        {toast && (
          <div style={{ position: "fixed", top: 16, right: 16, zIndex: 300, background: toast.ok ? "#f0fdf4" : "#fef2f2", border: `1px solid ${toast.ok ? "#bbf7d0" : "#fca5a5"}`, color: toast.ok ? "#15803d" : "#dc2626", borderRadius: 10, padding: "12px 16px", fontSize: 13, fontWeight: 500, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", maxWidth: 400 }}>
            {toast.msg}
          </div>
        )}

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 }}>WhatsApp Account</h1>
          <p style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>Connect your WhatsApp Business account to engage leads directly.</p>
        </div>

        {/* Connection card */}
        <div style={{ background: "#fff", border: `1px solid ${connected ? "#bbf7d0" : "#e5e7eb"}`, borderRadius: 12, padding: "24px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MessageCircle size={26} color="#25d366" />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "#111827", fontSize: 15 }}>WhatsApp Business API</div>
              <div style={{ fontSize: 13, color: connected ? "#15803d" : "#9ca3af", marginTop: 2, display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: connected ? "#22c55e" : "#d1d5db", display: "inline-block" }} />
                {connected ? "Connected via Meta Business Suite" : "Not connected — connect via Meta Business Suite"}
              </div>
            </div>
          </div>
          {connected ? (
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => window.open("https://business.facebook.com/wa/manage", "_blank")}
                style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", color: "#374151", border: "1px solid #e5e7eb", borderRadius: 9, padding: "9px 16px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                <ExternalLink size={13} /> Open Meta
              </button>
              <button onClick={() => { setConnected(false); showMsg("WhatsApp disconnected."); }}
                style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 9, padding: "9px 16px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                Disconnect
              </button>
            </div>
          ) : (
            <button onClick={() => setShowConnect(true)}
              style={{ display: "flex", alignItems: "center", gap: 7, background: "#25d366", color: "#fff", border: "none", borderRadius: 9, padding: "10px 20px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              <CheckCircle size={14} /> Connect WhatsApp
            </button>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
          {[
            { label: "Messages Sent",  value: String(totalSent),                                                  color: "#25d366", bg: "#f0fdf4" },
            { label: "Templates",      value: String(templates.length),                                           color: "#3b82f6", bg: "#eff6ff" },
            { label: "Approved",       value: String(templates.filter(t => t.status === "Approved").length),      color: "#15803d", bg: "#dcfce7" },
            { label: "Pending Review", value: String(templates.filter(t => t.status === "Pending").length),       color: "#d97706", bg: "#fef3c7" },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, border: "1px solid #e5e7eb", borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Templates */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 600, color: "#111827", fontSize: 14 }}>Message Templates</span>
            <button onClick={() => setShowNew(true)}
              style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "#25d366", background: "none", border: "1px solid #bbf7d0", borderRadius: 7, padding: "5px 12px", cursor: "pointer" }}>
              <Plus size={12} /> New Template
            </button>
          </div>
          <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f3f4f6", background: "#f9fafb" }}>
                {["TEMPLATE NAME","TYPE","STATUS","SENT","PREVIEW","ACTIONS"].map(h => (
                  <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {templates.map(t => (
                <tr key={t.id} style={{ borderBottom: "1px solid #f9fafb" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#fafafa"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                  <td style={{ padding: "12px 16px", fontWeight: 500, color: "#111827" }}>{t.name}</td>
                  <td style={{ padding: "12px 16px", color: "#6b7280" }}>{t.type}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: t.status === "Approved" ? "#dcfce7" : t.status === "Pending" ? "#fef3c7" : "#fee2e2", color: t.status === "Approved" ? "#15803d" : t.status === "Pending" ? "#d97706" : "#dc2626" }}>{t.status}</span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#6b7280" }}>{t.sent}</td>
                  <td style={{ padding: "12px 16px", color: "#9ca3af", fontSize: 12, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={t.body}>{t.body}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => { if (!connected) { showMsg("Connect WhatsApp first.", false); return; } if (t.status !== "Approved") { showMsg("Only approved templates can be sent.", false); return; } setShowSend(t); }}
                        style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: t.status === "Approved" && connected ? "#25d366" : "#d1d5db", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>
                        <Send size={11} /> Send
                      </button>
                      <button onClick={() => handleDelete(t.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#fca5a5", padding: 2 }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Connect modal */}
        {showConnect && (
          <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} onClick={() => setShowConnect(false)} />
            <div style={{ position: "relative", background: "#fff", borderRadius: 16, padding: "28px", width: 440, zIndex: 10, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>Connect WhatsApp Business</h3>
                <button onClick={() => setShowConnect(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}><X size={18} /></button>
              </div>
              <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>Enter your WhatsApp Business phone number registered with Meta Business Suite.</p>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Phone Number (with country code)</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210"
                style={{ width: "100%", padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", color: "#111827", boxSizing: "border-box", marginBottom: 16 }} />
              <a href="https://business.facebook.com/wa/manage" target="_blank" rel="noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#25d366", fontWeight: 600, marginBottom: 20, textDecoration: "none" }}>
                <ExternalLink size={12} /> Open Meta Business Suite
              </a>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowConnect(false)} style={{ flex: 1, padding: "10px", border: "1px solid #e5e7eb", borderRadius: 9, background: "#fff", color: "#374151", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Cancel</button>
                <button onClick={handleConnect} disabled={connecting}
                  style={{ flex: 2, padding: "10px", border: "none", borderRadius: 9, background: connecting ? "#9ca3af" : "#25d366", color: "#fff", fontWeight: 600, fontSize: 13, cursor: connecting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  {connecting ? <><div style={{ width: 13, height: 13, border: "2px solid #fff4", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Connecting...</> : <><CheckCircle size={13} /> Connect</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* New template modal */}
        {showNew && (
          <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} onClick={() => setShowNew(false)} />
            <div style={{ position: "relative", background: "#fff", borderRadius: 16, padding: "28px", width: 480, zIndex: 10, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>New Message Template</h3>
                <button onClick={() => setShowNew(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}><X size={18} /></button>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Template Name</label>
                <input value={tplName} onChange={e => setTplName(e.target.value)} placeholder="e.g. Welcome Message"
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", color: "#111827", boxSizing: "border-box" }} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Type</label>
                <select value={tplType} onChange={e => setTplType(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, color: "#111827", outline: "none" }}>
                  {["Greeting","Follow-up","Promotional","Survey","Reminder"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Message Body</label>
                <textarea value={tplBody} onChange={e => setTplBody(e.target.value)} rows={4}
                  placeholder="Hi {{name}}, your message here... Use {{name}}, {{link}} as variables."
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", color: "#111827", resize: "vertical", boxSizing: "border-box" }} />
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>Use {"{{name}}"}, {"{{link}}"} as dynamic variables. Template will be reviewed by WhatsApp (24–48 hrs).</div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowNew(false)} style={{ flex: 1, padding: "10px", border: "1px solid #e5e7eb", borderRadius: 9, background: "#fff", color: "#374151", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Cancel</button>
                <button onClick={handleNewTemplate} disabled={submitting}
                  style={{ flex: 2, padding: "10px", border: "none", borderRadius: 9, background: submitting ? "#9ca3af" : "#25d366", color: "#fff", fontWeight: 600, fontSize: 13, cursor: submitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  {submitting ? "Submitting..." : <><Plus size={13} /> Submit for Approval</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Send modal */}
        {showSend && (
          <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} onClick={() => setShowSend(null)} />
            <div style={{ position: "relative", background: "#fff", borderRadius: 16, padding: "28px", width: 420, zIndex: 10, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>Send Template</h3>
                <button onClick={() => setShowSend(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}><X size={18} /></button>
              </div>
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "12px 14px", marginBottom: 16, fontSize: 13, color: "#374151" }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{showSend.name}</div>
                <div style={{ color: "#6b7280" }}>{showSend.body}</div>
              </div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Send to (phone number)</label>
              <input value={sendTo} onChange={e => setSendTo(e.target.value)} placeholder="+91 98765 43210"
                style={{ width: "100%", padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", color: "#111827", boxSizing: "border-box", marginBottom: 20 }} />
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowSend(null)} style={{ flex: 1, padding: "10px", border: "1px solid #e5e7eb", borderRadius: 9, background: "#fff", color: "#374151", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Cancel</button>
                <button onClick={handleSend} disabled={sending}
                  style={{ flex: 2, padding: "10px", border: "none", borderRadius: 9, background: sending ? "#9ca3af" : "#25d366", color: "#fff", fontWeight: 600, fontSize: 13, cursor: sending ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  {sending ? "Sending..." : <><Send size={13} /> Send Message</>}
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
