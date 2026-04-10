import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* CONFIG FIREBASE */
const firebaseConfig = {
  apiKey: "XXX",
  authDomain: "XXX",
  projectId: "XXX",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* 🔥 RÉCUPÉRER ID */
const params = new URLSearchParams(window.location.search);
const artistId = params.get("id");

/* 🔥 LOAD PROFIL */
async function loadProfile() {

  const docRef = doc(db, "artists", artistId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {

    const artist = docSnap.data();

    document.getElementById("profileImage").src =
      artist.profileImage || "https://via.placeholder.com/150";

    document.getElementById("username").innerText = artist.username;
    document.getElementById("city").innerText = artist.city;
    document.getElementById("description").innerText = artist.description;
    document.getElementById("rating").innerText = "⭐ " + artist.rating;

  }
}

/* 🔥 LOAD PORTFOLIO */
async function loadPortfolio() {

  const container = document.getElementById("portfolioContainer");

  const snapshot = await getDocs(collection(db, "artists", artistId, "portfolio"));

  snapshot.forEach(doc => {

    const item = doc.data();

    let media = "";

    if (item.type === "audio") {
      media = `<audio controls src="${item.fileURL}"></audio>`;
    }

    if (item.type === "video") {
      media = `<video controls src="${item.fileURL}"></video>`;
    }

    container.innerHTML += `
      <div class="card">
        <h4>${item.title}</h4>
        ${media}
      </div>
    `;
  });
}

/* 🔥 INIT */
loadProfile();
loadPortfolio();
