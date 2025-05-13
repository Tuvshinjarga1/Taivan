"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

// Google OAuth 2.0 configurations
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ||
  "http://localhost:3000/api/auth/google/callback";

// Google Fit API scopes
const SCOPES = [
  "https://www.googleapis.com/auth/fitness.activity.read",
  "https://www.googleapis.com/auth/fitness.heart_rate.read",
  "https://www.googleapis.com/auth/fitness.sleep.read",
  "https://www.googleapis.com/auth/fitness.body.read",
  "https://www.googleapis.com/auth/fitness.nutrition.read",
];

// Function to get Google OAuth URL
export async function getGoogleAuthURLAction() {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");

  url.searchParams.append("client_id", GOOGLE_CLIENT_ID);
  url.searchParams.append("redirect_uri", REDIRECT_URI);
  url.searchParams.append("response_type", "code");
  url.searchParams.append("scope", SCOPES.join(" "));
  url.searchParams.append("access_type", "offline");
  url.searchParams.append("prompt", "consent");

  return { url: url.toString() };
}

// Function to exchange auth code for tokens
export async function exchangeCodeForTokensAction(code: string) {
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error exchanging code for tokens:", errorData);
      return {
        success: false,
        error: "Failed to exchange auth code for tokens",
      };
    }

    const tokenData = await response.json();

    // Store tokens in cookies
    const cookieStore = await cookies();
    cookieStore.set("googleAccessToken", tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: tokenData.expires_in,
      path: "/",
    });

    if (tokenData.refresh_token) {
      cookieStore.set("googleRefreshToken", tokenData.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
      });
    }

    return { success: true, tokens: tokenData };
  } catch (error) {
    console.error("Error exchanging code for tokens:", error);
    return { success: false, error: "Failed to exchange auth code for tokens" };
  }
}

// Function to refresh the access token
export async function refreshAccessTokenAction() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("googleRefreshToken")?.value;

    if (!refreshToken) {
      return { success: false, error: "No refresh token available" };
    }

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error refreshing access token:", errorData);
      return { success: false, error: "Failed to refresh access token" };
    }

    const tokenData = await response.json();

    // Update access token in cookies
    cookieStore.set("googleAccessToken", tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: tokenData.expires_in,
      path: "/",
    });

    return { success: true, token: tokenData.access_token };
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return { success: false, error: "Failed to refresh access token" };
  }
}

// Function to get access token (checks if token exists and refresh if needed)
export async function getAccessTokenAction() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("googleAccessToken")?.value;

  if (!accessToken) {
    // Try to refresh the token
    const refreshResult = await refreshAccessTokenAction();

    if (!refreshResult.success) {
      return { success: false, error: "No access token available" };
    }

    return { success: true, token: refreshResult.token };
  }

  return { success: true, token: accessToken };
}

