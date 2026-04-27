"use client";

import { ChangeEvent, FormEvent } from "react";
import { HousingFormValues } from "../lib/api";

const OCEAN_OPTIONS = ["<1H OCEAN", "INLAND", "ISLAND", "NEAR BAY", "NEAR OCEAN"];

type Props = {
  values: HousingFormValues;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
};

export default function SinglePredictionForm({
  values,
  onChange,
  onSubmit,
  isLoading,
}: Props) {
  return (
    <form
      className="w-full min-w-0 rounded-2xl border border-slate-700/15 bg-white/85 p-4 shadow-[0_14px_38px_rgba(16,26,36,0.14)] backdrop-blur-md dark:border-slate-300/20 dark:bg-slate-900/70 dark:shadow-[0_18px_44px_rgba(1,5,15,0.55)]"
      onSubmit={onSubmit}
    >
      <h2 className="mb-1 text-[1.1rem] font-semibold text-slate-900 dark:text-slate-100">
        Single Prediction
      </h2>
      <p className="mb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        Enter one housing sample and get a predicted median house value.
      </p>

      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
        {[
          ["longitude", "Longitude"],
          ["latitude", "Latitude"],
          ["housingMedianAge", "Housing Median Age"],
          ["totalRooms", "Total Rooms"],
          ["totalBedrooms", "Total Bedrooms"],
          ["population", "Population"],
          ["households", "Households"],
          ["medianIncome", "Median Income"],
        ].map(([key, label]) => (
          <label key={key} className="flex min-w-0 flex-col gap-1.5">
            <span className="text-[0.83rem] font-semibold text-slate-600 dark:text-slate-300">
              {label}
            </span>
            <input
              type="number"
              step="any"
              name={key}
              value={values[key as keyof HousingFormValues]}
              onChange={onChange}
              className="w-full min-w-0 rounded-xl border border-slate-700/15 bg-white px-3 py-2.5 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-cyan-700/25 dark:border-slate-300/20 dark:bg-slate-800 dark:text-slate-100 dark:focus-visible:ring-sky-300/35"
              required
            />
          </label>
        ))}

        <label className="flex min-w-0 flex-col gap-1.5">
          <span className="text-[0.83rem] font-semibold text-slate-600 dark:text-slate-300">
            Ocean Proximity
          </span>
          <select
            name="oceanProximity"
            value={values.oceanProximity}
            onChange={onChange}
            className="w-full min-w-0 rounded-xl border border-slate-700/15 bg-white px-3 py-2.5 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-cyan-700/25 dark:border-slate-300/20 dark:bg-slate-800 dark:text-slate-100 dark:focus-visible:ring-sky-300/35"
            required
          >
            {OCEAN_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-linear-to-br from-cyan-600 to-blue-700 px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-cyan-700/25 disabled:cursor-not-allowed disabled:opacity-70 dark:focus-visible:ring-sky-300/35 sm:w-auto"
      >
        {isLoading ? "Predicting..." : "Predict"}
      </button>
    </form>
  );
}
