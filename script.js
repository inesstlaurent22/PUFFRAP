/* ================= FIREBASE ================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  setDoc,
  doc,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

/* ================= CONFIG ================= */

const firebaseConfig = {
  apiKey: "AIzaSyA4IF_NqUVXXQxMWz3F1SM32NN5vLUpRoI",
  authDomain: "puffrap-46658.firebaseapp.com",
  projectId: "puffrap-46658",
  storageBucket: "puffrap-46658.appspot.com",
  messagingSenderId: "217849878785",
  appId: "1:217849878785:web:e4e7d90ae3b77a19e76300"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

/* ================= AUTH UI ================= */

onAuthStateChanged(auth, (user) => {

  const loginBtn = document.getElementById("loginBtn");
  const signupToggle = document.getElementById("signupToggle");
  const userMenu = document.getElementById("userMenu");

  if (user) {
    if (loginBtn) loginBtn.style.display = "none";
    if (signupToggle) signupToggle.style.display = "none";
    if (userMenu) userMenu.style.display = "block";
  } else {
    if (loginBtn) loginBtn.style.display = "block";
    if (signupToggle) signupToggle.style.display = "block";
    if (userMenu) userMenu.style.display = "none";
  }

});

/* ================= MODALS ================= */

const loginBtn = document.getElementById("loginBtn");
const signupClientBtn = document.getElementById("signupClient");
const signupArtistBtn = document.getElementById("signupArtist");

if (loginBtn) {
  loginBtn.onclick = () => {
    document.getElementById("loginModal").style.display = "flex";
  };
}

if (signupClientBtn) {
  signupClientBtn.onclick = () => {
    document.getElementById("signupClientModal").style.display = "flex";
  };
}

if (signupArtistBtn) {
  signupArtistBtn.onclick = () => {
    document.getElementById("signupArtistModal").style.display = "flex";
  };
}

/* ================= CLOSE MODAL ================= */

window.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal")) {
    e.target.style.display = "none";
  }
});

/* ================= DROPDOWN INSCRIPTION ================= */

const toggleBtn = document.getElementById("signupToggle");
const dropdown = document.getElementById("dropdownMenu");

if (toggleBtn && dropdown) {

  toggleBtn.onclick = (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("active");
  };

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target) && e.target !== toggleBtn) {
      dropdown.classList.remove("active");
    }
  });

  dropdown.addEventListener("click", (e) => {
    e.stopPropagation();
  });

}

/* ================= LOGOUT ================= */

document.addEventListener("DOMContentLoaded", () => {

  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.onclick = async () => {
      await signOut(auth);
      location.reload();
    };
  }

});

/* ================= LOGIN ================= */

const loginSubmit = document.getElementById("loginSubmit");

if (loginSubmit) {
  loginSubmit.onclick = async () => {
    try {
      const email = document.getElementById("loginEmail").value;
      const password = document.getElementById("loginPassword").value;

      await signInWithEmailAndPassword(auth, email, password);

      alert("Connexion réussie 🔥");
      location.reload();

    } catch (error) {
      alert(error.message);
    }
  };
}

/* ================= SIGNUP CLIENT ================= */

const createClientBtn = document.getElementById("createClient");

if (createClientBtn) {
  createClientBtn.onclick = async () => {
  try {

    const email = document.getElementById("clientEmail").value.trim();
    const password = document.getElementById("clientPassword").value.trim();
    const name = document.getElementById("clientUsername").value.trim();

    if (!email || !password || !name) {
      throw new Error("Remplis tous les champs");
    }

    /* 🔥 CHECK EMAIL */
    const methods = await fetchSignInMethodsForEmail(auth, email);

    /* ================= CAS 1 : EMAIL EXISTE ================= */
    if (methods.length > 0) {

      try {
        await signInWithEmailAndPassword(auth, email, password);

        alert("Connexion automatique 🔥");
        location.reload();
        return;

      } catch {
        throw new Error("Mot de passe incorrect ❌");
      }
    }

    /* ================= CAS 2 : NOUVEL UTILISATEUR ================= */
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "Users", user.uid), {
      Mail: email,
      Name: name,
      Role: "client",
      CreatedAt: new Date()
    });

    alert("Compte créé ✅");
    location.reload();

  } catch (error) {
    alert(error.message);
  }
};
}

