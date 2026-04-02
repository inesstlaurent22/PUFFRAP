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

/* ================= SIGNUP FIREBASE ================= */

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
      email
    });

    alert("Compte créé avec succès");

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

    const docSnap = await getDoc(doc(db, "users", user.uid));

    let prenom = "Utilisateur";

    if(docSnap.exists()){
      prenom = docSnap.data().prenom;
    }

    signupBtn.classList.add("hidden");
    loginBtn.classList.add("hidden");

    profile.classList.remove("hidden");
    profileName.textContent = prenom;

    // ferme popup automatiquement
    document.getElementById("popup").classList.remove("active");
    document.getElementById("popup").classList.add("hidden");

    document.getElementById("loginPopup").classList.remove("active");
    document.getElementById("loginPopup").classList.add("hidden");

  } else {

    signupBtn.classList.remove("hidden");
    loginBtn.classList.remove("hidden");
    profile.classList.add("hidden");

  }

});

window.logout = function(){
  signOut(auth);
};


/* ================= DOM READY ================= */

document.addEventListener("DOMContentLoaded", () => {

/* ================= DOM ELEMENTS ================= */

const username = document.getElementById("username");
const nom = document.getElementById("nom");
const prenom = document.getElementById("prenom");
const email = document.getElementById("email");
const password = document.getElementById("password");

const locateBtn = document.getElementById("locateBtn");


/* ================= MAP ================= */

const mapElement = document.getElementById("map");

if(!mapElement){
  console.error("Map introuvable");
  return;
}

const map = L.map(mapElement).setView([48.1173, -1.6778], 12);

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap & Carto',
  subdomains: 'abcd',
  maxZoom: 20
}).addTo(map);

/* ================= CLUSTER ================= */

const markerCluster = L.markerClusterGroup();
map.addLayer(markerCluster);


/* ================= GEO ================= */

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

    }, () => {
      console.log("Géolocalisation refusée");
    });
  }
}

/* ================= INIT GEO ================= */

locateUser();

if(locateBtn){
  locateBtn.onclick = locateUser;
}

});

document.addEventListener("DOMContentLoaded", () => {

/* ================= UI ================= */

const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");

const dropdown = document.getElementById("dropdown");
const popup = document.getElementById("popup");
const loginPopup = document.getElementById("loginPopup");

const profile = document.getElementById("profile");
const profileName = document.getElementById("profileName");
const profileDropdown = document.getElementById("profileDropdown");


/* ================= DROPDOWN ================= */

if(signupBtn){
  signupBtn.onclick = () => {
    if(dropdown) dropdown.classList.toggle("hidden");
    if(profileDropdown) profileDropdown.classList.add("hidden");
  };
}

if(loginBtn){
  loginBtn.onclick = () => {
    if(loginPopup){
      loginPopup.classList.remove("hidden");
      loginPopup.classList.add("active");
    }
    if(dropdown) dropdown.classList.add("hidden");
  };
}

if(profile){
  profile.onclick = () => {
    if(profileDropdown) profileDropdown.classList.toggle("hidden");
    if(dropdown) dropdown.classList.add("hidden");
  };
}


/* ================= SELECT USER ================= */

window.selectUser = function(type){

  if(dropdown) dropdown.classList.add("hidden");

  if(type === "client" && popup){
    popup.classList.remove("hidden");
    popup.classList.add("active");
  }

};


/* ================= CLOSE POPUP ================= */

function closePopup(){

  if(popup){
    popup.classList.remove("active");
    popup.classList.add("hidden");
  }

  if(loginPopup){
    loginPopup.classList.remove("active");
    loginPopup.classList.add("hidden");
  }

}

});

/* ================= CLICK OUTSIDE ================= */

document.addEventListener("click", (e) => {

  // ferme dropdown si clic extérieur
  if(!e.target.closest(".topbar")){
    if(dropdown) dropdown.classList.add("hidden");
    if(profileDropdown) profileDropdown.classList.add("hidden");
  }

  // ferme popup si clic en dehors
  if(popup && popup.classList.contains("active") && !e.target.closest(".popup-content")){
    closePopup();
  }

  if(loginPopup && loginPopup.classList.contains("active") && !e.target.closest(".popup-content")){
    closePopup();
  }

});


/* ================= FAVORIS ================= */

window.toggleFavori = function(id){

  const user = getUser();

  if(!user){
    alert("Connecte-toi");
    return;
  }

  if(!user.favoris) user.favoris = [];

  if(user.favoris.includes(id)){
    user.favoris = user.favoris.filter(f => f !== id);
  } else {
    user.favoris.push(id);
  }

  saveUser(user);

  if(typeof renderMarkers === "function"){
    renderMarkers();
  }

};

