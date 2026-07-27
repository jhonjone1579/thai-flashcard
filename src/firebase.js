import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// သင့် Firebase Project ၏ Config Keys များ
const firebaseConfig = {
  apiKey: "AIzaSyAhkkffxW1HBBh7l6e5DcoehEO2bwRTuy0",
  authDomain: "thai-flashcards-feda1.firebaseapp.com",
  projectId: "thai-flashcards-feda1",
  storageBucket: "thai-flashcards-feda1.firebasestorage.app",
  messagingSenderId: "905382151667",
  appId: "1:905382151667:web:f23f88bb68bd2911993e86"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth နှင့် Database များကို အခြား ဖိုင်များမှ လှမ်းသုံးနိုင်ရန် Export လုပ်ခြင်း
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);