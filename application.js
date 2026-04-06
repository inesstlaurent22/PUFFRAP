/* ================= IMPORTS ================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  setDoc,
  doc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

/* ================= FIREBASE ================= */

const firebaseConfig = {
  apiKey: "AIzaSyAHb_jyRobERs677A4ZlGTzOVRCLZaaF3s",
  authDomain: "puffrap.firebaseapp.com",
  projectId: "puffrap",
  storageBucket: "puffrap.appspot.com",
  messagingSenderId: "555120601762",
  appId: "1:555120601762:web:796a6681b5841c7bdb85fb"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

/* ================= GLOBAL ================= */

let map = null;
let markerCluster = null;

/* ================= HELPERS ================= */

const $ = (id) => document.getElementById(id);

/* ================= SIGNUP CLIENT ================= */

window.signup = async () => {

  const username = $("username")?.value.trim();
  const nom = $("nom")?.value.trim();
  const prenom = $("prenom")?.value.trim();
  const email = $("email")?.value.trim();
  const password = $("password")?.value.trim();

  if(!username || !nom || !prenom || !email || !password){
    alert("Remplis tous les champs");
    return;
  }

  try{
    const user = await createUserWithEmailAndPassword(auth, email, password);
    const uid = user.user.uid;

    await setDoc(doc(db, "users", uid), {
      username,
      nom,
      prenom,
      email,
      role: "client",
      createdAt: Date.now()
    });

    closePopup();
    alert("Bienvenue " + prenom);

  } catch(e){
    console.error("Signup error:", e);
    alert(e.message);
  }
};

/* ================= SIGNUP ARTIST ================= */

window.createArtistAccount = async () => {

  const nom = $("artistNom")?.value.trim();
  const prenom = $("artistPrenom")?.value.trim();
  const email = $("artistEmail")?.value.trim();
  const password = $("artistPassword")?.value.trim();
  const produits = $("artistProduits")?.value;
  const files = $("artistMedia")?.files;
  const locInput = $("artistArr");

  if(!nom || !prenom || !email || !password){
    alert("Champs obligatoires manquants");
    return;
  }

  const lat = parseFloat(locInput?.dataset.lat);
  const lng = parseFloat(locInput?.dataset.lng);
  const localisation = locInput?.value;

  if(!locInput || isNaN(lat) || isNaN(lng)){
    alert("Choisis une localisation valide");
    return;
  }

  try{

    const user = await createUserWithEmailAndPassword(auth, email, password);
    const uid = user.user.uid;

    /* ===== UPLOAD MEDIA OPTIMISÉ (PARALLÈLE) ===== */
    let mediaUrls = [];

    if(files && files.length){
      const uploadPromises = Array.from(files).map(async (file) => {
        const storageRef = ref(storage, `artists/${uid}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
      });

      mediaUrls = await Promise.all(uploadPromises);
    }

    /* ===== FIRESTORE ===== */
    await setDoc(doc(db, "artists", uid), {
      nom,
      prenom,
      email,
      produits,
      media: mediaUrls,
      photo: mediaUrls[0] || "",
      arrondissement: localisation,
      lat,
      lng,
      createdAt: Date.now()
    });

    /* ===== MARKER ===== */
    if(map && markerCluster){

      const marker = L.marker([lat, lng]);

      marker.bindPopup(generateArtistCard({
        nom,
        prenom,
        produits,
        photo: mediaUrls[0] || "",
        media: mediaUrls
      }, uid));

      markerCluster.addLayer(marker);
      map.setView([lat, lng], 14);
    }

    alert("Profil artiste créé !");
    closePopup();

  } catch(e){
    console.error("Artist signup error:", e);
    alert(e.message);
  }
};

/* ================= LOGIN ================= */

window.login = async () => {

  const email = $("loginEmail")?.value.trim();
  const password = $("loginPassword")?.value.trim();

  if(!email || !password){
    alert("Champs requis");
    return;
  }

  try{
    await signInWithEmailAndPassword(auth, email, password);
    closePopup();
  } catch(e){
    console.error("Login error:", e);
    alert(e.message);
  }
};

/* ================= LOAD ARTISTS ================= */

async function loadArtists(){

  if(!markerCluster) return;

  try{

    const artistsRef = collection(db, "artists");

    onSnapshot(artistsRef, (snap) => {

      markerCluster.clearLayers();

      snap.forEach(docSnap => {

        const d = docSnap.data();

        if(!d || d.lat == null || d.lng == null) return;

        const lat = Number(d.lat);
        const lng = Number(d.lng);

        if(isNaN(lat) || isNaN(lng)) return;

        const marker = L.marker([lat, lng]);

        marker.bindPopup(generateArtistCard(d, docSnap.id));

        marker.on("popupopen", () => {
          if(typeof loadComments === "function"){
            loadComments(docSnap.id);
          }
        });

        markerCluster.addLayer(marker);

      });

    });

  } catch(e){
    console.error("Erreur loadArtists :", e);
  }
}

/* ================= CARD ================= */

function generateArtistCard(d = {}, id){

  const photo = d.photo || "https://via.placeholder.com/150";
  const rating = Number(d.rating) || 4.8;

  const starsHTML =
    "★".repeat(Math.floor(rating)) +
    "☆".repeat(5 - Math.floor(rating));

  const dispo = Array.isArray(d.disponibilites)
    ? d.disponibilites.slice(0,3)
    : ["12/02", "13/02", "14/02"];

  const services = Array.isArray(d.services) ? d.services : [];

  const servicesHTML = services.length
    ? services.map(service => `
        <div class="service-card">
          ${service?.name || "Service"}<br>
          <strong>${service?.price || 0} €</strong>
        </div>
      `).join("")
    : `<div class="service-card">Aucun service</div>`;

  return `
  <div class="artist-popup-scroll">
    <div class="artist-popup">

      <div class="artist-header">
        <img src="${photo}" class="artist-avatar">
        <div class="artist-badge">${d.produits || "DJ"}</div>

        <div class="artist-rating">
          <span class="stars">${starsHTML}</span>
          <span class="rating">${rating.toFixed(1)}</span>
        </div>

        <h2>${d.prenom || ""} ${d.nom || ""}</h2>
      </div>

      <div class="artist-dispo-box">
        <p>Prochaine disponibilité</p>
        <div class="dates">
          ${dispo.map(date => `<span>${date}</span>`).join("")}
        </div>
      </div>

      <button class="calendar-btn" onclick="openArtistPage('${id}')">
        Voir le calendrier
      </button>

      <div class="artist-services-scroll">
        ${servicesHTML}
      </div>

      <div class="artist-comments" id="comments-${id}">
        Chargement...
      </div>

    </div>
  </div>
  `;
}

/* ================= DOM CONTENT ================= */

document.addEventListener("DOMContentLoaded", () => {

  /* ===== HELPERS ===== */
  const $ = (id) => document.getElementById(id);

  $("signupSubmit")?.addEventListener("click", signup);
  $("loginSubmit")?.addEventListener("click", login);
  $("createArtistBtn")?.addEventListener("click", createArtistAccount);

  const signupBtn = $("signupBtn");
  const loginBtn = $("loginBtn");
  const dropdown = $("dropdown");
  const loginPopup = $("loginPopup");

  /* ===== SIGNUP DROPDOWN ===== */
  signupBtn?.addEventListener("click", e=>{
    e.stopPropagation();
    dropdown?.classList.toggle("hidden");
  });

  /* ===== LOGIN POPUP ===== */
  loginBtn?.addEventListener("click", e=>{
    e.stopPropagation();

    // ✅ ferme tout avant (évite bugs multiples popups)
    closePopup();

    loginPopup?.classList.remove("hidden");
    loginPopup?.classList.add("active");
  });

  /* ================= MAP ================= */

  const mapEl = $("map");

  if(mapEl){

    map = L.map(mapEl);

    // ✅ géolocalisation prioritaire
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        map.setView([pos.coords.latitude, pos.coords.longitude], 10);
      },
      () => {
        map.setView([48.85, 2.35], 6);
      }
    );

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png')
      .addTo(map);

    markerCluster = L.markerClusterGroup();
    map.addLayer(markerCluster);

    loadArtists();
  }

  /* ================= AUTOCOMPLETE ================= */
  initAutocomplete();

  /* ===== STOP PROPAGATION POPUP ===== */
  document.querySelectorAll(".popup-content").forEach(el => {
    el.addEventListener("click", e => e.stopPropagation());
  });

  /* ================= PROFILE DROPDOWN (FIX BUG) ================= */

  const profile = $("profile");
  const profileDropdown = $("profileDropdown");

  if(profile && profileDropdown){
    profile.addEventListener("click", (e)=>{
      e.stopPropagation();
      profileDropdown.classList.toggle("hidden");
    });
  }

});

/* ================= POPUP ================= */

window.closePopup = () => {
  document.querySelectorAll(".popup").forEach(p=>{
    p.classList.remove("active");
    p.classList.add("hidden");
  });
};

/* ================= SELECT USER ================= */

window.selectUser = (type) => {

  const popup = document.getElementById("popup");
  const artistPopup = document.getElementById("artistPopup");
  const dropdown = document.getElementById("dropdown");

  dropdown?.classList.add("hidden");

  // ✅ ferme tout avant
  closePopup();

  if(type === "client" && popup){
    popup.classList.remove("hidden");
    popup.classList.add("active");
  }

  if(type === "artist" && artistPopup){
    artistPopup.classList.remove("hidden");
    artistPopup.classList.add("active");
  }
};

/* ================= NAVIGATION ARTIST ================= */

window.openArtistPage = (id) => {

  if(!id){
    console.error("ID artiste manquant");
    return;
  }

  window.location.href = `artiste.html?id=${id}`;
};

/* ================= GLOBAL CLICK ================= */

window.addEventListener("click", (e) => {

  const dropdown = document.getElementById("dropdown");
  const profileDropdown = document.getElementById("profileDropdown");

  if(!e.target.closest(".topbar")){
    dropdown?.classList.add("hidden");
    profileDropdown?.classList.add("hidden");
  }

  if(e.target.classList.contains("popup-overlay")){
    closePopup();
  }
});

/* ================= NAVIGATION ================= */

window.openAccount = function () {
  window.location.href = "monprofil.html";
};

window.openReservations = function () {
  window.location.href = "reservations.html";
};

window.openFavoris = function () {
  window.location.href = "favoris.html";
};

window.logout = async function () {
  try{
    await signOut(auth);
    window.location.href = "index.html";
  } catch(e){
    console.error("Logout error:", e);
  }
};

/* ================= AUTH STATE ================= */

const profile = document.getElementById("profile");
const profileDropdown = document.getElementById("profileDropdown");

onAuthStateChanged(auth, async (user) => {

  const signupBtn = document.getElementById("signupBtn");
  const loginBtn = document.getElementById("loginBtn");
  const profileName = document.getElementById("profileName");

  if(user){

    let prenom = "Utilisateur";

    try {

      const userRef = doc(db, "users", user.uid);
      const artistRef = doc(db, "artists", user.uid);

      const [userDoc, artistDoc] = await Promise.all([
        getDoc(userRef),
        getDoc(artistRef)
      ]);

      if(userDoc.exists()) prenom = userDoc.data().prenom;
      if(artistDoc.exists()) prenom = artistDoc.data().prenom;

    } catch(e){
      console.error("Erreur récupération profil :", e);
    }

    signupBtn?.classList.add("hidden");
    loginBtn?.classList.add("hidden");
    profile?.classList.remove("hidden");

    if(profileName) profileName.textContent = prenom;

  } else {

    signupBtn?.classList.remove("hidden");
    loginBtn?.classList.remove("hidden");
    profile?.classList.add("hidden");

  }
});

/* ================= DROPDOWN ================= */

if(profile && profileDropdown){
  profile.addEventListener("click", (e)=>{
    e.stopPropagation();
    profileDropdown.classList.toggle("hidden");
  });
}
