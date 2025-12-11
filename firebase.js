// ⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️ firebase.js
// Firebase initialization and helper exports
// Place this file in your project and include it with a module script where needed.
// (Uses your provided config.)

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage, ref as sRef, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// ⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️ Your Firebase Config (from you)
const firebaseConfig = {
  apiKey: "AIzaSyAJRD-ZTH8Uf0qb_l5Ud8owgnGG0bg5ph0",
  authDomain: "bookyoursalon-a107d.firebaseapp.com",
  projectId: "bookyoursalon-a107d",
  storageBucket: "bookyoursalon-a107d.firebasestorage.app",
  messagingSenderId: "725348398126",
  appId: "1:725348398126:web:c6b2e531e42d1117d0dbbf",
  measurementId: "G-E32W9GB1KK"
};

// Initialize
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Helper: mount invisible recaptcha on an element id (button)
export function mountInvisibleRecaptcha(containerId) {
  // returns a RecaptchaVerifier instance
  return new RecaptchaVerifier(containerId, { size: 'invisible' }, auth);
}
