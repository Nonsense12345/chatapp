// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCWvXsq_5R3d00Fg9YN8CERLR103InofNc",
  authDomain: "treepulse-965b5.firebaseapp.com",
  projectId: "treepulse-965b5",
  storageBucket: "treepulse-965b5.appspot.com",
  messagingSenderId: "283586985951",
  appId: "1:283586985951:web:b838140c81d8563e6fce6a",
  measurementId: "G-GL1702305Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);