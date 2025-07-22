import React from "react";
import { Outlet } from "react-router-dom";
import { DashboardLayout } from "./dashboard-layout";

export default function SuperAdminLayout() {
  return <DashboardLayout><Outlet /></DashboardLayout>;
} 