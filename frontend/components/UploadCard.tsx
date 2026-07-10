"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import API from "@/services/api";
import { UploadResponse } from "@/types/crm";

interface Props {
  onUploadSuccess: (data: Record<string, string>[], filename: string) => void;
  onError: (msg: string) => void;
}

export default function UploadCard({ onUploadSuccess, onError }: Props) {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) setSelectedFile(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    multiple: false,
    onDropRejected: () => onError("Only CSV files are accepted."),
  });

  const handleUpload = async () => {
    if (!selectedFile) return onError("Please select a CSV file first.");

    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await API.post<UploadResponse>("/upload", formData);
      onUploadSuccess(res.data.data, selectedFile.name);
    } catch {
      onError("Upload failed. Please check your file and try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
        <h2 className="text-xl font-bold text-gray-800">Upload CSV File</h2>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          {isDragActive ? (
            <p className="text-blue-600 font-semibold">Drop your CSV here...</p>
          ) : (
            <>
              <p className="text-gray-600 font-medium">Drag & drop your CSV file here</p>
              <p className="text-gray-400 text-sm">or click to browse files</p>
            </>
          )}
        </div>
      </div>

      {selectedFile && (
        <div className="mt-4 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
          <svg className="w-5 h-5 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-blue-700 text-sm font-medium truncate">{selectedFile.name}</span>
          <span className="text-blue-400 text-xs ml-auto shrink-0">
            {(selectedFile.size / 1024).toFixed(1)} KB
          </span>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        className="mt-5 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-base"
      >
        {uploading ? "Uploading..." : "Upload & Preview CSV"}
      </button>
    </div>
  );
}
