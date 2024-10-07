// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { getAnalytics } from "firebase/analytics"; // Optional for web

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBMD_4FpCBJrwKbRpSCqUR0awww-cwGEAo",
  authDomain: "hadisi-a04ee.firebaseapp.com",
  projectId: "hadisi-a04ee",
  storageBucket: "hadisi-a04ee.appspot.com",
  messagingSenderId: "170034153807",
  appId: "1:170034153807:web:fb0c8da1ed75a1e2a29d3a",
  measurementId: "G-5QPKKW9V6X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
export const db = getFirestore(app);

// Export auth
export { auth };

// Uncomment below if you're working in a web environment where analytics is supported
// const analytics = getAnalytics(app);
