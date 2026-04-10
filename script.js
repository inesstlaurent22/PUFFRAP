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
  storageBucket: "puffrap-46658.firebasestorage.app",
  messagingSenderId: "217849878785",
  appId: "1:217849878785:web:e4e7d90ae3b77a19e76300",
  measurementId: "G-5LBQ1595QF"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

/* ================= MODALS ================= */

/* OUVRIR */
document.getElementById("loginBtn").onclick = () => {
  document.getElementById("loginModal").style.display = "flex";
};

document.getElementById("signupBtn").onclick = () => {
  document.getElementById("signupModal").style.display = "flex";
};

/* FERMER */
window.onclick = (e) => {
  if (e.target.classList.contains("modal")) {
    e.target.style.display = "none";
  }
};

/* ================= PREVIEW IMAGE ================= */

document.getElementById("profileImageInput").onchange = (e) => {
  const file = e.target.files[0];
  if (file) {
    document.getElementById("previewImage").src = URL.createObjectURL(file);
  }
};

/* ================= LOGIN ================= */

document.getElementById("loginSubmit").onclick = async () => {
  try {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    await signInWithEmailAndPassword(auth, email, password);

    alert("Connexion réussie !");
    window.location.href = "index.html";

  } catch (error) {
    alert("Erreur : " + error.message);
  }
};

/* ================= SIGNUP ARTISTE AVEC PHOTO ================= */

document.getElementById("signupSubmit").onclick = async () => {
  try {

    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    const file = document.getElementById("profileImageInput").files[0];

    /* CREATE USER */
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
      email: email,
      role: "artist",
      createdAt: new Date()
    });

    /* ARTIST PROFILE */
    await setDoc(doc(db, "artists", user.uid), {
      userId: user.uid,
      username: "New Artist",
      email: email,
      city: "",
      description: "",
      skills: [],
      profileImage: imageUrl,
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

  } catch (error) {
    alert("Erreur : " + error.message);
  }
};

/* ================= HERO BUTTON ================= */

document.getElementById("clientBtn").onclick = () => {
  document.getElementById("artistsContainer").scrollIntoView({
    behavior: "smooth"
  });
};

/* ================= AFFICHAGE ARTISTES ================= */

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

/* INIT */
displayArtists();
