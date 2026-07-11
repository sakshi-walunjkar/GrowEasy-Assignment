"use client";

import { UserPlus, Mail, Trash2, X, MoreHorizontal } from "lucide-react";
import { useState, useEffect } from "react";
import { teamAPI } from "@/services/api";

type Role = "Owner" | "Admin" | "Agent" | "Viewer";
type Status = "Active" | "Inactive" | "Pending";

interface Member {
  id: number; name: string; email: string; role: Role; status: Status; joined: string; avatar: string; color: string;
}

const INITIAL: Member[] = [
  { id: 1, name: "VK Test",      email: "vk@groweasy.ai",    role: "Owner",  status: "Active",   joined: "Jan 2026", avatar: "VK", color: "#3b82f6" },
  { id: 2, name: "Rahul Sharma", email: "rahul@groweasy.ai", role: "Admin",  status: "Active",   joined: "Feb 2026", avatar: "RS", color: "#10b981" },
  { id: 3, name: "Priya Singh",  email: "priya@groweasy.ai", role: "Agent",  status: "Active",   joined: "Mar 2026", avatar: "PS", color: "#8b5cf6" },
  { id: 4, name: "Amit Kumar",   email: "amit@groweasy.ai",  role: "Agent",  status: "Inactive", joined: "Apr 2026", avatar: "AK", color: "#f59e0b" },
  { id: 5, name: "Neha Patel",   email: "neha@groweasy.ai",  role: "Viewer", status: "Active",   joined: "May 2026", avatar: "NP", color: "#ec4899" },
];

const ROLE_STYLE: Record<Role, { bg: string; color: string }> = {
  Owner:  { bg: "#fef3c7", color: "#d97706" },
  Admin:  { bg: "#dbeafe", color: "#1d4ed8" },
  Agent:  { bg: "#dcfce7", color: "#15803d" },
  Viewer: { bg: "#f3f4f6", color: "#6b7280" },
};

const COLORS = ["#3b82f6","#10b981","#8b5cf6","#f59e0b","#ec4899","#06b6d4","#f97316"];

