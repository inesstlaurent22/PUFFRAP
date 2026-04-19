import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ================= INIT ================= */

const auth = getAuth();
const db = getFirestore();

const params = new URLSearchParams(window.location.search);
const artistId = params.get("id");

/* ================= LOAD ARTIST ================= */

function loadArtist() {

  onAuthStateChanged(auth, async () => {

    try {

      if (!artistId) {
        alert("Aucun artiste spécifié");
        window.location.href = "index.html";
        return;
      }

      const docRef = doc(db, "Artists", artistId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        alert("Artiste introuvable");
        window.location.href = "index.html";
        return;
      }

      const data = docSnap.data();

      /* ================= NOM ================= */
      const fullName = `${data.FirstName || ""} ${data.LastName || ""}`.trim();
      const stageName = data.ArtistName || "Artiste";

      document.getElementById("displayStageName").innerText = stageName;
      document.getElementById("displayFullName").innerText = fullName;

      /* ================= IMAGES ================= */
      document.getElementById("profileImage").src =
        data.profileImage || "https://via.placeholder.com/300";

      document.getElementById("coverImage").src =
        data.profileImage || "https://via.placeholder.com/800x300";

      /* ================= SOCIALS ================= */
      if (data.Socials) {

        const insta = document.getElementById("linkInstagram");
        const tiktok = document.getElementById("linkTiktok");
        const portfolio = document.getElementById("linkPortfolio");

        if (data.Socials.Instagram) {
          insta.href = data.Socials.Instagram;
          insta.style.display = "inline-block";
        } else {
          insta.style.display = "none";
        }

        if (data.Socials.TikTok) {
          tiktok.href = data.Socials.TikTok;
          tiktok.style.display = "inline-block";
        } else {
          tiktok.style.display = "none";
        }

        if (data.Socials.Portfolio) {
          portfolio.href = data.Socials.Portfolio;
          portfolio.style.display = "inline-block";
        } else {
          portfolio.style.display = "none";
        }

      }

      /* ================= LOAD DATA ================= */
      await loadCreations();
      await loadServices();

    } catch (error) {
      console.error("Erreur loadArtist:", error);
      alert("Erreur lors du chargement du profil");
    }

  });

}

/* ================= CREATIONS ================= */

async function loadCreations() {

  const container = document.getElementById("creationsList");
  container.innerHTML = "";

  const snapshot = await getDocs(
    collection(db, "Artists", artistId, "Creations")
  );

  if (snapshot.empty) {
    container.innerHTML = "<p style='color:#888;'>Aucune création</p>";
    return;
  }

  snapshot.forEach(docSnap => {

    const c = docSnap.data();

    const div = document.createElement("div");

    /* 🎧 AUDIO */
    if (c.Type === "mp3") {
      div.innerHTML = `
        <audio controls>
          <source src="${c.FileURL}">
        </audio>
      `;
    }

    /* 🎬 VIDEO */
    if (c.Type === "mp4" || c.Type === "mov") {
      div.innerHTML = `
        <video controls>
          <source src="${c.FileURL}">
        </video>
      `;
    }

    container.appendChild(div);

  });

}

/* ================= SERVICES ================= */

async function loadServices() {

  const container = document.getElementById("servicesList");
  container.innerHTML = "";

  const snapshot = await getDocs(
    collection(db, "Artists", artistId, "Services")
  );

  if (snapshot.empty) {
    container.innerHTML = "<p style='color:#888;'>Aucun service</p>";
    return;
  }

  snapshot.forEach(docSnap => {

    const s = docSnap.data();

    const div = document.createElement("div");

    div.innerHTML = `
      <div style="font-weight:600;">${s.Title || "Service"}</div>
      <div style="color:#D4AF37;">${s.Price || 0}€</div>
      <div style="font-size:13px;color:#aaa;">
        ${s.Description || ""}
      </div>
    `;

    container.appendChild(div);

  });

}

/* ================= INIT ================= */

window.addEventListener("DOMContentLoaded", loadArtist);
