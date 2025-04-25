import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, limit, Timestamp } from "firebase/firestore"
import { getAuth } from "firebase/auth"

// Your Firebase configuration
const firebaseConfig = {
  // These values will be provided by the Firebase integration
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

// Health data functions
export async function saveHealthData(userId: string, data: any) {
  try {
    const docRef = await addDoc(collection(db, "healthData"), {
      userId,
      ...data,
      timestamp: Timestamp.now(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error saving health data:", error)
    throw error
  }
}

export async function getUserHealthData(userId: string, days = 7) {
  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const q = query(
      collection(db, "healthData"),
      where("userId", "==", userId),
      where("timestamp", ">=", Timestamp.fromDate(startDate)),
      orderBy("timestamp", "desc"),
    )

    const querySnapshot = await getDocs(q)
    const data: any[] = []

    querySnapshot.forEach((doc) => {
      data.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    return data
  } catch (error) {
    console.error("Error getting health data:", error)
    throw error
  }
}

export async function getLatestHealthData(userId: string) {
  try {
    const q = query(collection(db, "healthData"), where("userId", "==", userId), orderBy("timestamp", "desc"), limit(1))

    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return null
    }

    const doc = querySnapshot.docs[0]
    return {
      id: doc.id,
      ...doc.data(),
    }
  } catch (error) {
    console.error("Error getting latest health data:", error)
    throw error
  }
}

export { db, auth }
