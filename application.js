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
  getDocs
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

let map;
let markerCluster;

/* ================= SIGNUP CLIENT ================= */
window.signup = async () => {

  const usernameEl = document.getElementById("username");
  const nomEl = document.getElementById("nom");
  const prenomEl = document.getElementById("prenom");
  const emailEl = document.getElementById("email");
  const passwordEl = document.getElementById("password");

  if(!usernameEl || !nomEl || !prenomEl || !emailEl || !passwordEl){
    alert("Erreur formulaire");
    return;
  }

  const username = usernameEl.value.trim();
  const nom = nomEl.value.trim();
  const prenom = prenomEl.value.trim();
  const email = emailEl.value.trim();
  const password = passwordEl.value.trim();

  if(!username || !nom || !prenom || !email || !password){
    alert("Remplis tous les champs");
    return;
  }

  // 🔐 sécurité basique
  if(password.length < 6){
    alert("Mot de passe trop court (min 6 caractères)");
    return;
  }

  if(!email.includes("@")){
    alert("Email invalide");
    return;
  }

  try{

    // 🔒 désactive bouton pour éviter double clic
    const btn = document.getElementById("signupSubmit");
    if(btn) btn.disabled = true;

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

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

    console.error(e);

    if(e.code === "auth/email-already-in-use"){
      alert("Email déjà utilisé");
    } else if(e.code === "auth/invalid-email"){
      alert("Email invalide");
    } else if(e.code === "auth/weak-password"){
      alert("Mot de passe trop faible");
    } else {
      alert("Erreur : " + e.message);
    }

  } finally {
    const btn = document.getElementById("signupSubmit");
    if(btn) btn.disabled = false;
  }
};

/* ================= SIGNUP ARTIST ================= */

window.createArtistAccount = async () => {

  const nom = document.getElementById("artistNom")?.value.trim();
  const prenom = document.getElementById("artistPrenom")?.value.trim();
  const email = document.getElementById("artistEmail")?.value.trim();
  const password = document.getElementById("artistPassword")?.value.trim();
  const produits = document.getElementById("artistProduits")?.value.trim();
  const media = document.getElementById("artistMedia")?.value.trim();
  const locInput = document.getElementById("artistArr");

  if(!nom || !prenom || !email || !password){
    alert("Champs obligatoires manquants");
    return;
  }

  const lat = parseFloat(locInput?.dataset.lat);
  const lng = parseFloat(locInput?.dataset.lng);
  const localisation = locInput?.value;

  if(!lat || !lng){
    alert("Choisis une localisation valide dans la liste");
    return;
  }

  try{

    const user = await createUserWithEmailAndPassword(auth, email, password);
    const uid = user.user.uid;

    await setDoc(doc(db, "artists", uid), {
      nom, prenom, email,
      produits,
      media,
      arrondissement: localisation,
      lat, lng,
      createdAt: Date.now()
    });

    /* MARKER DIRECT */

    if(map && markerCluster){

      const marker = L.marker([lat, lng]);

      marker.bindPopup(`
        <div class="card-premium">
          <h2>${prenom} ${nom}</h2>
          <p>${localisation}</p>
          <p>${produits || ""}</p>
        </div>
      `);

      markerCluster.addLayer(marker);
      map.setView([lat, lng], 14);
    }

    alert("Profil artiste créé !");
    closePopup();

  } catch(e){
    alert(e.message);
  }
};

/* ================= LOGIN ================= */

window.login = async () => {

  const email = document.getElementById("loginEmail")?.value.trim();
  const password = document.getElementById("loginPassword")?.value.trim();

  try{
    await signInWithEmailAndPassword(auth, email, password);
    closePopup();
  } catch(e){
    alert(e.message);
  }
};

/* ================= LOGOUT ================= */

window.logout = () => signOut(auth);

/* ================= AUTH STATE ================= */

