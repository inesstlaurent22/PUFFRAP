const client = JSON.parse(localStorage.getItem("client"));

if(!client){
  alert("Aucun compte trouvé");
  window.location.href = "signup-client.html";
}

document.getElementById("infos").innerHTML = `
  <p>${client.prenom} ${client.nom}</p>
  <p>${client.email}</p>
`;

const favDiv = document.getElementById("favoris");
client.favoris.forEach(f => {
  favDiv.innerHTML += `<p>${f}</p>`;
});

const resDiv = document.getElementById("reservations");
client.reservations.forEach(r => {
  resDiv.innerHTML += `<p>${r}</p>`;
});
