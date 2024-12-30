const map = L.map("mapa").setView([41.5362, -8.7821], 13);
var popup = L.popup();

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

function onMapClick(e) {
  const latlng4326 = e.latlng;
  const latlng3763 = proj4("EPSG:4326", "EPSG:3763", [
    latlng4326.lng,
    latlng4326.lat,
  ]);

  const wmsLayers = [
    { layer: praiasLayer, tableName: "praias" },
    { layer: entidadesLayer, tableName: "entidades" },
    { layer: estradasLayer, tableName: "estradas" },
    { layer: poisLayer, tableName: "pois" },
    { layer: trilhosLayer, tableName: "trilhos" },
  ];

  // Iterate through WMS layers and send a GetFeatureInfo request
  for (const { layer, tableName } of wmsLayers) {
    const wmsUrl = layer._url;
    const params = {
      request: "GetFeatureInfo",
      service: "WMS",
      srs: "EPSG:4326",
      styles: "",
      transparent: true,
      version: "1.1.1",
      format: "image/png",
      bbox: map.getBounds().toBBoxString(),
      height: map.getSize().y,
      width: map.getSize().x,
      layers: layer.wmsParams.layers,
      query_layers: layer.wmsParams.layers,
      info_format: "application/json",
      x: Math.round(map.layerPointToContainerPoint(e.layerPoint).x),
      y: Math.round(map.layerPointToContainerPoint(e.layerPoint).y),
    };

    // Build the GetFeatureInfo URL
    const url = `${wmsUrl}?${new URLSearchParams(params).toString()}`;

    // Fetch the feature info
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch GetFeatureInfo.");
        }
        return response.json();
      })
      .then((data) => {
        if (data.features && data.features.length > 0) {
          const feature = data.features[0];
          const properties = feature.properties;

          // Show a popup with the feature information
          popup
            .setLatLng(e.latlng)
            .setContent(
              `<b>Table:</b> ${tableName}<br>` +
                `<b>Properties:</b> ${JSON.stringify(properties, null, 2)}`
            )
            .openOn(map);
        }
      })
      .catch((error) => {
        console.error("Error fetching feature info:", error);
      });
  }
}

map.on("click", onMapClick);

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

// Function to handle feature clicks (for vector layers)
function onFeatureClick(e) {
  // Prevent the global map click event
  L.DomEvent.stopPropagation(e);

  const layer = e.target; // The clicked layer
  const properties = layer.feature?.properties; // Assuming GeoJSON with properties
  const tableName = properties?.tableName; // Table name (e.g., entidades, praias, etc.)
  const id = properties?.id; // Unique ID of the feature

  if (!tableName || !id) {
    alert("Feature data is missing.");
    return;
  }

  // Determine the API endpoint
  const apiUrl = `http://localhost:3000/${tableName}/${id}/`;

  // Fetch data from the API
  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch data.");
      }
      return response.json();
    })
    .then((data) => {
      // Display the information in a popup
      const popupContent = `
        <b>Table:</b> ${tableName}<br>
        <b>ID:</b> ${id}<br>
        <b>Info:</b> ${JSON.stringify(data.info, null, 2)}
      `;
      layer.bindPopup(popupContent).openPopup();
    })
    .catch((error) => {
      console.error(error);
      alert("Error fetching feature information.");
    });
}

// Bind popups to vector layers (GeoJSON)
function bindFeaturePopups(layer, tableName) {
  if (
    tableName === "entidades" ||
    tableName === "praias" ||
    tableName === "pois"
  ) {
    layer.on("click", onFeatureClick); // Polygons
  } else if (tableName === "estradas" || tableName === "trilhos") {
    layer.on("click", onFeatureClick); // Lines
  }
}

// Add WMS layers with GetFeatureInfo support
function addWMSLayerWithPopups(tableName, layerName) {
  const wmsLayer = L.tileLayer
    .wms("http://localhost:8081/geoserver/wms", {
      layers: layerName,
      format: "image/png",
      transparent: true,
      attribution: `Layer: ${tableName}`,
    })
    .addTo(map);

  // Handle GetFeatureInfo for WMS layers
  map.on("click", (e) => {
    const params = {
      request: "GetFeatureInfo",
      service: "WMS",
      srs: "EPSG:4326",
      styles: "",
      transparent: true,
      version: "1.1.1",
      format: "image/png",
      bbox: map.getBounds().toBBoxString(),
      height: map.getSize().y,
      width: map.getSize().x,
      layers: layerName,
      query_layers: layerName,
      info_format: "application/json",
      x: Math.round(map.layerPointToContainerPoint(e.layerPoint).x),
      y: Math.round(map.layerPointToContainerPoint(e.layerPoint).y),
    };

    const url = `${wmsLayer._url}?${new URLSearchParams(params).toString()}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data.features && data.features.length > 0) {
          const feature = data.features[0];
          const properties = feature.properties;

          popup
            .setLatLng(e.latlng)
            .setContent(
              `<b>Table:</b> ${tableName}<br>` +
                `<b>Properties:</b> ${JSON.stringify(properties, null, 2)}`
            )
            .openOn(map);
        }
      })
      .catch((error) => console.error("GetFeatureInfo error:", error));
  });
}

// Add all layers
addWMSLayerWithPopups("entidades", "tp-sig:entidades");
addWMSLayerWithPopups("praias", "tp-sig:praias");
addWMSLayerWithPopups("estradas", "tp-sig:estradas");
addWMSLayerWithPopups("pois", "tp-sig:pois");
addWMSLayerWithPopups("trilhos", "tp-sig:trilhos");
