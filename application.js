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
  getDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ================= FIREBASE ================= */

const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "puffrap.firebaseapp.com",
  projectId: "puffrap",
  storageBucket: "puffrap.firebasestorage.app",
  messagingSenderId: "555120601762",
  appId: "1:555120601762:web:796a6681b5841c7bdb85fb"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* ================= SIGNUP ================= */

window.signup = async function(){

  const username = document.getElementById("username").value.trim();
  const nom = document.getElementById("nom").value.trim();
  const prenom = document.getElementById("prenom").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

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
      createdAt: Date.now()
    });

    closePopup();
    alert("Bienvenue " + prenom);

  } catch(e){
    console.error(e);
    alert(e.message);
  }
};

/* ================= LOGIN ================= */

window.login = async function(){

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  try{
    await signInWithEmailAndPassword(auth, email, password);
    closePopup();
  } catch(e){
    alert(e.message);
  }
};

/* ================= LOGOUT ================= */

window.logout = function(){
  signOut(auth);
};

/* ================= AUTH STATE ================= */

onAuthStateChanged(auth, async (user) => {

  const signupBtn = document.getElementById("signupBtn");
  const loginBtn = document.getElementById("loginBtn");
  const profile = document.getElementById("profile");
  const profileName = document.getElementById("profileName");

  if(user){

    let prenom = "Utilisateur";

    try{
      const docSnap = await getDoc(doc(db, "users", user.uid));
      if(docSnap.exists()){
        prenom = docSnap.data().prenom;
      }
    } catch(e){
      console.log(e);
    }

    signupBtn?.classList.add("hidden");
    loginBtn?.classList.add("hidden");

    profile?.classList.remove("hidden");
    if(profileName) profileName.textContent = prenom;

    closePopup();

  } else {

    signupBtn?.classList.remove("hidden");
    loginBtn?.classList.remove("hidden");
    profile?.classList.add("hidden");

  }

});

/* ================= DOM READY ================= */

document.addEventListener("DOMContentLoaded", () => {

  /* ===== BUTTONS ===== */

  document.getElementById("signupSubmit")?.addEventListener("click", signup);
  document.getElementById("loginSubmit")?.addEventListener("click", login);

  /* ===== UI ===== */

  const signupBtn = document.getElementById("signupBtn");
  const loginBtn = document.getElementById("loginBtn");
  const dropdown = document.getElementById("dropdown");
  const popup = document.getElementById("popup");
  const loginPopup = document.getElementById("loginPopup");
  const profile = document.getElementById("profile");
  const profileDropdown = document.getElementById("profileDropdown");

  signupBtn?.onclick = (e) => {
  e.stopPropagation();

  popup?.classList.remove("hidden");
  popup?.classList.add("active");

  dropdown?.classList.add("hidden");
  profileDropdown?.classList.add("hidden");
};

  loginBtn?.onclick = (e) => {
    e.stopPropagation();
    loginPopup?.classList.remove("hidden");
    loginPopup?.classList.add("active");
    dropdown?.classList.add("hidden");
  };

  profile?.onclick = (e) => {
    e.stopPropagation();
    profileDropdown?.classList.toggle("hidden");
    dropdown?.classList.add("hidden");
  };

  /* ===== STOP CLICK DANS POPUP ===== */

  document.querySelectorAll(".popup-content").forEach(el => {
    el.onclick = (e) => e.stopPropagation();
  });

  /* ===== MAP ===== */

  const mapElement = document.getElementById("map");

  if(mapElement){

  window.map = L.map(mapElement).setView([48.1173, -1.6778], 12);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap & Carto',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(map);

  window.markerCluster = L.markerClusterGroup();
  map.addLayer(markerCluster);

  function locateUser(){
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(pos => {

        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        map.setView([lat, lon], 13);

        if(window.userMarker){
          map.removeLayer(window.userMarker);
        }

        window.userMarker = L.marker([lat, lon]).addTo(map);

      });
    }
  }

  locateUser();

  document.getElementById("locateBtn")?.addEventListener("click", locateUser);

}

  window.map = L.map(mapElement).setView([48.1173, -1.6778], 12);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap & Carto',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(map);

  window.markerCluster = L.markerClusterGroup();
  map.addLayer(markerCluster);

  function locateUser(){
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(pos => {

        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        map.setView([lat, lon], 13);

        if(window.userMarker){
          map.removeLayer(window.userMarker);
        }

        window.userMarker = L.marker([lat, lon]).addTo(map);

      });
    }
  }

  locateUser();

  document.getElementById("locateBtn")?.addEventListener("click", locateUser);

});

/* ================= POPUP ================= */

window.closePopup = function(){

  const popup = document.getElementById("popup");
  const loginPopup = document.getElementById("loginPopup");

  popup?.classList.remove("active");
  popup?.classList.add("hidden");

  loginPopup?.classList.remove("active");
  loginPopup?.classList.add("hidden");

};

/* ================= SELECT USER ================= */

window.selectUser = function(type){

  const popup = document.getElementById("popup");
  const dropdown = document.getElementById("dropdown");

  dropdown?.classList.add("hidden");

  if(type === "client"){
    popup?.classList.remove("hidden");
    popup?.classList.add("active");
  }

};

/* ================= CLICK GLOBAL ================= */

window.addEventListener("click", (e) => {

  const dropdown = document.getElementById("dropdown");
  const profileDropdown = document.getElementById("profileDropdown");
  const popup = document.getElementById("popup");
  const loginPopup = document.getElementById("loginPopup");

  if(!e.target.closest(".topbar")){
    dropdown?.classList.add("hidden");
    profileDropdown?.classList.add("hidden");
  }

  if(
    popup &&
    popup.classList.contains("active") &&
    !e.target.closest(".popup-content")
  ){
    closePopup();
  }

  if(
    loginPopup &&
    loginPopup.classList.contains("active") &&
    !e.target.closest(".popup-content")
  ){
    closePopup();
  }

});
