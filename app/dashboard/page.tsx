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

// Анхны эрүүл мэндийн дата
const fallbackHealthData = {
  heartRate: 72,
  steps: 8243,
  sleep: 7.2,
  calories: 1842,
};

// Туршилтын хэрэглэгчийн ID
const staticUserId = "demo-user-123";

// Separating the auth status check into a client component
function AuthStatusHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL дээрх баталгаажуулалтын төлөвийг шалгах
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

    // URL-ээс auth параметрийг устгах
    if (authStatus) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("auth");
      router.replace(newUrl.pathname + newUrl.search);
    }
  }, [searchParams, router]);

  return null;
}

export default function DashboardPage() {
  const [healthData, setHealthData] = useState(fallbackHealthData);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Хэрэглэгч баталгаажсан эсэхийг шалгаж, өгөгдөл авах
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);

      // Google Fit-тэй холбогдсон эсэхийг шалгах
      const authResult = await isGoogleFitAuthenticatedAction();
      setIsAuthenticated(!!authResult);

      if (authResult) {
        // Google Fit-ээс эрүүл мэндийн мэдээлэл авах
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
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-muted-foreground">
            Мэдээлэл ачааллаж байна...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Wrap the component that uses useSearchParams in Suspense */}
      <Suspense fallback={null}>
        <AuthStatusHandler />
      </Suspense>

      <div className="mx-auto px-2 sm:px-4 max-w-full sm:max-w-screen-lg py-3 sm:py-6">
        {!isAuthenticated && (
          <div className="mx-0 sm:mx-4 my-2 sm:my-4 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg shadow-sm">
            <p className="font-medium text-yellow-800 mb-1 sm:mb-2 text-sm sm:text-base">
              Google Fit-тэй холбогдоогүй байна
            </p>
            <p className="text-yellow-700 mb-3 sm:mb-4 text-xs sm:text-sm">
              Та бодит эрүүл мэндийн мэдээлэл авахын тулд Google Fit
              бүртгэлтэйгээ холбогдоно уу.
            </p>
            <div className="flex justify-center">
              <ConnectGoogleFitButton
                fullWidth
                size="sm"
                className="text-xs sm:text-sm py-1.5 sm:py-2"
              />
            </div>
          </div>
        )}

        <div className="py-2">
          <HealthDashboard healthData={healthData} userId={staticUserId} />
        </div>
      </div>
    </main>
  );
}
