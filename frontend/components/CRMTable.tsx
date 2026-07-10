"use client";

import { CRMRecord, ProcessResponse } from "@/types/crm";

interface Props {
  result: ProcessResponse;
}

const CRM_FIELDS: (keyof CRMRecord)[] = [
  "name", "email", "mobile_without_country_code", "country_code",
  "company", "city", "state", "country", "crm_status",
  "data_source", "lead_owner", "crm_note", "created_at",
  "possession_time", "description",
];

const STATUS_COLORS: Record<string, string> = {
  GOOD_LEAD_FOLLOW_UP: "bg-green-100 text-green-700",
  DID_NOT_CONNECT: "bg-yellow-100 text-yellow-700",
  BAD_LEAD: "bg-red-100 text-red-700",
  SALE_DONE: "bg-blue-100 text-blue-700",
};

export default function CRMTable({ result }: Props) {
  const { data, totalImported, totalSkipped, skippedRecords } = result;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-6xl">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">4</div>
        <h2 className="text-xl font-bold text-gray-800">AI Extracted CRM Records</h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{totalImported}</p>
          <p className="text-green-700 text-sm font-medium mt-1">Successfully Imported</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-red-500">{totalSkipped}</p>
          <p className="text-red-600 text-sm font-medium mt-1">Skipped Records</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{totalImported + totalSkipped}</p>
          <p className="text-blue-700 text-sm font-medium mt-1">Total Processed</p>
        </div>
      </div>

      {/* CRM Table */}
      {data.length > 0 && (
        <div className="overflow-auto max-h-96 rounded-xl border border-gray-200 mb-6">
          <table className="w-full text-sm border-collapse min-w-max">
            <thead className="sticky top-0 z-10">
              <tr>
                {CRM_FIELDS.map((f) => (
                  <th
                    key={f}
                    className="bg-gray-800 text-white px-4 py-3 text-left font-semibold whitespace-nowrap border-r border-gray-700 last:border-r-0"
                  >
                    {f.replace(/_/g, " ")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  {CRM_FIELDS.map((f) => (
                    <td
                      key={f}
                      className="px-4 py-2.5 text-gray-700 border-r border-gray-100 last:border-r-0 whitespace-nowrap max-w-xs"
                      title={row[f]}
                    >
                      {f === "crm_status" && row[f] ? (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[row[f]] || "bg-gray-100 text-gray-600"}`}>
                          {row[f]}
                        </span>
                      ) : (
                        <span className="truncate block max-w-xs">
                          {row[f] || <span className="text-gray-300">—</span>}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Skipped Records */}
      {skippedRecords.length > 0 && (
        <details className="mt-2">
          <summary className="cursor-pointer text-sm font-semibold text-red-600 hover:text-red-700">
            View {skippedRecords.length} skipped record(s)
          </summary>
          <div className="mt-3 space-y-2">
            {skippedRecords.map((s, i) => (
              <div key={i} className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-700">
                <span className="font-semibold">Row {s.index + 1}:</span> {s.reason}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
