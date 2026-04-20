// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAyICL1-ker3t3UolEB5_Kaiu9sAhUR9b0",
  authDomain: "omni-1e418.firebaseapp.com",
  projectId: "omni-1e418",
  storageBucket: "omni-1e418.firebasestorage.app",
  messagingSenderId: "433334007058",
  appId: "1:433334007058:web:498c6800987de3a2a7afcb",
  measurementId: "G-M1GR20QL3Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const db = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, db, auth };