/* ================= VALIDATION URL ================= */

function isValidURL(url) {
  return url.startsWith("https://");
}

/* ================= GEOLOCALISATION (CODE POSTAL → GPS) ================= */

async function getCoordinatesFromPostal(postal) {
  const res = await fetch(`https://nominatim.openstreetmap.org/search?postalcode=${postal}&country=France&format=json`);
  const data = await res.json();

  if (data.length > 0) {
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon)
    };
  } else {
    throw new Error("Code postal invalide");
  }
}

/* ================= SIGNUP ARTIST ================= */
const createArtistBtn = document.getElementById("createArtist");

if (createArtistBtn) {

  createArtistBtn.onclick = async () => {

    try {

      /* ================= GET ELEMENTS ================= */
      const emailEl = document.getElementById("artistEmail");
      const passwordEl = document.getElementById("artistPassword");
      const usernameEl = document.getElementById("artistUsername");
      const addressEl = document.getElementById("artistAddress");

      if (!emailEl || !passwordEl || !usernameEl || !addressEl) {
        throw new Error("Erreur interface (éléments manquants)");
      }

      const email = emailEl.value.trim();
      const password = passwordEl.value.trim();
      const artistName = document.getElementById("artistStageName").value.trim();
      const firstName = document.getElementById("artistFirstName").value.trim();
      const lastName = document.getElementById("artistLastName").value.trim();

      const instagram = document.getElementById("artistInstagram")?.value.trim() || "";
      const tiktok = document.getElementById("artistTiktok")?.value.trim() || "";
      const portfolio = document.getElementById("artistPortfolio")?.value.trim() || "";

      const file = document.getElementById("artistImage")?.files[0];

      const lat = parseFloat(addressEl.dataset.lat);
      const lng = parseFloat(addressEl.dataset.lng);

      if (!artistName || !firstName || !lastName) {
  throw new Error("Nom, prénom et nom d'artiste obligatoires");
}

      /* ================= VALIDATION ================= */

      if (!email || !password || !artistName) {
        throw new Error("Remplis tous les champs obligatoires");
      }

      if (isNaN(lat) || isNaN(lng)) {
        throw new Error("Choisis une adresse dans les suggestions");
      }

      if (instagram && !instagram.startsWith("https://")) throw new Error("Instagram invalide");
      if (tiktok && !tiktok.startsWith("https://")) throw new Error("TikTok invalide");
      if (portfolio && !portfolio.startsWith("https://")) throw new Error("Portfolio invalide");

      /* ================= SKILLS ================= */
      const skills = getSelectedSkills ? getSelectedSkills() : [];

      /* ================= CHECK EMAIL ================= */
      const methods = await fetchSignInMethodsForEmail(auth, email);

      if (methods.length > 0) {

        try {
          await signInWithEmailAndPassword(auth, email, password);
          alert("Connexion automatique 🔥");
          location.reload();
          return;

        } catch {
          throw new Error("Mot de passe incorrect ❌");
        }
      }

      /* ================= CREATE USER ================= */
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      /* ================= UPLOAD IMAGE ================= */
      let imageUrl = "";

      if (file) {
        const storageRef = ref(storage, `artists/${user.uid}/profile.jpg`);
        await uploadBytes(storageRef, file);
        imageUrl = await getDownloadURL(storageRef);
      }

      /* ================= UPLOAD CREATIONS ================= */

let creations = [];

if (selectedFiles.length > 0) {

  for (let i = 0; i < selectedFiles.length; i++) {

    const file = selectedFiles[i];

    /* 🔥 VALIDATION FORMAT */
    const allowedTypes = ["audio/mpeg", "video/mp4", "video/quicktime"];

    if (!allowedTypes.includes(file.type)) {
      throw new Error("Format non supporté (mp3, mp4, mov uniquement)");
    }

    const storageRef = ref(storage, `artists/${user.uid}/creations/${Date.now()}_${file.name}`);

    await uploadBytes(storageRef, file);

    const url = await getDownloadURL(storageRef);

    creations.push({
      FileURL: url,
      Type: file.type,
      IsActive: true,
      CreatedAt: new Date()
    });

  }

}

      /* ================= FIRESTORE USERS ================= */
      await setDoc(doc(db, "Users", user.uid), {
        Mail: email,
        Name: artistName,
        Role: "artist",
        CreatedAt: new Date()
      });

      /* ================= SAVE CREATIONS ================= */

for (let i = 0; i < creations.length; i++) {

  await setDoc(
    doc(collection(db, "Artists", user.uid, "Creations")),
    creations[i]
  );

}

      /* ================= FIRESTORE ARTIST ================= */

  await setDoc(doc(db, "Artists", user.uid), {

  UserID: user.uid,

  /* 🔥 IDENTITÉ */
  ArtistName: artistName,
  FirstName: firstName,
  LastName: lastName,

  /* (optionnel mais utile pour recherche) */
  Username: artistName,

  Email: email,
  profileImage: imageUrl,

  Skills: skills,

  Location: {
    Lat: lat,
    Lng: lng,
    Address: addressEl.value
  },

  Socials: {
    Instagram: instagram,
    TikTok: tiktok,
    Portfolio: portfolio
  },

  Rating: 0,
  reviewCount: 0,
  isAvailable: true,

  CreatedAt: new Date()
});

      /* ================= MAP SAFE ================= */
      if (typeof map !== "undefined" && map) {
        L.marker([lat, lng])
          .addTo(map)
          .bindPopup("Ton profil")
          .openPopup();

        map.setView([lat, lng], 13);
      }

      alert("Artiste créé 🔥");
      location.reload();

    } catch (error) {
      console.error("Erreur création artiste:", error);
      alert(error.message);
    }

  };

}

