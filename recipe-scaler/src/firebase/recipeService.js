import {
  collection,
  onSnapshot,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  query,
} from "firebase/firestore";
import { getDb, getSavedFirebaseConfig } from "./config";
import { defaultRecipes } from "../data/defaultRecipes";

const LOCAL_RECIPES_KEY = "chav_local_recipes_cache";
const COLLECTION_NAME = "recipes";

/**
 * Get cached local recipes from LocalStorage
 */
export function getLocalCachedRecipes() {
  try {
    const raw = localStorage.getItem(LOCAL_RECIPES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error reading local recipes:", e);
  }
  return defaultRecipes;
}

/**
 * Save recipes to local storage cache
 */
export function saveLocalCachedRecipes(recipes) {
  try {
    localStorage.setItem(LOCAL_RECIPES_KEY, JSON.stringify(recipes));
  } catch (e) {
    console.error("Error writing local recipes:", e);
  }
}

/**
 * Subscribes to recipes from Firestore in real-time, or falls back to local cache if offline
 * @param {Function} onRecipesUpdate - callback receiving recipe array and connection status
 * @returns {Function} unsubscribe function
 */
export function subscribeToRecipes(onRecipesUpdate) {
  let db;
  try {
    db = getDb();
  } catch (err) {
    console.warn("Could not get Firestore instance:", err);
  }

  if (!db) {
    const initial = getLocalCachedRecipes();
    onRecipesUpdate(initial, {
      connected: false,
      mode: "local",
      message: "Operating in local offline mode",
    });
    return () => {};
  }

  try {
    const recipesRef = collection(db, COLLECTION_NAME);
    const q = query(recipesRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }));
          saveLocalCachedRecipes(loaded);
          onRecipesUpdate(loaded, {
            connected: true,
            mode: "firestore",
            message: `Cloud Firestore synced (krunchy-b0b61)`,
          });
        } else {
          // If Firestore recipes collection is empty, display preloaded authentic recipes
          const cached = getLocalCachedRecipes();
          onRecipesUpdate(cached, {
            connected: true,
            mode: "empty_firestore",
            message: "Connected to krunchy-b0b61 (Ready to seed or add)",
          });
        }
      },
      (error) => {
        console.warn("Firestore subscription notice (using local cache):", error.message);
        const cached = getLocalCachedRecipes();
        onRecipesUpdate(cached, {
          connected: false,
          mode: "fallback",
          message: error.message.includes("permission-denied")
            ? "Firestore Rules: Set read/write rules to test"
            : error.message,
          error: error.message,
        });
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn("Firestore listener setup error:", err.message);
    const cached = getLocalCachedRecipes();
    onRecipesUpdate(cached, {
      connected: false,
      mode: "fallback",
      message: err.message,
      error: err.message,
    });
    return () => {};
  }
}

/**
 * Add a new recipe to Cloud Firestore (with local cache fallback)
 */
export async function addRecipe(recipeData) {
  let db;
  try {
    db = getDb();
  } catch (e) {}

  const cleanRecipe = {
    ...recipeData,
    created_at: new Date().toISOString(),
  };

  if (db) {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...cleanRecipe,
        server_timestamp: serverTimestamp(),
      });
      return { success: true, id: docRef.id, cloud: true };
    } catch (e) {
      console.warn("Failed to write directly to Firestore, saving to local cache:", e.message);
    }
  }

  // Local fallback
  const localRecipes = getLocalCachedRecipes();
  const newId = `custom-${Date.now()}`;
  const updatedRecipes = [{ id: newId, ...cleanRecipe }, ...localRecipes];
  saveLocalCachedRecipes(updatedRecipes);
  return { success: true, id: newId, cloud: false };
}

/**
 * Delete a recipe by ID
 */
export async function deleteRecipe(recipeId) {
  let db;
  try {
    db = getDb();
  } catch (e) {}

  if (db && !recipeId.startsWith("kanda-") && !recipeId.startsWith("masala-")) {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, recipeId));
    } catch (e) {
      console.warn("Could not delete from Firestore:", e.message);
    }
  }

  // Update local
  const current = getLocalCachedRecipes();
  const filtered = current.filter((r) => r.id !== recipeId);
  saveLocalCachedRecipes(filtered);
  return { success: true };
}

/**
 * Seed authentic recipes into Cloud Firestore
 */
export async function seedFirestoreWithDefaultRecipes() {
  const db = getDb();
  if (!db) {
    throw new Error("Firestore database is not initialized.");
  }

  let count = 0;
  for (const recipe of defaultRecipes) {
    const { id, ...data } = recipe;
    await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      is_preloaded: true,
      seeded_at: new Date().toISOString(),
    });
    count++;
  }
  return count;
}
