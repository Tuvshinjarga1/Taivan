import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokensAction } from "@/app/actions/googlefit-actions";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");

    // Handle errors from OAuth provider
    if (error) {
      console.error("Google OAuth error:", error);
      return NextResponse.redirect(
        new URL("/dashboard?auth=failed", request.url)
      );
    }

    // If we have a code, exchange it for tokens
    if (code) {
      const result = await exchangeCodeForTokensAction(code);

      if (result.success) {
        return NextResponse.redirect(
          new URL("/dashboard?auth=success", request.url)
        );
      } else {
        console.error("Failed to exchange code for tokens:", result.error);
        return NextResponse.redirect(
          new URL("/dashboard?auth=failed", request.url)
        );
      }
    }

    // No code or error, redirect to dashboard with invalid parameter
    return NextResponse.redirect(
      new URL("/dashboard?auth=invalid", request.url)
    );
  } catch (error) {
    console.error("Error handling Google OAuth callback:", error);
    return NextResponse.redirect(new URL("/dashboard?auth=error", request.url));
  }
}
