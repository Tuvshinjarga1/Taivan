"use server";

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  type QuerySnapshot,
  type DocumentData,
} from "firebase/firestore";
import { revalidatePath } from "next/cache";
import { firebaseConfig } from "@/lib/firebase-config";

// Initialize Firebase on the server
let db: any = null;

try {
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (error) {
  console.error("Error initializing Firebase on server:", error);
  db = null;
}

// Default health data
const defaultHealthData = {
  heartRate: 72,
  steps: 8243,
  sleep: 7.2,
  calories: 1842,
  date: new Date().toISOString().split("T")[0],
};

export async function saveHealthDataAction(formData: FormData) {
  try {
    const userId = formData.get("userId") as string;

    // Extract and convert form data
    const healthData = {
      heartRate: Number(formData.get("heartRate")),
      steps: Number(formData.get("steps")),
      sleep: Number(formData.get("sleep")),
      calories: Number(formData.get("calories")),
      date: new Date().toISOString().split("T")[0],
      timestamp: Timestamp.now(),
    };

    // If Firebase is not initialized, return error
    if (!db) {
      console.error("Firebase database not initialized");
      return { success: false, error: "Database connection error" };
    }

    // Save to Firestore
    const docRef = await addDoc(collection(db, "healthData"), {
      userId,
      ...healthData,
    });

    // Revalidate the dashboard page to show updated data
    revalidatePath("/dashboard");

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error saving health data:", error);
    return { success: false, error: "Failed to save health data" };
  }
}

export async function getUserHealthDataAction(userId: string, days = 7) {
  try {
    // If Firebase is not initialized, return error
    if (!db) {
      console.error("Firebase database not initialized");
      return { success: false, error: "Database connection error" };
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Simple query without ordering to avoid index issues
    const q = query(
      collection(db, "healthData"),
      where("userId", "==", userId)
    );

    const querySnapshot = await getDocs(q);
    const data: any[] = [];

    querySnapshot.forEach((doc) => {
      const docData = doc.data();
      // Only include documents after the start date
      if (docData.timestamp && docData.timestamp.toDate() >= startDate) {
        data.push({
          id: doc.id,
          ...docData,
        });
      }
    });

    // Sort the data manually
    data.sort((a, b) => {
      return b.timestamp.toDate().getTime() - a.timestamp.toDate().getTime();
    });

    return { success: true, data };
  } catch (error) {
    console.error("Error getting health data:", error);
    return { success: false, error: "Failed to retrieve health data" };
  }
}

export async function getLatestHealthDataAction(userId: string) {
  try {
    // If Firebase is not initialized, return error
    if (!db) {
      console.error("Firebase database not initialized");
      return { success: false, error: "Database connection error" };
    }

    let querySnapshot: QuerySnapshot<DocumentData>;

    try {
      // Try the original query that requires an index
      const q = query(
        collection(db, "healthData"),
        where("userId", "==", userId),
        orderBy("timestamp", "desc"),
        limit(1)
      );
      querySnapshot = await getDocs(q);
    } catch (indexError: any) {
      // Check if it's a missing index error
      if (
        indexError.message &&
        indexError.message.includes("requires an index")
      ) {
        console.warn("Missing Firestore index. Using fallback query method.");

        // Fallback to a simpler query without ordering
        const q = query(
          collection(db, "healthData"),
          where("userId", "==", userId)
        );
        querySnapshot = await getDocs(q);

        // If we have data, we'll sort it manually
        if (!querySnapshot.empty) {
          const allDocs: any[] = [];
          querySnapshot.forEach((doc) => {
            allDocs.push({
              id: doc.id,
              ...doc.data(),
            });
          });

          // Sort manually by timestamp
          allDocs.sort((a, b) => {
            if (!a.timestamp || !b.timestamp) return 0;
            return (
              b.timestamp.toDate().getTime() - a.timestamp.toDate().getTime()
            );
          });

          // Return the first document (most recent)
          if (allDocs.length > 0) {
            return {
              success: true,
              data: allDocs[0],
              indexNeeded: true,
              indexUrl: extractIndexUrl(indexError.message),
            };
          }
        }
      } else {
        // If it's not a missing index error, rethrow
        throw indexError;
      }
    }

    if (querySnapshot.empty) {
      return { success: true, data: null };
    }

    const doc = querySnapshot.docs[0];
    return {
      success: true,
      data: {
        id: doc.id,
        ...doc.data(),
      },
    };
  } catch (error) {
    console.error("Error getting latest health data:", error);
    return {
      success: false,
      error: "Failed to retrieve latest health data",
      defaultData: {
        ...defaultHealthData,
        userId,
        timestamp: Timestamp.now(),
      },
    };
  }
}

// Helper function to extract the index URL from the error message
function extractIndexUrl(errorMessage: string): string | null {
  const urlMatch = errorMessage.match(
    /https:\/\/console\.firebase\.google\.com[^\s]+/
  );
  return urlMatch ? urlMatch[0] : null;
}
