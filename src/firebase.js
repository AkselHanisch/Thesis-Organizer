// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD_dqEkvXcDoSD3VZTGF1UWco9-RjWv7VI",
  authDomain: "thesis-organizer.firebaseapp.com",
  projectId: "thesis-organizer",
  storageBucket: "thesis-organizer.firebasestorage.app",
  messagingSenderId: "441536111257",
  appId: "1:441536111257:web:0dec0428cd0cc998b98e08",
  measurementId: "G-5LQ2RDQD4N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
const analytics = getAnalytics(app);
export const auth = getAuth(app);