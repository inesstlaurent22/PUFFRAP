/* ================= FIREBASE ================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  setDoc,
  doc,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

/* CONFIG */
const firebaseConfig = {
  apiKey: "AIzaSyA4IF_NqUVXXQxMWz3F1SM32NN5vLUpRoI",
  authDomain: "puffrap-46658.firebaseapp.com",
  projectId: "puffrap-46658",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

/* ================= HELPERS ================= */

const openModal = (id) => document.getElementById(id).style.display = "flex";
const closeModal = (id) => document.getElementById(id).style.display = "none";

/* ================= MODALS ================= */

document.getElementById("loginBtn").onclick = () => openModal("loginModal");

document.getElementById("signupClient").onclick = () => openModal("signupClientModal");
document.getElementById("signupArtist").onclick = () => openModal("signupArtistModal");

/* fermer modal */
window.onclick = (e) => {
  if (e.target.classList.contains("modal")) {
    e.target.style.display = "none";
  }
};

/* ================= LOGIN ================= */

document.getElementById("loginSubmit").onclick = async () => {
  try {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    await signInWithEmailAndPassword(auth, email, password);

    alert("Connexion réussie ✨");

  } catch (error) {
    alert(error.message);
  }
};

/* ================= SIGNUP CLIENT ================= */

document.getElementById("createClient").onclick = async () => {
  try {

    const email = document.getElementById("clientEmail").value;
    const password = document.getElementById("clientPassword").value;

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      email,
      role: "client",
      createdAt: new Date()
    });

    alert("Compte client créé !");
    closeModal("signupClientModal");

  } catch (error) {
    alert(error.message);
  }
};

/* ================= SIGNUP ARTIST ================= */

document.getElementById("createArtistFinal").onclick = async () => {
  try {

    const email = document.getElementById("artistEmail").value;
    const password = document.getElementById("artistPassword").value;
    const file = document.getElementById("artistImage").files[0];

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    let imageUrl = "";

    /* UPLOAD IMAGE */
    if (file) {
      const storageRef = ref(storage, `artists/${user.uid}/profile.jpg`);
      await uploadBytes(storageRef, file);
      imageUrl = await getDownloadURL(storageRef);
    }

    /* USERS */
    await setDoc(doc(db, "users", user.uid), {
      email,
      role: "artist",
      createdAt: new Date()
    });

    /* ARTIST */
    await setDoc(doc(db, "artists", user.uid), {
      userId: user.uid,
      username: document.getElementById("artistName").value,
      firstname: document.getElementById("artistFirstname").value,
      city: document.getElementById("artistCity").value,
      skills: document.getElementById("artistSkills").value.split(","),
      portfolioLink: document.getElementById("artistPortfolio").value,
      socials: {
        instagram: document.getElementById("artistInstagram").value
      },
      profileImage: imageUrl,
      rating: 0,
      reviewsCount: 0,
      isAvailable: true,

      /* ⚠️ temporaire (tu amélioreras après) */
      location: {
        lat: 48.85,
        lng: 2.35
      },

      createdAt: new Date()
    });

    alert("Artiste créé 🚀");
    closeModal("signupArtistModal");

  } catch (error) {
    alert(error.message);
  }
};

/* ================= MAP ================= */

let map;

function initMap() {

  navigator.geolocation.getCurrentPosition(async (position) => {

    const userLocation = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };

    map = new google.maps.Map(document.getElementById("map"), {
      center: userLocation,
      zoom: 12,
      styles: [
        { elementType: "geometry", stylers: [{ color: "#0B0B0B" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#ffffff" }] }
      ]
    });

    /* USER MARKER */
    new google.maps.Marker({
      position: userLocation,
      map,
      title: "Vous êtes ici"
    });

    /* ARTISTS MARKERS */
    const snapshot = await getDocs(collection(db, "artists"));

    snapshot.forEach(docSnap => {

      const artist = docSnap.data();

      if (!artist.location) return;

      new google.maps.Marker({
        position: {
          lat: artist.location.lat,
          lng: artist.location.lng
        },
        map,
        title: artist.username
      });

    });

  });
}

/* ================= INIT ================= */

initMap();
