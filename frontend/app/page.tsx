"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import GenerateLeads from "@/components/GenerateLeads";
import LeadSources from "@/components/LeadSources";
import ManageLeads from "@/components/ManageLeads";
import EngageLeads from "@/components/EngageLeads";
import TeamMembers from "@/components/TeamMembers";
import AdAccounts from "@/components/AdAccounts";
import WhatsAppAccount from "@/components/WhatsAppAccount";
import TeleCalling from "@/components/TeleCalling";
import CRMFields from "@/components/CRMFields";
import APICenter from "@/components/APICenter";
import ImportModal from "@/components/ImportModal";
import PreviewModal from "@/components/PreviewModal";
import ResultModal from "@/components/ResultModal";
import { uploadAPI } from "@/services/api";
import ImportHistory from "@/components/ImportHistory";
import { CRMRecord, SkippedRecord } from "@/types/crm";

export type Page =
  | "dashboard" | "generate-leads" | "manage-leads" | "engage-leads"
  | "lead-sources" | "team-members" | "ad-accounts" | "whatsapp-account"
  | "tele-calling" | "crm-fields" | "api-center" | "import-history";

type Modal = "none" | "import" | "preview" | "processing" | "mapping" | "result";

export default function Home() {
  const [page,       setPage]       = useState<Page>("dashboard");
  const [modal,      setModal]      = useState<Modal>("none");
  const [csvData,    setCsvData]    = useState<Record<string, string>[]>([]);
  const [filename,   setFilename]   = useState("");
  const [filesize,   setFilesize]   = useState("");
  const [error,      setError]      = useState<string | null>(null);
  const [progress,   setProgress]   = useState(0);
  const [progMsg,    setProgMsg]    = useState("");
  // refreshKey is bumped after every successful import — ManageLeads watches this
  const [refreshKey,   setRefreshKey]   = useState(0);
  const [importedLeads, setImportedLeads] = useState<CRMRecord[]>([]);
  const [skippedLeads,  setSkippedLeads]  = useState<SkippedRecord[]>([]);
  const [columnMapping, setColumnMapping] = useState<{originalColumn:string;crmField:string;sampleValue:string}[]>([]);
  const [batchInfo,     setBatchInfo]     = useState({ current: 0, total: 0 });

  const handleUploadSuccess = (data: Record<string, string>[], name: string, size: string) => {
    setCsvData(data); setFilename(name); setFilesize(size); setModal("preview");
  };

  const handleConfirm = async () => {
    setModal("processing");
    setError(null);
    setProgress(0);
    setProgMsg("Connecting to AI...");
    setBatchInfo({ current: 0, total: Math.ceil(csvData.length / 15) });

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    try {
      const response = await fetch(`${API_URL}/process-stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records: csvData }),
      });

      if (!response.ok || !response.body) throw new Error("Stream failed");

      const reader  = response.body.getReader();
      const decoder = new TextDecoder();
      let   buffer  = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const evt = JSON.parse(line.slice(6));
            if (evt.type === "start") {
              setBatchInfo({ current: 0, total: evt.batches });
              setProgMsg(`Starting — ${evt.total} records in ${evt.batches} batches`);
              setProgress(5);
            } else if (evt.type === "batch") {
              setBatchInfo({ current: evt.batchNum, total: evt.totalBatches });
              const pct = Math.round((evt.batchNum / evt.totalBatches) * 85) + 5;
              setProgress(pct);
              setProgMsg(`Processing batch ${evt.batchNum} of ${evt.totalBatches}...`);
            } else if (evt.type === "saving") {
              setProgress(93);
              setProgMsg("Saving leads to database...");
            } else if (evt.type === "done") {
              setProgress(100);
              setProgMsg("Done!");
              setImportedLeads(evt.data ?? []);
              setSkippedLeads(evt.skippedRecords ?? []);
              setColumnMapping(evt.columnMapping ?? []);
              setRefreshKey(k => k + 1);
              await new Promise(r => setTimeout(r, 400));
              setModal(evt.columnMapping?.length > 0 ? "mapping" : "result");
            } else if (evt.type === "error") {
              throw new Error(evt.message);
            }
          } catch {}
        }
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error)?.message ||
        "AI processing failed. Make sure your GEMINI_API_KEY is set in backend/.env";
      setError(msg);
      setModal("preview");
    }
  };

  const handleReset = () => {
    setCsvData([]); setFilename(""); setFilesize("");
    setImportedLeads([]); setSkippedLeads([]);
    setModal("none");
  };

  const openImport = () => { setModal("import"); };
  const navigate   = (p: string) => {
    if (p === "import-csv") { setModal("import"); return; }
    setPage(p as Page);
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden", background: "#f9fafb" }}>

      <Sidebar activePage={page} onNavigate={navigate} />

      <div style={{ marginLeft: 220, flex: 1, overflowY: "auto", height: "100vh" }} className="main-content">
        {page === "import-history"  && <ImportHistory   onImportClick={openImport} />}
        {page === "dashboard"        && <Dashboard       onNavigate={navigate} />}
        {page === "generate-leads"   && <GenerateLeads   onNavigate={navigate} />}
        {page === "engage-leads"     && <EngageLeads />}
        {page === "lead-sources"     && <LeadSources     onImportClick={() => setModal("import")} />}
        {page === "manage-leads"     && <ManageLeads     refreshKey={refreshKey} onReset={handleReset} onImportClick={openImport} />}
        {page === "team-members"     && <TeamMembers />}
        {page === "ad-accounts"      && <AdAccounts />}
        {page === "whatsapp-account" && <WhatsAppAccount />}
        {page === "tele-calling"     && <TeleCalling />}
        {page === "crm-fields"       && <CRMFields />}
        {page === "api-center"       && <APICenter />}
      </div>

      {/* Error toast */}
      {error && (
        <div style={{ position: "fixed", top: 16, right: 16, zIndex: 200, background: "#fef2f2", border: "1px solid #fca5a5", color: "#dc2626", borderRadius: 12, padding: "12px 18px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.12)", maxWidth: 440 }}>
          <span style={{ fontSize: 13, flex: 1 }}>{error}</span>
          <button onClick={() => setError(null)} style={{ color: "#f87171", fontWeight: 700, background: "none", border: "none", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
        </div>
      )}

      {modal === "import" && (
        <ImportModal onClose={() => setModal("none")} onUploadSuccess={handleUploadSuccess} onError={setError} />
      )}

      {modal === "preview" && csvData.length > 0 && (
        <PreviewModal data={csvData} filename={filename} filesize={filesize} onClose={() => setModal("none")} onConfirm={handleConfirm} />
      )}

      {modal === "result" && (
        <ResultModal
          imported={importedLeads}
          skipped={skippedLeads}
          onClose={handleReset}
          onViewLeads={() => { handleReset(); setPage("manage-leads"); }}
        />
      )}

      {modal === "processing" && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)" }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: "40px 48px", width: 440, textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
            <div style={{ width: 56, height: 56, border: "4px solid #f3f4f6", borderTopColor: "#f97316", borderRadius: "50%", margin: "0 auto 20px", animation: "spin 0.8s linear infinite" }} />
            <p style={{ fontWeight: 700, color: "#111827", fontSize: 16, margin: 0 }}>AI is processing your CSV</p>
            <p style={{ color: "#9ca3af", fontSize: 13, marginTop: 6, marginBottom: 20 }}>{progMsg}</p>
            {batchInfo.total > 0 && (
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
                {Array.from({ length: batchInfo.total }).map((_, i) => (
                  <div key={i} style={{ width: 28, height: 6, borderRadius: 999, background: i < batchInfo.current ? "#f97316" : i === batchInfo.current ? "#fb923c" : "#f3f4f6", transition: "background 0.3s" }} />
                ))}
              </div>
            )}
            <div style={{ height: 8, background: "#f3f4f6", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#f97316,#fb923c)", borderRadius: 999, transition: "width 0.6s ease" }} />
            </div>
            <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 8 }}>
              {batchInfo.current > 0 ? `Batch ${batchInfo.current} / ${batchInfo.total}` : `${csvData.length} records · ${batchInfo.total || Math.ceil(csvData.length/15)} batches`} · {progress}%
            </p>
            <p style={{ fontSize: 11, color: "#d1d5db", marginTop: 16 }}>This may take 15–60 seconds depending on file size</p>
          </div>
        </div>
      )}

      {modal === "mapping" && columnMapping.length > 0 && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)" }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: "28px 32px", width: 560, maxHeight: "80vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "#111827", margin: 0 }}>AI Column Mapping</h2>
              <button onClick={() => setModal("result")} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 20 }}>×</button>
            </div>
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>Here’s how AI mapped your CSV columns to GrowEasy CRM fields.</p>
            <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  {["Your Column", "CRM Field", "Sample Value"].map(h => (
                    <th key={h} style={{ padding: "9px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {columnMapping.map((m, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "9px 12px", color: "#6b7280", fontFamily: "monospace", fontSize: 12 }}>{m.originalColumn}</td>
                    <td style={{ padding: "9px 12px" }}>
                      <span style={{ background: "#eff6ff", color: "#1d4ed8", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999 }}>{m.crmField}</span>
                    </td>
                    <td style={{ padding: "9px 12px", color: "#374151", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={m.sampleValue}>{m.sampleValue || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={() => setModal("result")} style={{ marginTop: 20, width: "100%", padding: "11px", borderRadius: 10, border: "none", background: "#f97316", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
              View Imported Leads →
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
