"use client";

import { Plus, Pencil, Trash2, X } from "lucide-react";
import { useState, useEffect } from "react";
import { fieldsAPI } from "@/services/api";

type Field = { name: string; label: string; type: string; required: boolean; system: boolean };

const defaultFields: Field[] = [
  { name: "created_at",                  label: "Created At",        type: "DateTime", required: true,  system: true  },
  { name: "name",                        label: "Lead Name",         type: "Text",     required: true,  system: true  },
  { name: "email",                       label: "Email",             type: "Email",    required: false, system: true  },
  { name: "country_code",               label: "Country Code",      type: "Text",     required: false, system: true  },
  { name: "mobile_without_country_code", label: "Mobile Number",     type: "Phone",    required: false, system: true  },
  { name: "company",                     label: "Company",           type: "Text",     required: false, system: true  },
  { name: "city",                        label: "City",              type: "Text",     required: false, system: true  },
  { name: "state",                       label: "State",             type: "Text",     required: false, system: true  },
  { name: "country",                     label: "Country",           type: "Text",     required: false, system: true  },
  { name: "lead_owner",                  label: "Lead Owner",        type: "Email",    required: false, system: true  },
  { name: "crm_status",                  label: "CRM Status",        type: "Dropdown", required: false, system: true  },
  { name: "crm_note",                    label: "CRM Note",          type: "TextArea", required: false, system: true  },
  { name: "data_source",                 label: "Data Source",       type: "Dropdown", required: false, system: true  },
  { name: "possession_time",             label: "Possession Time",   type: "Text",     required: false, system: true  },
  { name: "description",                 label: "Description",       type: "TextArea", required: false, system: true  },
];

const FIELD_TYPES = ["Text", "Email", "Phone", "DateTime", "Dropdown", "TextArea", "Number", "URL"];

const TYPE_STYLE: Record<string, { bg: string; color: string }> = {
  Text:     { bg: "#f3f4f6", color: "#374151" },
  Email:    { bg: "#eff6ff", color: "#1d4ed8" },
  Phone:    { bg: "#f0fdf4", color: "#15803d" },
  DateTime: { bg: "#fef3c7", color: "#d97706" },
  Dropdown: { bg: "#f5f3ff", color: "#7c3aed" },
  TextArea: { bg: "#fff7ed", color: "#c2410c" },
  Number:   { bg: "#ecfdf5", color: "#059669" },
  URL:      { bg: "#fdf4ff", color: "#9333ea" },
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8,
  fontSize: 13, color: "#111827", outline: "none", boxSizing: "border-box",
};

const emptyForm = { name: "", label: "", type: "Text", required: false };

