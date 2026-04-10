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

/* REDIRECTION PAGE APP */
document.getElementById("clientBtn").onclick = () => {
  window.location.href = "index.html";
};

document.getElementById("artistBtn").onclick = async () => {

  const email = prompt("Email");
  const password = prompt("Mot de passe");

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  /* 🔥 USER */
  await setDoc(doc(db, "users", user.uid), {
    email: email,
    role: "artist",
    createdAt: new Date()
  });

  /* 🔥 ARTIST */
  await setDoc(doc(db, "artists", user.uid), {
    userId: user.uid,
    username: "New Artist",
    email: email,
    city: "",
    description: "",
    skills: [],
    profileImage: "",
    rating: 0,
    reviewsCount: 0,
    isAvailable: true,
    location: {
      lat: 0,
      lng: 0
    },
    createdAt: new Date()
  });

  alert("Compte artiste créé !");
  window.location.href = "index.html";
};

import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

document.getElementById("loginBtn").onclick = async () => {

  const email = prompt("Email");
  const password = prompt("Mot de passe");

  await signInWithEmailAndPassword(auth, email, password);

  alert("Connecté !");
  window.location.href = "index.html";
};

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* 🔥 AFFICHER LES ARTISTES */
async function displayArtists() {

  const container = document.getElementById("artistsContainer");

  if (!container) return;

  container.innerHTML = "";

  const snapshot = await getDocs(collection(db, "artists"));

  snapshot.forEach(doc => {

    const artist = doc.data();

    container.innerHTML += `
      <div class="card" onclick="window.location.href='profil.html?id=${doc.id}'">

        <img src="${artist.profileImage || 'https://via.placeholder.com/300'}" class="profile-img"/>

        <h2>${artist.username || "Artiste"}</h2>

        <p>${artist.city || ""}</p>

        <p>${artist.description || ""}</p>

        <p>⭐ ${artist.rating || 0}</p>

      </div>
    `;
  });
}

/* LANCER */
displayArtists();
