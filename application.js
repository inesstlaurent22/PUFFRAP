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
  apiKey: "AIzaSyAHb_jyRobERs677A4ZlGTzOVRCLZaaF3s",
  authDomain: "puffrap.firebaseapp.com",
  projectId: "puffrap",
  storageBucket: "puffrap.firebasestorage.app",
  messagingSenderId: "555120601762",
  appId: "1:555120601762:web:796a6681b5841c7bdb85fb"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


/* ================= DOM READY ================= */

document.addEventListener("DOMContentLoaded", () => {

/* ================= MAP ================= */

const map = L.map('map').setView([48.1173, -1.6778], 12);

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  subdomains: 'abcd',
  maxZoom: 20
}).addTo(map);

const markerCluster = L.markerClusterGroup();
map.addLayer(markerCluster);


/* ================= GEO ================= */

function locateUser(){
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

locateUser();
document.getElementById("locateBtn").onclick = locateUser;


/* ================= UI ================= */

const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");

const dropdown = document.getElementById("dropdown");
const popup = document.getElementById("popup");
const loginPopup = document.getElementById("loginPopup");

const profile = document.getElementById("profile");
const profileName = document.getElementById("profileName");
const profileDropdown = document.getElementById("profileDropdown");


signupBtn.onclick = () => {
  dropdown.classList.toggle("hidden");
};

loginBtn.onclick = () => {
  loginPopup.classList.remove("hidden");
  loginPopup.classList.add("active");
};

profile.onclick = () => {
  profileDropdown.classList.toggle("hidden");
};

window.selectUser = function(type){
  dropdown.classList.add("hidden");
  if(type === "client"){
    popup.classList.remove("hidden");
    popup.classList.add("active");
  }
};

function closePopup(){
  popup.classList.remove("active");
  loginPopup.classList.remove("active");

  popup.classList.add("hidden");
  loginPopup.classList.add("hidden");
}


/* ================= SIGNUP ================= */

window.signup = async function(){

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  const userData = {
    username: document.getElementById("username").value,
    nom: document.getElementById("nom").value,
    prenom: document.getElementById("prenom").value,
    email
  };

  try{
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(doc(db, "users", userCredential.user.uid), userData);

    alert("Compte créé !");
    closePopup();

  } catch(e){
    alert(e.message);
  }
};


/* ================= LOGIN ================= */

window.login = async function(){

  const email = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  try{
    await signInWithEmailAndPassword(auth, email, password);
    closePopup();
  } catch(e){
    alert("Erreur : " + e.message);
  }
};

/* ================= AUTH STATE ================= */

onAuthStateChanged(auth, async (user) => {

  if(user){

    const docSnap = await getDoc(doc(db, "users", user.uid));

    if(docSnap.exists()){
      const data = docSnap.data();

      profile.classList.remove("hidden");
      signupBtn.classList.add("hidden");
      loginBtn.classList.add("hidden");

      profileName.textContent = data.prenom;
    }

  } else {

    profile.classList.add("hidden");
    signupBtn.classList.remove("hidden");
    loginBtn.classList.remove("hidden");
  }

});

/* ================= LOGOUT ================= */

window.logout = function(){
  signOut(auth);
};

  
/* ================= ARTISTES ================= */

const artistes = [
  {
    id:1,
    nom:"Léo Martin",
    coords:[48.1173,-1.6778],
    image:"images/artiste1.jpg",
    categories:["Rap","Freestyle"],
    services:["Mixage","Mastering","Freestyle"]
  },
  {
    id:2,
    nom:"Sarah K",
    coords:[48.115,-1.68],
    image:"images/artiste2.jpg",
    categories:["Chant","Pop"],
    services:["Chant","Cover","Studio"]
  },
  {
    id:3,
    nom:"DJ Nox",
    coords:[48.118,-1.675],
    image:"images/artiste3.jpg",
    categories:["DJ","Electro"],
    services:["DJ Set","Soirée","Mix"]
  }
];


/* ================= MARKERS ================= */
function renderMarkers(){

  markerCluster.clearLayers();

  artistes.forEach(artiste => {

    const avg = "4.8";

    // sécurité services
    const servicesHTML = (artiste.services || [])
      .map(s => `<span>${s}</span>`)
      .join("");

    const commentsHTML = [
      {name:"Lucas", text:"Incroyable 🔥"},
      {name:"Sarah", text:"Très pro"},
      {name:"Mehdi", text:"Top qualité"},
      {name:"Inès", text:"Super expérience"},
      {name:"Thomas", text:"Je recommande"}
    ].map(c => `
      <div class="comment">
        <div>
          <b>${c.name}</b><br>
          ${c.text}
        </div>
      </div>
    `).join("");

    const icon = L.divIcon({
      className: "custom-marker",
      html: `<div class="marker-img" style="background-image:url('${artiste.image}')"></div>`,
      iconSize: [50,50]
    });

    const marker = L.marker(artiste.coords, { icon });

    marker.bindPopup(`
      <div class="card-premium">

        <div class="header">
          <div class="avatar" style="background-image:url('${artiste.image}')"></div>

          <div class="header-info">
            <div class="stars">⭐⭐⭐⭐☆ <span>${avg}</span></div>

            <div class="tags">
              ${servicesHTML}
            </div>
          </div>
        </div>

        <h2>${artiste.nom}</h2>

        <div class="service-slider">
          <div class="service-track">
            <div class="service-card">🎵<br>50€</div>
            <div class="service-card">🎚️<br>50€</div>
            <div class="service-card">📱<br>50€</div>
            <div class="service-card">🎤<br>50€</div>
            <div class="service-card">📀<br>50€</div>
          </div>
        </div>

        <div class="comments-box">
          <h3>Commentaires</h3>

          <div class="comments-list">
            ${commentsHTML}
          </div>
        </div>

        <button class="cta" onclick="openArtist(${artiste.id})">
          Demander un rendez-vous
        </button>

      </div>
    `);

    markerCluster.addLayer(marker);
  });
}

  renderMarkers();

  
  /* ================= CLOSE POPUP OUTSIDE ================= */

window.addEventListener("click", (e) => {

  // INSCRIPTION
  if (popup.classList.contains("active") && !e.target.closest(".popup-content")) {
    closePopup();
  }

  // LOGIN
  if (loginPopup.classList.contains("active") && !e.target.closest(".popup-content")) {
    closePopup();
  }

});

  
document.querySelectorAll(".popup-content").forEach(el => {
  el.addEventListener("click", (e) => e.stopPropagation());
});


});