export default function CRMFields() {
  const [fields, setFields]       = useState<Field[]>(defaultFields);
  const [showModal, setShowModal] = useState(false);
  const [editIdx, setEditIdx]     = useState<number | null>(null);
  const [form, setForm]           = useState(emptyForm);
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);
  const [toast, setToast]         = useState("");

  // Load custom fields from DB and merge with system fields
  useEffect(() => {
    fieldsAPI.getAll()
      .then(r => setFields([...defaultFields, ...r.data.data]))
      .catch(() => {});
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const openAdd = () => { setForm(emptyForm); setEditIdx(null); setShowModal(true); };
  const openEdit = (i: number) => {
    const f = fields[i];
    setForm({ name: f.name, label: f.label, type: f.type, required: f.required });
    setEditIdx(i);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.label.trim()) return;
    const slug = form.name.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    if (editIdx !== null) {
      const f = fields[editIdx];
      if (f.system) {
        // system fields: update locally only
        setFields(prev => prev.map((f, i) => i === editIdx ? { ...f, label: form.label.trim(), type: form.type, required: form.required } : f));
      } else {
        try {
          const r = await fieldsAPI.update((f as any).id, { label: form.label.trim(), type: form.type, required: form.required });
          setFields(prev => prev.map((f, i) => i === editIdx ? { ...r.data.data, system: false } : f));
        } catch { showToast("Failed to update field."); return; }
      }
      showToast("Field updated.");
    } else {
      try {
        const r = await fieldsAPI.add({ name: slug, label: form.label.trim(), type: form.type, required: form.required });
        setFields(prev => [...prev, r.data.data]);
        showToast("Custom field added.");
      } catch (err: any) {
        showToast(err?.response?.data?.message || "Failed to add field."); return;
      }
    }
    setShowModal(false);
  };

  const handleDelete = async () => {
    if (deleteIdx === null) return;
    const f = fields[deleteIdx];
    if (!f.system) {
      try { await fieldsAPI.remove((f as any).id); } catch { showToast("Failed to delete field."); return; }
    }
    setFields(prev => prev.filter((_, i) => i !== deleteIdx));
    setDeleteIdx(null);
    showToast("Field deleted.");
  };

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh", overflowY: "auto" }}>
      <div style={{ padding: "28px 36px" }}>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 }}>CRM Fields</h1>
            <p style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>Manage the fields used to capture and store lead information.</p>
          </div>
          <button onClick={openAdd}
            style={{ display: "flex", alignItems: "center", gap: 7, background: "#111827", color: "#fff", border: "none", borderRadius: 9, padding: "9px 18px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            <Plus size={14} /> Add Custom Field
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24 }}>
          {[
            { label: "Total Fields",    value: fields.length,                          color: "#111827", bg: "#fff"     },
            { label: "System Fields",   value: fields.filter(f => f.system).length,    color: "#3b82f6", bg: "#eff6ff"  },
            { label: "Required Fields", value: fields.filter(f => f.required).length,  color: "#dc2626", bg: "#fef2f2"  },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, border: "1px solid #e5e7eb", borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Fields table */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #f3f4f6" }}>
            <span style={{ fontWeight: 600, color: "#111827", fontSize: 14 }}>All CRM Fields</span>
          </div>
          <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                {["FIELD NAME", "LABEL", "TYPE", "REQUIRED", "SYSTEM", "ACTIONS"].map(h => (
                  <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fields.map((f, i) => {
                const ts = TYPE_STYLE[f.type] || TYPE_STYLE.Text;
                return (
                  <tr key={i} style={{ borderBottom: "1px solid #f9fafb" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#fafafa"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                    <td style={{ padding: "11px 16px", fontFamily: "monospace", fontSize: 12, color: "#374151" }}>{f.name}</td>
                    <td style={{ padding: "11px 16px", fontWeight: 500, color: "#111827" }}>{f.label}</td>
                    <td style={{ padding: "11px 16px" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: ts.bg, color: ts.color }}>{f.type}</span>
                    </td>
                    <td style={{ padding: "11px 16px" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: f.required ? "#fee2e2" : "#f3f4f6", color: f.required ? "#dc2626" : "#9ca3af" }}>
                        {f.required ? "Yes" : "No"}
                      </span>
                    </td>
                    <td style={{ padding: "11px 16px" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: f.system ? "#eff6ff" : "#f0fdf4", color: f.system ? "#1d4ed8" : "#15803d" }}>
                        {f.system ? "System" : "Custom"}
                      </span>
                    </td>
                    <td style={{ padding: "11px 16px" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => openEdit(i)}
                          title="Edit field"
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: 4, borderRadius: 6 }}>
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => !f.system && setDeleteIdx(i)}
                          title={f.system ? "System fields cannot be deleted" : "Delete field"}
                          style={{ background: "none", border: "none", cursor: f.system ? "not-allowed" : "pointer", color: f.system ? "#d1d5db" : "#dc2626", padding: 4, borderRadius: 6 }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: 28, width: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111827" }}>{editIdx !== null ? "Edit Field" : "Add Custom Field"}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}><X size={18} /></button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Field Name (slug) *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  disabled={editIdx !== null}
                  placeholder="e.g. budget_range"
                  style={{ ...inputStyle, background: editIdx !== null ? "#f9fafb" : "#fff", color: editIdx !== null ? "#9ca3af" : "#111827" }} />
                {editIdx === null && <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>Spaces → underscores, lowercase only</div>}
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Display Label *</label>
                <input value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
                  placeholder="e.g. Budget Range"
                  style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Field Type</label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                  style={{ ...inputStyle, background: "#fff" }}>
                  {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13, color: "#374151" }}>
                <input type="checkbox" checked={form.required} onChange={e => setForm(p => ({ ...p, required: e.target.checked }))}
                  style={{ width: 15, height: 15, cursor: "pointer" }} />
                Mark as required field
              </label>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 22, justifyContent: "flex-end" }}>
              <button onClick={() => setShowModal(false)}
                style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={!form.name.trim() || !form.label.trim()}
                style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: !form.name.trim() || !form.label.trim() ? "#e5e7eb" : "#111827", color: !form.name.trim() || !form.label.trim() ? "#9ca3af" : "#fff", fontSize: 13, fontWeight: 600, cursor: !form.name.trim() || !form.label.trim() ? "not-allowed" : "pointer" }}>
                {editIdx !== null ? "Save Changes" : "Add Field"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteIdx !== null && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: 28, width: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <h2 style={{ margin: "0 0 10px", fontSize: 16, fontWeight: 700, color: "#111827" }}>Delete Field?</h2>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 20px" }}>
              Delete <strong>{fields[deleteIdx]?.label}</strong>? This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setDeleteIdx(null)}
                style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={handleDelete}
                style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: "#dc2626", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#111827", color: "#fff", padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 300, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
          {toast}
        </div>
      )}
    </div>
  );
}
