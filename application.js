document.addEventListener("DOMContentLoaded", () => {

  /* ================= MAP ================= */

  const map = L.map('map').setView([48.8566, 2.3522], 5);

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

    // refresh popup sans reload
    renderMarkers();
  }

  window.toggleFavori = toggleFavori;


  /* ================= MARKERS ================= */

  let markers = [];

  function renderMarkers(){

    // supprimer anciens markers
    markers.forEach(m => map.removeLayer(m));
    markers = [];

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

      markers.push(marker);
    });
  }

  renderMarkers();


  /* ================= DROPDOWN ================= */

  const signupBtn = document.getElementById("signupBtn");
  const dropdown = document.getElementById("dropdown");
  const container = document.querySelector(".signup-container");

  if(signupBtn && dropdown){

    signupBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.classList.toggle("hidden");
    });

    window.selectUser = function(type){

      if(type === "client"){
        window.location.href = "inscriptionclient.html";
      }

      if(type === "artiste"){
        alert("Inscription artiste à venir");
      }

      dropdown.classList.add("hidden");
    };

    // fermer si clic ailleurs
    document.addEventListener("click", (e) => {
      if(container && !container.contains(e.target)){
        dropdown.classList.add("hidden");
      }
    });
  }


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

      }, () => {
        alert("Localisation refusée");
      });

    } else {
      alert("Géolocalisation non supportée");
    }
  }

  const locateBtn = document.getElementById("locateBtn");

  if(locateBtn){
    locateBtn.addEventListener("click", locateUser);
  }

  locateUser();

});
