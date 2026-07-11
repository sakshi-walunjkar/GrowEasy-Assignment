"use client";

import {
  LayoutDashboard, Zap, Database, MessageSquare,
  Users, Radio, UserPlus, MessageCircle,
  Phone, Grid, Link, Settings, History
} from "lucide-react";

type Page = "dashboard" | "generate-leads" | "manage-leads" | "engage-leads" | "lead-sources" | "team-members" | "ad-accounts" | "whatsapp-account" | "tele-calling" | "crm-fields" | "api-center" | "import-history";

interface Props {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

const mainNav = [
  { icon: LayoutDashboard, label: "Dashboard",       key: "dashboard" as Page },
  { icon: Zap,             label: "Generate Leads",  key: "generate-leads" as Page },
  { icon: Database,        label: "Manage Leads",    key: "manage-leads" as Page },
  { icon: History,         label: "Import History",  key: "import-history" as Page },
  { icon: MessageSquare,   label: "Engage Leads",    key: "engage-leads" as Page },
];

const controlNav = [
  { icon: Users,         label: "Team Members",     key: "team-members" as Page     },
  { icon: Radio,         label: "Lead Sources",     key: "lead-sources" as Page     },
  { icon: UserPlus,      label: "Ad Accounts",      key: "ad-accounts" as Page      },
  { icon: MessageCircle, label: "WhatsApp Account", key: "whatsapp-account" as Page },
  { icon: Phone,         label: "Tele Calling",     key: "tele-calling" as Page     },
  { icon: Grid,          label: "CRM Fields",       key: "crm-fields" as Page       },
  { icon: Link,          label: "API Center",       key: "api-center" as Page       },
];

export default function Sidebar({ activePage, onNavigate }: Props) {
  return (
    <div style={{
      width: 220,
      minWidth: 220,
      height: "100vh",
      background: "#ffffff",
      borderRight: "1px solid #e5e7eb",
      display: "flex",
      flexDirection: "column",
      position: "fixed",
      left: 0,
      top: 0,
      zIndex: 30,
      overflowY: "auto",
      overflowX: "hidden",
    }}>

      {/* Logo */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div style={{ width: 28, height: 28, background: "#111827", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
        </div>
        <span style={{ fontWeight: 700, fontSize: 16, color: "#111827", letterSpacing: "-0.3px" }}>GrowEasy</span>
      </div>

      {/* User profile */}
      <div style={{ padding: "10px 14px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8, flexShrink: 0,
            background: "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 700, fontSize: 11,
          }}>VK</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", lineHeight: "1.3" }}>VK Test</div>
            <div style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em" }}>Owner</div>
          </div>
        </div>
        <span style={{ color: "#9ca3af", fontSize: 14, lineHeight: 1 }}>›</span>
      </div>

      {/* Navigation */}
      <div style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>

        {/* MAIN section */}
        <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.09em", padding: "0 8px", marginBottom: 4 }}>Main</div>

        {mainNav.map(({ icon: Icon, label, key }) => {
          const active = activePage === key;
          return (
            <button key={label} onClick={() => key && onNavigate(key)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 9,
                padding: "7px 10px", borderRadius: 7, fontSize: 13,
                fontWeight: active ? 600 : 400,
                color: active ? "#1d4ed8" : "#6b7280",
                background: active ? "#eff6ff" : "transparent",
                border: "none", cursor: key ? "pointer" : "default",
                textAlign: "left", marginBottom: 1, transition: "background 0.15s",
              }}
            >
              <Icon size={15} color={active ? "#3b82f6" : "#9ca3af"} strokeWidth={active ? 2.2 : 1.8} />
              {label}
            </button>
          );
        })}

        {/* CONTROL CENTER section */}
        <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.09em", padding: "0 8px", marginTop: 16, marginBottom: 4 }}>Control Center</div>

        {controlNav.map(({ icon: Icon, label, key }) => {
          const active = activePage === key;
          return (
            <button key={label} onClick={() => key && onNavigate(key)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 9,
                padding: "7px 10px", borderRadius: 7, fontSize: 13,
                fontWeight: active ? 600 : 400,
                color: active ? "#1d4ed8" : "#6b7280",
                background: active ? "#eff6ff" : "transparent",
                border: "none", cursor: key ? "pointer" : "default",
                textAlign: "left", marginBottom: 1, transition: "background 0.15s",
              }}
            >
              <Icon size={15} color={active ? "#3b82f6" : "#9ca3af"} strokeWidth={active ? 2.2 : 1.8} />
              {label}
            </button>
          );
        })}
      </div>

      {/* Business Center */}
      <div style={{ padding: "10px 8px", borderTop: "1px solid #f3f4f6", flexShrink: 0 }}>
        <button style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "7px 10px", borderRadius: 7, fontSize: 13, color: "#6b7280", background: "transparent", border: "none", cursor: "pointer" }}>
          <Settings size={15} color="#9ca3af" strokeWidth={1.8} />
          Business Center
        </button>
      </div>
    </div>
  );
}
