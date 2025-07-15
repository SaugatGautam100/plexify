// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDm0sA-pbN2gPb3QQKInlEfsOisAGt14H4",
  authDomain: "plexify-6469a.firebaseapp.com",
  databaseURL: "https://plexify-6469a-default-rtdb.firebaseio.com",
  projectId: "plexify-6469a",
  storageBucket: "plexify-6469a.firebasestorage.app",
  messagingSenderId: "410243363030",
  appId: "1:410243363030:web:35e1af541796dd9cb85977",
  measurementId: "G-MEQ7YFWYPN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default app;