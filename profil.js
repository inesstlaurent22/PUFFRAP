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

    try {

      currentUser = user;

      const docRef = doc(db, "Artists", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) return;

      const data = docSnap.data();

      /* 🔥 SAFE GET ELEMENT */
      const setValue = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.value = value || "";
      };

      const setSrc = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.src = value || "";
      };

      /* ================= REMPLISSAGE ================= */

      setValue("username", data.Username);
      setSrc("profileImage", data.profileImage);

      setValue("artistFirstName", data.FirstName);
      setValue("artistLastName", data.LastName);

      setValue("artistEmail", data.Email);

      setValue("artistAddress", data.Location?.Address);

      /* ================= SOCIALS ================= */

      setValue("artistInstagram", data.Socials?.Instagram);
      setValue("artistTiktok", data.Socials?.TikTok);
      setValue("artistPortfolio", data.Socials?.Portfolio);

      /* ================= SKILLS ================= */

      document.querySelectorAll(".skill").forEach(skill => {
        skill.classList.remove("active"); // reset propre

        if (data.Skills?.includes(skill.innerText)) {
          skill.classList.add("active");
        }
      });

      /* ================= LOAD DATA ================= */

      await loadServices();
      await loadCreations();

    } catch (error) {
      console.error("Erreur loadProfile:", error);
    }

  });

}

