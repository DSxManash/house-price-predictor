"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import BatchUpload from "../components/BatchUpload";
import ResultsTable from "../components/ResultsTable";
import SinglePredictionForm from "../components/SinglePredictionForm";
import {
  CsvRow,
  HousingFormValues,
  SinglePredictionResponse,
  parseCsvText,
  predictBatch,
  predictSingle,
} from "../lib/api";

const INITIAL_FORM: HousingFormValues = {
  longitude: -122.23,
  latitude: 37.88,
  housingMedianAge: 41,
  totalRooms: 880,
  totalBedrooms: 129,
  population: 322,
  households: 126,
  medianIncome: 8.3252,
  oceanProximity: "NEAR BAY",
};

export default function HomePage() {
  const [formValues, setFormValues] = useState<HousingFormValues>(INITIAL_FORM);
  const [singleResult, setSingleResult] = useState<SinglePredictionResponse | null>(null);
  const [batchFile, setBatchFile] = useState<File | null>(null);
  const [batchRows, setBatchRows] = useState<CsvRow[]>([]);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [batchFileName, setBatchFileName] = useState("");
  const [loadingSingle, setLoadingSingle] = useState(false);
  const [loadingBatch, setLoadingBatch] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const storedTheme = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    const initialTheme = storedTheme === "dark" || storedTheme === "light"
      ? storedTheme
      : prefersDark
        ? "dark"
        : "light";

    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  const handleFormChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    const numericFields: Array<keyof HousingFormValues> = [
      "longitude",
      "latitude",
      "housingMedianAge",
      "totalRooms",
      "totalBedrooms",
      "population",
      "households",
      "medianIncome",
    ];

    const key = name as keyof HousingFormValues;
    setFormValues((prev) => ({
      ...prev,
      [key]: numericFields.includes(key) ? value : value,
    }));
  };

  const handleSingleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setLoadingSingle(true);

    try {
      const payload = {
        ...formValues,
        longitude: Number(formValues.longitude),
        latitude: Number(formValues.latitude),
        housingMedianAge: Number(formValues.housingMedianAge),
        totalRooms: Number(formValues.totalRooms),
        totalBedrooms: Number(formValues.totalBedrooms),
        population: Number(formValues.population),
        households: Number(formValues.households),
        medianIncome: Number(formValues.medianIncome),
      };

      const result = await predictSingle(payload);
      setSingleResult(result);
      setNotice("Single prediction generated successfully.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Single prediction failed.";
      setError(message);
    } finally {
      setLoadingSingle(false);
    }
  };

  const handleBatchSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!batchFile) {
      setError("Please choose a CSV file first.");
      return;
    }

    setError("");
    setNotice("");
    setLoadingBatch(true);

    try {
      const blob = await predictBatch(batchFile);
      const text = await blob.text();
      const rows = parseCsvText(text);
      setBatchRows(rows);
      setNotice(`Batch prediction complete. ${rows.length} rows processed.`);

      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
      setDownloadUrl(URL.createObjectURL(blob));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Batch prediction failed.";
      setError(message);
    } finally {
      setLoadingBatch(false);
    }
  };

  const handleDownloadTemplate = () => {
    const template = [
      "longitude,latitude,housingMedianAge,totalRooms,totalBedrooms,population,households,medianIncome,oceanProximity",
      "-122.23,37.88,41,880,129,322,126,8.3252,NEAR BAY",
    ].join("\n");

    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "batch_template.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleClearBatchFile = () => {
    setBatchFile(null);
    setBatchFileName("");
  };

  return (
    <main className="mx-auto my-4 w-full max-w-280 animate-[fadeIn_500ms_ease-out] px-2 sm:px-3">
      <header className="relative w-full rounded-[18px] border border-slate-700/15 bg-white/85 p-4 shadow-[0_14px_38px_rgba(16,26,36,0.14)] backdrop-blur-md dark:border-slate-300/20 dark:bg-slate-900/70 dark:shadow-[0_18px_44px_rgba(1,5,15,0.55)]">
        <div className="flex flex-wrap items-start justify-between gap-3 sm:items-center">
          <p className="m-0 text-[0.76rem] font-bold uppercase tracking-[0.17em] text-cyan-700 dark:text-cyan-300">
            House Price Predictor
          </p>
          <button
            type="button"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-700/15 bg-white/80 text-slate-900 transition hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(10,127,139,0.25)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-cyan-700/25 dark:border-slate-300/20 dark:bg-slate-800 dark:text-slate-100 dark:focus-visible:ring-sky-300/35"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            <span className="text-base leading-none" aria-hidden="true">
              {theme === "light" ? "☾" : "☀"}
            </span>
          </button>
        </div>
        <h1 className="mb-2 mt-1 text-[clamp(1.56rem,4.6vw,3rem)] font-extrabold leading-[1.1] tracking-[-0.03em] text-slate-900 dark:text-slate-100">
          California Housing Price Predictor
        </h1>
        <p className="m-0 max-w-[62ch] text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Predict median house value from California housing features.
        </p>
      </header>

      {error ? (
        <p className="mt-3 text-sm font-bold text-rose-700 dark:text-rose-300">{error}</p>
      ) : null}
      {notice ? (
        <p className="mt-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
          {notice}
        </p>
      ) : null}

      <div className="mt-4 grid w-full min-w-0 grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <SinglePredictionForm
          values={formValues}
          onChange={handleFormChange}
          onSubmit={handleSingleSubmit}
          isLoading={loadingSingle}
        />

        <BatchUpload
          file={batchFile}
          fileName={batchFileName}
          onFileChange={(e) => {
            const nextFile = e.target.files?.[0] || null;
            setBatchFile(nextFile);
            setBatchFileName(nextFile?.name || "");
          }}
          onSubmit={handleBatchSubmit}
          onDownloadTemplate={handleDownloadTemplate}
          onClearFile={handleClearBatchFile}
          isLoading={loadingBatch}
        />
      </div>

      {singleResult ? (
        <section className="mt-4 w-full min-w-0 rounded-2xl border border-slate-700/15 bg-white/85 p-4 shadow-[0_14px_38px_rgba(16,26,36,0.14)] backdrop-blur-md dark:border-slate-300/20 dark:bg-slate-900/70 dark:shadow-[0_18px_44px_rgba(1,5,15,0.55)]">
          <h2 className="mb-1 text-[1.1rem] font-semibold text-slate-900 dark:text-slate-100">
            Single Prediction Result
          </h2>
          <p className="text-sm text-slate-700 dark:text-slate-200">
            Predicted median house value: <strong>${singleResult.medianHouseValue.toFixed(2)}</strong>
          </p>
        </section>
      ) : null}

      {batchRows.length > 0 ? (
        <>
          <section className="mb-3 mt-4">
            <a
              className="inline-flex w-full items-center justify-center rounded-xl bg-linear-to-br from-cyan-600 to-blue-700 px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-cyan-700/25 dark:focus-visible:ring-sky-300/35 sm:w-auto"
              href={downloadUrl}
              download="predictions.csv"
            >
              Download Predictions CSV
            </a>
          </section>
          <ResultsTable rows={batchRows} title="Batch Prediction Results" />
        </>
      ) : null}

      <footer className="mt-4 flex w-full min-w-0 flex-col items-start justify-between gap-3 rounded-[18px] border border-slate-700/15 bg-white/85 p-4 shadow-[0_14px_38px_rgba(16,26,36,0.14)] backdrop-blur-md dark:border-slate-300/20 dark:bg-slate-900/70 dark:shadow-[0_18px_44px_rgba(1,5,15,0.55)] sm:flex-row sm:flex-wrap sm:items-center">
        <div>
          <p className="m-0 text-[0.95rem] font-extrabold tracking-[-0.02em] text-slate-900 dark:text-slate-100">
            California Housing Predictor
          </p>
          <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Built for quick house value estimates with single and batch prediction flows.
          </p>
        </div>
        <p className="text-left text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-right">
          FastAPI backend · Next.js frontend · Kaggle housing dataset
        </p>
      </footer>
    </main>
  );
}
