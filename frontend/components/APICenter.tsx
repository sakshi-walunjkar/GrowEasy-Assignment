"use client";

import { Copy, Play, CheckCircle, XCircle, RefreshCw, Zap, Database, Server, Key, AlertTriangle } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000";

const endpoints: { method: string; path: string; full: string; desc: string; needsBody: boolean; note?: string }[] = [
  { method: "GET",    path: "/",                  full: BASE_URL + "/",                       desc: "Health check — server running",    needsBody: false },
  { method: "GET",    path: "/api/leads",          full: BASE_URL + "/api/leads",              desc: "Fetch all CRM leads",              needsBody: false },
  { method: "GET",    path: "/api/leads/stats",    full: BASE_URL + "/api/leads/stats",        desc: "Lead stats + import history",      needsBody: false },
  { method: "GET",    path: "/api/leads/export",   full: BASE_URL + "/api/leads/export",       desc: "Export all leads as CSV",          needsBody: false },
  { method: "POST",   path: "/api/upload",         full: BASE_URL + "/api/upload",             desc: "Upload & parse CSV file",           needsBody: true,  note: "Needs multipart CSV file" },
  { method: "POST",   path: "/api/process",        full: BASE_URL + "/api/process",            desc: "AI-extract CRM fields",            needsBody: true,  note: "Needs JSON body: { records }"  },
  { method: "PATCH",  path: "/api/leads/:id",      full: "",                                   desc: "Update a lead (needs ID)",         needsBody: true,  note: "Needs lead ID + body"          },
  { method: "DELETE", path: "/api/leads/:id",      full: "",                                   desc: "Delete a lead (needs ID)",         needsBody: true,  note: "Needs lead ID"                 },
  { method: "DELETE", path: "/api/leads",          full: BASE_URL + "/api/leads",              desc: "Clear all leads & history",        needsBody: false },
];

const METHOD_COLOR: Record<string, { bg: string; color: string; border: string }> = {
  GET:    { bg: "#dcfce7", color: "#15803d", border: "#bbf7d0" },
  POST:   { bg: "#dbeafe", color: "#1d4ed8", border: "#bfdbfe" },
  PATCH:  { bg: "#fef3c7", color: "#d97706", border: "#fde68a" },
  DELETE: { bg: "#fee2e2", color: "#dc2626", border: "#fecaca" },
};

type ServerStatus = "checking" | "online" | "offline";
type GeminiStatus = "checking" | "configured" | "missing" | "invalid";
type TestResult   = { status: number; ok: boolean; ms: number; preview: string };

