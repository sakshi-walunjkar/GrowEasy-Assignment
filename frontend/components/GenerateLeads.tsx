"use client";

import { Zap, Globe, Share2, Mail, Phone, Plus, ArrowRight } from "lucide-react";

interface Props {
  onNavigate: (page: string) => void;
}

const channels = [
  { name: "Google Ads",    icon: Globe,    color: "#4285f4", bg: "#e8f0fe", leads: 342, status: "Active" },
  { name: "Facebook Ads", icon: Share2,  color: "#1877f2", bg: "#e7f3ff", leads: 218, status: "Active" },
  { name: "Email Campaign",icon: Mail,     color: "#10b981", bg: "#f0fdf4", leads: 156, status: "Paused" },
  { name: "Cold Calling",  icon: Phone,    color: "#f59e0b", bg: "#fffbeb", leads: 89,  status: "Active" },
];

const tips = [
  "Use specific targeting to reach high-intent buyers",
  "A/B test your ad creatives every 2 weeks",
  "Follow up within 5 minutes of lead capture",
  "Personalize outreach based on lead source",
];

export default function GenerateLeads({ onNavigate }: Props) {
  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh", overflowY: "auto" }}>
      <div style={{ padding: "28px 36px" }}>

        {/* Header */}
        <div style={{ marginBottom: 24, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 }}>Generate Leads</h1>
            <p style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>Connect channels and automate lead generation across platforms.</p>
          </div>
          <button
            onClick={() => onNavigate("lead-sources")}
            style={{ display: "flex", alignItems: "center", gap: 8, background: "#111827", color: "#fff", border: "none", borderRadius: 10, padding: "9px 18px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
          >
            <Plus size={14} /> Add Channel
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
          {[
            { label: "Total Generated",  value: "805",  sub: "This month",    color: "#3b82f6" },
            { label: "Active Channels",  value: "3",    sub: "of 4 connected", color: "#10b981" },
            { label: "Avg. Cost/Lead",   value: "₹142", sub: "Across channels", color: "#8b5cf6" },
          ].map(s => (
            <div key={s.label} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "18px 20px" }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginTop: 4 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Channels */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 12 }}>Lead Channels</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
            {channels.map(ch => {
              const Icon = ch.icon;
              return (
                <div key={ch.name} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: ch.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={20} color={ch.color} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: "#111827", fontSize: 14 }}>{ch.name}</div>
                      <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{ch.leads} leads generated</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: ch.status === "Active" ? "#dcfce7" : "#f3f4f6", color: ch.status === "Active" ? "#15803d" : "#6b7280" }}>
                      {ch.status}
                    </span>
                    <button onClick={() => onNavigate("lead-sources")} style={{ fontSize: 12, color: "#3b82f6", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 3, fontWeight: 500 }}>
                      Manage <ArrowRight size={11} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tips */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Zap size={16} color="#f59e0b" />
            <span style={{ fontWeight: 600, color: "#111827", fontSize: 14 }}>Pro Tips to Generate More Leads</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {tips.map((tip, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px", background: "#fffbeb", borderRadius: 8, border: "1px solid #fde68a" }}>
                <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#f59e0b", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
                <span style={{ fontSize: 12, color: "#78350f", lineHeight: 1.5 }}>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
