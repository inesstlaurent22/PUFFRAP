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

/* ================= GLOBAL MAP ================= */

let map;
let markerCluster;

/* ================= SIGNUP CLIENT ================= */

window.signup = async function(){

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
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(doc(db, "users", userCredential.user.uid), {
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
    alert(e.message);
  }
};

/* ================= SIGNUP ARTIST ================= */

window.createArtistAccount = async function(){

  const nom = document.getElementById("artistNom")?.value.trim();
  const prenom = document.getElementById("artistPrenom")?.value.trim();
  const email = document.getElementById("artistEmail")?.value.trim();
  const password = document.getElementById("artistPassword")?.value.trim();
  const ville = document.getElementById("artistVille")?.value.trim();
  const produits = document.getElementById("artistProduits")?.value.trim();
  const media = document.getElementById("artistMedia")?.value.trim();

  if(!nom || !prenom || !email || !password){
    alert("Champs obligatoires manquants");
    return;
  }

  try{

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    navigator.geolocation.getCurrentPosition(async (pos) => {

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      await setDoc(doc(db, "artists", uid), {
        nom,
        prenom,
        email,
        ville,
        produits,
        media,
        lat,
        lng,
        createdAt: Date.now()
      });

      alert("Profil artiste créé !");
      closePopup();
      loadArtists();

    });

  } catch(e){
    alert(e.message);
  }
};

/* ================= LOGIN ================= */

window.login = async function(){

  const email = document.getElementById("loginEmail")?.value.trim();
  const password = document.getElementById("loginPassword")?.value.trim();

  try{
    await signInWithEmailAndPassword(auth, email, password);
    closePopup();
  } catch(e){
    alert(e.message);
  }
};

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

    if(userDoc.exists()){
      prenom = userDoc.data().prenom;
    }

    if(artistDoc.exists()){
      prenom = artistDoc.data().prenom;
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

/* ================= LOAD ARTISTS ================= */

async function loadArtists(){

  if(!markerCluster) return;

  markerCluster.clearLayers();

  const snap = await getDocs(collection(db, "artists"));

  snap.forEach(docSnap => {

    const data = docSnap.data();

    const marker = L.marker([data.lat, data.lng]);

    marker.bindPopup(`
      <div class="card-premium">
        <h2>${data.prenom} ${data.nom}</h2>
        <p>${data.ville || ""}</p>
        <p>${data.produits || ""}</p>

        ${
          data.media?.includes("mp4")
          ? `<video src="${data.media}" controls width="100%"></video>`
          : data.media?.includes("mp3")
          ? `<audio src="${data.media}" controls></audio>`
          : `<img src="${data.media}" width="100%">`
        }
      </div>
    `);

    markerCluster.addLayer(marker);

  });

}

/* ================= DOM READY ================= */

document.addEventListener("DOMContentLoaded", () => {

  const signupBtn = document.getElementById("signupBtn");
  const loginBtn = document.getElementById("loginBtn");
  const dropdown = document.getElementById("dropdown");
  const popup = document.getElementById("popup");
  const loginPopup = document.getElementById("loginPopup");
  const artistPopup = document.getElementById("artistPopup");

  /* BUTTONS */

  document.getElementById("signupSubmit")?.addEventListener("click", signup);
  document.getElementById("loginSubmit")?.addEventListener("click", login);
  document.getElementById("createArtistBtn")?.addEventListener("click", createArtistAccount);

  signupBtn?.addEventListener("click", (e)=>{
    e.stopPropagation();
    dropdown?.classList.toggle("hidden");
  });

  loginBtn?.addEventListener("click", (e)=>{
    e.stopPropagation();
    loginPopup?.classList.remove("hidden");
    loginPopup?.classList.add("active");
  });

  /* MAP */

  const mapElement = document.getElementById("map");

  if(mapElement){

    map = L.map(mapElement).setView([48.1173, -1.6778], 12);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap & Carto',
      maxZoom: 20
    }).addTo(map);

    markerCluster = L.markerClusterGroup();
    map.addLayer(markerCluster);

    loadArtists();
  }

});

/* ================= SELECT USER ================= */

window.selectUser = function(type){

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

/* ================= POPUP ================= */

window.closePopup = function(){

  document.querySelectorAll(".popup").forEach(p=>{
    p.classList.remove("active");
    p.classList.add("hidden");
  });

};

/* ================= CLICK GLOBAL ================= */

window.addEventListener("click", (e) => {

  const dropdown = document.getElementById("dropdown");

  if(!e.target.closest(".topbar")){
    dropdown?.classList.add("hidden");
  }

  if(!e.target.closest(".popup-content")){
    closePopup();
  }

});
