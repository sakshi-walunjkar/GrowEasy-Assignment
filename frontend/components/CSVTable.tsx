"use client";

interface Props {
  data: Record<string, string>[];
  filename: string;
  onConfirm: () => void;
  confirming: boolean;
}

export default function CSVTable({ data, filename, onConfirm, confirming }: Props) {
  if (data.length === 0) return null;

  const headers = Object.keys(data[0]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-6xl">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">CSV Preview</h2>
            <p className="text-gray-400 text-sm">{filename} — {data.length} rows detected</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full">
            {data.length} records
          </span>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
            <button
              onClick={onConfirm}
              disabled={confirming}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold px-6 py-2 rounded-xl transition-colors"
            >
              {confirming ? "Processing with AI..." : "✓ Confirm & Import with AI"}
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-auto max-h-96 rounded-xl border border-gray-200">
        <table className="w-full text-sm border-collapse min-w-max">
          <thead className="sticky top-0 z-10">
            <tr>
              {headers.map((h) => (
                <th
                  key={h}
                  className="bg-blue-600 text-white px-4 py-3 text-left font-semibold whitespace-nowrap border-r border-blue-500 last:border-r-0"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                {headers.map((h) => (
                  <td
                    key={h}
                    className="px-4 py-2.5 text-gray-700 border-r border-gray-100 last:border-r-0 whitespace-nowrap max-w-xs truncate"
                    title={row[h]}
                  >
                    {row[h] || <span className="text-gray-300">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
