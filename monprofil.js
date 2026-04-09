/* ================= IMPORTS FIREBASE ================= */

import { getAuth, onAuthStateChanged, updateEmail } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const auth = getAuth();
const db = getFirestore();
const storage = getStorage();

/* ================= ELEMENTS ================= */

const preview = document.getElementById("profilePreview");
const inputFile = document.getElementById("profileImage");
const uploadBtn = document.getElementById("uploadBtn");
const mediaInput = document.getElementById("mediaInput");
const mediaPreview = document.getElementById("mediaPreview");
const productsList = document.getElementById("productsList");

let mediaFiles = [];

/* ================= AUTH CHECK ================= */

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "application.html";
  }
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

  setTimeout(() => div.querySelector("input")?.focus(), 50);
});

/* ================= UPLOAD MEDIA FIREBASE ================= */

async function uploadMediaFiles(uid) {
  for (const file of mediaFiles) {

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
  }
}

/* ================= SAVE ================= */

document.getElementById("saveProfile")?.addEventListener("click", async () => {

  const user = auth.currentUser;

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

    /* 🔐 UPDATE EMAIL AUTH */
    if (email && email !== user.email) {
      await updateEmail(user, email);
    }

    /* 🔥 FIRESTORE STRUCTURE PROPRE */
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
    if (nomInput) nomInput.value = data.nom || "";
    if (prenomInput) prenomInput.value = data.prenom || "";
    if (emailInput) emailInput.value = data.email || "";
    if (metierInput) metierInput.value = data.metier || "";
    if (instagramInput) instagramInput.value = data.instagram || "";
    if (portfolioInput) portfolioInput.value = data.portfolio || "";
    if (tiktokInput) tiktokInput.value = data.tiktok || "";
  }

  /* PHOTO */
  const photo = localStorage.getItem("photo");
  if (photo && preview) preview.src = photo;

  /* PRODUITS */
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

document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.clear();
  auth.signOut();
  window.location.href = "application.html";
});
