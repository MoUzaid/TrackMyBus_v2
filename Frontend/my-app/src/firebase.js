// src/firebase.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging } from "firebase/messaging"; // if you want FCM

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBrU_d2M5OQiWg6ddPt_QYqjaxMyYQQhTE",
  authDomain: "trackmybus-d74c4.firebaseapp.com",
  projectId: "trackmybus-d74c4",
  storageBucket: "trackmybus-d74c4.firebasestorage.app",
  messagingSenderId: "1059975295219",
  appId: "1:1059975295219:web:d6ffc4953e684d3ed2c786",
  measurementId: "G-R7Q7W7Q09W"
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
export const analytics = getAnalytics(firebaseApp);
export const messaging = getMessaging(firebaseApp);
