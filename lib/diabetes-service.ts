"use server"

import { getFirestore, collection, addDoc, getDocs, query, where, Timestamp } from "firebase/firestore"
import { initializeApp, getApps, getApp } from "firebase/app"
import { firebaseConfig } from "@/lib/firebase-config"

// Initialize Firebase on the server
let db

try {
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
  db = getFirestore(app)
} catch (error) {
  console.error("Error initializing Firebase on server:", error)
  db = null
}

// Диабетийн мэдээллийн төрлүүд
export type DiabetesReminderType = "medication" | "glucose" | "appointment" | "meal" | "exercise" | "other"

export interface DiabetesReminder {
  id?: string
  userId: string
  type: DiabetesReminderType
  name: string
  time: string
  frequency: "once" | "daily" | "weekdays" | "weekends" | "weekly" | "monthly"
  notes?: string
  isActive: boolean
  nextOccurrence: Date
}

export interface GlucoseReading {
  id?: string
  userId: string
  value: number // mg/dL
  readingType: "fasting" | "before_meal" | "after_meal" | "bedtime" | "random"
  timestamp: Date
  notes?: string
}

export interface DiabetesMealPlan {
  id?: string
  userId: string
  name: string
  description?: string
  meals: {
    name: string
    foods: string[]
    carbs: number
    time?: string
  }[]
  totalCarbs: number
  isRecommended: boolean
}

// Сануулга хадгалах
export async function saveReminder(reminder: Omit<DiabetesReminder, "id">) {
  try {
    if (!db) {
      console.error("Firebase database not initialized")
      return { success: false, error: "Database connection error" }
    }

    const docRef = await addDoc(collection(db, "diabetesReminders"), {
      ...reminder,
      timestamp: Timestamp.now(),
    })

    return { success: true, id: docRef.id }
  } catch (error) {
    console.error("Error saving reminder:", error)
    return { success: false, error: "Failed to save reminder" }
  }
}

// Сануулгуудыг авах
export async function getUserReminders(userId: string) {
  try {
    if (!db) {
      console.error("Firebase database not initialized")
      return { success: false, error: "Database connection error" }
    }

    // Simple query to avoid index issues
    const q = query(collection(db, "diabetesReminders"), where("userId", "==", userId))
    const querySnapshot = await getDocs(q)

    const reminders: DiabetesReminder[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      reminders.push({
        id: doc.id,
        userId: data.userId,
        type: data.type,
        name: data.name,
        time: data.time,
        frequency: data.frequency,
        notes: data.notes,
        isActive: data.isActive,
        nextOccurrence: data.nextOccurrence?.toDate() || new Date(),
      })
    })

    return { success: true, data: reminders }
  } catch (error) {
    console.error("Error getting reminders:", error)
    return { success: false, error: "Failed to retrieve reminders" }
  }
}

// Сахарын хэмжилт хадгалах
export async function saveGlucoseReading(reading: Omit<GlucoseReading, "id">) {
  try {
    if (!db) {
      console.error("Firebase database not initialized")
      return { success: false, error: "Database connection error" }
    }

    const docRef = await addDoc(collection(db, "glucoseReadings"), {
      ...reading,
      timestamp: Timestamp.fromDate(reading.timestamp),
    })

    return { success: true, id: docRef.id }
  } catch (error) {
    console.error("Error saving glucose reading:", error)
    return { success: false, error: "Failed to save glucose reading" }
  }
}

// Сахарын хэмжилтүүдийг авах
export async function getGlucoseReadings(userId: string, days = 7) {
  try {
    if (!db) {
      console.error("Firebase database not initialized")
      return { success: false, error: "Database connection error" }
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Simple query to avoid index issues
    const q = query(collection(db, "glucoseReadings"), where("userId", "==", userId))
    const querySnapshot = await getDocs(q)

    const readings: GlucoseReading[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      // Only include documents after the start date
      if (data.timestamp && data.timestamp.toDate() >= startDate) {
        readings.push({
          id: doc.id,
          userId: data.userId,
          value: data.value,
          readingType: data.readingType,
          timestamp: data.timestamp.toDate(),
          notes: data.notes,
        })
      }
    })

    // Sort manually
    readings.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    return { success: true, data: readings }
  } catch (error) {
    console.error("Error getting glucose readings:", error)
    return { success: false, error: "Failed to retrieve glucose readings" }
  }
}

// Хоолны төлөвлөгөө хадгалах
export async function saveMealPlan(mealPlan: Omit<DiabetesMealPlan, "id">) {
  try {
    if (!db) {
      console.error("Firebase database not initialized")
      return { success: false, error: "Database connection error" }
    }

    const docRef = await addDoc(collection(db, "diabetesMealPlans"), {
      ...mealPlan,
      timestamp: Timestamp.now(),
    })

    return { success: true, id: docRef.id }
  } catch (error) {
    console.error("Error saving meal plan:", error)
    return { success: false, error: "Failed to save meal plan" }
  }
}

// Хоолны төлөвлөгөөнүүдийг авах
export async function getMealPlans(userId: string) {
  try {
    if (!db) {
      console.error("Firebase database not initialized")
      return { success: false, error: "Database connection error" }
    }

    const q = query(collection(db, "diabetesMealPlans"), where("userId", "==", userId))
    const querySnapshot = await getDocs(q)

    const mealPlans: DiabetesMealPlan[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      mealPlans.push({
        id: doc.id,
        userId: data.userId,
        name: data.name,
        description: data.description,
        meals: data.meals,
        totalCarbs: data.totalCarbs,
        isRecommended: data.isRecommended,
      })
    })

    return { success: true, data: mealPlans }
  } catch (error) {
    console.error("Error getting meal plans:", error)
    return { success: false, error: "Failed to retrieve meal plans" }
  }
}

// Диабетийн эрсдэлийн үнэлгээг хадгалах
export async function saveDiabetesRiskAssessment(userId: string, assessmentData: any) {
  try {
    if (!db) {
      console.error("Firebase database not initialized")
      return { success: false, error: "Database connection error" }
    }

    const docRef = await addDoc(collection(db, "diabetesRiskAssessments"), {
      userId,
      ...assessmentData,
      timestamp: Timestamp.now(),
    })

    return { success: true, id: docRef.id }
  } catch (error) {
    console.error("Error saving risk assessment:", error)
    return { success: false, error: "Failed to save risk assessment" }
  }
}

// Хоолны зөвлөмж авах
export async function getRecommendedMeals(userId: string, carbLimit: number) {
  try {
    if (!db) {
      console.error("Firebase database not initialized")
      return { success: false, error: "Database connection error" }
    }

    // Энд бодит байдал дээр илүү нарийн логик байх ёстой
    // Жишээлбэл, хэрэглэгчийн хоолны дуртай зүйлс, хоолны хоригууд гэх мэт
    const q = query(
      collection(db, "diabetesMealPlans"),
      where("isRecommended", "==", true),
      where("totalCarbs", "<=", carbLimit),
    )

    const querySnapshot = await getDocs(q)

    const recommendedMeals: DiabetesMealPlan[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      recommendedMeals.push({
        id: doc.id,
        userId: data.userId,
        name: data.name,
        description: data.description,
        meals: data.meals,
        totalCarbs: data.totalCarbs,
        isRecommended: data.isRecommended,
      })
    })

    return { success: true, data: recommendedMeals }
  } catch (error) {
    console.error("Error getting recommended meals:", error)
    return { success: false, error: "Failed to retrieve recommended meals" }
  }
}
