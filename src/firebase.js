import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDUo9l-vq2SoG7iN4nq3qjylrC7zkvv9HE", // 💡 Quotes (" ") ခံပေးထားပါသည်
  authDomain: "thai-flashcards-feda1.firebaseapp.com",
  projectId: "thai-flashcards-feda1",
  storageBucket: "thai-flashcards-feda1.firebasestorage.app",
  messagingSenderId: "905382151667",
  appId: "1:905382151667:web:f23f88bb68bd2911993e86"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);