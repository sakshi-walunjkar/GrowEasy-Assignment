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
import { uploadAPI } from "@/services/api";

export type Page =
  | "dashboard" | "generate-leads" | "manage-leads" | "engage-leads"
  | "lead-sources" | "team-members" | "ad-accounts" | "whatsapp-account"
  | "tele-calling" | "crm-fields" | "api-center";

type Modal = "none" | "import" | "preview" | "processing";

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
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (modal !== "processing") return;
    setProgress(0);
    setProgMsg("Sending records to AI...");
    const steps = [
      { pct: 15, msg: "Sending records to AI...",       delay: 600  },
      { pct: 35, msg: "AI is mapping CRM fields...",    delay: 2500 },
      { pct: 55, msg: "Processing batches...",          delay: 5000 },
      { pct: 72, msg: "Extracting contact details...",  delay: 8000 },
      { pct: 88, msg: "Finalising and saving to DB...", delay: 11000 },
    ];
    const timers = steps.map(({ pct, msg, delay }) =>
      setTimeout(() => { setProgress(pct); setProgMsg(msg); }, delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [modal]);

  const handleUploadSuccess = (data: Record<string, string>[], name: string, size: string) => {
    setCsvData(data); setFilename(name); setFilesize(size); setModal("preview");
  };

  const handleConfirm = async () => {
    setModal("processing");
    setError(null);
    try {
      await uploadAPI.process(csvData);
      setProgress(100);
      setProgMsg("Done!");
      await new Promise(r => setTimeout(r, 400));
      setModal("none");
      setRefreshKey(k => k + 1); // trigger ManageLeads reload
      setPage("manage-leads");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "AI processing failed. Make sure your GEMINI_API_KEY is set in backend/.env";
      setError(msg);
      setModal("preview");
    }
  };

  const handleReset = () => {
    setCsvData([]); setFilename(""); setFilesize(""); setModal("none");
  };

  const openImport = () => { setPage("lead-sources"); setModal("import"); };
  const navigate   = (p: string) => setPage(p as Page);

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden", background: "#f9fafb" }}>

      <Sidebar activePage={page} onNavigate={navigate} />

      <div style={{ marginLeft: 220, flex: 1, overflowY: "auto", height: "100vh" }}>
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

      {modal === "processing" && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)" }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: "40px 48px", width: 400, textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
            <div style={{ width: 56, height: 56, border: "4px solid #f3f4f6", borderTopColor: "#f97316", borderRadius: "50%", margin: "0 auto 20px", animation: "spin 0.8s linear infinite" }} />
            <p style={{ fontWeight: 700, color: "#111827", fontSize: 16, margin: 0 }}>AI is processing your CSV</p>
            <p style={{ color: "#9ca3af", fontSize: 13, marginTop: 6, marginBottom: 24 }}>
              {csvData.length} records · {progMsg}
            </p>
            <div style={{ height: 8, background: "#f3f4f6", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#f97316,#fb923c)", borderRadius: 999, transition: "width 0.6s ease" }} />
            </div>
            <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 8 }}>{progress}%</p>
            <p style={{ fontSize: 11, color: "#d1d5db", marginTop: 16 }}>This may take 15–60 seconds depending on file size</p>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
