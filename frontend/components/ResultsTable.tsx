"use client";

import { CsvRow } from "../lib/api";

type Props = {
  rows: CsvRow[];
  title: string;
};

export default function ResultsTable({ rows, title }: Props) {
  if (!rows || rows.length === 0) {
    return null;
  }

  const headers = Object.keys(rows[0]);

  return (
    <section className="w-full min-w-0 rounded-2xl border border-slate-700/15 bg-white/85 p-4 shadow-[0_14px_38px_rgba(16,26,36,0.14)] backdrop-blur-md dark:border-slate-300/20 dark:bg-slate-900/70 dark:shadow-[0_18px_44px_rgba(1,5,15,0.55)]">
      <h2 className="mb-2 text-[1.1rem] font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h2>
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="border-b border-slate-700/15 px-2.5 py-2 text-left text-xs font-semibold uppercase tracking-[0.08em] whitespace-nowrap text-slate-600 dark:border-slate-300/20 dark:text-slate-300"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={`row-${idx}`}>
                {headers.map((header) => (
                  <td
                    key={`${idx}-${header}`}
                    className="border-b border-slate-700/15 px-2.5 py-2 text-left whitespace-nowrap text-slate-700 dark:border-slate-300/20 dark:text-slate-200"
                  >
                    {String(row[header])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
