const profileImage = document.getElementById("profileImage");
const profilePreview = document.getElementById("profilePreview");
const mediaInput = document.getElementById("mediaInput");
const mediaPreview = document.getElementById("mediaPreview");
const addProductBtn = document.getElementById("addProduct");
const productsList = document.getElementById("productsList");
const saveBtn = document.getElementById("saveProfile");

let mediaFiles = [];
let products = [];

/* ================= PHOTO ================= */
profileImage.addEventListener("change", () => {
  const file = profileImage.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      profilePreview.src = reader.result;
      localStorage.setItem("profileImage", reader.result);
    };
    reader.readAsDataURL(file);
  }
});

/* ================= MEDIAS ================= */
mediaInput.addEventListener("change", () => {
  const files = Array.from(mediaInput.files);

  if (mediaFiles.length + files.length > 5) {
    alert("Max 5 médias !");
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
    } else if (file.type.includes("audio")) {
      const audio = document.createElement("audio");
      audio.src = url;
      audio.controls = true;
      mediaPreview.appendChild(audio);
    }
  });
});

/* ================= PRODUITS ================= */
addProductBtn.addEventListener("click", () => {
  const div = document.createElement("div");
  div.className = "product";

  const name = document.createElement("input");
  name.placeholder = "Nom du produit";

  const price = document.createElement("input");
  price.placeholder = "Prix (€)";
  price.type = "number";

  div.appendChild(name);
  div.appendChild(price);

  productsList.appendChild(div);
});

/* ================= SAVE ================= */
saveBtn.addEventListener("click", () => {

  const profileData = {
    nom: document.getElementById("nom").value,
    prenom: document.getElementById("prenom").value,
    username: document.getElementById("username").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
    metier: document.getElementById("metier").value,
    instagram: document.getElementById("instagram").value,
    portfolio: document.getElementById("portfolio").value,
    tiktok: document.getElementById("tiktok").value,
    products: []
  };

  const productDivs = document.querySelectorAll(".product");

  productDivs.forEach(div => {
    const inputs = div.querySelectorAll("input");
    profileData.products.push({
      name: inputs[0].value,
      price: inputs[1].value
    });
  });

  localStorage.setItem("profileData", JSON.stringify(profileData));

  alert("Profil enregistré !");
});

/* ================= LOAD ================= */
window.onload = () => {
  const data = JSON.parse(localStorage.getItem("profileData"));

  if (data) {
    document.getElementById("nom").value = data.nom || "";
    document.getElementById("prenom").value = data.prenom || "";
    document.getElementById("username").value = data.username || "";
    document.getElementById("email").value = data.email || "";
    document.getElementById("password").value = data.password || "";
    document.getElementById("metier").value = data.metier || "";
    document.getElementById("instagram").value = data.instagram || "";
    document.getElementById("portfolio").value = data.portfolio || "";
    document.getElementById("tiktok").value = data.tiktok || "";

    if (data.products) {
      data.products.forEach(p => {
        const div = document.createElement("div");
        div.className = "product";

        const name = document.createElement("input");
        name.value = p.name;

        const price = document.createElement("input");
        price.value = p.price;

        div.appendChild(name);
        div.appendChild(price);

        productsList.appendChild(div);
      });
    }
  }

  const savedImage = localStorage.getItem("profileImage");
  if (savedImage) {
    profilePreview.src = savedImage;
  }
};
