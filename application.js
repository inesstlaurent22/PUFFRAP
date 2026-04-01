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
const dropdown = document.getElementById("dropdown");
const popup = document.getElementById("popup");

const profile = document.getElementById("profile");
const profileName = document.getElementById("profileName");

/* dropdown */
signupBtn.onclick = () => {
  dropdown.classList.toggle("hidden");
};

/* choix user */
window.selectUser = function(type){
  dropdown.classList.add("hidden");

  if(type === "client"){
    openPopup();
  }
};

/* ================= POPUP IOS ================= */

function openPopup(){
  popup.classList.add("active");
}

function closePopup(){
  popup.classList.remove("active");
}

/* ================= SIGNUP ================= */

window.signup = function(){

  const user = {
    username: document.getElementById("username").value,
    nom: document.getElementById("nom").value,
    prenom: document.getElementById("prenom").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
    favoris: [] // IMPORTANT
  };

  if(!user.username || !user.nom || !user.prenom || !user.email || !user.password){
    alert("Remplis tout");
    return;
  }

  localStorage.setItem("user", JSON.stringify(user));

  updateUI();
};


/* ================= FAVORIS CONNECTÉS ================= */

function getUser(){
  return JSON.parse(localStorage.getItem("user"));
}

function saveUser(user){
  localStorage.setItem("user", JSON.stringify(user));
}

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
        <span onclick="toggleFavori(${artiste.id})" style="font-size:22px">
          ${isFav ? "❤️" : "🤍"}
        </span>
      </div>
    `);

    markers.push(marker);
  });
}

renderMarkers();


/* ================= UI UPDATE ================= */

function updateUI(){

  const user = getUser();

  if(user){
    signupBtn.classList.add("hidden");
    profile.classList.remove("hidden");
    profile.classList.add("show");

    profileName.textContent = user.prenom;

    closePopup();
  }
}

updateUI();

});
