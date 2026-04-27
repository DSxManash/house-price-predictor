"use client";

import { ChangeEvent, FormEvent } from "react";

type Props = {
  file: File | null;
  fileName: string;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDownloadTemplate: () => void;
  onClearFile: () => void;
  isLoading: boolean;
};

export default function BatchUpload({
  file,
  fileName,
  onFileChange,
  onSubmit,
  onDownloadTemplate,
  onClearFile,
  isLoading,
}: Props) {
  return (
    <form
      className="w-full min-w-0 rounded-2xl border border-slate-700/15 bg-white/85 p-4 shadow-[0_14px_38px_rgba(16,26,36,0.14)] backdrop-blur-md dark:border-slate-300/20 dark:bg-slate-900/70 dark:shadow-[0_18px_44px_rgba(1,5,15,0.55)]"
      onSubmit={onSubmit}
    >
      <h2 className="mb-1 text-[1.1rem] font-semibold text-slate-900 dark:text-slate-100">
        Batch Prediction (CSV)
      </h2>
      <p className="mb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        Upload a CSV using the same feature columns. Predictions will be appended as
        medianHouseValue.
      </p>

      <label className="flex min-w-0 flex-col gap-1.5">
        <span className="text-[0.83rem] font-semibold text-slate-600 dark:text-slate-300">
          CSV File
        </span>
        <input
          type="file"
          accept=".csv"
          onChange={onFileChange}
          className="w-full min-w-0 rounded-xl border border-slate-700/15 bg-white px-3 py-2.5 text-sm text-slate-900 file:mr-3 file:rounded-md file:border-0 file:bg-cyan-700 file:px-2.5 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-cyan-800 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-cyan-700/25 dark:border-slate-300/20 dark:bg-slate-800 dark:text-slate-100 dark:file:bg-sky-700 dark:hover:file:bg-sky-600 dark:focus-visible:ring-sky-300/35"
          required
        />
      </label>

      {fileName ? (
        <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
          Selected file: <span className="font-semibold">{fileName}</span>
        </p>
      ) : null}

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={onDownloadTemplate}
          className="inline-flex w-full items-center justify-center rounded-xl border border-slate-700/15 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-cyan-700/25 dark:border-slate-300/20 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 dark:focus-visible:ring-sky-300/35 sm:w-auto"
        >
          Download Template CSV
        </button>
        {file ? (
          <button
            type="button"
            onClick={onClearFile}
            className="inline-flex w-full items-center justify-center rounded-xl border border-slate-700/15 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-cyan-700/25 dark:border-slate-300/20 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 dark:focus-visible:ring-sky-300/35 sm:w-auto"
          >
            Clear File
          </button>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isLoading || !file}
        className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-linear-to-br from-cyan-600 to-blue-700 px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-cyan-700/25 disabled:cursor-not-allowed disabled:opacity-70 dark:focus-visible:ring-sky-300/35 sm:w-auto"
      >
        {isLoading ? "Processing..." : "Upload and Predict"}
      </button>
    </form>
  );
}
