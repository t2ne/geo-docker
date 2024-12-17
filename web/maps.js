const map = L.map("mapa").setView([41.5362, -8.7821], 13);

// Camada base OSM
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

// Camadas WMS
const wmsLayers = {
  pontos: L.tileLayer.wms("http://localhost:8081/geoserver/ecgmsig1/wms", {
    layers: "ecgmteste1:pontos",
    format: "image/png",
    transparent: true,
    attribution: "Pontos",
  }),
  linhas: L.tileLayer.wms("http://localhost:8081/geoserver/ecgmsig1/wms", {
    layers: "ecgmteste1:linhas",
    format: "image/png",
    transparent: true,
    attribution: "Linhas",
  }),
  poligonos: L.tileLayer.wms("http://localhost:8081/geoserver/ecgmsig1/wms", {
    layers: "ecgmteste1:poligonos",
    format: "image/png",
    transparent: true,
    attribution: "Polígonos",
  }),
};

// Exibir camadas por padrão
wmsLayers.pontos.addTo(map);

// Alternar visibilidade das camadas
function showLayer(layerName) {
  Object.values(wmsLayers).forEach((layer) => map.removeLayer(layer));
  wmsLayers[layerName].addTo(map);
}

// Funcionalidade de dropdown
function showDropdown() {
  const dropdown = document.getElementById("dropdown-menu");
  dropdown.style.display = "block";
}

function hideDropdown() {
  const dropdown = document.getElementById("dropdown-menu");
  dropdown.style.display = "none";
}

function selectOption(option) {
  const dropdown = document.getElementById("dropdown-menu");
  dropdown.style.display = "none"; // Fechar o dropdown após a seleção
  if (option === "calcular") {
    // Exibir opções de calcular
    document.getElementById("search-container").style.display = "block"; // Mostrar a barra de busca
    startCalculating(); // Iniciar a funcionalidade de calcular
  } else if (option === "mostrar") {
    // Exibir as opções padrão
    showLayer("pontos"); // Mostrar a camada de pontos
    document.getElementById("search-container").style.display = "block"; // Mostrar a barra de busca
  }
}

// Quando o cursor estiver sobre o menu ou dropdown, o dropdown permanece visível
const menuIcon = document.getElementById("menu-icon");
const dropdownMenu = document.getElementById("dropdown-menu");

menuIcon.addEventListener("mouseover", showDropdown);
menuIcon.addEventListener("mouseout", () => {
  if (!dropdownMenu.matches(":hover")) {
    hideDropdown();
  }
});

dropdownMenu.addEventListener("mouseover", showDropdown);
dropdownMenu.addEventListener("mouseout", hideDropdown);

// Calcular a distância entre dois pontos
let linePoints = [];
let polyline;

function startCalculating() {
  map.on("click", addPoint);
}

function addPoint(e) {
  linePoints.push(e.latlng);

  if (linePoints.length > 1) {
    if (polyline) map.removeLayer(polyline);
    polyline = L.polyline(linePoints, { color: "blue" }).addTo(map);

    const distance = linePoints[0].distanceTo(linePoints[1]).toFixed(2); // Distância em metros
    alert(`Distância entre os pontos: ${distance} metros`);
  }
}

// Calcular área de um polígono
let polygonPoints = [];
let polygon;

function startPolygonCalculation() {
  map.on("click", addPolygonPoint);
}

function addPolygonPoint(e) {
  polygonPoints.push(e.latlng);

  if (polygonPoints.length > 2) {
    if (polygon) map.removeLayer(polygon);
    polygon = L.polygon(polygonPoints).addTo(map);

    const area = L.GeometryUtil.geodesicArea(polygon.getLatLngs()[0]).toFixed(
      2
    ); // Área em metros quadrados
    alert(`Área do polígono: ${area} metros quadrados`);
  }
}

// Funcionalidade de busca (não implementada, mas a estrutura está pronta)
function searchFeatures() {
  const query = document.getElementById("searchBox").value.toLowerCase();
  console.log(`Buscando por: ${query}`);
  // Aqui você pode implementar a lógica de pesquisa por pontos, linhas e polígonos
}
