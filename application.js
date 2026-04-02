document.addEventListener("DOMContentLoaded", () => {

/* ================= MAP ================= */

const map = L.map('map').setView([48.1173, -1.6778], 12);

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap & Carto',
  subdomains: 'abcd',
  maxZoom: 20
}).addTo(map);

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

/* ================= COMMENTS EXPAND ================= */
window.toggleComments = function(id, btn){

  const el = document.getElementById("comments-"+id);

  el.classList.toggle("open");
  btn.classList.toggle("open");

};
  
/* ================= SLIDER IOS SWIPE ================= */

function initSliders(){

  document.querySelectorAll(".service-slider").forEach(slider => {

    let isDown = false;
    let startX;
    let scrollLeft;
    let velocity = 0;
    let momentumID;

    /* ===== MOUSE ===== */

    slider.addEventListener("mousedown", (e)=>{
      isDown = true;
      startX = e.pageX;
      scrollLeft = slider.scrollLeft;
      slider.style.cursor = "grabbing";
      cancelAnimationFrame(momentumID);
    });

    slider.addEventListener("mouseup", ()=>{
      isDown = false;
      slider.style.cursor = "grab";
      momentum();
    });

    slider.addEventListener("mouseleave", ()=> isDown = false);

    slider.addEventListener("mousemove", (e)=>{
      if(!isDown) return;

      const x = e.pageX;
      const walk = x - startX;

      velocity = walk;
      slider.scrollLeft = scrollLeft - walk;
    });

    /* ===== TOUCH ===== */

    slider.addEventListener("touchstart", (e)=>{
      startX = e.touches[0].pageX;
      scrollLeft = slider.scrollLeft;
      cancelAnimationFrame(momentumID);
    });

    slider.addEventListener("touchmove", (e)=>{
      const x = e.touches[0].pageX;
      const walk = x - startX;

      velocity = walk;
      slider.scrollLeft = scrollLeft - walk;
    });

    slider.addEventListener("touchend", ()=>{
      momentum();
    });

    /* ===== INERTIE IOS ===== */

    function momentum(){
      cancelAnimationFrame(momentumID);

      momentumID = requestAnimationFrame(function step(){

        slider.scrollLeft -= velocity;

        velocity *= 0.95; // friction iOS

        if(Math.abs(velocity) > 0.5){
          momentumID = requestAnimationFrame(step);
        }
      });
    }

  });

}

  map.on("popupopen", () => {
  initSliders();
});

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

  <!-- HEADER -->
  <div class="header">
    <div class="avatar" style="background-image:url('${artiste.image}')"></div>

    <div class="header-info">
      <div class="stars">⭐⭐⭐⭐☆ <span>${avg}</span></div>

      <div class="tags">
        ${artiste.services.map(s=>`<span>${s}</span>`).join("")}
      </div>
    </div>
  </div>

  <h2>${artiste.nom}</h2>

  <!-- SLIDER SERVICES -->
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
<!-- COMMENTS -->
<div class="comments-box">

  <h3>Commentaires</h3>

  <div class="comments-list" id="comments-${artiste.id}">
    
    ${[
      {name:"Lucas Martin", avatar:"https://randomuser.me/api/portraits/men/32.jpg", text:"Incroyable prestation 🔥"},
      {name:"Sarah Dupont", avatar:"https://randomuser.me/api/portraits/women/44.jpg", text:"Très professionnelle"},
      {name:"Mehdi K", avatar:"https://randomuser.me/api/portraits/men/22.jpg", text:"Qualité studio parfaite"},
      {name:"Inès Laurent", avatar:"https://randomuser.me/api/portraits/women/65.jpg", text:"Super expérience !"},
      {name:"Thomas R", avatar:"https://randomuser.me/api/portraits/men/12.jpg", text:"Je recommande à 100%"}
    ].map(c=>`
      <div class="comment">
        <img src="${c.avatar}" class="mini-avatar">
        <div>
          <b>${c.name}</b><br>
          ${c.text}
        </div>
      </div>
    `).join("")}

  </div>

  <!-- FLECHE -->
  <div class="expand-btn" onclick="toggleComments(${artiste.id}, this)">
    ⬇️
  </div>

</div>

  <!-- CTA -->
  <button class="cta" onclick="openArtist(${artiste.id})">
    Demander un rendez-vous
  </button>

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
