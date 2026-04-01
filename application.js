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

    window.userMarker = L.marker([lat, lon]).addTo(map)
      .bindPopup("📍 Vous êtes ici");

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
    popup.classList.remove("hidden");
  }
};


/* ================= SIGNUP ================= */

window.signup = function(){

  const user = {
    username: document.getElementById("username").value,
    nom: document.getElementById("nom").value,
    prenom: document.getElementById("prenom").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value
  };

  if(!user.username || !user.nom || !user.prenom || !user.email || !user.password){
    alert("Remplis tout");
    return;
  }

  localStorage.setItem("user", JSON.stringify(user));

  updateUI();
};


/* ================= UI UPDATE ================= */

function updateUI(){

  const user = JSON.parse(localStorage.getItem("user"));

  if(user){
    signupBtn.classList.add("hidden");
    profile.classList.remove("hidden");
    profileName.textContent = user.prenom;
    popup.classList.add("hidden");
  }
}

updateUI();

});