export default function APICenter() {
  const [serverStatus, setServerStatus] = useState<ServerStatus>("checking");
  const [geminiStatus, setGeminiStatus] = useState<GeminiStatus>("checking");
  const [dbStats,      setDbStats]      = useState<{ total: number; imports: number } | null>(null);
  const [testResults,  setTestResults]  = useState<Record<string, TestResult>>({});
  const [testing,      setTesting]      = useState<string | null>(null);
  const [copied,       setCopied]       = useState<string | null>(null);
  const [lastChecked,  setLastChecked]  = useState<string>("");

  const checkAll = useCallback(async () => {
    setServerStatus("checking");
    setGeminiStatus("checking");
    setDbStats(null);

    // 1. Server health
    try {
      const t0  = Date.now();
      const res = await fetch(BASE_URL + "/", { signal: AbortSignal.timeout(4000) });
      const ms  = Date.now() - t0;
      setServerStatus(res.ok ? "online" : "offline");
    } catch {
      setServerStatus("offline");
    }

    // 2. DB stats (also confirms leads API works)
    try {
      const res  = await fetch(BASE_URL + "/api/leads/stats", { signal: AbortSignal.timeout(4000) });
      const json = await res.json();
      if (json.success) {
        setDbStats({
          total:   json.data.totalLeads,
          imports: json.data.totalImports ?? json.data.importHistory?.length ?? 0,
        });
      }
    } catch { /* offline */ }

    // 3. Gemini key status — call a tiny test via backend
    try {
      const res  = await fetch(BASE_URL + "/api/gemini-status", { signal: AbortSignal.timeout(4000) });
      const json = await res.json();
      setGeminiStatus(json.status); // "configured" | "missing" | "invalid"
    } catch {
      // endpoint doesn't exist yet — infer from process test
      setGeminiStatus("missing");
    }

    setLastChecked(new Date().toLocaleTimeString("en-IN"));
  }, []);

  useEffect(() => { checkAll(); }, [checkAll]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const testEndpoint = async (ep: typeof endpoints[0]) => {
    if (!ep.full) return;
    const key = ep.method + ep.path;
    setTesting(key);
    const t0 = Date.now();
    try {
      // For DELETE endpoints, ping the GET equivalent safely — never actually delete on test
      const safeMethod = ep.method === "DELETE" ? "GET" : ep.method;
      const safeUrl    = ep.method === "DELETE" && ep.path === "/api/leads"
        ? BASE_URL + "/api/leads/stats"  // ping stats instead of deleting
        : ep.full;
      const res  = await fetch(safeUrl, {
        method:  safeMethod,
        headers: { "Content-Type": "application/json" },
        signal:  AbortSignal.timeout(6000),
      });
      const ms   = Date.now() - t0;
      const text = await res.text();
      let preview = text;
      try {
        const parsed = JSON.parse(text);
        if (parsed.success !== undefined) {
          if (ep.method === "DELETE" && ep.path === "/api/leads") {
            preview = parsed.data?.totalLeads !== undefined
              ? `✓ DB reachable · ${parsed.data.totalLeads} leads · ${parsed.data.totalImports ?? 0} imports`
              : `✓ success`;
          } else {
            preview = parsed.success
              ? `✓ success${parsed.total !== undefined ? ` · ${parsed.total} leads` : ""}${parsed.message ? ` · ${parsed.message}` : ""}`
              : `✗ ${parsed.message || "error"}`;
          }
        } else {
          preview = JSON.stringify(parsed).slice(0, 120);
        }
      } catch { preview = text.slice(0, 120); }
      setTestResults(prev => ({ ...prev, [key]: { status: res.status, ok: res.ok, ms, preview } }));
    } catch (err: unknown) {
      setTestResults(prev => ({ ...prev, [key]: { status: 0, ok: false, ms: Date.now() - t0, preview: String(err) } }));
    }
    setTesting(null);
  };

  const testAll = async () => {
    for (const ep of endpoints.filter(e => e.full && e.method === "GET" && !e.needsBody)) {
      await testEndpoint(ep);
    }
    // Also ping POST endpoints to verify they're reachable (expect 400 without body)
    for (const ep of endpoints.filter(e => e.full && e.needsBody && e.method === "POST")) {
      await testEndpoint(ep);
    }
  };

  const geminiInfo = {
    configured: { color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0", icon: "✓", label: "Configured — AI extraction active" },
    missing:    { color: "#d97706", bg: "#fffbeb", border: "#fde68a", icon: "⚠", label: "Not set — using direct column mapping fallback" },
    invalid:    { color: "#dc2626", bg: "#fef2f2", border: "#fecaca", icon: "✗", label: "Invalid key — check backend/.env" },
    checking:   { color: "#6b7280", bg: "#f9fafb", border: "#e5e7eb", icon: "…", label: "Checking..." },
  }[geminiStatus];

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh", overflowY: "auto" }}>
      <div style={{ padding: "28px 36px", maxWidth: 960 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 }}>API Center</h1>
            <p style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>
              Live backend monitor · test endpoints · check Gemini AI status
              {lastChecked && <span style={{ color: "#d1d5db" }}> · last checked {lastChecked}</span>}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={testAll}
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#3b82f6", border: "1px solid #bfdbfe", borderRadius: 8, padding: "7px 14px", background: "#eff6ff", cursor: "pointer" }}>
              <Play size={12} /> Test All GET
            </button>
            <button onClick={checkAll}
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#374151", border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 14px", background: "#fff", cursor: "pointer" }}>
              <RefreshCw size={12} /> Refresh
            </button>
          </div>
        </div>

        {/* Status cards row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>

          {/* Backend server */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Server size={16} color="#15803d" />
              </div>
              <span style={{ fontWeight: 600, color: "#111827", fontSize: 13 }}>Backend Server</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 10, height: 10, borderRadius: "50%",
                background: serverStatus === "online" ? "#22c55e" : serverStatus === "offline" ? "#ef4444" : "#f59e0b",
                animation: serverStatus === "checking" ? "pulse 1s infinite" : "none",
              }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: serverStatus === "online" ? "#15803d" : serverStatus === "offline" ? "#dc2626" : "#d97706" }}>
                {serverStatus === "online" ? "Online" : serverStatus === "offline" ? "Offline" : "Checking..."}
              </span>
            </div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 6, fontFamily: "monospace" }}>{BASE_URL}</div>
          </div>

          {/* Gemini AI */}
          <div style={{ background: geminiStatus === "configured" ? "#f0fdf4" : "#fff", border: `1px solid ${geminiStatus === "configured" ? "#bbf7d0" : "#e5e7eb"}`, borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: geminiStatus === "configured" ? "#dcfce7" : "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Zap size={16} color={geminiStatus === "configured" ? "#15803d" : "#d97706"} />
              </div>
              <span style={{ fontWeight: 600, color: "#111827", fontSize: 13 }}>Gemini AI</span>
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: geminiInfo.color, background: geminiInfo.bg, border: `1px solid ${geminiInfo.border}`, borderRadius: 6, padding: "4px 10px", display: "inline-block" }}>
              {geminiInfo.icon} {geminiInfo.label}
            </div>
          </div>

          {/* Database */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Database size={16} color="#3b82f6" />
              </div>
              <span style={{ fontWeight: 600, color: "#111827", fontSize: 13 }}>SQLite Database</span>
            </div>
            {dbStats !== null ? (
              <div style={{ display: "flex", gap: 16 }}>
                <div><div style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>{dbStats.total}</div><div style={{ fontSize: 11, color: "#9ca3af" }}>Leads</div></div>
                <div><div style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>{dbStats.imports}</div><div style={{ fontSize: 11, color: "#9ca3af" }}>Imports</div></div>
              </div>
            ) : (
              <div style={{ fontSize: 12, color: "#9ca3af" }}>Connecting...</div>
            )}
          </div>
        </div>

        {/* How to set Gemini key — only show when not configured */}
        {geminiStatus !== "configured" && <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Key size={15} color="#d97706" />
            <span style={{ fontWeight: 600, color: "#92400e", fontSize: 13 }}>How to set your Gemini API Key</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { step: "1", text: "Go to aistudio.google.com/app/apikey", link: "https://aistudio.google.com/app/apikey" },
              { step: "2", text: "Sign in with Google → click \"Create API Key\"" },
              { step: "3", text: "Copy the key (starts with AIzaSy...)" },
              { step: "4", text: "Open backend/.env → replace your_gemini_api_key_here → restart backend" },
            ].map(s => (
              <div key={s.step} style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "#fff", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 12px" }}>
                <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#f59e0b", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.step}</span>
                <span style={{ fontSize: 12, color: "#78350f", lineHeight: 1.5 }}>
                  {s.link ? <a href={s.link} target="_blank" rel="noreferrer" style={{ color: "#d97706", fontWeight: 600 }}>{s.text}</a> : s.text}
                </span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>backend/.env</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <code style={{ flex: 1, fontSize: 12, color: "#374151", fontFamily: "monospace" }}>
                PORT=5000<br />
                GEMINI_API_KEY=<span style={{ color: "#d97706" }}>AIzaSyYOUR_KEY_HERE</span><br />
                FRONTEND_URL=http://localhost:3000
              </code>
              <button onClick={() => handleCopy("GEMINI_API_KEY=AIzaSyYOUR_KEY_HERE", "envkey")}
                style={{ fontSize: 11, color: copied === "envkey" ? "#15803d" : "#3b82f6", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 3, fontWeight: 600, flexShrink: 0 }}>
                <Copy size={11} /> {copied === "envkey" ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: "#92400e" }}>
            <AlertTriangle size={12} style={{ display: "inline", marginRight: 4 }} />
            After editing .env, restart the backend: <code style={{ background: "#fef3c7", padding: "1px 6px", borderRadius: 3 }}>Ctrl+C</code> then <code style={{ background: "#fef3c7", padding: "1px 6px", borderRadius: 3 }}>npm run dev</code> in the backend terminal.
            Without a key, imports still work using direct column mapping.
          </div>
        </div>}
        {geminiStatus === "configured" && (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "14px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
            <CheckCircle size={16} color="#15803d" />
            <span style={{ fontSize: 13, color: "#15803d", fontWeight: 600 }}>Gemini AI is configured and active — AI-powered field extraction is enabled for all CSV imports.</span>
          </div>
        )}

        {/* Endpoints table */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 600, color: "#111827", fontSize: 14 }}>API Endpoints</span>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>{endpoints.length} endpoints · click Test to ping live</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse", minWidth: 680 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f3f4f6", background: "#f9fafb" }}>
                  {["METHOD", "ENDPOINT", "DESCRIPTION", "TEST", "STATUS", "RESPONSE"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {endpoints.map((ep, i) => {
                  const mc  = METHOD_COLOR[ep.method];
                  const key = ep.method + ep.path;
                  const res = testResults[key];
                  const isTesting = testing === key;
                  return (
                    <tr key={i} style={{ borderBottom: "1px solid #f9fafb" }}>
                      <td style={{ padding: "11px 14px" }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 5, background: mc.bg, color: mc.color, border: `1px solid ${mc.border}`, fontFamily: "monospace" }}>{ep.method}</span>
                      </td>
                      <td style={{ padding: "11px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <code style={{ fontSize: 12, color: "#374151", fontFamily: "monospace", background: "#f3f4f6", padding: "2px 7px", borderRadius: 4 }}>{ep.path}</code>
                          {ep.full && (
                            <button onClick={() => handleCopy(ep.full, key + "cp")}
                              style={{ background: "none", border: "none", cursor: "pointer", color: copied === key + "cp" ? "#15803d" : "#d1d5db", padding: 2 }}>
                              <Copy size={11} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "11px 14px", color: "#6b7280", fontSize: 12 }}>{ep.desc}</td>
                      <td style={{ padding: "11px 14px" }}>
                        {ep.needsBody ? (
                          ep.full ? (
                            // POST endpoints: show Test button — 400 without body = endpoint is reachable
                            <button onClick={() => testEndpoint(ep)} disabled={isTesting}
                              style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: "#6b7280", border: "1px solid #e5e7eb", borderRadius: 6, padding: "4px 10px", background: "#f9fafb", cursor: isTesting ? "not-allowed" : "pointer", opacity: isTesting ? 0.6 : 1, whiteSpace: "nowrap" }}>
                              {isTesting
                                ? <><div style={{ width: 10, height: 10, border: "2px solid #e5e7eb", borderTopColor: "#6b7280", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Testing</>
                                : <><Play size={10} /> Ping</>}
                            </button>
                          ) : (
                            <span style={{ fontSize: 11, color: "#9ca3af", fontStyle: "italic" }}>
                              {ep.note || "Needs body"}
                            </span>
                          )
                        ) : ep.full ? (
                          <button onClick={() => testEndpoint(ep)} disabled={isTesting}
                            style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: "#3b82f6", border: "1px solid #bfdbfe", borderRadius: 6, padding: "4px 10px", background: "#eff6ff", cursor: isTesting ? "not-allowed" : "pointer", opacity: isTesting ? 0.6 : 1, whiteSpace: "nowrap" }}>
                            {isTesting
                              ? <><div style={{ width: 10, height: 10, border: "2px solid #bfdbfe", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Testing</>
                              : <><Play size={10} /> Test</>}
                          </button>
                        ) : null}
                      </td>
                      <td style={{ padding: "11px 14px" }}>
                        {res ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            {/* 400 on POST endpoints without body = expected, show as info not error */}
                            {(res.ok || (ep.needsBody && res.status === 400))
                              ? <CheckCircle size={13} color="#22c55e" />
                              : <XCircle size={13} color="#ef4444" />}
                            <span style={{ fontSize: 11, fontWeight: 700, color: (res.ok || (ep.needsBody && res.status === 400)) ? "#15803d" : "#dc2626" }}>
                              {res.status || "ERR"}
                            </span>
                            <span style={{ fontSize: 10, color: "#9ca3af" }}>{res.ms}ms</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: 11, color: "#e5e7eb" }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: "11px 14px", maxWidth: 220 }}>
                        {res && (
                          <pre style={{ fontSize: 10, color: ep.needsBody && res.status === 400 ? "#9ca3af" : "#6b7280", margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all", maxHeight: 48, overflow: "hidden", fontStyle: ep.needsBody && res.status === 400 ? "italic" : "normal" }}>
                            {ep.needsBody && res.status === 400 ? `✓ endpoint reachable · ${res.ms}ms · use Import CSV to test` : res.preview}
                          </pre>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Base URL copy */}
        <div style={{ marginTop: 16, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600 }}>BASE URL</span>
          <code style={{ flex: 1, fontSize: 12, color: "#374151", fontFamily: "monospace" }}>{BASE_URL}</code>
          <button onClick={() => handleCopy(BASE_URL, "base")}
            style={{ fontSize: 12, color: copied === "base" ? "#15803d" : "#3b82f6", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
            <Copy size={12} /> {copied === "base" ? "Copied!" : "Copy"}
          </button>
        </div>

      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}
