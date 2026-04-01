/* ================= MAP ================= */

const map = L.map('map').setView([48.8566, 2.3522], 5);

/* TILE GRATUIT */
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: ''
}).addTo(map);

/* ================= ARTISTES ================= */

const artistes = [
  { id:1, nom:"Punchologue", coords:[48.8566,2.3522]},
  { id:2, nom:"Fumsecc", coords:[45.7640,4.8357]},
  { id:3, nom:"Scott", coords:[43.2965,5.3698]},
  { id:4, nom:"Mr Below", coords:[50.6292,3.0573]}
];

/* ================= FAVORIS ================= */

let favoris = JSON.parse(localStorage.getItem("favoris")) || [];

function toggleFavori(id){
  if(favoris.includes(id)){
    favoris = favoris.filter(f => f !== id);
  } else {
    favoris.push(id);
  }
  localStorage.setItem("favoris", JSON.stringify(favoris));
  location.reload();
}

window.toggleFavori = toggleFavori;

/* ================= MARKERS ================= */

artistes.forEach(artiste => {

  const isFav = favoris.includes(artiste.id);

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
});

/* ================= GEO ================= */

function locateUser(){
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(position => {

      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      map.setView([lat, lon], 10);

      L.marker([lat, lon]).addTo(map)
        .bindPopup("📍 Vous êtes ici")
        .openPopup();

    });
  }
}

document.getElementById("locateBtn").addEventListener("click", locateUser);

locateUser();
