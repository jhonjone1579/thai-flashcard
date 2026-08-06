import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDUo9l-vq2SoG7iN4nq3qjylrC7zkvv9HE",
  authDomain: "thai-flashcards-feda1.firebaseapp.com",
  projectId: "thai-flashcards-feda1",
  storageBucket: "thai-flashcards-feda1.firebasestorage.app",
  messagingSenderId: "905382151667",
  appId: "1:123456789:web:f23f88bb68bd2911993e86"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);