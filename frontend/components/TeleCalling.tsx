"use client";

import { Phone, PhoneCall, PhoneMissed, Clock, Plus, X } from "lucide-react";
import { useState } from "react";

type CallStatus = "Connected" | "Not Answered" | "Busy" | "Scheduled";
interface CallLog { id: number; name: string; phone: string; duration: string; status: CallStatus; agent: string; time: string; }

const INITIAL: CallLog[] = [
  { id: 1, name: "Rahil Mohammad", phone: "+919579290000", duration: "4:32", status: "Connected",    agent: "Rahul S", time: "10:30 AM" },
  { id: 2, name: "Tarvinder Pal",  phone: "+919811362000", duration: "2:15", status: "Connected",    agent: "Priya S", time: "11:00 AM" },
  { id: 3, name: "Dhruv Bisht",    phone: "+919711564000", duration: "0:00", status: "Not Answered", agent: "Rahul S", time: "11:30 AM" },
  { id: 4, name: "Amit Raheja",    phone: "+919990110000", duration: "6:48", status: "Connected",    agent: "Amit K",  time: "12:00 PM" },
  { id: 5, name: "Amit Shetty",    phone: "+918040740000", duration: "1:20", status: "Busy",         agent: "Priya S", time: "12:30 PM" },
  { id: 6, name: "Amit Singh",     phone: "+917838090000", duration: "3:55", status: "Connected",    agent: "Neha P",  time: "1:00 PM"  },
];

const STATUS_STYLE: Record<CallStatus, { bg: string; color: string }> = {
  Connected:    { bg: "#dcfce7", color: "#15803d" },
  "Not Answered": { bg: "#fee2e2", color: "#dc2626" },
  Busy:         { bg: "#fef3c7", color: "#d97706" },
  Scheduled:    { bg: "#eff6ff", color: "#1d4ed8" },
};

