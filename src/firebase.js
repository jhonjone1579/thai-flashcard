import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "thai-flashcards-feda1.firebaseapp.com",
  projectId: "thai-flashcards-feda1",
  storageBucket: "thai-flashcards-feda1.firebasestorage.app",
  messagingSenderId: "905382151667",
  appId: "1:905382151667:web:f23f88bb68bd2911993e86"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);