onAuthStateChanged(auth, async (user) => {

  const signupBtn = document.getElementById("signupBtn");
  const loginBtn = document.getElementById("loginBtn");
  const profile = document.getElementById("profile");
  const profileName = document.getElementById("profileName");

  if(user){

    let prenom = "Utilisateur";

    const userDoc = await getDoc(doc(db, "users", user.uid));
    const artistDoc = await getDoc(doc(db, "artists", user.uid));

    if(userDoc.exists()) prenom = userDoc.data().prenom;
    if(artistDoc.exists()) prenom = artistDoc.data().prenom;

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

/* ================= LOAD ARTISTS ================= */

async function loadArtists(){

  if(!markerCluster) return;

  markerCluster.clearLayers();

  const snap = await getDocs(collection(db, "artists"));

  snap.forEach(docSnap => {

    const d = docSnap.data();

    if(!d.lat || !d.lng) return;

    const marker = L.marker([d.lat, d.lng]);

    marker.bindPopup(`
      <div class="card-premium">
        <h2>${d.prenom} ${d.nom}</h2>
        <p>${d.arrondissement || ""}</p>
        <p>${d.produits || ""}</p>
      </div>
    `);

    markerCluster.addLayer(marker);

  });
}

/* ================= AUTOCOMPLETE FRANCE ================= */

function initAutocomplete(){

  const input = document.getElementById("artistArr");
  const box = document.getElementById("arrSuggestions");

  let debounce;

  input.addEventListener("input", () => {

    clearTimeout(debounce);

    const query = input.value.trim();

    if(query.length < 2){
      box.classList.add("hidden");
      return;
    }

    debounce = setTimeout(async () => {

      const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`);
      const data = await res.json();

      box.innerHTML = "";

      if(!data.features.length){
        box.classList.add("hidden");
        return;
      }

      data.features.forEach(f => {

        const label = f.properties.label;
        const lat = f.geometry.coordinates[1];
        const lng = f.geometry.coordinates[0];

        const btn = document.createElement("button");
        btn.textContent = label;

        btn.onclick = () => {
          input.value = label;
          input.dataset.lat = lat;
          input.dataset.lng = lng;
          box.classList.add("hidden");
        };

        box.appendChild(btn);
      });

      box.classList.remove("hidden");

    }, 300);
  });
}

document.getElementById("geoBtn")?.addEventListener("click", () => {

  if(!navigator.geolocation){
    alert("Géolocalisation non supportée");
    return;
  }

  navigator.geolocation.getCurrentPosition(async (pos) => {

    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    // reverse geocoding
    const res = await fetch(`https://api-adresse.data.gouv.fr/reverse/?lat=${lat}&lon=${lng}`);
    const data = await res.json();

    if(data.features.length){

      const label = data.features[0].properties.label;

      const input = document.getElementById("artistArr");

      input.value = label;
      input.dataset.lat = lat;
      input.dataset.lng = lng;
    }

  }, () => {
    alert("Localisation refusée");
  });
});

/* ================= DOM READY ================= */

document.addEventListener("DOMContentLoaded", () => {

  document.getElementById("signupSubmit")?.addEventListener("click", signup);
  document.getElementById("loginSubmit")?.addEventListener("click", login);
  document.getElementById("createArtistBtn")?.addEventListener("click", createArtistAccount);

  const signupBtn = document.getElementById("signupBtn");
  const loginBtn = document.getElementById("loginBtn");
  const dropdown = document.getElementById("dropdown");
  const loginPopup = document.getElementById("loginPopup");

  signupBtn?.addEventListener("click", e=>{
    e.stopPropagation();
    dropdown?.classList.toggle("hidden");
  });

  loginBtn?.addEventListener("click", e=>{
    e.stopPropagation();
    loginPopup?.classList.remove("hidden");
    loginPopup?.classList.add("active");
  });

  /* MAP */

  const mapEl = document.getElementById("map");

  if(mapEl){
    map = L.map(mapEl).setView([48.85, 2.35], 6);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

    markerCluster = L.markerClusterGroup();
    map.addLayer(markerCluster);

    loadArtists();
  }

  initAutocomplete();

  document.querySelectorAll(".popup-content").forEach(el => {
    el.addEventListener("click", e => e.stopPropagation());
  });

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

  if(type === "client"){
    popup.classList.remove("hidden");
    popup.classList.add("active");
  }

  if(type === "artist"){
    artistPopup.classList.remove("hidden");
    artistPopup.classList.add("active");
  }
};

/* ================= GLOBAL CLICK ================= */

window.addEventListener("click", (e) => {

  const dropdown = document.getElementById("dropdown");

  if(!e.target.closest(".topbar")){
    dropdown?.classList.add("hidden");
  }

  if(e.target.classList.contains("popup-overlay")){
    closePopup();
  }
});