/* ================= SKILLS CLICK ================= */

const skills = document.querySelectorAll(".skill");

skills.forEach(skill => {
  skill.addEventListener("click", () => {
    skill.classList.toggle("active");
  });
});

/* ================= GET SKILLS ================= */

function getSelectedSkills() {
  return Array.from(document.querySelectorAll(".skill.active"))
    .map(s => s.innerText);
}

/* ================= PHOTO PREVIEW ================= */
const artistImage = document.getElementById("artistImage");
const previewImage = document.getElementById("previewImage");

if (artistImage && previewImage) {

  artistImage.addEventListener("change", (e) => {

    const file = e.target.files[0];

    if (!file) return;

    /* 🔥 PREVIEW IMAGE */
    const imageURL = URL.createObjectURL(file);
    previewImage.src = imageURL;

    /* 🔥 CLEAN MEMORY (IMPORTANT) */
    previewImage.onload = () => {
      URL.revokeObjectURL(imageURL);
    };

  });

}

/* ================= AUTOCOMPLETE ADRESSE ================= */

const addressInput = document.getElementById("artistAddress");
const suggestionsBox = document.getElementById("addressSuggestions");

let debounceTimeout;

if (addressInput && suggestionsBox) {

  addressInput.addEventListener("input", () => {

    clearTimeout(debounceTimeout);

    debounceTimeout = setTimeout(async () => {

      const query = addressInput.value.trim();

      if (query.length < 3) {
        suggestionsBox.innerHTML = "";
        return;
      }

      try {

        suggestionsBox.innerHTML = "<div class='suggestion-item'>Recherche...</div>";

        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=fr&format=json`
        );

        const data = await res.json();

        suggestionsBox.innerHTML = "";

        if (!data.length) {
          suggestionsBox.innerHTML = "<div class='suggestion-item'>Aucun résultat</div>";
          return;
        }

        data.slice(0, 5).forEach(place => {

          const div = document.createElement("div");
          div.className = "suggestion-item";
          div.innerText = place.display_name;

          div.onclick = () => {

            addressInput.value = place.display_name;

            /* 🔥 TRÈS IMPORTANT */
            addressInput.dataset.lat = place.lat;
            addressInput.dataset.lng = place.lon;

            suggestionsBox.innerHTML = "";

          };

          suggestionsBox.appendChild(div);

        });

      } catch (error) {
        console.error(error);
        suggestionsBox.innerHTML = "<div class='suggestion-item'>Erreur</div>";
      }

    }, 300);

  });

  /* 🔥 CLICK OUTSIDE */
  document.addEventListener("click", (e) => {
    if (!addressInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
      suggestionsBox.innerHTML = "";
    }
  });

}

/* ================= FILE PREVIEW ================= */

const artistFilesInput = document.getElementById("artistFiles");
const filePreview = document.getElementById("filePreview");

let selectedFiles = [];

if (artistFilesInput) {

  artistFilesInput.addEventListener("change", (e) => {

    const files = Array.from(e.target.files);

    if (files.length > 5) {
      alert("Maximum 5 fichiers");
      artistFilesInput.value = "";
      return;
    }

    selectedFiles = files;

    filePreview.innerHTML = "";

    files.forEach(file => {

      const div = document.createElement("div");
      div.style.fontSize = "12px";
      div.style.marginBottom = "5px";

      div.innerText = `📁 ${file.name}`;

      filePreview.appendChild(div);

    });

  });

}

/* ================= MAP ================= */
let map;
let markers = [];

function initMap() {

  /* 🔥 INIT MAP */
  map = L.map('map').setView([48.8566, 2.3522], 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  /* 🔥 GEOLOCALISATION */
  if (navigator.geolocation) {

    navigator.geolocation.getCurrentPosition(

      (position) => {

        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        /* CENTRER */
        map.setView([lat, lng], 13);

        /* MARKER USER */
        L.marker([lat, lng])
          .addTo(map)
          .bindPopup("📍 Vous êtes ici")
          .openPopup();

        /* 🔥 BONUS : cercle premium */
        L.circle([lat, lng], {
          radius: 500,
          color: "#00ff99",
          fillColor: "#00ff99",
          fillOpacity: 0.1
        }).addTo(map);

      },

      (error) => {

        console.warn("Erreur géolocalisation :", error);

        /* FALLBACK PARIS */
        map.setView([48.8566, 2.3522], 12);

      }

    );

  } else {

    console.warn("Géolocalisation non supportée");

    map.setView([48.8566, 2.3522], 12);

  }

  /* 🔥 LOAD ARTISTS */
  loadArtists();

}

/* ================= LOAD ALL ARTISTS ================= */
async function loadArtists() {

  try {

    if (!map) return;

    /* CLEAR MARKERS */
    markers.forEach(m => {
      if (m && map.hasLayer(m)) map.removeLayer(m);
    });
    markers = [];

    const snapshot = await getDocs(collection(db, "Artists"));

    const artistIcon = L.divIcon({
      html: `
        <div style="
          width:18px;
          height:18px;
          background:white;
          border-radius:50%;
          border:3px solid #D4AF37;
          box-shadow:0 0 8px rgba(212,175,55,0.4);
        "></div>
      `,
      className: ""
    });

    for (const docSnap of snapshot.docs) {

      const artist = docSnap.data();
      const id = docSnap.id;

      const lat = parseFloat(artist?.Location?.Lat);
      const lng = parseFloat(artist?.Location?.Lng);

      if (isNaN(lat) || isNaN(lng)) continue;

      /* ================= SERVICES (UNE SEULE FOIS) ================= */
      const servicesSnap = await getDocs(
        collection(db, "Artists", id, "Services")
      );

      let services = [];

      servicesSnap.forEach(doc => {
        const s = doc.data();
        if (!s?.IsActive) return;

        services.push({
          title: s.Title || "Service",
          price: s.Price || 0
        });
      });

      services.sort((a, b) => a.price - b.price);

      const servicesHTML = services.length
        ? services.slice(0, 3).map(s => `
            <div style="
              display:flex;
              justify-content:space-between;
              font-size:13px;
              padding:4px 0;
              border-bottom:1px solid #eee;
            ">
              <span>${s.title}</span>
              <span style="font-weight:600;">${s.price}€</span>
            </div>
          `).join("")
        : `<span style="font-size:12px;color:#999;">Aucun service</span>`;

      /* ================= REVIEWS ================= */
      const reviewsSnap = await getDocs(
        collection(db, "Artists", id, "Reviews")
      );

      let reviews = [];

      reviewsSnap.forEach(doc => {
        const r = doc.data();
        if (!r?.Comment) return;
        reviews.push(r);
      });

      const reviewsHTML = reviews.length
        ? reviews.slice(0, 2).map(r => `
            <div style="
              font-size:12px;
              padding:6px;
              background:#f9f9f9;
              border-radius:8px;
              margin-top:5px;
            ">
              ⭐ ${r.Rating || 0} — ${r.Comment}
            </div>
          `).join("")
        : `<span style="font-size:12px;color:#999;">Aucun avis</span>`;

      /* ================= MARKER ================= */
      const marker = L.marker([lat, lng], { icon: artistIcon }).addTo(map);

      const fullName = `${artist.FirstName || ""} ${artist.LastName || ""}`.trim();
      const stageName = artist.ArtistName || "Artiste";

      /* ================= POPUP ================= */
      marker.bindPopup(`
        <div style="width:260px;font-family:-apple-system;">
          
          <img src="${artist.profileImage || 'https://via.placeholder.com/300'}"
            style="
              width:100%;
              height:140px;
              object-fit:cover;
              border-radius:16px;
              margin-bottom:10px;
            " />

          <div style="font-size:16px;font-weight:600;">
            🎤 ${stageName}
          </div>

          <div style="font-size:13px;color:#666;margin-bottom:10px;">
            👤 ${fullName}
          </div>

          <div style="color:#D4AF37;font-size:13px;margin-bottom:10px;">
            ⭐ ${artist.Rating || 0} (${artist.reviewCount || 0})
          </div>

          <div style="font-size:13px;font-weight:600;">Services</div>

          <div style="
            background:#f9f9f9;
            border-radius:12px;
            padding:8px;
            margin-bottom:10px;
          ">
            ${servicesHTML}
          </div>

          <div style="font-size:13px;font-weight:600;">Avis</div>

          <div style="margin-bottom:10px;">
            ${reviewsHTML}
          </div>

          <button 
            onclick="window.location.href='artiste.html?id=${id}'"
            style="
              width:100%;
              padding:12px;
              background:#000;
              color:white;
              border:none;
              border-radius:12px;
              font-weight:600;
              cursor:pointer;
            ">
            Voir profil
          </button>

        </div>
      `);

      markers.push(marker);
    }

  } catch (error) {
    console.error("Erreur loadArtists:", error);
  }

}

      /* ================= UX PREMIUM ================= */

      let isHoverPopup = false;

      marker.on("mouseover", () => {
        marker.openPopup();
      });

      marker.on("mouseout", () => {
        setTimeout(() => {
          if (!isHoverPopup) marker.closePopup();
        }, 200);
      });

      marker.on("popupopen", () => {
        const popup = document.querySelector(".leaflet-popup");

        if (!popup) return;

        popup.addEventListener("mouseenter", () => {
          isHoverPopup = true;
        });

        popup.addEventListener("mouseleave", () => {
          isHoverPopup = false;
          marker.closePopup();
        });
      });

      marker.on("click", () => marker.openPopup());

      markers.push(marker);

    }

  } catch (error) {
    console.error("Erreur loadArtists:", error);
  }

}

/* ================= GEO CODE ================= */

async function getCoordsFromPostalCode(cp) {

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?postalcode=${cp}&country=France&format=json`
  );

  const data = await response.json();

  if (data.length === 0) return null;

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon)
  };
}

/* ================= DISTANCE ================= */

function getDistance(lat1, lon1, lat2, lon2) {

  const R = 6371;

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ================= FILTER ================= */
async function filterArtists(userLat, userLng) {

  const snapshot = await getDocs(collection(db, "Artists"));

  let artists = [];

  snapshot.forEach(docSnap => {

    const artist = docSnap.data();

    /* 🔥 CHECK DATA FIRESTORE */
    if (!artist.Location || !artist.Location.Lat || !artist.Location.Lng) return;

    const lat = parseFloat(artist.Location.Lat);
    const lng = parseFloat(artist.Location.Lng);

    const distance = getDistance(
      userLat,
      userLng,
      lat,
      lng
    );

    artists.push({
      id: docSnap.id,
      ...artist,
      distance
    });

  });

  /* 🔥 TRI PAR DISTANCE (AIRBNB STYLE) */
  artists.sort((a, b) => a.distance - b.distance);

  return artists;
}

/* ================= DISPLAY ================= */
function clearMarkers() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];
}

function displayArtists(artists) {

  clearMarkers();

  artists.forEach(artist => {

    /* 🔥 SÉCURITÉ */
    if (!artist.Location) return;

    const lat = parseFloat(artist.Location.Lat);
    const lng = parseFloat(artist.Location.Lng);

    if (isNaN(lat) || isNaN(lng)) return;

    const marker = L.marker([lat, lng]).addTo(map);

    marker.bindPopup(`
      <div style="text-align:center;">
        
        <img src="${artist.profileImage || 'https://via.placeholder.com/100'}"
        style="width:80px;height:80px;border-radius:50%;object-fit:cover;" />

        <h3>${artist.Username || "Artiste"}</h3>

        <p>⭐ ${artist.Rating || 0}</p>

        <p>
          📍 ${
            artist.distance 
            ? artist.distance.toFixed(1) + " km"
            : "Distance inconnue"
          }
        </p>

        <button 
          onclick="window.location.href='artiste.html?id=${artist.id}'"
          style="margin-top:10px;padding:8px 12px;background:#00ff99;border:none;border-radius:8px;color:black;font-weight:bold;">
          Voir profil
        </button>

      </div>
    `);

    markers.push(marker);

  });
}

/* ================= SEARCH ================= */
const searchBtn = document.getElementById("searchBtn");

if (searchBtn) {
  searchBtn.onclick = async () => {

    const cp = document.getElementById("searchInput").value;

    if (!cp) return alert("Entre un code postal");

    const coords = await getCoordsFromPostalCode(cp);

    if (!coords) return alert("Code postal invalide");

    map.setView([coords.lat, coords.lng], 13);

    const artists = await filterArtists(coords.lat, coords.lng);

    displayArtists(artists);
  };
}


/* ================= USER DROPDOWN ================= */

const userToggle = document.getElementById("userToggle");
const userDropdown = document.getElementById("userDropdown");

if (userToggle && userDropdown) {

  userToggle.onclick = (e) => {
    e.stopPropagation();
    userDropdown.classList.toggle("active");
  };

  document.addEventListener("click", () => {
    userDropdown.classList.remove("active");
  });

}

/* ================= LOGOUT ================= */

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.onclick = async () => {
    await signOut(auth);
    location.reload();
  };
}

/* ================= Fiche artiste ================= */
async function getArtistServices(artistId) {

  const snapshot = await getDocs(
    collection(db, "Artists", artistId, "Services")
  );

  let services = [];

  snapshot.forEach(doc => {
    const data = doc.data();

    if (!data.IsActive) return; // optionnel

    services.push({
      title: data.Title,
      price: data.Price,
      description: data.Description
    });
  });

  return services;
}

/* ================= INIT ================= */

window.addEventListener("DOMContentLoaded", () => {
  initMap();
}); 
