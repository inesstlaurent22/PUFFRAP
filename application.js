document.addEventListener("DOMContentLoaded", () => {

/* ================= MAP ================= */

const map = L.map('map').setView([48.8566, 2.3522], 5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

/* ================= GEO ================= */

function locateUser(){
  navigator.geolocation.getCurrentPosition(pos=>{
    map.setView([pos.coords.latitude, pos.coords.longitude], 10);
  });
}
document.getElementById("locateBtn").onclick = locateUser;


/* ================= UI ================= */

const signupBtn = document.getElementById("signupBtn");
const popup = document.getElementById("popup");
const profile = document.getElementById("profile");
const profileName = document.getElementById("profileName");
const dropdown = document.getElementById("profileDropdown");

/* OUVRIR POPUP */
signupBtn.onclick = () => popup.classList.remove("hidden");

/* PROFIL CLICK */
profile.onclick = () => dropdown.classList.toggle("hidden");

/* ================= SIGNUP ================= */

window.signup = function(){

  const nom = document.getElementById("nom").value;
  const prenom = document.getElementById("prenom").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if(!nom || !prenom || !email || !password){
    alert("Remplis tout");
    return;
  }

  const user = {nom, prenom, email, password};

  localStorage.setItem("user", JSON.stringify(user));

  /* EXPORT CSV (Excel) */
  const csv = `Nom,Prénom,Email\n${nom},${prenom},${email}`;
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "users.csv";
  a.click();

  updateUI();
};

/* ================= UI UPDATE ================= */

function updateUI(){

  const user = JSON.parse(localStorage.getItem("user"));

  if(user){
    signupBtn.classList.add("hidden");
    profile.classList.remove("hidden");
    profileName.textContent = user.prenom + " " + user.nom;
    popup.classList.add("hidden");
  }
}

updateUI();

});
