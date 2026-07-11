export interface CRMRecord {
  id?: string;
  created_at: string;
  name: string;
  email: string;
  country_code: string;
  mobile_without_country_code: string;
  company: string;
  city: string;
  state: string;
  country: string;
  lead_owner: string;
  crm_status: string;
  crm_note: string;
  data_source: string;
  possession_time: string;
  description: string;
  imported_at?: string;
  updated_at?: string;
}

export interface ProcessResponse {
  success: boolean;
  totalImported: number;
  totalSkipped: number;
  data: CRMRecord[];
  skippedRecords: SkippedRecord[];
}

export interface SkippedRecord {
  index: number;
  record: Record<string, string>;
  reason: string;
}

export interface UploadResponse {
  success: boolean;
  totalRecords: number;
  data: Record<string, string>[];
}

export interface LeadsResponse {
  success: boolean;
  total: number;
  page: number;
  limit: number;
  data: CRMRecord[];
}

export interface StatsResponse {
  success: boolean;
  data: {
    totalLeads: number;
    totalImports: number;
    byStatus: {
      GOOD_LEAD_FOLLOW_UP: number;
      SALE_DONE: number;
      DID_NOT_CONNECT: number;
      BAD_LEAD: number;
    };
    importHistory: ImportHistory[];
    lastImport: ImportHistory | null;
  };
}

export interface ImportHistory {
  id: string;
  imported_at: string;
  total_records: number;
  imported: number;
  skipped: number;
}

export const CRM_STATUS_OPTIONS = [
  { value: "GOOD_LEAD_FOLLOW_UP", label: "Good Lead",  bg: "#dcfce7", color: "#15803d", border: "#bbf7d0" },
  { value: "SALE_DONE",           label: "Sale Done",  bg: "#dbeafe", color: "#1d4ed8", border: "#bfdbfe" },
  { value: "DID_NOT_CONNECT",     label: "Not Dialed", bg: "#f3f4f6", color: "#6b7280", border: "#e5e7eb" },
  { value: "BAD_LEAD",            label: "Bad Lead",   bg: "#fee2e2", color: "#dc2626", border: "#fecaca" },
] as const;

export const getStatusStyle = (status: string) =>
  CRM_STATUS_OPTIONS.find((s) => s.value === status) ??
  { bg: "#f3f4f6", color: "#6b7280", border: "#e5e7eb", label: status || "—" };
