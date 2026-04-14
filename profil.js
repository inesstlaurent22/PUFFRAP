import {
  getAuth,
  updateEmail,
  updatePassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const auth = getAuth();
const db = getFirestore();
const storage = getStorage();

let currentUser;

/* ================= LOAD PROFILE ================= */
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

function loadProfile() {

  onAuthStateChanged(auth, async (user) => {

    if (!user) {
      alert("Non connecté");
      window.location.href = "index.html";
      return;
    }

    currentUser = user;

    const docRef = doc(db, "Artists", user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return;

    const data = docSnap.data();

    /* 🔥 REMPLISSAGE */
    document.getElementById("username").value = data.Username || "";
    document.getElementById("profileImage").src = data.profileImage || "";

    document.getElementById("artistFirstName").value = data.FirstName || "";
    document.getElementById("artistLastName").value = data.LastName || "";

    document.getElementById("artistEmail").value = data.Email || "";

    document.getElementById("artistAddress").value = data.Location?.Address || "";

    /* 🔥 SOCIALS */
    document.getElementById("artistInstagram").value = data.Socials?.Instagram || "";
    document.getElementById("artistTiktok").value = data.Socials?.TikTok || "";
    document.getElementById("artistPortfolio").value = data.Socials?.Portfolio || "";

    /* 🔥 SKILLS */
    document.querySelectorAll(".skill").forEach(skill => {
      if (data.Skills?.includes(skill.innerText)) {
        skill.classList.add("active");
      }
    });

    loadServices();
    loadCreations();

  });

}

/* ================= LOAD SERVICES ================= */
async function loadServices() {

  const container = document.getElementById("servicesList");
  container.innerHTML = "";

  const snapshot = await getDocs(
    collection(db, "Artists", currentUser.uid, "Services")
  );

  snapshot.forEach(docSnap => {

    const s = docSnap.data();

    const div = document.createElement("div");
    div.className = "service-card";

    div.innerHTML = `
      <input class="title" value="${s.Title}" placeholder="Titre"/>
      <input class="price" value="${s.Price}" placeholder="Prix"/>
      <input class="desc" value="${s.Description || ""}" placeholder="Description"/>

      <input class="mp3" value="${s.mp3 || ""}" placeholder="Lien MP3"/>
      <input class="mp4" value="${s.mp4 || ""}" placeholder="Lien MP4"/>
      <input class="mov" value="${s.mov || ""}" placeholder="Lien MOV"/>
    `;

    container.appendChild(div);

  });

}

async function loadCreations() {

  const container = document.getElementById("creationsList");
  container.innerHTML = "";

  const snapshot = await getDocs(
    collection(db, "Artists", currentUser.uid, "Creations")
  );

  snapshot.forEach(doc => {

    const c = doc.data();

    const div = document.createElement("div");
    div.className = "service-card";

    div.innerHTML = `
      <input class="title" value="${c.title}" placeholder="Titre"/>
      <input class="url" value="${c.url}" placeholder="Lien média"/>
    `;

    container.appendChild(div);

  });

}

/* ================= ADD SERVICE ================= */
document.getElementById("addService").onclick = () => {

  const container = document.getElementById("servicesList");

  const div = document.createElement("div");
  div.className = "service-card";

  div.innerHTML = `
    <input class="title" placeholder="Titre"/>
    <input class="price" placeholder="Prix"/>
    <input class="desc" placeholder="Description"/>
    <input class="mp3" placeholder="Lien MP3"/>
    <input class="mp4" placeholder="Lien MP4"/>
    <input class="mov" placeholder="Lien MOV"/>
  `;

  container.appendChild(div);
};

/* ================= SAVE PROFILE ================= */
/* ================= SAVE PROFILE ================= */
document.getElementById("saveProfile").onclick = async () => {

  const username = document.getElementById("username").value;

  /* 🔥 IMAGE */
  const file = document.getElementById("uploadImage").files[0];
  let imageUrl = "";

  if (file) {
    const storageRef = ref(storage, `artists/${currentUser.uid}/profile.jpg`);
    await uploadBytes(storageRef, file);
    imageUrl = await getDownloadURL(storageRef);
  }

  /* 🔥 UPDATE ARTIST */
  await setDoc(doc(db, "Artists", user.uid), {
  UserID: user.uid,

  /* 🔥 INFOS */
  Username: username,
  Email: email,
  FirstName: document.getElementById("artistFirstName").value,
  LastName: document.getElementById("artistLastName").value,

  profileImage: imageUrl,

  /* 🔥 LOCALISATION */
  Location: {
    Lat: lat,
    Lng: lng,
    Address: document.getElementById("artistAddress").value
  },

  /* 🔥 COMPÉTENCES */
  Skills: skills,

  /* 🔥 SOCIALS */
  Socials: {
    Instagram: instagram,
    TikTok: tiktok,
    Portfolio: portfolio
  },

  /* 🔥 META */
  Rating: 0,
  reviewCount: 0,
  isAvailable: true,
  CreatedAt: new Date()

});

  /* 🔥 SAVE SERVICES */
  const services = document.querySelectorAll(".service-card");

  for (const s of services) {

    const title = s.querySelector(".title").value;
    const price = parseFloat(s.querySelector(".price").value);

    const desc = s.querySelector(".desc").value;
    const mp3 = s.querySelector(".mp3").value;
    const mp4 = s.querySelector(".mp4").value;
    const mov = s.querySelector(".mov").value;

    await addDoc(collection(db, "Artists", currentUser.uid, "Services"), {
      Title: title,
      Price: price,
      Description: desc,
      mp3,
      mp4,
      mov,
      IsActive: true,
      CreatedAt: new Date()
    });

  }

  alert("Profil mis à jour 🔥");
};


/* ================= CHANGE EMAIL ================= */
document.getElementById("changeEmail").onclick = async () => {
  const newEmail = prompt("Nouveau email");

  if (!newEmail) return;

  await updateEmail(auth.currentUser, newEmail);

  alert("Email mis à jour");
};

/* ================= CHANGE PASSWORD ================= */
document.getElementById("changePassword").onclick = async () => {
  const newPassword = prompt("Nouveau mot de passe");

  if (!newPassword) return;

  await updatePassword(auth.currentUser, newPassword);

  alert("Mot de passe mis à jour");
};

/* ================= INIT ================= */
window.addEventListener("DOMContentLoaded", loadProfile);
