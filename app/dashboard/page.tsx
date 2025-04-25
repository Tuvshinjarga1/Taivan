"use client";

import { Suspense } from "react";
import HealthDashboard from "@/components/health-dashboard";

// Static health data for demo
const staticHealthData = {
  heartRate: 72,
  steps: 8243,
  sleep: 7.2,
  calories: 1842,
};

// Static user ID for demo
const staticUserId = "demo-user-123";

export default function DashboardPage() {
  return (
    <HealthDashboard healthData={staticHealthData} userId={staticUserId} />
  );
}
