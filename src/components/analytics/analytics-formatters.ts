export type GrowthMetric = {
  percent: number;
  trend: string;
};

function normalizeNumber(value?: number | null): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }

  return value;
}

export function formatCurrency(amount?: number | null): string {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    maximumFractionDigits: 2,
  }).format(normalizeNumber(amount));
}

export function formatNumber(value?: number | null): string {
  return new Intl.NumberFormat("en-US").format(normalizeNumber(value));
}

export function formatPercent(value?: number | null): string {
  return `${normalizeNumber(value).toFixed(2)}%`;
}

export function formatDateTime(value?: string | Date | null): string {
  if (!value) {
    return "Unknown time";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }

  return new Intl.DateTimeFormat("en-GH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function growthDirection(value?: GrowthMetric): "up" | "down" | "flat" {
  if (!value?.trend) {
    return "flat";
  }

  if (value.trend === "up") {
    return "up";
  }

  if (value.trend === "down") {
    return "down";
  }

  return "flat";
}

export function growthText(value?: GrowthMetric): string {
  if (!value) {
    return "vs previous period";
  }

  const absPercent = Math.abs(normalizeNumber(value.percent)).toFixed(2);

  if (value.trend === "up") {
    return `+${absPercent}% vs previous period`;
  }

  if (value.trend === "down") {
    return `-${absPercent}% vs previous period`;
  }

  return "No change vs previous period";
}
