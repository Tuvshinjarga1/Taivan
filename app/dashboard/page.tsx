"use client";

import { Suspense, useState, useEffect } from "react";
import HealthDashboard from "@/components/health-dashboard";
import {
  getAllHealthDataAction,
  isGoogleFitAuthenticatedAction,
} from "@/app/actions/googlefit-actions";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import ConnectGoogleFitButton from "@/components/connect-googlefit-button";

// Fallback health data in case fetching fails
const fallbackHealthData = {
  heartRate: 72,
  steps: 8243,
  sleep: 7.2,
  calories: 1842,
};

// Static user ID for demo
const staticUserId = "demo-user-123";

export default function DashboardPage() {
  const [healthData, setHealthData] = useState(fallbackHealthData);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Check for auth status parameter in URL
  useEffect(() => {
    const authStatus = searchParams.get("auth");

    if (authStatus === "success") {
      toast({
        title: "Амжилттай холбогдлоо",
        description: "Google Fit-тэй амжилттай холбогдлоо",
      });
    } else if (authStatus === "failed" || authStatus === "error") {
      toast({
        title: "Холболт амжилтгүй",
        description: "Google Fit-тэй холбогдоход алдаа гарлаа",
        variant: "destructive",
      });
    }

    // Remove the auth parameter from URL
    if (authStatus) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("auth");
      router.replace(newUrl.pathname + newUrl.search);
    }
  }, [searchParams, router]);

  // Check if user is authenticated and fetch data
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);

      // Check if authenticated with Google Fit
      const authResult = await isGoogleFitAuthenticatedAction();
      setIsAuthenticated(!!authResult);

      if (authResult) {
        // Fetch health data from Google Fit
        const result = await getAllHealthDataAction(staticUserId);

        if (result.success && result.data) {
          setHealthData(result.data);
        }
      }

      setIsLoading(false);
    }

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">
            Мэдээлэл ачааллаж байна...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {!isAuthenticated && (
        <div className="mx-4 my-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
          <p className="font-medium text-yellow-800 mb-2">
            Google Fit-тэй холбогдоогүй байна
          </p>
          <p className="text-yellow-700 mb-3">
            Бодит эрүүл мэндийн мэдээлэл харахын тулд Google Fit-тэй холбогдоно
            уу.
          </p>
          <ConnectGoogleFitButton fullWidth size="sm" />
        </div>
      )}

      <HealthDashboard healthData={healthData} userId={staticUserId} />
    </>
  );
}
