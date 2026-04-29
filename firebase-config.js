// js/firebase-config.js
// Replace with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyCdsXWp0okIjmkV8PPaZkcZji4lVu7Qz9A",
  authDomain: "malmeen.firebaseapp.com",
  databaseURL: "https://malmeen-default-rtdb.firebaseio.com",
  projectId: "malmeen",
  storageBucket: "malmeen.firebasestorage.app",
  messagingSenderId: "853741838495",
  appId: "1:853741838495:web:87c3b11c886b39867e02aa",
  measurementId: "G-SDGGXSE3F6"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Create collections references
const interactionsRef = db.collection('interactions');
const dailyContentRef = db.collection('dailyContent');
const usersRef = db.collection('users');

window.db = db;
window.interactionsRef = interactionsRef;
window.dailyContentRef = dailyContentRef;
window.usersRef = usersRef;
