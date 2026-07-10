"use client";

import { Upload, Plus, Link2, X, CheckCircle } from "lucide-react";
import { useState } from "react";
import { leadsAPI } from "@/services/api";

interface Props {
  onImportClick: () => void;
}

const sources = [
  { name: "Google Ads",    initial: "G",  bg: "#e8f0fe", color: "#4285f4" },
  { name: "Facebook Ads", initial: "f",  bg: "#e7f3ff", color: "#1877f2" },
  { name: "WhatsApp",     initial: "W",  bg: "#e6f9f0", color: "#25d366" },
  { name: "Harmony",      initial: "H",  bg: "#fef3e2", color: "#f59e0b" },
];

const EMPTY_LEAD = { name: "", email: "", country_code: "+91", mobile_without_country_code: "", company: "", city: "", state: "", country: "India", crm_status: "GOOD_LEAD_FOLLOW_UP", crm_note: "" };

export default function LeadSources({ onImportClick }: Props) {
  const [showSingle, setShowSingle] = useState(false);
  const [form,       setForm]       = useState(EMPTY_LEAD);
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [toast,      setToast]      = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveLead = async () => {
    if (!form.name.trim() && !form.email.trim() && !form.mobile_without_country_code.trim()) {
      showToast("Please fill in at least name, email or phone.");
      return;
    }
    setSaving(true);
    try {
      // Use the process endpoint with a single record
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api") + "/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records: [form] }),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        showToast(`✓ Lead "${form.name || form.email}" added successfully!`);
        setTimeout(() => { setShowSingle(false); setForm(EMPTY_LEAD); setSaved(false); }, 1200);
      } else {
        showToast(data.message || "Failed to save lead.");
      }
    } catch {
      showToast("Failed to save lead. Make sure backend is running.");
    }
    setSaving(false);
  };

  return (
    <div style={{ padding: "32px 36px", background: "#f9fafb", minHeight: "100vh", overflowY: "auto" }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 16, right: 16, zIndex: 200, background: toast.startsWith("✓") ? "#f0fdf4" : "#fef2f2", border: `1px solid ${toast.startsWith("✓") ? "#bbf7d0" : "#fca5a5"}`, color: toast.startsWith("✓") ? "#15803d" : "#dc2626", borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 500, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", maxWidth: 360 }}>
          {toast}
        </div>
      )}

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 }}>Lead Sources</h1>
        <p style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>Connect, manage, and control all your lead channels from one dashboard.</p>
      </div>

      {/* Action cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 520, marginBottom: 32 }}>
        <button onClick={onImportClick}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, border: "2px dashed #d1d5db", borderRadius: 14, padding: "32px 16px", background: "#fff", cursor: "pointer", transition: "all 0.2s" }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#3b82f6"; el.style.background = "#eff6ff"; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#d1d5db"; el.style.background = "#fff"; }}>
          <div style={{ width: 44, height: 44, background: "#f3f4f6", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Upload size={20} color="#6b7280" />
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 600, color: "#374151", fontSize: 13 }}>Import via CSV</div>
            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 3 }}>Bulk import leads</div>
          </div>
        </button>

        <button onClick={() => setShowSingle(true)}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, border: "2px dashed #d1d5db", borderRadius: 14, padding: "32px 16px", background: "#fff", cursor: "pointer", transition: "all 0.2s" }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#10b981"; el.style.background = "#f0fdf4"; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#d1d5db"; el.style.background = "#fff"; }}>
          <div style={{ width: 44, height: 44, background: "#f3f4f6", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Plus size={20} color="#6b7280" />
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 600, color: "#374151", fontSize: 13 }}>Single Lead</div>
            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 3 }}>Add a new lead manually</div>
          </div>
        </button>
      </div>

      {/* Active Lead Sources */}
      <div>
        <h2 style={{ fontWeight: 600, color: "#111827", fontSize: 14, marginBottom: 12 }}>Active Lead Sources</h2>
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 120px", padding: "10px 20px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
            {["SOURCE","ACCOUNT","NUMBER","STATUS",""].map((h, i) => (
              <div key={i} style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</div>
            ))}
          </div>
          {sources.map((s, i) => (
            <div key={s.name} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 120px", padding: "14px 20px", alignItems: "center", borderBottom: i < sources.length - 1 ? "1px solid #f9fafb" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: s.color, flexShrink: 0 }}>{s.initial}</div>
                <div>
                  <div style={{ fontWeight: 500, color: "#111827", fontSize: 13 }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#d1d5db", display: "inline-block" }} /> Inactive
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>—</div>
              <div style={{ fontSize: 12, color: "#9ca3af" }}>Not Connected</div>
              <div style={{ fontSize: 12, color: "#9ca3af" }}>Not Connected</div>
              <button onClick={() => showToast(`${s.name} integration coming soon!`)}
                style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "#374151", border: "1px solid #e5e7eb", borderRadius: 8, padding: "5px 12px", background: "#fff", cursor: "pointer", width: "fit-content" }}>
                <Link2 size={11} /> Connect
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Single Lead Modal */}
      {showSingle && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} onClick={() => setShowSingle(false)} />
          <div style={{ position: "relative", background: "#fff", borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", width: "100%", maxWidth: 480, margin: "0 16px", zIndex: 10, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: "#111827", margin: 0 }}>Add Single Lead</h2>
                <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 3, marginBottom: 0 }}>Manually enter lead details</p>
              </div>
              <button onClick={() => setShowSingle(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}><X size={18} /></button>
            </div>

            <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[
                { label: "Full Name *",   key: "name",                          placeholder: "John Doe",          span: 2 },
                { label: "Email",         key: "email",                         placeholder: "john@example.com",  span: 1 },
                { label: "Phone",         key: "mobile_without_country_code",   placeholder: "9876543210",        span: 1 },
                { label: "Country Code",  key: "country_code",                  placeholder: "+91",               span: 1 },
                { label: "Company",       key: "company",                       placeholder: "Acme Corp",         span: 1 },
                { label: "City",          key: "city",                          placeholder: "Mumbai",            span: 1 },
                { label: "State",         key: "state",                         placeholder: "Maharashtra",       span: 1 },
              ].map(f => (
                <div key={f.key} style={{ gridColumn: f.span === 2 ? "1 / -1" : "auto" }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em" }}>{f.label}</label>
                  <input
                    value={(form as Record<string, string>)[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    style={{ width: "100%", padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", color: "#111827", boxSizing: "border-box" }}
                  />
                </div>
              ))}

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em" }}>Status</label>
                <select value={form.crm_status} onChange={e => setForm(prev => ({ ...prev, crm_status: e.target.value }))}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, color: "#111827", outline: "none" }}>
                  <option value="GOOD_LEAD_FOLLOW_UP">Good Lead</option>
                  <option value="DID_NOT_CONNECT">Not Dialed</option>
                  <option value="BAD_LEAD">Bad Lead</option>
                  <option value="SALE_DONE">Sale Done</option>
                </select>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em" }}>Notes</label>
                <textarea value={form.crm_note} onChange={e => setForm(prev => ({ ...prev, crm_note: e.target.value }))}
                  placeholder="Any remarks or notes..."
                  rows={2}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, color: "#111827", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
              </div>
            </div>

            <div style={{ padding: "14px 24px 20px", borderTop: "1px solid #f3f4f6", display: "flex", gap: 10 }}>
              <button onClick={() => setShowSingle(false)} style={{ flex: 1, padding: "10px", border: "1px solid #e5e7eb", borderRadius: 9, background: "#fff", color: "#374151", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Cancel</button>
              <button onClick={handleSaveLead} disabled={saving || saved}
                style={{ flex: 2, padding: "10px", border: "none", borderRadius: 9, background: saved ? "#dcfce7" : saving ? "#fcd9c0" : "#f97316", color: saved ? "#15803d" : "#fff", fontWeight: 600, fontSize: 13, cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                {saved ? <><CheckCircle size={14} /> Saved!</> : saving ? "Saving..." : <><Plus size={14} /> Add Lead</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
