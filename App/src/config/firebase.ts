import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  getFirestore,
  Firestore
} from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyA6gpiCLKTSpLJPJNdaMebJuMQoZKg_5DU",
  authDomain: "krunchy-b0b61.firebaseapp.com",
  projectId: "krunchy-b0b61",
  storageBucket: "krunchy-b0b61.firebasestorage.app",
  messagingSenderId: "732375611891",
  appId: "1:732375611891:web:f5e55377bfd617a3333a86",
  measurementId: "G-C3QTM004N8"
};

// Initialize Firebase App singleton
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with robust local persistent cache for offline POS resilience
let firestoreInstance: Firestore;
try {
  firestoreInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
} catch {
  // If already initialized
  firestoreInstance = getFirestore(app);
}

export const db = firestoreInstance;

// Initialize Analytics conditionally
export const initAnalytics = async () => {
  try {
    if (await isAnalyticsSupported()) {
      return getAnalytics(app);
    }
  } catch (err) {
    console.warn("Firebase Analytics could not be initialized:", err);
  }
  return null;
};

