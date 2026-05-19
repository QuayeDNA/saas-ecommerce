export const formatAuditAction = (action: string): string => {
  // Convert 'auth.login' → 'Login'
  const parts = action.split(".");
  return parts[parts.length - 1]
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    auth: "blue",
    user: "green",
    order: "purple",
    wallet: "yellow",
    storefront: "pink",
    payout: "orange",
    settings: "gray",
  };
  return colors[category] || "gray";
};

export const getSeverityColor = (severity: string): string => {
  const colors: Record<string, string> = {
    info: "blue",
    warning: "yellow",
    critical: "red",
  };
  return colors[severity] || "gray";
};

export const downloadCSV = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};