/* ================= LOAD SERVICES ================= */
async function loadServices() {

  const container = document.getElementById("servicesList");
  if (!container || !currentUser) return;

  container.innerHTML = "";

  try {

    const snapshot = await getDocs(
      collection(db, "Artists", currentUser.uid, "Services")
    );

    snapshot.forEach(docSnap => {

      const s = docSnap.data();
      const id = docSnap.id;

      const div = document.createElement("div");
      div.className = "service-card";

      /* 🔥 IMPORTANT : ID FIRESTORE */
      div.dataset.id = id;

      div.innerHTML = `
        <input class="title" value="${s.Title || ""}" placeholder="Titre"/>
        <input class="price" value="${s.Price || ""}" placeholder="Prix"/>
        <input class="desc" value="${s.Description || ""}" placeholder="Description"/>

        <input class="mp3" value="${s.mp3 || ""}" placeholder="Lien MP3"/>
        <input class="mp4" value="${s.mp4 || ""}" placeholder="Lien MP4"/>
        <input class="mov" value="${s.mov || ""}" placeholder="Lien MOV"/>

        <button class="delete-service">Supprimer</button>
      `;

      /* 🔥 DELETE SERVICE */
      div.querySelector(".delete-service").onclick = async () => {
        try {
          await deleteDoc(
            doc(db, "Artists", currentUser.uid, "Services", id)
          );
          div.remove();
        } catch (error) {
          console.error("Erreur suppression:", error);
        }
      };

      container.appendChild(div);

    });

  } catch (error) {
    console.error("Erreur loadServices:", error);
  }

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
const addServiceBtn = document.getElementById("addService");

if (addServiceBtn) {
  addServiceBtn.onclick = () => {

    const container = document.getElementById("servicesList");

    const div = document.createElement("div");
    div.className = "service-card";
    div.dataset.id = "";

    div.innerHTML = `
      <input class="title" placeholder="Nom du service"/>
      <input class="price" placeholder="Prix"/>
      <input class="desc" placeholder="Description"/>

      <button class="delete-service">Supprimer</button>
    `;

    div.querySelector(".delete-service").onclick = () => div.remove();

    container.appendChild(div);
  };
}

const addCreationBtn = document.getElementById("addCreation");

if (addCreationBtn) {
  addCreationBtn.onclick = () => {

    const container = document.getElementById("creationsList");

    const div = document.createElement("div");
    div.className = "service-card";

    div.innerHTML = `
      <input class="creation-title" placeholder="Titre"/>
      <input class="creation-url" placeholder="Lien (mp3/mp4)"/>

      <button class="delete-creation">Supprimer</button>
    `;

    div.querySelector(".delete-creation").onclick = () => div.remove();

    container.appendChild(div);
  };
}

/* ================= SAVE PROFILE ================= */

async function saveProfile() {
  try {

    if (!currentUser) return alert("Utilisateur non connecté");

    const username = document.getElementById("username").value;
    const email = currentUser.email;

    const skills = Array.from(document.querySelectorAll(".skill.active"))
      .map(s => s.innerText);

    const instagram = document.getElementById("artistInstagram").value;
    const tiktok = document.getElementById("artistTiktok").value;
    const portfolio = document.getElementById("artistPortfolio").value;

    /* ================= IMAGE ================= */
    const file = document.getElementById("uploadImage").files[0];
    let imageUrl = document.getElementById("profileImage").src;

    if (file) {
      const storageRef = ref(storage, `artists/${currentUser.uid}/profile.jpg`);
      await uploadBytes(storageRef, file);
      imageUrl = await getDownloadURL(storageRef);
    }

    /* ================= UPDATE ARTIST ================= */
    await setDoc(doc(db, "Artists", currentUser.uid), {
      UserID: currentUser.uid,
      Username: username,
      Email: email,

      FirstName: document.getElementById("artistFirstName").value,
      LastName: document.getElementById("artistLastName").value,

      profileImage: imageUrl,

      Location: {
        Lat: 0,
        Lng: 0,
        Address: document.getElementById("artistAddress").value
      },

      Skills: skills,

      Socials: {
        Instagram: instagram,
        TikTok: tiktok,
        Portfolio: portfolio
      }

    }, { merge: true });

    /* ================= SAVE SERVICES (SMART) ================= */

    const services = document.querySelectorAll(".service-card");

    for (const s of services) {

      const id = s.dataset.id; // 🔥 IMPORTANT

      const title = s.querySelector(".title").value;
      const price = parseFloat(s.querySelector(".price").value);
      const desc = s.querySelector(".desc").value;

      const mp3 = s.querySelector(".mp3").value;
      const mp4 = s.querySelector(".mp4").value;
      const mov = s.querySelector(".mov").value;

      /* 🔥 VALIDATION */
      if (!title || isNaN(price)) continue;

      if (id) {
        /* 🔥 UPDATE EXISTING */
        await setDoc(
          doc(db, "Artists", currentUser.uid, "Services", id),
          {
            Title: title,
            Price: price,
            Description: desc,
            mp3,
            mp4,
            mov,
            IsActive: true
          },
          { merge: true }
        );

      } else {
        /* 🔥 CREATE NEW */
        const newDoc = await addDoc(
          collection(db, "Artists", currentUser.uid, "Services"),
          {
            Title: title,
            Price: price,
            Description: desc,
            mp3,
            mp4,
            mov,
            IsActive: true,
            CreatedAt: new Date()
          }
        );

        /* 🔥 UPDATE ID FRONT */
        s.dataset.id = newDoc.id;
      }

    }

    alert("Profil mis à jour 🔥");

  } catch (error) {
    console.error("Erreur saveProfile:", error);
    alert("Erreur lors de la sauvegarde");
  }

};

/* ================= SAVE CREATIONS ================= */

const creations = document.querySelectorAll(".service-card");

for (const c of creations) {

  const title = c.querySelector(".creation-title");
  const url = c.querySelector(".creation-url");

  if (!title || !url) continue;

  if (!title.value || !url.value) continue;

  await addDoc(
    collection(db, "Artists", currentUser.uid, "Creations"),
    {
      Title: title.value,
      FileURL: url.value,
      IsActive: true,
      CreatedAt: new Date()
    }
  );
}

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

window.addEventListener("DOMContentLoaded", () => {

  loadProfile();

  /* 🔥 BOUTON RETOUR */
  const backBtn = document.getElementById("backBtn");

  if (backBtn) {
    backBtn.onclick = () => {
      window.location.href = "index.html";
    };
  }

  /* 🔥 SKILLS */
  document.querySelectorAll(".skill").forEach(skill => {
    skill.onclick = () => skill.classList.toggle("active");
  });

  /* 🔥 ADD SERVICE */
  // ton code

  /* 🔥 SAVE */
  document.getElementById("saveProfile").onclick = saveProfile;

});

/* ================= INIT ================= */
window.addEventListener("DOMContentLoaded", loadProfile);
