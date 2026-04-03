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
  const locInput = document.getElementById("artistArr");
  const files = document.getElementById("artistMedia").files;

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

    /* ========= UPLOAD MULTI MEDIA ========= */

    let mediaUrls = [];

    for (let file of files) {

      const storageRef = ref(storage, `artists/${uid}/${Date.now()}_${file.name}`);

      await uploadBytes(storageRef, file);

      const url = await getDownloadURL(storageRef);

      mediaUrls.push(url);
    }

    /* ========= FIRESTORE ========= */

    await setDoc(doc(db, "artists", uid), {
      nom, prenom, email,
      produits,
      media: mediaUrls,
      arrondissement: localisation,
      lat, lng,
      createdAt: Date.now()
    });

    /* ========= MARKER ========= */

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

/* ================= AUTOCOMPLETE ================= */

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

/* ================= GEOLOC ================= */

function initGeoloc(){
  const btn = document.getElementById("geoBtn");

  if(!btn) return;

  btn.addEventListener("click", () => {

    navigator.geolocation.getCurrentPosition(async (pos) => {

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      const res = await fetch(`https://api-adresse.data.gouv.fr/reverse/?lat=${lat}&lon=${lng}`);
      const data = await res.json();

      if(data.features.length){
        const input = document.getElementById("artistArr");
        input.value = data.features[0].properties.label;
        input.dataset.lat = lat;
        input.dataset.lng = lng;
      }

    });
  });
}

/* ================= PREVIEW ================= */

function initPreview(){

  const input = document.getElementById("artistMedia");
  const preview = document.getElementById("mediaPreview");

  if(!input || !preview) return;

  input.addEventListener("change", () => {

    preview.innerHTML = "";

    Array.from(input.files).forEach(file => {

      const url = URL.createObjectURL(file);

      if(file.type.startsWith("audio")){
        preview.innerHTML += `<audio controls src="${url}"></audio>`;
      }

      if(file.type.startsWith("video")){
        preview.innerHTML += `<video controls width="120" src="${url}"></video>`;
      }
    });
  });
}

/* ================= DOM READY ================= */

document.addEventListener("DOMContentLoaded", () => {

  document.getElementById("signupSubmit")?.addEventListener("click", signup);
  document.getElementById("loginSubmit")?.addEventListener("click", login);
  document.getElementById("createArtistBtn")?.addEventListener("click", createArtistAccount);

  initAutocomplete();
  initGeoloc();
  initPreview();

});
