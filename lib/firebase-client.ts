"use client"

import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { firebaseConfig } from "./firebase-config"

// Initialize Firebase
let app, db, auth

try {
  // Initialize Firebase
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
  db = getFirestore(app)
  auth = getAuth(app)
} catch (error) {
  console.error("Error initializing Firebase:", error)
  // Set to null to indicate initialization failed
  app = null
  db = null
  auth = null
}

export { app, db, auth }