/* ================= NOTES ================= */

function getRatings(id){
  try{
    return JSON.parse(localStorage.getItem("ratings_"+id)) || [];
  } catch(e){
    return [];
  }
}

function addRating(id, rating){

  if(typeof rating !== "number") return;

  let r = getRatings(id);
  r.push(rating);

  localStorage.setItem("ratings_"+id, JSON.stringify(r));

  if(typeof renderMarkers === "function"){
    renderMarkers();
  }
}

function getAverage(id){

  const r = getRatings(id);

  if(!r.length) return "0.0";

  const sum = r.reduce((a,b)=>a+b, 0);

  return (sum / r.length).toFixed(1);
}


/* ================= COMMENTAIRES ================= */

function getComments(id){
  try{
    return JSON.parse(localStorage.getItem("comments_"+id)) || [];
  } catch(e){
    return [];
  }
}

function addComment(id){

  const user = getUser();
  const input = document.getElementById("comment-"+id);

  if(!user){
    alert("Connecte-toi");
    return;
  }

  if(!input || !input.value.trim()){
    return;
  }

  let comments = getComments(id);

  comments.push({
    pseudo: user.prenom || "Utilisateur",
    text: input.value.trim()
  });

  localStorage.setItem("comments_"+id, JSON.stringify(comments));

  input.value = ""; // reset champ

  if(typeof renderMarkers === "function"){
    renderMarkers();
  }
}


/* ================= COMMENTS EXPAND ================= */

window.toggleComments = function(id, btn){

  const el = document.getElementById("comments-"+id);

  if(!el) return;

  el.classList.toggle("open");

  // rotation flèche
  if(btn){
    btn.classList.toggle("open");
  }

};
  
/* ================= SLIDER IOS SWIPE ================= */

function initSliders(){

  const sliders = document.querySelectorAll(".service-slider");

  if(!sliders.length) return;

  sliders.forEach(slider => {

    // évite de ré-attacher les events à chaque ouverture popup
    if(slider.dataset.init === "true") return;
    slider.dataset.init = "true";

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let velocity = 0;
    let momentumID = null;

    /* ===== MOUSE ===== */

    slider.addEventListener("mousedown", (e)=>{
      isDown = true;
      startX = e.pageX;
      scrollLeft = slider.scrollLeft;
      slider.style.cursor = "grabbing";
      cancelAnimationFrame(momentumID);
    });

    slider.addEventListener("mouseup", ()=>{
      if(!isDown) return;
      isDown = false;
      slider.style.cursor = "grab";
      momentum();
    });

    slider.addEventListener("mouseleave", ()=>{
      if(isDown){
        isDown = false;
        momentum();
      }
    });

    slider.addEventListener("mousemove", (e)=>{
      if(!isDown) return;

      e.preventDefault();

      const x = e.pageX;
      const walk = x - startX;

      velocity = walk;
      slider.scrollLeft = scrollLeft - walk;
    });

    /* ===== TOUCH (MOBILE) ===== */

    slider.addEventListener("touchstart", (e)=>{
      startX = e.touches[0].pageX;
      scrollLeft = slider.scrollLeft;
      cancelAnimationFrame(momentumID);
    }, { passive: true });

    slider.addEventListener("touchmove", (e)=>{
      const x = e.touches[0].pageX;
      const walk = x - startX;

      velocity = walk;
      slider.scrollLeft = scrollLeft - walk;
    }, { passive: true });

    slider.addEventListener("touchend", ()=>{
      momentum();
    });

    /* ===== INERTIE IOS ===== */

    function momentum(){

      cancelAnimationFrame(momentumID);

      momentumID = requestAnimationFrame(function step(){

        slider.scrollLeft -= velocity;
        velocity *= 0.95;

        if(Math.abs(velocity) > 0.5){
          momentumID = requestAnimationFrame(step);
        }
      });

    }

  });

}


/* ================= INIT SLIDER SUR POPUP ================= */

if(typeof map !== "undefined"){
  map.on("popupopen", () => {
    setTimeout(initSliders, 50); // laisse le DOM charger
  });
}


/* ================= MARKERS ================= */

