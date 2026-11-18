import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// Local storage key for custom user Firebase config override
const STORAGE_KEY = "chav_firebase_config";

// Active Firebase Configuration for Krunchy Project
export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyA6gpiCLKTSpLJPJNdaMebJuMQoZKg_5DU",
  authDomain: "krunchy-b0b61.firebaseapp.com",
  projectId: "krunchy-b0b61",
  storageBucket: "krunchy-b0b61.firebasestorage.app",
  messagingSenderId: "732375611891",
  appId: "1:732375611891:web:f5e55377bfd617a3333a86",
  measurementId: "G-C3QTM004N8"
};

/**
 * Get active Firebase configuration from localStorage or default
 */
export function getSavedFirebaseConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.projectId && parsed.apiKey) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error reading saved Firebase config:", e);
  }
  return DEFAULT_FIREBASE_CONFIG;
}

/**
 * Save Firebase configuration override to localStorage
 */
export function saveFirebaseConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    // Reset cached instances to force re-initialization
    cachedApp = null;
    cachedDb = null;
    return true;
  } catch (e) {
    console.error("Error saving Firebase config:", e);
    return false;
  }
}

/**
 * Reset to default project configuration
 */
export function clearFirebaseConfig() {
  localStorage.removeItem(STORAGE_KEY);
  cachedApp = null;
  cachedDb = null;
}

let cachedApp = null;
let cachedDb = null;
let cachedAnalytics = null;

/**
 * Initialize Firebase app and Firestore instance safely
 */
export function initFirebase() {
  const configToUse = getSavedFirebaseConfig();

  try {
    const app = !getApps().length ? initializeApp(configToUse) : getApp();
    const db = getFirestore(app);
    cachedApp = app;
    cachedDb = db;

    // Initialize Analytics if supported in this browser environment
    if (typeof window !== "undefined" && !cachedAnalytics) {
      isSupported().then((supported) => {
        if (supported) {
          cachedAnalytics = getAnalytics(app);
        }
      }).catch((e) => {
        console.warn("Analytics initialization notice:", e.message);
      });
    }

    return { app, db, isConfigured: true, projectId: configToUse.projectId };
  } catch (error) {
    console.warn("Firebase initialization notice:", error.message);
    return { app: null, db: null, isConfigured: false, error: error.message };
  }
}

export function getDb() {
  if (cachedDb) return cachedDb;
  const { db } = initFirebase();
  return db;
}
