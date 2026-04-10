import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  setDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA4IF_NqUVXXQxMWz3F1SM32NN5vLUpRoI",
  authDomain: "puffrap-46658.firebaseapp.com",
  projectId: "puffrap-46658",
  storageBucket: "puffrap-46658.firebasestorage.app",
  messagingSenderId: "217849878785",
  appId: "1:217849878785:web:e4e7d90ae3b77a19e76300",
  measurementId: "G-5LBQ1595QF"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