function renderMarkers(){

  if(typeof markerCluster === "undefined" || !markerCluster) return;

  markerCluster.clearLayers();

  artistes.forEach(artiste => {

    if(!artiste.coords || !artiste.image) return;

    const avg = "4.8";
    const services = artiste.services || [];

    const icon = L.divIcon({
      className:"custom-marker",
      html:`<div class="marker-img" style="background-image:url('${artiste.image}')"></div>`,
      iconSize:[50,50]
    });

    const marker = L.marker(artiste.coords, { icon });

    /* ===== POPUP HTML ===== */

    const popupHTML = `
<div class="card-premium">

  <!-- HEADER -->
  <div class="header">
    <div class="avatar" style="background-image:url('${artiste.image}')"></div>

    <div class="header-info">
      <div class="stars">⭐⭐⭐⭐☆ <span>${avg}</span></div>

      <div class="tags">
        ${services.map(s => `<span>${s}</span>`).join("")}
      </div>
    </div>
  </div>

  <h2>${artiste.nom}</h2>

  <!-- SLIDER -->
  <div class="service-slider">
    <div class="service-track">
      <div class="service-card">🎵<br>50€</div>
      <div class="service-card">🎚️<br>50€</div>
      <div class="service-card">📱<br>50€</div>
      <div class="service-card">🎤<br>50€</div>
      <div class="service-card">📀<br>50€</div>
    </div>
  </div>

  <!-- COMMENTS -->
  <div class="comments-box">

    <h3>Commentaires</h3>

    <div class="comments-list">

      ${[
        {name:"Lucas Martin", avatar:"https://randomuser.me/api/portraits/men/32.jpg", text:"Incroyable prestation 🔥"},
        {name:"Sarah Dupont", avatar:"https://randomuser.me/api/portraits/women/44.jpg", text:"Très professionnelle"},
        {name:"Mehdi K", avatar:"https://randomuser.me/api/portraits/men/22.jpg", text:"Qualité studio parfaite"},
        {name:"Inès Laurent", avatar:"https://randomuser.me/api/portraits/women/65.jpg", text:"Super expérience !"},
        {name:"Thomas R", avatar:"https://randomuser.me/api/portraits/men/12.jpg", text:"Je recommande à 100%"}
      ].map(c => `
        <div class="comment">
          <img src="${c.avatar}" class="mini-avatar">
          <div>
            <b>${c.name}</b><br>
            ${c.text}
          </div>
        </div>
      `).join("")}

    </div>

  </div>

  <!-- CTA -->
  <button class="cta" onclick="openArtist(${artiste.id})">
    Demander un rendez-vous
  </button>

</div>
`;

    marker.bindPopup(popupHTML, {
      maxWidth: 320,
      closeButton: true
    });

    markerCluster.addLayer(marker);
  });

}


/* ================= INIT ================= */

// ⚠️ IMPORTANT : attendre que la map soit prête
if(typeof map !== "undefined"){
  renderMarkers();
}


/* ================= NAV ================= */

window.openArtist = function(id){
  if(!id) return;
  window.location.href = "artiste.html?id=" + id;
};


/* ================= LOGOUT ================= */

window.logout = function(){

  try{
    localStorage.removeItem("user");
  } catch(e){}

  if(signupBtn) signupBtn.classList.remove("hidden");
  if(loginBtn) loginBtn.classList.remove("hidden");

  if(profile) profile.classList.add("hidden");
  if(profileDropdown) profileDropdown.classList.add("hidden");
};

/* ================= UI AUTH ================= */

onAuthStateChanged(auth, async (user) => {

  try{

    if(user){

      let data = null;

      try{
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if(docSnap.exists()){
          data = docSnap.data();
        }
      } catch(e){
        console.log("Erreur Firestore :", e);
      }

      if(profile) profile.classList.remove("hidden");
      if(signupBtn) signupBtn.classList.add("hidden");
      if(loginBtn) loginBtn.classList.add("hidden");

      if(profileName){
        profileName.textContent = data?.prenom || "Utilisateur";
      }

    } else {

      if(profile) profile.classList.add("hidden");
      if(signupBtn) signupBtn.classList.remove("hidden");
      if(loginBtn) loginBtn.classList.remove("hidden");

    }

  } catch(e){
    console.log("Erreur auth :", e);
  }

});


/* ================= CLOSE POPUP OUTSIDE ================= */

window.addEventListener("click", (e) => {

  // popup inscription
  if(
    popup &&
    popup.classList.contains("active") &&
    !e.target.closest(".popup-content") &&
    !e.target.closest("#signupBtn")
  ){
    closePopup();
  }

  // popup login
  if(
    loginPopup &&
    loginPopup.classList.contains("active") &&
    !e.target.closest(".popup-content") &&
    !e.target.closest("#loginBtn")
  ){
    closePopup();
  }

});


/* ================= STOP PROPAGATION ================= */

const popups = document.querySelectorAll(".popup-content");

if(popups.length){
  popups.forEach(el => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  });
}
