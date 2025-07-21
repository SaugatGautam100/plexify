// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getMessaging } from 'firebase/messaging'; // Import getMessaging

// Your web app's Firebase configuration
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
export const auth = getAuth(app);

// Initialize Firebase Messaging
let messaging;
if (typeof window !== 'undefined') { // Only initialize messaging in the browser
  try {
    messaging = getMessaging(app);
  } catch (e) {
    console.error("Error initializing Firebase Messaging:", e);
    // Handle error, e.g., by not exporting messaging or setting it to null
  }
}
export { messaging }; // Export the messaging instance

export default app;