export default function TeamMembers() {
  const [members,    setMembers]    = useState<Member[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [email,      setEmail]      = useState("");
  const [name,       setName]       = useState("");
  const [role,       setRole]       = useState<Role>("Agent");
  const [sending,    setSending]    = useState(false);
  const [toast,      setToast]      = useState<{ msg: string; ok: boolean } | null>(null);
  const [menuId,     setMenuId]     = useState<number | null>(null);

  useEffect(() => {
    teamAPI.getAll()
      .then(r => setMembers(r.data.data))
      .catch(() => setMembers(INITIAL))
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const handleInvite = async () => {
    if (!email.trim() || !name.trim()) { showToast("Please fill in name and email.", false); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast("Enter a valid email address.", false); return; }
    setSending(true);
    try {
      const r = await teamAPI.add({ name: name.trim(), email: email.trim(), role });
      setMembers(prev => [...prev, r.data.data]);
      showToast(`✓ Invitation sent to ${email} — they'll receive an email to join GrowEasy.`);
      setShowInvite(false); setEmail(""); setName(""); setRole("Agent");
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to invite member.", false);
    }
    setSending(false);
  };

  const handleRemove = async (id: number) => {
    const m = members.find(m => m.id === id);
    if (!m || m.role === "Owner") return;
    if (!confirm(`Remove ${m.name} from the team?`)) return;
    await teamAPI.remove(id);
    setMembers(prev => prev.filter(m => m.id !== id));
    showToast(`${m.name} removed from team.`);
    setMenuId(null);
  };

  const handleRoleChange = async (id: number, newRole: Role) => {
    await teamAPI.update(id, { role: newRole });
    setMembers(prev => prev.map(m => m.id === id ? { ...m, role: newRole } : m));
    setMenuId(null);
    showToast("Role updated.");
  };

  const handleToggleStatus = async (id: number) => {
    const m = members.find(m => m.id === id);
    if (!m) return;
    const newStatus = m.status === "Active" ? "Inactive" : "Active";
    await teamAPI.update(id, { status: newStatus });
    setMembers(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
    setMenuId(null);
  };

  const active  = members.filter(m => m.status === "Active").length;
  const admins  = members.filter(m => m.role === "Admin" || m.role === "Owner").length;
  const pending = members.filter(m => m.status === "Pending").length;

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh", overflowY: "auto" }}>
      <div style={{ padding: "28px 36px" }}>
        {loading && <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>Loading...</div>}

        {toast && (
          <div style={{ position: "fixed", top: 16, right: 16, zIndex: 300, background: toast.ok ? "#f0fdf4" : "#fef2f2", border: `1px solid ${toast.ok ? "#bbf7d0" : "#fca5a5"}`, color: toast.ok ? "#15803d" : "#dc2626", borderRadius: 10, padding: "12px 16px", fontSize: 13, fontWeight: 500, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", maxWidth: 400 }}>
            {toast.msg}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 }}>Team Members</h1>
            <p style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>Manage your team and control access permissions.</p>
          </div>
          <button onClick={() => setShowInvite(true)}
            style={{ display: "flex", alignItems: "center", gap: 7, background: "#111827", color: "#fff", border: "none", borderRadius: 9, padding: "9px 18px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            <UserPlus size={14} /> Invite Member
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
          {[
            { label: "Total Members", value: members.length, color: "#111827", bg: "#fff" },
            { label: "Active",        value: active,         color: "#15803d", bg: "#f0fdf4" },
            { label: "Admins",        value: admins,         color: "#1d4ed8", bg: "#eff6ff" },
            { label: "Pending",       value: pending,        color: "#d97706", bg: "#fffbeb" },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, border: "1px solid #e5e7eb", borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 600, color: "#111827", fontSize: 14 }}>All Members</span>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>{members.length} members</span>
          </div>
          <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f3f4f6", background: "#f9fafb" }}>
                {["MEMBER","EMAIL","ROLE","STATUS","JOINED","ACTIONS"].map(h => (
                  <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map(m => {
                const rs = ROLE_STYLE[m.role];
                return (
                  <tr key={m.id} style={{ borderBottom: "1px solid #f9fafb" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#fafafa"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: m.color + "22", color: m.color, fontWeight: 700, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>{m.avatar}</div>
                        <span style={{ fontWeight: 500, color: "#111827" }}>{m.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "13px 16px", color: "#6b7280" }}>{m.email}</td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: rs.bg, color: rs.color }}>{m.role}</span>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: m.status === "Active" ? "#15803d" : m.status === "Pending" ? "#d97706" : "#9ca3af" }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.status === "Active" ? "#22c55e" : m.status === "Pending" ? "#f59e0b" : "#d1d5db", display: "inline-block" }} />
                        {m.status}
                      </span>
                    </td>
                    <td style={{ padding: "13px 16px", color: "#9ca3af", fontSize: 12 }}>{m.joined}</td>
                    <td style={{ padding: "13px 16px", position: "relative" }}>
                      {m.role !== "Owner" && (
                        <div style={{ position: "relative", display: "inline-block" }}>
                          <button onClick={() => setMenuId(menuId === m.id ? null : m.id)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }}>
                            <MoreHorizontal size={16} />
                          </button>
                          {menuId === m.id && (
                            <div style={{ position: "absolute", right: 0, top: 28, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 50, minWidth: 160, padding: "6px 0" }}>
                              {(["Admin","Agent","Viewer"] as Role[]).map(r => (
                                <button key={r} onClick={() => handleRoleChange(m.id, r)}
                                  style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 14px", fontSize: 13, color: m.role === r ? "#f97316" : "#374151", background: "none", border: "none", cursor: "pointer", fontWeight: m.role === r ? 600 : 400 }}>
                                  Set as {r}
                                </button>
                              ))}
                              <div style={{ borderTop: "1px solid #f3f4f6", margin: "4px 0" }} />
                              <button onClick={() => handleToggleStatus(m.id)}
                                style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 14px", fontSize: 13, color: "#374151", background: "none", border: "none", cursor: "pointer" }}>
                                {m.status === "Active" ? "Deactivate" : "Activate"}
                              </button>
                              <button onClick={() => handleRemove(m.id)}
                                style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 14px", fontSize: 13, color: "#dc2626", background: "none", border: "none", cursor: "pointer" }}>
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Invite modal */}
        {showInvite && (
          <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} onClick={() => setShowInvite(false)} />
            <div style={{ position: "relative", background: "#fff", borderRadius: 16, padding: "28px", width: 440, zIndex: 10, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>Invite Team Member</h3>
                <button onClick={() => setShowInvite(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}><X size={18} /></button>
              </div>
              <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>An invitation email will be sent to the person to join your GrowEasy workspace.</p>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Full Name *</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Rahul Sharma"
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", color: "#111827", boxSizing: "border-box" }} />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Email Address *</label>
                <div style={{ position: "relative" }}>
                  <input
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleInvite()}
                    placeholder="colleague@gmail.com"
                    type="email"
                    style={{ width: "100%", padding: "9px 12px", border: `1px solid ${email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "#fca5a5" : "#e5e7eb"}`, borderRadius: 8, fontSize: 13, outline: "none", color: "#111827", boxSizing: "border-box" }}
                  />
                  {email && !email.includes("@") && (
                    <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 10, overflow: "hidden", marginTop: 2 }}>
                      {["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "company.com"].map(domain => (
                        <button key={domain} type="button"
                          onClick={() => setEmail(email + "@" + domain)}
                          style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 12px", fontSize: 13, color: "#374151", background: "none", border: "none", cursor: "pointer", borderBottom: "1px solid #f9fafb" }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#f9fafb"}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "none"}>
                          {email}@{domain}
                        </button>
                      ))}
                    </div>
                  )}
                  {email && email.includes("@") && !email.split("@")[1]?.includes(".") && (
                    <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 10, overflow: "hidden", marginTop: 2 }}>
                      {["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"].filter(d => d.startsWith(email.split("@")[1] || "")).map(domain => (
                        <button key={domain} type="button"
                          onClick={() => setEmail(email.split("@")[0] + "@" + domain)}
                          style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 12px", fontSize: 13, color: "#374151", background: "none", border: "none", cursor: "pointer", borderBottom: "1px solid #f9fafb" }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#f9fafb"}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "none"}>
                          {email.split("@")[0]}@{domain}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.includes("@") && email.split("@")[1]?.includes(".") && (
                  <div style={{ fontSize: 11, color: "#dc2626", marginTop: 4 }}>Invalid email address</div>
                )}
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Role</label>
                <select value={role} onChange={e => setRole(e.target.value as Role)}
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, color: "#111827", outline: "none" }}>
                  <option value="Agent">Agent — can view and update leads</option>
                  <option value="Admin">Admin — full access except billing</option>
                  <option value="Viewer">Viewer — read-only access</option>
                </select>
              </div>

              <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 12, color: "#1d4ed8" }}>
                <Mail size={12} style={{ display: "inline", marginRight: 6 }} />
                An email will be sent to <strong>{email || "the address above"}</strong> with a link to join your workspace.
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowInvite(false)} style={{ flex: 1, padding: "10px", border: "1px solid #e5e7eb", borderRadius: 9, background: "#fff", color: "#374151", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Cancel</button>
                <button onClick={handleInvite} disabled={sending}
                  style={{ flex: 2, padding: "10px", border: "none", borderRadius: 9, background: sending ? "#9ca3af" : "#111827", color: "#fff", fontWeight: 600, fontSize: 13, cursor: sending ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  {sending ? <><div style={{ width: 13, height: 13, border: "2px solid #fff4", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Sending...</> : <><Mail size={13} /> Send Invite</>}
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
