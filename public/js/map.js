
const mapDiv = document.getElementById("map");

if (mapDiv && mapDiv.dataset.lat && mapDiv.dataset.lng) {
  const lat = parseFloat(mapDiv.dataset.lat);
  const lng = parseFloat(mapDiv.dataset.lng);
  const address = mapDiv.dataset.address;

  const map = L.map("map").setView([lat, lng], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  L.marker([lat, lng])
    .addTo(map)
    .bindPopup(`<strong>${address}</strong>`)
    .openPopup();
}