// Function to get steps data from Google Fit
export async function getStepsDataAction(
  startTimeMillis: number,
  endTimeMillis: number
) {
  try {
    const tokenResult = await getAccessTokenAction();

    if (!tokenResult.success) {
      return { success: false, error: tokenResult.error };
    }

    const response = await fetch(
      "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenResult.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          aggregateBy: [
            {
              dataTypeName: "com.google.step_count.delta",
              dataSourceId:
                "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps",
            },
          ],
          bucketByTime: { durationMillis: 86400000 }, // Daily buckets
          startTimeMillis,
          endTimeMillis,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error fetching steps data:", errorData);
      return {
        success: false,
        error: "Failed to fetch steps data from Google Fit",
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching steps data:", error);
    return { success: false, error: "Failed to fetch steps data" };
  }
}

// Function to get heart rate data from Google Fit
export async function getHeartRateDataAction(
  startTimeMillis: number,
  endTimeMillis: number
) {
  try {
    const tokenResult = await getAccessTokenAction();

    if (!tokenResult.success) {
      return { success: false, error: tokenResult.error };
    }

    const response = await fetch(
      "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenResult.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          aggregateBy: [
            {
              dataTypeName: "com.google.heart_rate.bpm",
              dataSourceId:
                "derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm",
            },
          ],
          bucketByTime: { durationMillis: 86400000 }, // Daily buckets
          startTimeMillis,
          endTimeMillis,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error fetching heart rate data:", errorData);
      return {
        success: false,
        error: "Failed to fetch heart rate data from Google Fit",
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching heart rate data:", error);
    return { success: false, error: "Failed to fetch heart rate data" };
  }
}

// Function to get sleep data from Google Fit
export async function getSleepDataAction(
  startTimeMillis: number,
  endTimeMillis: number
) {
  try {
    const tokenResult = await getAccessTokenAction();

    if (!tokenResult.success) {
      return { success: false, error: tokenResult.error };
    }

    const response = await fetch(
      "https://www.googleapis.com/fitness/v1/users/me/sessions",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${tokenResult.token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error fetching sleep data:", errorData);
      return {
        success: false,
        error: "Failed to fetch sleep data from Google Fit",
      };
    }

    const data = await response.json();

    // Filter sleep sessions
    const sleepSessions = data.session
      ? data.session.filter(
          (session: any) =>
            session.activityType === 72 && // Sleep activity type
            session.startTimeMillis >= startTimeMillis &&
            session.endTimeMillis <= endTimeMillis
        )
      : [];

    return { success: true, data: sleepSessions };
  } catch (error) {
    console.error("Error fetching sleep data:", error);
    return { success: false, error: "Failed to fetch sleep data" };
  }
}

// Function to get calories data from Google Fit
export async function getCaloriesDataAction(
  startTimeMillis: number,
  endTimeMillis: number
) {
  try {
    const tokenResult = await getAccessTokenAction();

    if (!tokenResult.success) {
      return { success: false, error: tokenResult.error };
    }

    const response = await fetch(
      "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenResult.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          aggregateBy: [
            {
              dataTypeName: "com.google.calories.expended",
              dataSourceId:
                "derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended",
            },
          ],
          bucketByTime: { durationMillis: 86400000 }, // Daily buckets
          startTimeMillis,
          endTimeMillis,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error fetching calories data:", errorData);
      return {
        success: false,
        error: "Failed to fetch calories data from Google Fit",
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching calories data:", error);
    return { success: false, error: "Failed to fetch calories data" };
  }
}

// Function to get all health data from Google Fit
export async function getAllHealthDataAction(userId: string) {
  try {
    // Calculate time range (last 7 days)
    const endTimeMillis = Date.now();
    const startTimeMillis = endTimeMillis - 7 * 24 * 60 * 60 * 1000;

    // Get all types of health data in parallel
    const [stepsResult, heartRateResult, sleepResult, caloriesResult] =
      await Promise.all([
        getStepsDataAction(startTimeMillis, endTimeMillis),
        getHeartRateDataAction(startTimeMillis, endTimeMillis),
        getSleepDataAction(startTimeMillis, endTimeMillis),
        getCaloriesDataAction(startTimeMillis, endTimeMillis),
      ]);

    // Process and format the data
    let formattedData = {
      steps: 0,
      heartRate: 0,
      sleep: 0,
      calories: 0,
      userId: userId,
    };

    // Process steps data
    if (stepsResult.success && stepsResult.data) {
      const stepsData = stepsResult.data;
      if (stepsData.bucket && stepsData.bucket.length > 0) {
        // Get most recent day's steps
        const latestBucket = stepsData.bucket[stepsData.bucket.length - 1];
        if (latestBucket.dataset && latestBucket.dataset.length > 0) {
          const pointData = latestBucket.dataset[0].point;
          if (pointData && pointData.length > 0) {
            const latestSteps = pointData[0].value[0].intVal || 0;
            formattedData.steps = latestSteps;
          }
        }
      }
    }

    // Process heart rate data
    if (heartRateResult.success && heartRateResult.data) {
      const heartData = heartRateResult.data;
      if (heartData.bucket && heartData.bucket.length > 0) {
        // Get average heart rate from latest data
        const latestBucket = heartData.bucket[heartData.bucket.length - 1];
        if (latestBucket.dataset && latestBucket.dataset.length > 0) {
          const pointData = latestBucket.dataset[0].point;
          if (pointData && pointData.length > 0) {
            let sum = 0;
            let count = 0;

            pointData.forEach((point: any) => {
              if (point.value && point.value.length > 0) {
                sum += point.value[0].fpVal || 0;
                count++;
              }
            });

            if (count > 0) {
              formattedData.heartRate = Math.round(sum / count);
            }
          }
        }
      }
    }

    // Process sleep data
    if (sleepResult.success && sleepResult.data) {
      const sleepData = sleepResult.data;
      if (sleepData.length > 0) {
        // Get most recent sleep session
        const latestSleep = sleepData[sleepData.length - 1];
        const durationMillis =
          latestSleep.endTimeMillis - latestSleep.startTimeMillis;
        const durationHours = durationMillis / (1000 * 60 * 60);
        formattedData.sleep = parseFloat(durationHours.toFixed(1));
      }
    }

    // Process calories data
    if (caloriesResult.success && caloriesResult.data) {
      const caloriesData = caloriesResult.data;
      if (caloriesData.bucket && caloriesData.bucket.length > 0) {
        // Get most recent day's calories
        const latestBucket =
          caloriesData.bucket[caloriesData.bucket.length - 1];
        if (latestBucket.dataset && latestBucket.dataset.length > 0) {
          const pointData = latestBucket.dataset[0].point;
          if (pointData && pointData.length > 0) {
            let totalCalories = 0;

            pointData.forEach((point: any) => {
              if (point.value && point.value.length > 0) {
                totalCalories += point.value[0].fpVal || 0;
              }
            });

            formattedData.calories = Math.round(totalCalories);
          }
        }
      }
    }

    return { success: true, data: formattedData };
  } catch (error) {
    console.error("Error fetching all health data:", error);
    return {
      success: false,
      error: "Failed to fetch health data from Google Fit",
    };
  }
}

// Function to check if user is authenticated with Google Fit
export async function isGoogleFitAuthenticatedAction() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("googleAccessToken")?.value;
  const refreshToken = cookieStore.get("googleRefreshToken")?.value;

  // If we have a refresh token, we can probably get a new access token
  if (refreshToken) return true;

  // If we have an access token, check if it's still valid
  if (accessToken) {
    try {
      const response = await fetch(
        "https://www.googleapis.com/fitness/v1/users/me/dataSources",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  return false;
}

// Function to logout from Google Fit (clear tokens)
export async function logoutGoogleFitAction() {
  const cookieStore = await cookies();
  cookieStore.delete("googleAccessToken");
  cookieStore.delete("googleRefreshToken");

  return { success: true };
}
