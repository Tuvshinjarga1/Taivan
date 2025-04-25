"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"
import firebase from "../firebase/config"
import { useAuth } from "./AuthContext"

interface HealthData {
  id?: string
  userId: string
  heartRate: number
  steps: number
  sleep: number
  calories: number
  date: string
  timestamp: firebase.firestore.Timestamp
}

interface GlucoseReading {
  id?: string
  userId: string
  value: number
  readingType: "fasting" | "before_meal" | "after_meal" | "bedtime" | "random"
  timestamp: Date
  notes?: string
}

interface FoodData {
  id?: string
  userId: string
  foodItems: Array<{ name: string; calories: number; portion: string; carbs?: number }>
  totalCalories: number
  totalCarbs?: number
  mealType: "breakfast" | "lunch" | "dinner" | "snack"
  timestamp: firebase.firestore.Timestamp
}

interface HealthDataContextData {
  healthData: HealthData | null
  glucoseReadings: GlucoseReading[]
  foodData: FoodData[]
  isLoading: boolean
  saveHealthData: (data: Omit<HealthData, "id" | "timestamp" | "date">) => Promise<void>
  saveGlucoseReading: (reading: Omit<GlucoseReading, "id">) => Promise<void>
  saveFoodData: (data: Omit<FoodData, "id" | "timestamp">) => Promise<void>
  getLatestHealthData: () => Promise<HealthData | null>
  getGlucoseReadings: (days?: number) => Promise<GlucoseReading[]>
  getFoodData: (days?: number) => Promise<FoodData[]>
}

const HealthDataContext = createContext<HealthDataContextData>({} as HealthDataContextData)

export const HealthDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const [healthData, setHealthData] = useState<HealthData | null>(null)
  const [glucoseReadings, setGlucoseReadings] = useState<GlucoseReading[]>([])
  const [foodData, setFoodData] = useState<FoodData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadLatestHealthData()
      loadGlucoseReadings()
      loadFoodData()
    } else {
      setHealthData(null)
      setGlucoseReadings([])
      setFoodData([])
    }
  }, [user])

  const loadLatestHealthData = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const result = await getLatestHealthData()
      setHealthData(result)
    } catch (error) {
      console.error("Error loading health data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadGlucoseReadings = async () => {
    if (!user) return

    try {
      const readings = await getGlucoseReadings(7) // Last 7 days by default
      setGlucoseReadings(readings)
    } catch (error) {
      console.error("Error loading glucose readings:", error)
    }
  }

  const loadFoodData = async () => {
    if (!user) return

    try {
      const data = await getFoodData(7) // Last 7 days by default
      setFoodData(data)
    } catch (error) {
      console.error("Error loading food data:", error)
    }
  }

  const getLatestHealthData = async (): Promise<HealthData | null> => {
    if (!user) return null

    try {
      const q = firebase
        .firestore()
        .collection("healthData")
        .where("userId", "==", user.id)
        .orderBy("timestamp", "desc")
        .limit(1)

      const snapshot = await q.get()

      if (snapshot.empty) {
        return null
      }

      const doc = snapshot.docs[0]
      return {
        id: doc.id,
        ...(doc.data() as HealthData),
      }
    } catch (error) {
      console.error("Error getting latest health data:", error)
      return null
    }
  }

  const getGlucoseReadings = async (days = 7): Promise<GlucoseReading[]> => {
    if (!user) return []

    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const q = firebase.firestore().collection("glucoseReadings").where("userId", "==", user.id)

      const snapshot = await q.get()

      const readings: GlucoseReading[] = []

      snapshot.forEach((doc) => {
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

      return readings
    } catch (error) {
      console.error("Error getting glucose readings:", error)
      return []
    }
  }

  const getFoodData = async (days = 7): Promise<FoodData[]> => {
    if (!user) return []

    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const q = firebase.firestore().collection("foodData").where("userId", "==", user.id)

      const snapshot = await q.get()

      const data: FoodData[] = []

      snapshot.forEach((doc) => {
        const foodData = doc.data()
        // Only include documents after the start date
        if (foodData.timestamp && foodData.timestamp.toDate() >= startDate) {
          data.push({
            id: doc.id,
            ...(foodData as FoodData),
          })
        }
      })

      // Sort manually
      data.sort((a, b) => b.timestamp.toDate().getTime() - a.timestamp.toDate().getTime())

      return data
    } catch (error) {
      console.error("Error getting food data:", error)
      return []
    }
  }

  const saveHealthData = async (data: Omit<HealthData, "id" | "timestamp" | "date">) => {
    if (!user) return

    try {
      const today = new Date().toISOString().split("T")[0]

      await firebase
        .firestore()
        .collection("healthData")
        .add({
          ...data,
          userId: user.id,
          date: today,
          timestamp: firebase.firestore.Timestamp.now(),
        })

      // Reload latest data
      loadLatestHealthData()
    } catch (error) {
      console.error("Error saving health data:", error)
      throw error
    }
  }

  const saveGlucoseReading = async (reading: Omit<GlucoseReading, "id">) => {
    if (!user) return

    try {
      await firebase
        .firestore()
        .collection("glucoseReadings")
        .add({
          ...reading,
          userId: user.id,
          timestamp: firebase.firestore.Timestamp.fromDate(reading.timestamp),
        })

      // Reload glucose readings
      loadGlucoseReadings()
    } catch (error) {
      console.error("Error saving glucose reading:", error)
      throw error
    }
  }

  const saveFoodData = async (data: Omit<FoodData, "id" | "timestamp">) => {
    if (!user) return

    try {
      await firebase
        .firestore()
        .collection("foodData")
        .add({
          ...data,
          userId: user.id,
          timestamp: firebase.firestore.Timestamp.now(),
        })

      // Reload food data
      loadFoodData()
    } catch (error) {
      console.error("Error saving food data:", error)
      throw error
    }
  }

  return (
    <HealthDataContext.Provider
      value={{
        healthData,
        glucoseReadings,
        foodData,
        isLoading,
        saveHealthData,
        saveGlucoseReading,
        saveFoodData,
        getLatestHealthData,
        getGlucoseReadings,
        getFoodData,
      }}
    >
      {children}
    </HealthDataContext.Provider>
  )
}

export const useHealthData = () => {
  const context = useContext(HealthDataContext)
  if (!context) {
    throw new Error("useHealthData must be used within a HealthDataProvider")
  }
  return context
}
