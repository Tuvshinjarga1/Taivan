import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA07lyi0jHWrv_xW5lZ9QH-GnM8RmXDN4I",
  authDomain: "v0test-bacca.firebaseapp.com",
  projectId: "v0test-bacca",
  storageBucket: "v0test-bacca.firebasestorage.app",
  messagingSenderId: "527296994103",
  appId: "1:527296994103:web:57ddcf8197f877a91b98b2",
};

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === "development";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Set up custom auth emulation if in development
if (isDevelopment) {
  console.log("Running in development mode with mock Firebase");
}

export { app, auth, db, storage, firebaseConfig, isDevelopment };
