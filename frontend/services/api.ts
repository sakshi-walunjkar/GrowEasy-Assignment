import axios from "axios";
import { LeadsResponse, StatsResponse, ProcessResponse, UploadResponse } from "@/types/crm";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  timeout: 180000, // 3 min — AI processing can be slow for large files
});

export default API;

export const leadsAPI = {
  getAll: (params?: { q?: string; status?: string; page?: number; limit?: number }) =>
    API.get<LeadsResponse>("/leads", { params }),

  getStats: () =>
    API.get<StatsResponse>("/leads/stats"),

  getById: (id: string) =>
    API.get<{ success: boolean; data: import("@/types/crm").CRMRecord }>(`/leads/${id}`),

  update: (id: string, data: Partial<import("@/types/crm").CRMRecord>) =>
    API.patch(`/leads/${id}`, data),

  delete: (id: string) =>
    API.delete(`/leads/${id}`),

  clearAll: () =>
    API.delete("/leads"),
};

export const uploadAPI = {
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return API.post<UploadResponse>("/upload", form);
  },

  process: (records: Record<string, string>[]) =>
    API.post<ProcessResponse>("/process", { records }),
};
