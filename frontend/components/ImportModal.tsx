"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { X, FileText, Download, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { uploadAPI } from "@/services/api";

interface Props {
  onClose: () => void;
  onUploadSuccess: (data: Record<string, string>[], filename: string, filesize: string) => void;
  onError: (msg: string) => void;
}

export default function ImportModal({ onClose, onUploadSuccess, onError }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading,    setUploading]    = useState(false);
  const [uploadDone,   setUploadDone]   = useState(false);
  const [localError,   setLocalError]   = useState<string | null>(null);

  // Accept ALL files in dropzone — validate extension ourselves
  // This avoids react-dropzone rejecting .csv on Windows (sent as application/vnd.ms-excel)
  const onDrop = useCallback((accepted: File[]) => {
    const file = accepted[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "csv") {
      setLocalError("Only .csv files are accepted.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setLocalError("File is too large. Maximum size is 10 MB.");
      return;
    }
    setLocalError(null);
    setSelectedFile(file);
    setUploadDone(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    // No accept filter — we validate manually above
  });

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setLocalError(null);
    try {
      const res = await uploadAPI.upload(selectedFile);
      if (!res.data.success || !res.data.data || res.data.data.length === 0) {
        setLocalError("CSV appears to be empty or has no valid rows.");
        return;
      }
      setUploadDone(true);
      const sizeKB = (selectedFile.size / 1024).toFixed(1) + " KB";
      setTimeout(() => onUploadSuccess(res.data.data, selectedFile.name, sizeKB), 300);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = axiosErr?.response?.data?.message
        || axiosErr?.message
        || "Upload failed. Make sure the backend is running on port 5000.";
      setLocalError(msg);
      onError(msg);
    } finally {
      setUploading(false);
    }
  };

  const downloadSample = () => {
    const rows = [
      "created_at,name,email,country_code,mobile_without_country_code,company,city,state,country,lead_owner,crm_status,crm_note,data_source,possession_time,description",
      "2026-06-29T10:00:00Z,Rahil Mohammad,rahil@test.com,+91,9579290000,GrowEasy,Mumbai,Maharashtra,India,,GOOD_LEAD_FOLLOW_UP,Interested in demo,,,",
      "2026-06-29T10:05:00Z,Tarvinder Pal,tarvinderpal@beauty.com,+91,9811362000,Beauty Co,Delhi,Delhi,India,,DID_NOT_CONNECT,Will try again next week,,,",
      "2026-06-29T10:10:00Z,Dhruv Bisht,dhruv.bisht@gmail.com,+91,9711564000,,Bangalore,Karnataka,India,,GOOD_LEAD_FOLLOW_UP,,,,",
      "2026-06-29T10:15:00Z,Amit Raheja,amit.raheja@outlook.com,+91,9990110000,,Pune,Maharashtra,India,,SALE_DONE,Deal closed,,,",
      "2026-06-29T10:20:00Z,Priya Singh,priya.singh@yahoo.com,+91,8040740000,Startup Inc,Chennai,Tamil Nadu,India,,BAD_LEAD,Not interested,,,",
      "2026-06-29T10:25:00Z,Vikram Nair,vikram.nair@gmail.com,+91,9123456789,Tech Corp,Hyderabad,Telangana,India,,GOOD_LEAD_FOLLOW_UP,Wants product demo,,,",
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "groweasy_sample.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)" }} onClick={onClose} />

      <div style={{ position: "relative", background: "#fff", borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", width: "100%", maxWidth: 500, margin: "0 16px", zIndex: 10 }}>

        {/* Header */}
        <div style={{ padding: "22px 24px 18px", borderBottom: "1px solid #f3f4f6" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: 0 }}>Import Leads via CSV</h2>
              <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4, marginBottom: 0 }}>
                Upload any CSV — AI will intelligently map columns to CRM fields.
              </p>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4, marginLeft: 12 }}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div style={{ padding: "20px 24px" }}>

          {/* Dropzone */}
          <div
            {...getRootProps()}
            style={{
              border: `2px dashed ${isDragActive ? "#3b82f6" : selectedFile ? "#22c55e" : localError ? "#f87171" : "#d1d5db"}`,
              background: isDragActive ? "#eff6ff" : selectedFile ? "#f0fdf4" : "#f9fafb",
              borderRadius: 12, padding: "28px 20px", textAlign: "center", cursor: "pointer", transition: "all 0.2s",
            }}
          >
            <input {...getInputProps()} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div style={{ width: 48, height: 48, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                <Upload size={20} color={isDragActive ? "#3b82f6" : selectedFile ? "#22c55e" : "#6b7280"} />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, color: "#111827", margin: 0 }}>
                  {isDragActive ? "Drop your CSV here" : "Drag & drop your CSV file"}
                </p>
                <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 3, marginBottom: 0 }}>or click to browse · .csv only · max 10 MB</p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); downloadSample(); }}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#f0fdfa", border: "1px solid #99f6e4", color: "#0d9488", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
              >
                <Download size={12} /> Download Sample CSV
              </button>
            </div>
          </div>

          {/* Local error */}
          {localError && (
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "9px 12px" }}>
              <AlertCircle size={14} color="#dc2626" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: "#dc2626" }}>{localError}</span>
            </div>
          )}

          {/* Selected file */}
          {selectedFile && (
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid #e5e7eb", borderRadius: 10, padding: "10px 14px", background: "#fff" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {uploadDone ? <CheckCircle size={16} color="#22c55e" /> : <FileText size={16} color="#f97316" />}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: 0 }}>{selectedFile.name}</p>
                  <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>{(selectedFile.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button onClick={() => { setSelectedFile(null); setUploadDone(false); setLocalError(null); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
                <X size={14} />
              </button>
            </div>
          )}

          <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 12, lineHeight: 1.6, textAlign: "center" }}>
            Works with: Facebook Ads, Google Ads, Excel CSV, Real Estate CRM, Sales reports, and any custom CSV format.
          </p>
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 24px 22px", borderTop: "1px solid #f3f4f6", display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", color: "#374151", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading || uploadDone}
            style={{
              flex: 2, padding: "11px 0", borderRadius: 10, border: "none",
              background: !selectedFile ? "#e5e7eb" : uploading ? "#fcd9c0" : uploadDone ? "#dcfce7" : "#f97316",
              color: !selectedFile ? "#9ca3af" : uploadDone ? "#15803d" : "#fff",
              fontWeight: 600, fontSize: 14,
              cursor: !selectedFile || uploading || uploadDone ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.2s",
            }}
          >
            {uploading ? (
              <>
                <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                Uploading...
              </>
            ) : uploadDone ? (
              <><CheckCircle size={15} /> Uploaded!</>
            ) : (
              <><Upload size={14} /> Upload & Preview</>
            )}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