export default function TeleCalling() {
  const [logs,       setLogs]       = useState<CallLog[]>(INITIAL);
  const [showNew,    setShowNew]    = useState(false);
  const [calling,    setCalling]    = useState<number | null>(null);
  const [toast,      setToast]      = useState<string | null>(null);
  const [leadName,   setLeadName]   = useState("");
  const [phone,      setPhone]      = useState("");
  const [agent,      setAgent]      = useState("Rahul S");
  const [schedTime,  setSchedTime]  = useState("");
  const [scheduling, setScheduling] = useState(false);

  const showMsg = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleCall = async (id: number) => {
    const log = logs.find(l => l.id === id);
    if (!log) return;
    setCalling(id);
    showMsg(`📞 Calling ${log.name} at ${log.phone}...`);
    await new Promise(r => setTimeout(r, 2000));
    const outcomes: CallStatus[] = ["Connected", "Not Answered", "Busy"];
    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
    const dur = outcome === "Connected" ? `${Math.floor(Math.random()*8)+1}:${String(Math.floor(Math.random()*60)).padStart(2,"0")}` : "0:00";
    setLogs(prev => prev.map(l => l.id === id ? { ...l, status: outcome, duration: dur, time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) } : l));
    showMsg(outcome === "Connected" ? `✓ Connected with ${log.name}` : `${log.name} — ${outcome}`);
    setCalling(null);
  };

  const handleSchedule = async () => {
    if (!leadName.trim() || !phone.trim()) { showMsg("Fill in lead name and phone."); return; }
    setScheduling(true);
    await new Promise(r => setTimeout(r, 800));
    setLogs(prev => [...prev, {
      id: Date.now(), name: leadName.trim(), phone: phone.trim(),
      duration: "—", status: "Scheduled", agent, time: schedTime || "Pending",
    }]);
    showMsg(`✓ Call scheduled for ${leadName}.`);
    setShowNew(false); setLeadName(""); setPhone(""); setSchedTime(""); setScheduling(false);
  };

  const connected = logs.filter(l => l.status === "Connected").length;
  const missed    = logs.filter(l => l.status === "Not Answered" || l.status === "Busy").length;
  const connectedLogs = logs.filter(l => l.status === "Connected" && l.duration !== "—");
  const avgSecs = connectedLogs.length > 0
    ? connectedLogs.reduce((s, l) => {
        const [m, sec] = l.duration.split(":").map(Number);
        return s + m * 60 + sec;
      }, 0) / connectedLogs.length
    : 0;
  const avgDur = avgSecs > 0 ? `${Math.floor(avgSecs/60)}:${String(Math.round(avgSecs%60)).padStart(2,"0")}` : "—";

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh", overflowY: "auto" }}>
      <div style={{ padding: "28px 36px" }}>

        {toast && (
          <div style={{ position: "fixed", top: 16, right: 16, zIndex: 300, background: toast.startsWith("✓") || toast.startsWith("📞") ? "#f0fdf4" : "#fef2f2", border: `1px solid ${toast.startsWith("✓") || toast.startsWith("📞") ? "#bbf7d0" : "#fca5a5"}`, color: toast.startsWith("✓") || toast.startsWith("📞") ? "#15803d" : "#dc2626", borderRadius: 10, padding: "12px 16px", fontSize: 13, fontWeight: 500, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", maxWidth: 360 }}>
            {toast}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 }}>Tele Calling</h1>
            <p style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>Track calls, manage agents, and monitor calling performance.</p>
          </div>
          <button onClick={() => setShowNew(true)}
            style={{ display: "flex", alignItems: "center", gap: 7, background: "#111827", color: "#fff", border: "none", borderRadius: 9, padding: "9px 18px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            <Plus size={14} /> Schedule Call
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
          {[
            { label: "Total Calls",  value: String(logs.length), icon: Phone,       color: "#3b82f6", bg: "#eff6ff" },
            { label: "Connected",    value: String(connected),   icon: PhoneCall,   color: "#10b981", bg: "#f0fdf4" },
            { label: "Missed/Busy",  value: String(missed),      icon: PhoneMissed, color: "#dc2626", bg: "#fef2f2" },
            { label: "Avg Duration", value: avgDur,              icon: Clock,       color: "#8b5cf6", bg: "#f5f3ff" },
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

        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 600, color: "#111827", fontSize: 14 }}>Call Logs — Today</span>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>{logs.length} calls</span>
          </div>
          <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f3f4f6", background: "#f9fafb" }}>
                {["LEAD NAME","PHONE","DURATION","STATUS","AGENT","TIME","ACTION"].map(h => (
                  <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map(c => {
                const st = STATUS_STYLE[c.status] || STATUS_STYLE.Busy;
                const isCalling = calling === c.id;
                return (
                  <tr key={c.id} style={{ borderBottom: "1px solid #f9fafb" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#fafafa"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                    <td style={{ padding: "12px 16px", fontWeight: 500, color: "#111827" }}>{c.name}</td>
                    <td style={{ padding: "12px 16px", color: "#6b7280", fontFamily: "monospace", fontSize: 12 }}>{c.phone}</td>
                    <td style={{ padding: "12px 16px", color: "#6b7280" }}>{c.duration}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: st.bg, color: st.color }}>{c.status}</span>
                    </td>
                    <td style={{ padding: "12px 16px", color: "#6b7280" }}>{c.agent}</td>
                    <td style={{ padding: "12px 16px", color: "#9ca3af", fontSize: 12 }}>{c.time}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <button onClick={() => handleCall(c.id)} disabled={isCalling || calling !== null}
                        style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: isCalling ? "#9ca3af" : "#3b82f6", background: "none", border: "1px solid", borderColor: isCalling ? "#e5e7eb" : "#bfdbfe", borderRadius: 6, padding: "4px 10px", cursor: isCalling || calling !== null ? "not-allowed" : "pointer", fontWeight: 500 }}>
                        {isCalling
                          ? <><div style={{ width: 10, height: 10, border: "2px solid #e5e7eb", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Calling</>
                          : <><Phone size={11} /> Call</>}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Schedule modal */}
        {showNew && (
          <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} onClick={() => setShowNew(false)} />
            <div style={{ position: "relative", background: "#fff", borderRadius: 16, padding: "28px", width: 420, zIndex: 10, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>Schedule a Call</h3>
                <button onClick={() => setShowNew(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}><X size={18} /></button>
              </div>
              {[
                { label: "Lead Name *",    value: leadName,  onChange: setLeadName,  placeholder: "Rahil Mohammad",  type: "text" },
                { label: "Phone Number *", value: phone,     onChange: setPhone,     placeholder: "+91 98765 43210", type: "tel"  },
                { label: "Scheduled Time", value: schedTime, onChange: setSchedTime, placeholder: "",                type: "datetime-local" },
              ].map(f => (
                <div key={f.label} style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>{f.label}</label>
                  <input value={f.value} onChange={e => f.onChange(e.target.value)} placeholder={f.placeholder} type={f.type}
                    style={{ width: "100%", padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", color: "#111827", boxSizing: "border-box" }} />
                </div>
              ))}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Assign Agent</label>
                <select value={agent} onChange={e => setAgent(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, color: "#111827", outline: "none" }}>
                  {["Rahul S","Priya S","Amit K","Neha P"].map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowNew(false)} style={{ flex: 1, padding: "10px", border: "1px solid #e5e7eb", borderRadius: 9, background: "#fff", color: "#374151", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Cancel</button>
                <button onClick={handleSchedule} disabled={scheduling}
                  style={{ flex: 2, padding: "10px", border: "none", borderRadius: 9, background: scheduling ? "#9ca3af" : "#111827", color: "#fff", fontWeight: 600, fontSize: 13, cursor: scheduling ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  {scheduling ? "Scheduling..." : <><Phone size={13} /> Schedule Call</>}
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
