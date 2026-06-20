// Routing alias — superadmins use the exact same layout as agents/admins.
// Kept as a separate module so the route tree can reference SuperAdminLayout
// without coupling to DashboardLayout's import path.
export { DashboardLayout as default } from "./dashboard-layout";
