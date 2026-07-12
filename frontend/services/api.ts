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

export const teamAPI = {
  getAll:  ()                                              => API.get("/team"),
  add:     (data: { name: string; email: string; role: string }) => API.post("/team", data),
  update:  (id: number, data: { role?: string; status?: string }) => API.patch(`/team/${id}`, data),
  remove:  (id: number)                                   => API.delete(`/team/${id}`),
};

export const fieldsAPI = {
  getAll:  ()                                                                        => API.get("/fields"),
  add:     (data: { name: string; label: string; type: string; required: boolean }) => API.post("/fields", data),
  update:  (id: number, data: { label?: string; type?: string; required?: boolean }) => API.patch(`/fields/${id}`, data),
  remove:  (id: number)                                                              => API.delete(`/fields/${id}`),
};

export const campaignAPI = {
  getAll:  ()                                                    => API.get("/campaigns"),
  add:     (data: { name: string; channel: string })             => API.post("/campaigns", data),
  update:  (id: number, data: Record<string, unknown>)           => API.patch(`/campaigns/${id}`, data),
  remove:  (id: number)                                          => API.delete(`/campaigns/${id}`),
};

export const callAPI = {
  getAll:  ()                                                                              => API.get("/calls"),
  add:     (data: { lead_name: string; phone: string; agent: string; call_time: string }) => API.post("/calls", data),
  update:  (id: number, data: { status?: string; duration?: string; call_time?: string }) => API.patch(`/calls/${id}`, data),
};

export const whatsappAPI = {
  getAccount:    ()                                                          => API.get("/whatsapp/account"),
  connect:       (phone: string)                                             => API.post("/whatsapp/account", { phone }),
  disconnect:    ()                                                          => API.delete("/whatsapp/account"),
  getTemplates:  ()                                                          => API.get("/whatsapp/templates"),
  addTemplate:   (data: { name: string; type: string; body: string })       => API.post("/whatsapp/templates", data),
  sendTemplate:  (id: number)                                                => API.post(`/whatsapp/templates/${id}/send`, {}),
  deleteTemplate:(id: number)                                                => API.delete(`/whatsapp/templates/${id}`),
};
