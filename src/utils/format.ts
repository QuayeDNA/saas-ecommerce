export function formatMasked(val?: string): string {
  if (!val) return "Not configured";
  if (val.length <= 10) return "••••••••";
  return `${val.slice(0, 6)}…${val.slice(-4)}`;
}

const currencyFormatter = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatGHS(amount: number): string {
  return currencyFormatter.format(amount);
}
