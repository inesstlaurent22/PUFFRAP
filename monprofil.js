/* ================= IMPORTS FIREBASE ================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  updateEmail,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  arrayUnion
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

/* ================= CONFIG FIREBASE ================= */

const firebaseConfig = {
  apiKey: "TON_API_KEY",
  authDomain: "TON_PROJECT.firebaseapp.com",
  projectId: "TON_PROJECT",
  storageBucket: "TON_PROJECT.appspot.com",
  appId: "TON_APP_ID"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

/* ================= USER GLOBAL ================= */

let currentUser = null;

/* ================= ELEMENTS ================= */

const preview = document.getElementById("profilePreview");
const inputFile = document.getElementById("profileImage");
const uploadBtn = document.getElementById("uploadBtn");
const mediaInput = document.getElementById("mediaInput");
const mediaPreview = document.getElementById("mediaPreview");
const productsList = document.getElementById("productsList");

let mediaFiles = [];

document.getElementById("loader").style.display = "none";

/* ================= AUTH CHECK ================= */

let authChecked = false;

const loader = document.getElementById("loader");

loader.style.display = "flex";

onAuthStateChanged(auth, (user) => {

  loader.style.display = "none";

  if (user) {
    currentUser = user;
  } else {
    console.warn("Utilisateur non connecté");
    
    // ✅ OPTION : afficher un message
    alert("Tu n'es pas connecté");
  }

});

document.getElementById("backMenu")?.addEventListener("click", () => {
  window.location.href = "application.html";
});

/* ================= PHOTO ================= */

uploadBtn?.addEventListener("click", () => inputFile?.click());

inputFile?.addEventListener("change", () => {
  const file = inputFile.files?.[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    if (preview) preview.src = reader.result;
    localStorage.setItem("photo", reader.result);
  };

  reader.readAsDataURL(file);
});

/* ================= MEDIA ================= */

mediaInput?.addEventListener("change", () => {
  const files = Array.from(mediaInput.files || []);

  if (mediaFiles.length + files.length > 5) {
    alert("Max 5 fichiers");
    return;
  }

  files.forEach(file => {
    mediaFiles.push(file);

    const url = URL.createObjectURL(file);

    if (file.type.includes("video")) {
      const video = document.createElement("video");
      video.src = url;
      video.controls = true;
      mediaPreview?.appendChild(video);
    }

    if (file.type.includes("audio")) {
      const audio = document.createElement("audio");
      audio.src = url;
      audio.controls = true;
      mediaPreview?.appendChild(audio);
    }
  });
});

/* ================= PRODUITS ================= */

document.getElementById("addProduct")?.addEventListener("click", () => {
  const div = document.createElement("div");
  div.className = "product";

  div.innerHTML = `
    <input placeholder="Nom produit">
    <input type="number" placeholder="Prix">
  `;

  productsList?.appendChild(div);
});

/* ================= UPLOAD MEDIA FIREBASE ================= */

async function uploadMediaFiles(uid) {
  for (const file of mediaFiles) {
    try {
      const storageRef = ref(storage, `artists/${uid}/${file.name}`);

      await uploadBytes(storageRef, file);

      const url = await getDownloadURL(storageRef);

      await updateDoc(doc(db, "users", uid), {
        media: arrayUnion({
          name: file.name,
          url,
          type: file.type
        })
      });

    } catch (e) {
      console.error("Erreur upload fichier:", e);
    }
  }
}

/* ================= SAVE ================= */

document.getElementById("saveProfile")?.addEventListener("click", async () => {

  const user = currentUser;

  if (!user) {
    alert("Utilisateur non connecté");
    return;
  }

  const nom = document.getElementById("nom")?.value || "";
  const prenom = document.getElementById("prenom")?.value || "";
  const email = document.getElementById("email")?.value || "";
  const metier = document.getElementById("metier")?.value || "";
  const instagram = document.getElementById("instagram")?.value || "";
  const portfolio = document.getElementById("portfolio")?.value || "";
  const tiktok = document.getElementById("tiktok")?.value || "";

  /* ===== PRODUITS ===== */
  const products = [];

  document.querySelectorAll(".product").forEach(p => {
    const inputs = p.querySelectorAll("input");

    const name = inputs[0]?.value.trim();
    const price = parseFloat(inputs[1]?.value);

    if (name && !isNaN(price)) {
      products.push({ name, price });
    }
  });

  /* ===== LOCAL STORAGE ===== */
  const data = {
    nom,
    prenom,
    email,
    metier,
    instagram,
    portfolio,
    tiktok,
    products
  };

  localStorage.setItem("profile", JSON.stringify(data));

  try {

    /* 🔐 UPDATE EMAIL */
    try {
      if (email && email !== user.email) {
        await updateEmail(user, email);
      }
    } catch (e) {
      console.warn("Email non modifié :", e.message);
    }

    /* 🔥 FIRESTORE */
    await setDoc(doc(db, "users", user.uid), {
      role: "artist",
      email,
      profile: {
        firstName: prenom,
        lastName: nom,
        metier
      },
      socialLinks: {
        instagram,
        portfolio,
        tiktok
      },
      products,
      updatedAt: new Date()
    }, { merge: true });

    /* 🎵 UPLOAD MEDIA */
    if (mediaFiles.length > 0) {
      await uploadMediaFiles(user.uid);
    }

    alert("Profil enregistré ✅");

  } catch (e) {
    console.error("Erreur Firebase:", e);
    alert("Erreur : " + e.message);
  }

});

/* ================= LOAD ================= */

window.addEventListener("load", () => {

  let data = null;

  try {
    data = JSON.parse(localStorage.getItem("profile"));
  } catch (e) {
    console.error("Erreur parsing localStorage:", e);
  }

  const nomInput = document.getElementById("nom");
  const prenomInput = document.getElementById("prenom");
  const emailInput = document.getElementById("email");
  const metierInput = document.getElementById("metier");
  const instagramInput = document.getElementById("instagram");
  const portfolioInput = document.getElementById("portfolio");
  const tiktokInput = document.getElementById("tiktok");

  if (data) {
    nomInput && (nomInput.value = data.nom || "");
    prenomInput && (prenomInput.value = data.prenom || "");
    emailInput && (emailInput.value = data.email || "");
    metierInput && (metierInput.value = data.metier || "");
    instagramInput && (instagramInput.value = data.instagram || "");
    portfolioInput && (portfolioInput.value = data.portfolio || "");
    tiktokInput && (tiktokInput.value = data.tiktok || "");
  }

  const photo = localStorage.getItem("photo");
  if (photo && preview) preview.src = photo;

  if (data?.products && productsList) {
    data.products.forEach(p => {
      const div = document.createElement("div");
      div.className = "product";

      div.innerHTML = `
        <input value="${p.name || ""}" placeholder="Nom produit">
        <input type="number" value="${p.price || ""}" placeholder="Prix">
      `;

      productsList.appendChild(div);
    });
  }
});

/* ================= LOGOUT ================= */

document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  localStorage.clear();
  await signOut(auth);
  window.location.href = "application.html";
});
