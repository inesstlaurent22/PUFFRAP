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
    renderMarkers();
  }

  window.toggleFavori = toggleFavori;


  /* ================= MARKERS ================= */

  let markers = [];

  function renderMarkers(){

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


  /* ================= GEOLOCALISATION ================= */

  function locateUser(auto = false){

    if(!navigator.geolocation){
      if(!auto) alert("Géolocalisation non supportée");
      return;
    }

    navigator.geolocation.getCurrentPosition(

      position => {

        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        map.setView([lat, lon], 13);

        if(window.userMarker){
          map.removeLayer(window.userMarker);
        }

        window.userMarker = L.marker([lat, lon]).addTo(map)
          .bindPopup("📍 Vous êtes ici")
          .openPopup();

      },

      () => {
        if(!auto) alert("Localisation refusée");
      },

      {
        enableHighAccuracy: true,
        timeout: 10000
      }

    );
  }

  /* AUTO AU CHARGEMENT */
  locateUser(true);

  /* BOUTON GPS */
  const locateBtn = document.getElementById("locateBtn");
  if(locateBtn){
    locateBtn.addEventListener("click", () => locateUser(false));
  }


  /* ================= INSCRIPTION ================= */

  const signupBtn = document.getElementById("signupBtn");
  const popup = document.getElementById("popup");
  const profile = document.getElementById("profile");
  const profileName = document.getElementById("profileName");
  const dropdown = document.getElementById("profileDropdown");

  /* ouvrir popup */
  if(signupBtn){
    signupBtn.onclick = () => popup.classList.remove("hidden");
  }

  /* profil dropdown */
  if(profile){
    profile.onclick = () => dropdown.classList.toggle("hidden");
  }


  /* ================= SIGNUP ================= */

  window.signup = function(){

    const nom = document.getElementById("nom").value.trim();
    const prenom = document.getElementById("prenom").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if(!nom || !prenom || !email || !password){
      alert("Remplis tous les champs");
      return;
    }

    const user = { nom, prenom, email, password };

    localStorage.setItem("user", JSON.stringify(user));

    updateUI();
  };


  /* ================= UI UPDATE ================= */

  function updateUI(){

    const user = JSON.parse(localStorage.getItem("user"));

    if(user){
      signupBtn?.classList.add("hidden");
      profile?.classList.remove("hidden");
      profileName.textContent = user.prenom + " " + user.nom;
      popup?.classList.add("hidden");
    }
  }

  updateUI();

});
