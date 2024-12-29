const map = L.map("mapa").setView([41.5362, -8.7821], 13);

const roadsLayer = L.tileLayer(
  "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    attribution: "&copy; OpenStreetMap",
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

const praiasLayer = L.tileLayer
  .wms("http://localhost:8081/geoserver/wms", {
    layers: "tp-sig:praias",
    format: "image/png",
    transparent: true,
    attribution: "Esposende: Praias",
  })
  .addTo(map);

const entidadesLayer = L.tileLayer
  .wms("http://localhost:8081/geoserver/wms", {
    layers: "tp-sig:entidades",
    format: "image/png",
    transparent: true,
    attribution: "Edifícios",
  })
  .addTo(map);

const estradasLayer = L.tileLayer
  .wms("http://localhost:8081/geoserver/wms", {
    layers: "tp-sig:estradas",
    format: "image/png",
    transparent: true,
    attribution: "Estradas",
  })
  .addTo(map);

const poisLayer = L.tileLayer
  .wms("http://localhost:8081/geoserver/wms", {
    layers: "tp-sig:pois",
    format: "image/png",
    transparent: true,
    attribution: "Pontos de Interesse",
  })
  .addTo(map);

const trilhosLayer = L.tileLayer
  .wms("http://localhost:8081/geoserver/wms", {
    layers: "tp-sig:trilhos",
    format: "image/png",
    transparent: true,
    attribution: "e Trilhos - t2ne 2025",
  })
  .addTo(map);

const layerControl = L.control
  .layers(null, {
    Praias: praiasLayer,
    Entidades: entidadesLayer,
    Estradas: estradasLayer,
    "Pontos de Interesse": poisLayer,
    Trilhos: trilhosLayer,
  })
  .addTo(map);

L.control
  .scale({
    position: "bottomleft",
    imperial: false,
  })
  .addTo(map);

const baseLayers = {
  Estradas: roadsLayer,
  Satélite: satelliteLayer,
  HeatMap: heatmapLayer,
};

const layerSelectBox = document.getElementById("layer-select");

layerSelectBox.addEventListener("change", (e) => {
  const selectedLayerName = e.target.value;

  Object.values(baseLayers).forEach((layer) => map.removeLayer(layer));

  baseLayers[selectedLayerName].addTo(map);
});

let drawingMode = null;
let points = [];
let linePoints = [];
let polygonPoints = [];
let polyline, polygon;
let deleteMode = false;
let currentLocationMarker = null;

function toggleMenu() {
  const menu = document.getElementById("buttons-menu");
  menu.style.display =
    menu.style.display === "none" || menu.style.display === ""
      ? "block"
      : "none";
}

function toggleButton(type) {
  document.getElementById("point-btn").classList.remove("active");
  document.getElementById("line-btn").classList.remove("active");
  document.getElementById("polygon-btn").classList.remove("active");

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

function addPoint(e) {
  if (drawingMode === "point") {
    const marker = L.marker(e.latlng).addTo(map);
    points.push(marker);
  }
}

function drawLine(e) {
  if (drawingMode === "line") {
    linePoints.push(e.latlng);
    if (linePoints.length === 2) {
      polyline = L.polyline(linePoints, { color: "blue" }).addTo(map);
      const distance = linePoints[0].distanceTo(linePoints[1]).toFixed(2);
      alert(`Distance between the points: ${distance} meters`);
      linePoints = [];
    }
  }
}

function drawPolygon(e) {
  if (drawingMode === "polygon") {
    polygonPoints.push(e.latlng);
    if (polygon) {
      map.removeLayer(polygon);
    }
    polygon = L.polygon(polygonPoints).addTo(map);
  }
}

function completePolygon(e) {
  if (drawingMode === "polygon" && polygonPoints.length >= 3) {
    alert("Polygon closed. You can now start a new polygon.");
    drawingMode = null;
    polygonPoints = [];
    polygon = null;
  }
}

function toggleDelete() {
  deleteMode = !deleteMode;
  document.getElementById("delete-btn").classList.toggle("active");

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
}

function getCurrentPosition() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const currentPos = L.latLng(lat, lon);

      if (currentLocationMarker) {
        currentLocationMarker.setLatLng(currentPos);
      } else {
        const marker = L.marker(currentPos).addTo(map);
        points.push(marker);
        currentLocationMarker = marker;
      }
      map.setView(currentPos, 13);
    });
  } else {
    alert("Geolocation not available.");
  }
}

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

proj4.defs(
  "EPSG:3763",
  "+proj=tmerc +lat_0=0 +lon_0=-48 +k=1 +x_0=500000 +y_0=10000000 +datum=WGS84 +units=m +no_defs"
);
proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");

map.on("mousemove", function (e) {
  const latlng = e.latlng;
  const coord3763 = proj4("EPSG:4326", "EPSG:3763", [latlng.lng, latlng.lat]);

  $("#mouse-coords-3763").text(
    "3763: [" + coord3763[0].toFixed(2) + ", " + coord3763[1].toFixed(2) + "]"
  );
  $("#mouse-coords-4326").text(
    "4326: [" + latlng.lng.toFixed(5) + ", " + latlng.lat.toFixed(5) + "]"
  );
});
