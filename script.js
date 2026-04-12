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

/* ================= CONFIG ================= */

const firebaseConfig = {
  apiKey: "AIzaSyA4IF_NqUVXXQxMWz3F1SM32NN5vLUpRoI",
  authDomain: "puffrap-46658.firebaseapp.com",
  projectId: "puffrap-46658",
  storageBucket: "puffrap-46658.firebasestorage.app",
  messagingSenderId: "217849878785",
  appId: "1:217849878785:web:e4e7d90ae3b77a19e76300"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

/* ================= MODALS ================= */

document.getElementById("loginBtn").onclick = () => {
  document.getElementById("loginModal").style.display = "flex";
};

document.getElementById("signupClient").onclick = () => {
  document.getElementById("signupClientModal").style.display = "flex";
};

document.getElementById("signupArtist").onclick = () => {
  document.getElementById("signupArtistModal").style.display = "flex";
};

window.onclick = (e) => {
  if (e.target.classList.contains("modal")) {
    e.target.style.display = "none";
  }
};

/* ================= PREVIEW IMAGE ================= */

const imageInput = document.getElementById("artistImage");

if (imageInput) {
  imageInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      document.getElementById("previewImage").src = URL.createObjectURL(file);
    }
  };
}

/* ================= LOGIN ================= */

document.getElementById("loginSubmit").onclick = async () => {
  try {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    await signInWithEmailAndPassword(auth, email, password);

    alert("Connexion réussie 🔥");
    location.reload();

  } catch (error) {
    alert(error.message);
  }
};

/* ================= SIGNUP CLIENT ================= */

document.getElementById("createClient").onclick = async () => {
  try {

    const email = document.getElementById("clientEmail").value;
    const password = document.getElementById("clientPassword").value;
    const name = document.getElementById("clientUsername").value;

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "Users", user.uid), {
      Mail: email,
      Name: name,
      Role: "client",
      CreatedAt: new Date()
    });

    alert("Client créé ✅");
    location.reload();

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

    const username = document.getElementById("artistName").value;
    const city = document.getElementById("artistCity").value;
    const skillsInput = document.getElementById("artistSkills").value;

    const portfolio = document.getElementById("artistPortfolio").value;
    const instagram = document.getElementById("artistInstagram").value;
    const tiktok = document.getElementById("artistTiktok").value;

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    let imageUrl = "";

    if (file) {
      const storageRef = ref(storage, `artists/${user.uid}/profile.jpg`);
      await uploadBytes(storageRef, file);
      imageUrl = await getDownloadURL(storageRef);
    }

    const skills = skillsInput.split(",").map(s => s.trim());

    const location = {
      lat: 48.8566,
      lng: 2.3522
    };

    await setDoc(doc(db, "artists", user.uid), {
      userId: user.uid,
      username: username,
      email: email,
      city: city,
      description: "",
      skills: skills,
      profileImage: imageUrl,
      rating: 0,
      reviewCount: 0,
      isAvailable: true,
      location: location,
      socials: {
        instagram: instagram,
        portfolio: portfolio,
        tiktok: tiktok
      },
      createdAt: new Date()
    });

    alert("Artiste créé 🔥");
    location.reload();

  } catch (error) {
    alert(error.message);
  }
};

/* ================= MAP ================= */

let map;
let markers = [];

function initMap() {

  map = L.map('map').setView([48.8566, 2.3522], 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      map.setView([lat, lng], 13);

      L.marker([lat, lng])
        .addTo(map)
        .bindPopup("📍 Vous êtes ici");

    });
  }

  loadArtists();
}

/* ================= LOAD ALL ARTISTS ================= */

async function loadArtists() {

  const snapshot = await getDocs(collection(db, "artists"));

  snapshot.forEach(docSnap => {

    const artist = docSnap.data();

    if (!artist.location) return;

    const marker = L.marker([
      artist.location.lat,
      artist.location.lng
    ]).addTo(map);

    marker.bindPopup(`
      <div style="text-align:center;">
        <img src="${artist.profileImage || 'https://via.placeholder.com/100'}"
        style="width:80px;height:80px;border-radius:50%;object-fit:cover;" />

        <h3>${artist.username}</h3>
        <p>${artist.city}</p>
      </div>
    `);

    markers.push(marker);

  });
}

/* ================= GEO CODE ================= */

async function getCoordsFromPostalCode(cp) {

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?postalcode=${cp}&country=France&format=json`
  );

  const data = await response.json();

  if (data.length === 0) return null;

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon)
  };
}

/* ================= DISTANCE ================= */

function getDistance(lat1, lon1, lat2, lon2) {

  const R = 6371;

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ================= FILTER ================= */

async function filterArtists(userLat, userLng) {

  const snapshot = await getDocs(collection(db, "artists"));

  let artists = [];

  snapshot.forEach(docSnap => {

    const artist = docSnap.data();

    if (!artist.location) return;

    const distance = getDistance(
      userLat,
      userLng,
      artist.location.lat,
      artist.location.lng
    );

    artists.push({
      id: docSnap.id,
      ...artist,
      distance
    });

  });

  artists.sort((a, b) => a.distance - b.distance);

  return artists;
}

/* ================= DISPLAY ================= */

function clearMarkers() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];
}

function displayArtists(artists) {

  clearMarkers();

  artists.forEach(artist => {

    const marker = L.marker([
      artist.location.lat,
      artist.location.lng
    ]).addTo(map);

    marker.bindPopup(`
      <div style="text-align:center;">
        <img src="${artist.profileImage || 'https://via.placeholder.com/100'}"
        style="width:80px;height:80px;border-radius:50%;object-fit:cover;" />

        <h3>${artist.username}</h3>
        <p>${artist.city}</p>
        <p>📍 ${artist.distance.toFixed(1)} km</p>

        <button onclick="window.location.href='profil.html?id=${artist.id}'"
        style="margin-top:10px;padding:8px 12px;background:#D4AF37;border:none;border-radius:8px;">
        Voir profil
        </button>
      </div>
    `);

    markers.push(marker);

  });
}

/* ================= SEARCH ================= */

document.getElementById("searchBtn").onclick = async () => {

  const cp = document.getElementById("searchInput").value;

  if (!cp) return alert("Entre un code postal");

  const coords = await getCoordsFromPostalCode(cp);

  if (!coords) return alert("Code postal invalide");

  map.setView([coords.lat, coords.lng], 13);

  const artists = await filterArtists(coords.lat, coords.lng);

  displayArtists(artists);
};

/* ================= INIT ================= */

initMap();
