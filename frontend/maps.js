const map = L.map("mapa").setView([41.5362, -8.7821], 13);

// Base Layers
const roadsLayer = L.tileLayer(
  "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    attribution: "&copy; OpenStreetMap contributors",
  }
).addTo(map);

const satelliteLayer = L.tileLayer(
  "https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
  {
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
    attribution: "Google Satellite",
  }
);

const heatmapLayer = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  {
    attribution:
      "&copy; <a href='https://www.carto.com/'>CARTO</a> | Dark Heatmap",
  }
);

// WMS Layers
const praiasLayer = L.tileLayer
  .wms("http://localhost:8081/geoserver/wms", {
    layers: "tp-sig:praias",
    format: "image/png",
    transparent: true,
    attribution: "Praias de Esposende",
  })
  .addTo(map);

const entidadesLayer = L.tileLayer
  .wms("http://localhost:8081/geoserver/wms", {
    layers: "tp-sig:entidades",
    format: "image/png",
    transparent: true,
    attribution: "Edifícios de Esposende",
  })
  .addTo(map);

const estradasLayer = L.tileLayer
  .wms("http://localhost:8081/geoserver/wms", {
    layers: "tp-sig:estradas",
    format: "image/png",
    transparent: true,
    attribution: "Estradas de Esposende",
  })
  .addTo(map);

const poisLayer = L.tileLayer
  .wms("http://localhost:8081/geoserver/wms", {
    layers: "tp-sig:pois",
    format: "image/png",
    transparent: true,
    attribution: "Pontos de Interesse de Esposende",
  })
  .addTo(map);

const trilhosLayer = L.tileLayer
  .wms("http://localhost:8081/geoserver/wms", {
    layers: "tp-sig:trilhos",
    format: "image/png",
    transparent: true,
    attribution: "Trilhos de Esposende",
  })
  .addTo(map);

// Layer Control
const layerControl = L.control
  .layers(null, {
    Praias: praiasLayer,
    Entidades: entidadesLayer,
    Estradas: estradasLayer,
    "Pontos de Interesse": poisLayer,
    Trilhos: trilhosLayer,
  })
  .addTo(map);

// Scale Bar
L.control
  .scale({
    position: "bottomleft",
    imperial: false,
  })
  .addTo(map);

// Layer Selector
const baseLayers = {
  Roads: roadsLayer,
  Satellite: satelliteLayer,
  Heatmap: heatmapLayer,
};

// Create and configure the select dropdown
const layerSelectBox = document.createElement("select");
layerSelectBox.id = "layer-select";
layerSelectBox.style.position = "absolute";
layerSelectBox.style.top = "10px";
layerSelectBox.style.left = "1200px";
layerSelectBox.style.zIndex = "1000";
layerSelectBox.style.padding = "5px";
layerSelectBox.style.border = "1px solid #ccc";
layerSelectBox.style.borderRadius = "5px";
layerSelectBox.style.backgroundColor = "#fff";

// Populate the select box
Object.keys(baseLayers).forEach((layerName) => {
  const option = document.createElement("option");
  option.value = layerName;
  option.textContent = layerName;
  layerSelectBox.appendChild(option);
});

// Handle layer switching
layerSelectBox.addEventListener("change", (e) => {
  const selectedLayerName = e.target.value;
  // Remove all existing base layers
  Object.values(baseLayers).forEach((layer) => map.removeLayer(layer));
  // Add the selected base layer
  baseLayers[selectedLayerName].addTo(map);
});

// Add the select box to the DOM
document.body.appendChild(layerSelectBox);

// Existing map functionality and controls (unchanged)

// Control variables
let drawingMode = null;
let points = [];
let linePoints = [];
let polygonPoints = [];
let polyline, polygon;
let deleteMode = false;
let currentLocationMarker = null; // Marker for the current location of the user

// Function to toggle the visibility of the menu
function toggleMenu() {
  const menu = document.getElementById("buttons-menu");
  menu.style.display =
    menu.style.display === "none" || menu.style.display === ""
      ? "block"
      : "none";
}

// Toggle button states (active/inactive)
function toggleButton(type) {
  // Unmark all buttons
  document.getElementById("point-btn").classList.remove("active");
  document.getElementById("line-btn").classList.remove("active");
  document.getElementById("polygon-btn").classList.remove("active");

  // Activate the corresponding button
  if (type === "point") {
    drawingMode = "point";
    document.getElementById("point-btn").classList.add("active");
  } else if (type === "line") {
    drawingMode = "line";
    document.getElementById("line-btn").classList.add("active");
  } else if (type === "polygon") {
    drawingMode = "polygon";
    document.getElementById("polygon-btn").classList.add("active");
  }
}

// Add a point to the map
function addPoint(e) {
  if (drawingMode === "point") {
    const marker = L.marker(e.latlng).addTo(map);
    points.push(marker);
  }
}

// Draw a line
function drawLine(e) {
  if (drawingMode === "line") {
    linePoints.push(e.latlng);
    if (linePoints.length === 2) {
      polyline = L.polyline(linePoints, { color: "blue" }).addTo(map);
      const distance = linePoints[0].distanceTo(linePoints[1]).toFixed(2);
      alert(`Distance between the points: ${distance} meters`);
      linePoints = []; // Reset line points
    }
  }
}

// Draw a polygon and allow closing it with Enter
function drawPolygon(e) {
  if (drawingMode === "polygon") {
    polygonPoints.push(e.latlng);
    if (polygon) {
      map.removeLayer(polygon); // Remove previous polygon
    }
    polygon = L.polygon(polygonPoints).addTo(map);
  }
}

// Function to complete the polygon when the user presses Enter
function completePolygon(e) {
  if (drawingMode === "polygon" && polygonPoints.length >= 3) {
    alert("Polygon closed. You can now start a new polygon.");
    drawingMode = null; // Reset drawing mode
    polygonPoints = []; // Reset points
    polygon = null; // Reset polygon
  }
}

// Delete functionality
function toggleDelete() {
  deleteMode = !deleteMode;
  document.getElementById("delete-btn").classList.toggle("active");
}

map.on("click", function (e) {
  if (deleteMode) {
    const latlng = e.latlng;
    const layer = map.queryRenderedFeatures(latlng)[0];
    if (layer) {
      const confirmed = confirm("Do you really want to delete this element?");
      if (confirmed) {
        map.removeLayer(layer);
      }
    }
  } else {
    if (drawingMode === "point") {
      addPoint(e);
    } else if (drawingMode === "line") {
      drawLine(e);
    } else if (drawingMode === "polygon") {
      drawPolygon(e);
    }
  }
});

// Function for the user's current location
function getCurrentPosition() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const currentPos = L.latLng(lat, lon);
      // If there's already a current location marker, move it instead of adding a new one
      if (currentLocationMarker) {
        currentLocationMarker.setLatLng(currentPos);
      } else {
        const marker = L.marker(currentPos).addTo(map);
        points.push(marker); // Add the marker to the points array
        currentLocationMarker = marker;
      }
      map.setView(currentPos, 13);
    });
  } else {
    alert("Geolocation not available.");
  }
}

// Search functionality (Filter points)
function searchFeatures() {
  const query = document.getElementById("searchBox").value.toLowerCase();
  points.forEach((marker) => {
    const markerName = marker.getPopup().getContent()?.toLowerCase();
    if (markerName?.includes(query)) {
      marker.openPopup();
    } else {
      marker.closePopup();
    }
  });
}
