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

  const username = document.getElementById("username")?.value.trim();
  const nom = document.getElementById("nom")?.value.trim();
  const prenom = document.getElementById("prenom")?.value.trim();
  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value.trim();

  if(!username || !nom || !prenom || !email || !password){
    alert("Remplis tous les champs");
    return;
  }

  try{
    const user = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(doc(db, "users", user.user.uid), {
      username, nom, prenom, email,
      role: "client",
      createdAt: Date.now()
    });

    closePopup();
    alert("Bienvenue " + prenom);

  } catch(e){
    alert(e.message);
  }
};

/* ================= SIGNUP ARTIST ================= */

window.createArtistAccount = async () => {

  const nom = document.getElementById("artistNom")?.value.trim();
  const prenom = document.getElementById("artistPrenom")?.value.trim();
  const email = document.getElementById("artistEmail")?.value.trim();
  const password = document.getElementById("artistPassword")?.value.trim();
  const produits = document.getElementById("artistProduits")?.value;
  const files = document.getElementById("artistMedia")?.files;
  const locInput = document.getElementById("artistArr");

  if(!nom || !prenom || !email || !password){
    alert("Champs obligatoires manquants");
    return;
  }

  const lat = parseFloat(locInput?.dataset.lat);
  const lng = parseFloat(locInput?.dataset.lng);
  const localisation = locInput?.value;

  if(isNaN(lat) || isNaN(lng)){
    alert("Choisis une localisation valide");
    return;
  }

  try{

    const user = await createUserWithEmailAndPassword(auth, email, password);
    const uid = user.user.uid;

    /* ===== UPLOAD MEDIA ===== */
    let mediaUrls = [];

    if(files && files.length){
      for (let file of files) {
        const storageRef = ref(storage, `artists/${uid}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        mediaUrls.push(url);
      }
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

    /* ✅ MARKER AU BON ENDROIT */
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
    console.error(e);
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

const profile = document.getElementById("profile");
const profileDropdown = document.getElementById("profileDropdown");

if(profile && profileDropdown){
  profile.addEventListener("click", (e)=>{
    e.stopPropagation();
    profileDropdown.classList.toggle("hidden");
  });
}

/* ================= LOAD ARTISTS ================= */

async function loadArtists(){

  if(!markerCluster) return;

  try{

    markerCluster.clearLayers();

    const snap = await getDocs(collection(db, "artists"));

    snap.forEach(docSnap => {

      const d = docSnap.data();

      /* 🔒 sécurités */
      if(!d || d.lat == null || d.lng == null) return;

      const lat = Number(d.lat);
      const lng = Number(d.lng);

      if(isNaN(lat) || isNaN(lng)) return;

      const marker = L.marker([lat, lng]);

      /* ✅ NOUVEAU POPUP DESIGN */
      marker.bindPopup(generateArtistCard(d, docSnap.id));

      /* 🔥 charger commentaires au clic */
      marker.on("click", () => {
        setTimeout(() => loadComments(docSnap.id), 200);
      });

      markerCluster.addLayer(marker);

    });

  } catch(e){
    console.error("Erreur loadArtists :", e);
  }
}

function generateArtistCard(d, id){

  const photo = d.photo || "https://via.placeholder.com/120";
  const rating = d.rating || 0;

  const stars = "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating));

  /* ✅ FIX */
  const dispo = Array.isArray(d.disponibilites)
    ? d.disponibilites.slice(0,3)
    : [];

  return `
<div class="artist-popup-wrapper">

  <div class="artist-card dark">

    <img src="${photo}" class="artist-photo">

    <div class="artist-badge">${d.produits || "Artiste"}</div>

    <div class="artist-rating">
      ${stars} ${rating.toFixed(1)}
    </div>

    <h2>${d.prenom} ${d.nom}</h2>

    <div class="artist-dispo">
      <p>Prochaine disponibilité</p>
      <div class="dates">
        ${dispo.map(d => `<span>${d}</span>`).join("")}
      </div>
    </div>

    <button onclick="openArtistPage('${id}')">
      Voir le calendrier
    </button>

    <div class="artist-media">
      ${(d.media || []).map(url => {

        if(url.includes(".mp3")){
          return `<audio controls src="${url}"></audio>`;
        }

        if(url.includes(".mp4") || url.includes(".mov")){
          return `<video src="${url}" controls></video>`;
        }

        return "";

      }).join("")}
    </div>

    <div class="artist-comments" id="comments-${id}">
      Chargement...
    </div>

  </div>

</div>
`;
}

async function loadComments(artistId){

  const container = document.getElementById(`comments-${artistId}`);
  if(!container) return;

  const snap = await getDocs(collection(db, "artists", artistId, "comments"));

  container.innerHTML = "";

  snap.forEach(doc => {

    const c = doc.data();

    container.innerHTML += `
      <div>
        <strong>${c.nom}</strong>
        <p>${c.text}</p>
      </div>
    `;
  });

}

/* ================= AUTOCOMPLETE FRANCE ================= */

function initAutocomplete(){

  const input = document.getElementById("artistArr");
  const box = document.getElementById("arrSuggestions");

  if(!input || !box) return;

  let debounce;

  input.addEventListener("input", () => {

    clearTimeout(debounce);

    const query = input.value.trim();

    if(query.length < 2){
      box.classList.add("hidden");
      box.innerHTML = "";
      return;
    }

    debounce = setTimeout(async () => {

      try{

        const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`);
        const data = await res.json();

        box.innerHTML = "";

        /* ✅ FIX ICI */
        if(!data.features || !data.features.length){
          box.classList.add("hidden");
          return;
        }

        data.features.forEach(f => {

          const btn = document.createElement("button");
          btn.textContent = f.properties.label;

          btn.onclick = () => {
            input.value = f.properties.label;
            input.dataset.lat = f.geometry.coordinates[1];
            input.dataset.lng = f.geometry.coordinates[0];
            box.classList.add("hidden");
          };

          box.appendChild(btn);
        });

        box.classList.remove("hidden");

      } catch(e){
        console.error("Erreur autocomplete", e);
      }

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

    try{
      const res = await fetch(`https://api-adresse.data.gouv.fr/reverse/?lat=${lat}&lon=${lng}`);
      const data = await res.json();

      if(data.features && data.features.length){

        const input = document.getElementById("artistArr");

        input.value = data.features[0].properties.label;
        input.dataset.lat = lat;
        input.dataset.lng = lng;
      }

    } catch(e){
      console.error("Erreur géoloc", e);
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

const profile = document.getElementById("profile");
const profileDropdown = document.getElementById("profileDropdown");

if(profile && profileDropdown){
  profile.addEventListener("click", (e)=>{
    e.stopPropagation();
    profileDropdown.classList.toggle("hidden");
  });
}

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

  if(type === "client" && popup){
    popup.classList.remove("hidden");
    popup.classList.add("active");
  }

  if(type === "artist" && artistPopup){
    artistPopup.classList.remove("hidden");
    artistPopup.classList.add("active");
  }
};

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

/* ================= NAVIGATION ARTISTE ================= */

window.openArtistPage = (id) => {

  if(!id){
    console.error("ID artiste manquant");
    return;
  }

  window.location.href = `artiste.html?id=${id}`;
};
