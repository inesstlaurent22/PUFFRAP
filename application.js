document.addEventListener("DOMContentLoaded", () => {

/* ================= MAP ================= */

const map = L.map('map').setView([48.1173, -1.6778], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

/* CLUSTER */
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


/* ================= DROPDOWN ================= */

signupBtn.onclick = () => {
  dropdown.classList.toggle("hidden");
  profileDropdown.classList.add("hidden");
};

loginBtn.onclick = () => {
  loginPopup.classList.remove("hidden");
  loginPopup.classList.add("active");
  dropdown.classList.add("hidden");
};

profile.onclick = () => {
  profileDropdown.classList.toggle("hidden");
  dropdown.classList.add("hidden");
};


/* ================= POPUPS ================= */

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


/* ================= USER ================= */

function getUser(){
  return JSON.parse(localStorage.getItem("user"));
}

function saveUser(user){
  localStorage.setItem("user", JSON.stringify(user));
}


/* ================= SIGNUP ================= */

window.signup = function(){

  const user = {
    username: username.value.trim(),
    nom: nom.value.trim(),
    prenom: prenom.value.trim(),
    email: email.value.trim(),
    password: password.value.trim(),
    favoris: []
  };

  if(!user.username || !user.nom || !user.prenom || !user.email || !user.password){
    alert("Remplis tous les champs");
    return;
  }

  saveUser(user);
  updateUI();
};


/* ================= LOGIN ================= */

window.login = function(){

  const user = getUser();

  if(!user){
    alert("Aucun compte trouvé");
    return;
  }

  if(user.username === loginUsername.value && user.password === loginPassword.value){
    updateUI();
    closePopup();
  } else {
    alert("Identifiants incorrects");
  }
};


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


/* ================= NOTES ================= */

function getRatings(id){
  return JSON.parse(localStorage.getItem("ratings_"+id)) || [];
}

function addRating(id, rating){
  let r = getRatings(id);
  r.push(rating);
  localStorage.setItem("ratings_"+id, JSON.stringify(r));
  renderMarkers();
}

function getAverage(id){
  const r = getRatings(id);
  if(!r.length) return "0.0";
  return (r.reduce((a,b)=>a+b)/r.length).toFixed(1);
}


/* ================= COMMENTAIRES ================= */

function getComments(id){
  return JSON.parse(localStorage.getItem("comments_"+id)) || [];
}

function addComment(id){

  const user = getUser();
  const input = document.getElementById("comment-"+id);

  if(!user) return alert("Connecte-toi");
  if(!input.value) return;

  let comments = getComments(id);

  comments.push({
    pseudo: user.prenom,
    text: input.value
  });

  localStorage.setItem("comments_"+id, JSON.stringify(comments));
  renderMarkers();
}


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

  const user = getUser();
  const favs = user?.favoris || [];

  artistes.forEach(artiste => {

    const isFav = favs.includes(artiste.id);
    const avg = getAverage(artiste.id);
    const comments = getComments(artiste.id);

    const icon = L.divIcon({
      className:"custom-marker",
      html:`<div class="marker-img" style="background-image:url('${artiste.image}')"></div>`,
      iconSize:[50,50]
    });

    const marker = L.marker(artiste.coords,{icon});

    marker.bindPopup(`
<div class="card-premium">

  <!-- TOP -->
  <div class="top">

    <div class="avatar" style="background-image:url('${artiste.image}')"></div>

    <div class="infos">

      <div class="stars">
        ${"⭐".repeat(Math.round(avg))} <span>${avg}</span>
      </div>

      <div class="tags">
        ${artiste.services.map(s=>`<span>${s}</span>`).join("")}
      </div>

    </div>

  </div>

  <!-- NOM -->
  <h2>${artiste.nom}</h2>

  <!-- SERVICES PRIX -->
  <div class="services-box">

    <div class="service">
      🎵
      <p>À partir de 50€</p>
    </div>

    <div class="service">
      🎚️
      <p>À partir de 50€</p>
    </div>

    <div class="service">
      💬
      <p>À partir de 50€</p>
    </div>

  </div>

  <!-- COMMENTAIRES -->
  <div class="comments-box">

    <h4>Commentaires</h4>

    <div class="comment">
      <div class="mini-avatar"></div>
      <div>
        <b>${comments[0]?.pseudo || "Utilisateur"}</b><br>
        ${comments[0]?.text || "Aucun commentaire"}
      </div>
    </div>

  </div>

  <!-- ACTIONS -->
  <div class="actions">

    <div onclick="toggleFavori(${artiste.id})">
      ${isFav ? "❤️" : "🤍"}
    </div>

    <button onclick="openArtist(${artiste.id})">
      Demander un rendez-vous
    </button>

  </div>

</div>
`);

    markerCluster.addLayer(marker);
  });
}

renderMarkers();

  window.openArtist = function(id){
  window.location.href = "artiste.html?id=" + id;
};


/* ================= LOGOUT ================= */

window.logout = function(){

  localStorage.removeItem("user");

  signupBtn.classList.remove("hidden");
  loginBtn.classList.remove("hidden");

  profile.classList.add("hidden");
  profileDropdown.classList.add("hidden");
};


/* ================= UI ================= */

function updateUI(){

  const user = getUser();

  if(user){
    signupBtn.classList.add("hidden");
    loginBtn.classList.add("hidden");

    profile.classList.remove("hidden");
    profileName.textContent = user.prenom;

    closePopup();
  }
}

updateUI();


/* ================= CLOSE GLOBAL ================= */

document.addEventListener("click", (e) => {

  if(!e.target.closest(".topbar")){
    dropdown.classList.add("hidden");
    profileDropdown.classList.add("hidden");
  }

  if(!e.target.closest(".popup") && !e.target.closest("#signupBtn") && !e.target.closest("#loginBtn")){
    closePopup();
  }

});

});
