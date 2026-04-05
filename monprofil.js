const preview = document.getElementById("profilePreview");
const inputFile = document.getElementById("profileImage");
const uploadBtn = document.getElementById("uploadBtn");
const mediaInput = document.getElementById("mediaInput");
const mediaPreview = document.getElementById("mediaPreview");
const productsList = document.getElementById("productsList");

let mediaFiles = [];

/* PHOTO */
uploadBtn.onclick = () => inputFile.click();

inputFile.onchange = () => {
  const file = inputFile.files[0];
  const reader = new FileReader();

  reader.onload = () => {
    preview.src = reader.result;
    localStorage.setItem("photo", reader.result);
  };

  reader.readAsDataURL(file);
};

/* MEDIA */
mediaInput.onchange = () => {
  const files = Array.from(mediaInput.files);

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
      mediaPreview.appendChild(video);
    }

    if (file.type.includes("audio")) {
      const audio = document.createElement("audio");
      audio.src = url;
      audio.controls = true;
      mediaPreview.appendChild(audio);
    }
  });
};

/* PRODUITS */
document.getElementById("addProduct").onclick = () => {
  const div = document.createElement("div");
  div.className = "product";

  div.innerHTML = `
    <input placeholder="Nom produit">
    <input type="number" placeholder="Prix">
  `;

  productsList.appendChild(div);
};

/* SAVE */
document.getElementById("saveProfile").onclick = () => {

  const data = {
    nom: nom.value,
    prenom: prenom.value,
    email: email.value,
    metier: metier.value,
    instagram: instagram.value,
    portfolio: portfolio.value,
    tiktok: tiktok.value
  };

  localStorage.setItem("profile", JSON.stringify(data));

  alert("Profil enregistré");
};

/* LOAD */
window.onload = () => {

  const data = JSON.parse(localStorage.getItem("profile"));

  if (data) {
    nom.value = data.nom || "";
    prenom.value = data.prenom || "";
    email.value = data.email || "";
    metier.value = data.metier || "";
    instagram.value = data.instagram || "";
    portfolio.value = data.portfolio || "";
    tiktok.value = data.tiktok || "";
  }

  const photo = localStorage.getItem("photo");
  if (photo) preview.src = photo;
};

/* LOGOUT */
document.getElementById("logoutBtn").onclick = () => {
  localStorage.clear();
  window.location.href = "application.html";
};
