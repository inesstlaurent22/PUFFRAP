document.addEventListener("DOMContentLoaded", () => {

/* ================= MAP ================= */

const map = L.map('map').setView([48.8566, 2.3522], 5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);


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


/* ================= DROPDOWN INSCRIPTION ================= */

signupBtn.onclick = () => {
  dropdown.classList.toggle("hidden");
  profileDropdown.classList.add("hidden");
};


/* ================= LOGIN POPUP ================= */

loginBtn.onclick = () => {
  loginPopup.classList.add("active");
  dropdown.classList.add("hidden");
};


/* ================= SELECT USER ================= */

window.selectUser = function(type){
  dropdown.classList.add("hidden");

  if(type === "client"){
    openPopup();
  }
};


/* ================= POPUP ================= */

function openPopup(){
  popup.classList.add("active");
}

function closePopup(){
  popup.classList.remove("active");
  loginPopup.classList.remove("active");
}


/* ================= SIGNUP ================= */

window.signup = function(){

  const user = {
    username: document.getElementById("username").value.trim(),
    nom: document.getElementById("nom").value.trim(),
    prenom: document.getElementById("prenom").value.trim(),
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value.trim(),
    favoris: []
  };

  if(!user.username || !user.nom || !user.prenom || !user.email || !user.password){
    alert("Remplis tous les champs");
    return;
  }

  localStorage.setItem("user", JSON.stringify(user));
  updateUI();
};


/* ================= LOGIN ================= */

window.login = function(){

  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  const user = getUser();

  if(!user){
    alert("Aucun compte trouvé");
    return;
  }

  if(user.username === username && user.password === password){
    updateUI();
    closePopup();
  } else {
    alert("Identifiants incorrects");
  }
};


/* ================= USER HELPERS ================= */

function getUser(){
  return JSON.parse(localStorage.getItem("user"));
}

function saveUser(user){
  localStorage.setItem("user", JSON.stringify(user));
}


/* ================= FAVORIS ================= */

window.toggleFavori = function(id){

  let user = getUser();

  if(!user){
    alert("Connecte-toi");
    return;
  }

  if(user.favoris.includes(id)){
    user.favoris = user.favoris.filter(f => f !== id);
  } else {
    user.favoris.push(id);
  }

  saveUser(user);
  renderMarkers();
};


/* ================= ARTISTES ================= */

const artistes = [
  { id:1, nom:"Punchologue", coords:[48.8566,2.3522]},
  { id:2, nom:"Fumsecc", coords:[45.7640,4.8357]},
  { id:3, nom:"Scott", coords:[43.2965,5.3698]},
  { id:4, nom:"Mr Below", coords:[50.6292,3.0573]}
];


/* ================= MARKERS ================= */

let markers = [];

function renderMarkers(){

  markers.forEach(m => map.removeLayer(m));
  markers = [];

  const user = getUser();
  const favs = user?.favoris || [];

  artistes.forEach(artiste => {

    const isFav = favs.includes(artiste.id);

    const marker = L.marker(artiste.coords).addTo(map);

    marker.bindPopup(`
      <div style="text-align:center">
        <h3>${artiste.nom}</h3>
        <br>
        <span onclick="toggleFavori(${artiste.id})" style="font-size:22px;cursor:pointer">
          ${isFav ? "❤️" : "🤍"}
        </span>
      </div>
    `);

    markers.push(marker);
  });
}

renderMarkers();


/* ================= PROFIL ================= */

profile.onclick = () => {
  profileDropdown.classList.toggle("hidden");
  dropdown.classList.add("hidden");
};


/* ================= ACTIONS ================= */

window.openAccount = () => alert("Mon compte à venir");
window.openReservations = () => alert("Réservations à venir");
window.openFavoris = () => alert("Favoris à venir");


/* ================= LOGOUT ================= */

window.logout = function(){

  localStorage.removeItem("user");

  signupBtn.classList.remove("hidden");
  loginBtn.classList.remove("hidden");

  profile.classList.add("hidden");

  profileDropdown.classList.add("hidden");

};


/* ================= UI UPDATE ================= */

function updateUI(){

  const user = getUser();

  if(user){
    signupBtn.classList.add("hidden");
    loginBtn.classList.add("hidden");

    profile.classList.remove("hidden");
    profile.classList.add("show");

    profileName.textContent = user.prenom;

    closePopup();
  }
}

updateUI();


/* ================= CLOSE CLICK OUTSIDE ================= */

document.addEventListener("click", (e) => {

  if(!e.target.closest(".topbar")){
    dropdown.classList.add("hidden");
    profileDropdown.classList.add("hidden");
  }

});

});
