const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export type HousingFormValues = {
  longitude: number | string;
  latitude: number | string;
  housingMedianAge: number | string;
  totalRooms: number | string;
  totalBedrooms: number | string;
  population: number | string;
  households: number | string;
  medianIncome: number | string;
  oceanProximity: string;
};

export type SinglePredictionResponse = {
  medianHouseValue: number;
};

export type CsvRow = Record<string, string>;

type ApiError = {
  detail?: string;
};

export async function predictSingle(
  payload: HousingFormValues
): Promise<SinglePredictionResponse> {
  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as ApiError;
    throw new Error(error.detail || "Failed to get prediction.");
  }

  return (await response.json()) as SinglePredictionResponse;
}

export async function predictBatch(file: File): Promise<Blob> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/batch_predict`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as ApiError;
    throw new Error(error.detail || "Failed to process CSV file.");
  }

  return response.blob();
}

export function parseCsvText(csvText: string): CsvRow[] {
  const lines = csvText.trim().split(/\r?\n/);
  if (!lines.length) {
    return [];
  }

  const headers = lines[0].split(",").map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const cells = line.split(",").map((cell) => cell.trim());
    return headers.reduce<CsvRow>((acc, header, idx) => {
      acc[header] = cells[idx] ?? "";
      return acc;
    }, {});
  });
}
