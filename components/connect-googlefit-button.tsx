"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getGoogleAuthURLAction } from "@/app/actions/googlefit-actions";
import { toast } from "@/hooks/use-toast";

interface ConnectGoogleFitButtonProps {
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "destructive"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  fullWidth?: boolean;
}

export default function ConnectGoogleFitButton({
  variant = "default",
  size = "default",
  className = "",
  fullWidth = false,
}: ConnectGoogleFitButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleConnect() {
    try {
      setIsLoading(true);
      const result = await getGoogleAuthURLAction();
      window.location.href = result.url;
    } catch (error) {
      console.error("Error getting Google auth URL:", error);
      toast({
        title: "Алдаа",
        description: "Google Fit-тэй холбогдоход алдаа гарлаа",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }

  return (
    <Button
      onClick={handleConnect}
      variant={variant}
      size={size}
      className={`${className} ${fullWidth ? "w-full" : ""}`}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
          Ачааллаж байна...
        </>
      ) : (
        "Google Fit-тэй холбогдох"
      )}
    </Button>
  );
}
