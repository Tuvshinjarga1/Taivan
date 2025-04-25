// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// TODO: Replace with your actual firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA07lyi0jHWrv_xW5lZ9QH-GnM8RmXDN4I",
  authDomain: "v0test-bacca.firebaseapp.com",
  projectId: "v0test-bacca",
  storageBucket: "v0test-bacca.firebasestorage.app",
  messagingSenderId: "527296994103",
  appId: "1:527296994103:web:57ddcf8197f877a91b98b2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Helper function to save diabetes assessment data
export const saveDiabetesAssessment = async (userId, assessmentData) => {
  try {
    const { collection, addDoc, serverTimestamp } = await import(
      "firebase/firestore"
    );

    const docRef = await addDoc(collection(db, "diabetesAssessments"), {
      userId,
      assessmentData,
      createdAt: serverTimestamp(),
    });

    console.log("Diabetes assessment saved with ID: ", docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error saving diabetes assessment: ", error);
    return { success: false, error };
  }
};

// Helper function to save health data
export const saveHealthData = async (userId, healthData) => {
  try {
    const { collection, addDoc, serverTimestamp } = await import(
      "firebase/firestore"
    );

    const docRef = await addDoc(collection(db, "healthData"), {
      userId,
      healthData,
      createdAt: serverTimestamp(),
    });

    console.log("Health data saved with ID: ", docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error saving health data: ", error);
    return { success: false, error };
  }
};
