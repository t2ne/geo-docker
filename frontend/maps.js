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

const espoLayer = L.tileLayer.wms("http://localhost:8081/geoserver/wms", {
  layers: "tp-sig:esposende",
  format: "image/png",
  transparent: true,
});

const praiasLayer = L.tileLayer
  .wms("http://localhost:8081/geoserver/wms", {
    layers: "tp-sig:praias",
    format: "image/png",
    transparent: true,
  })
  .addTo(map);

const entidadesLayer = L.tileLayer
  .wms("http://localhost:8081/geoserver/wms", {
    layers: "tp-sig:entidades",
    format: "image/png",
    transparent: true,
  })
  .addTo(map);

const estradasLayer = L.tileLayer
  .wms("http://localhost:8081/geoserver/wms", {
    layers: "tp-sig:estradas",
    format: "image/png",
    transparent: true,
  })
  .addTo(map);

const poisLayer = L.tileLayer
  .wms("http://localhost:8081/geoserver/wms", {
    layers: "tp-sig:pois",
    format: "image/png",
    transparent: true,
  })
  .addTo(map);

const trilhosLayer = L.tileLayer
  .wms("http://localhost:8081/geoserver/wms", {
    layers: "tp-sig:trilhos",
    format: "image/png",
    transparent: true,
    attribution: "t2ne 2025",
  })
  .addTo(map);

const layerControl = L.control
  .layers(null, {
    "Limites do Concelho": espoLayer,
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

const wmsLayers = [
  praiasLayer,
  entidadesLayer,
  estradasLayer,
  poisLayer,
  trilhosLayer,
];

let bufferLayer = null;

wmsLayers.forEach((layer) => layer.addTo(map));

const layerSelectBox = document.getElementById("layer-select");

layerSelectBox.addEventListener("change", (e) => {
  const selectedLayerName = e.target.value;

  Object.values(baseLayers).forEach((layer) => {
    if (map.hasLayer(layer)) {
      map.removeLayer(layer);
    }
  });
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

  for (const { layer, tableName } of wmsLayers) {
    const wmsUrl = layer._url;
    const params = {
      request: "GetFeatureInfo",
      service: "WMS",
      srs: "EPSG:4326",
      styles: "",
      transparent: true,
      version: "1.1.1",
      format: "application/json",
      bbox: map.getBounds().toBBoxString(),
      height: map.getSize().y,
      width: map.getSize().x,
      layers: layer.wmsParams.layers,
      query_layers: layer.wmsParams.layers,
      info_format: "application/json",
      x: Math.round(map.layerPointToContainerPoint(e.layerPoint).x),
      y: Math.round(map.layerPointToContainerPoint(e.layerPoint).y),
    };

    const url = `${wmsUrl}?${new URLSearchParams(params).toString()}`;

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Fetch falhado de: GetFeatureInfo.");
        }
        return response.json();
      })
      .then((data) => {
        if (data.features && data.features.length > 0) {
          const feature = data.features[0];
          const properties = feature.properties;

          const featureId = feature.id.split(".")[1];
          if (!featureId) {
            console.error("Info da Feature encontrada!");
            return;
          }

          fetch(`http://localhost:3000/api/${tableName}/${featureId}`)
            .then((apiResponse) => apiResponse.json())
            .then((apiData) => {
              const nomeTipo = apiData.info.nome_tipo;
              const coords = apiData.info.coords;

              const formattedContent = `
              <div style="min-width: 400px">
                <b>Tabela:</b> ${tableName}<br>
                <b>Nome:</b> ${properties.nome || "N/A"}<br>
                <b>Descrição:</b> ${properties.descricao || "N/A"}<br>
                ${
                  nomeTipo
                    ? `<b>Tipo:</b> ${nomeTipo} (${properties.tipo})<br>`
                    : ""
                }
                <b>Coordenadas:</b> Latitude ${
                  coords?.latitude || "N/A"
                }, Longitude ${coords?.longitude || "N/A"}
                <br><b>Distância do buffer:</b> 
                <input type="range" id="bufferSlider" min="0" max="1000" value="0" />
                <span id="bufferValue">0</span> metros
              </div>
              `;

              popup = L.popup({ minWidth: 370 })
                .setLatLng(e.latlng)
                .setContent(formattedContent)
                .openOn(map);

              document
                .getElementById("bufferSlider")
                .addEventListener("input", function () {
                  const bufferDistance = this.value;
                  document.getElementById("bufferValue").textContent =
                    bufferDistance;

                  if (bufferLayer) {
                    console.log("Removendo o bufferLayer atual...");
                    map.removeLayer(bufferLayer);
                  }

                  if (bufferDistance > 0) {
                    console.log(
                      "Buscando o buffer de distância:",
                      bufferDistance
                    );
                    fetch(
                      `http://localhost:3000/api/${tableName}/${featureId}/buffer/${bufferDistance}`
                    )
                      .then((bufferResponse) => bufferResponse.json())
                      .then((bufferData) => {
                        console.log("Buffer data:", bufferData); // Detailed log for debugging
                        if (bufferData.bufferedGeom) {
                          console.log(
                            "Buffer encontrado, adicionando ao mapa..."
                          );
                          const bufferedGeoJSON = JSON.parse(
                            bufferData.bufferedGeom
                          );
                          bufferLayer = L.geoJSON(bufferedGeoJSON, {
                            style: { color: "blue", weight: 2, opacity: 0.5 },
                          }).addTo(map);
                        } else {
                          console.log(
                            "Nenhuma geometria de buffer encontrada."
                          );
                        }
                      })
                      .catch((error) => {
                        console.error("Erro ao buscar o buffer:", error);
                      });
                  }
                });
            })
            .catch((error) => {
              console.error("Erro no fetch da data da API:", error);
            });
        } else {
          console.error("Informação da feature encontrada!");
        }
      })
      .catch((error) => {
        console.error("Erro ao fazer fetch da feature na WMS:", error);
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

function searchFeatures() {
  const query = document.getElementById("searchBox").value.toLowerCase();

  // Loop over all WMS layers
  wmsLayers.forEach(({ layer, tableName }) => {
    const wmsUrl = layer._url;
    const params = {
      request: "GetFeatureInfo",
      service: "WMS",
      srs: "EPSG:4326",
      styles: "",
      transparent: true,
      version: "1.1.1",
      format: "application/json",
      bbox: map.getBounds().toBBoxString(),
      height: map.getSize().y,
      width: map.getSize().x,
      layers: layer.wmsParams.layers,
      query_layers: layer.wmsParams.layers,
      info_format: "application/json",
      x: Math.round(map.layerPointToContainerPoint(e.layerPoint).x),
      y: Math.round(map.layerPointToContainerPoint(e.layerPoint).y),
    };

    const url = `${wmsUrl}?${new URLSearchParams(params).toString()}`;

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Fetch failed for GetFeatureInfo.");
        }
        return response.json();
      })
      .then((data) => {
        if (data.features && data.features.length > 0) {
          data.features.forEach((feature) => {
            const featureName = feature.properties.nome || "";
            const featureId = feature.id.split(".")[1];
            if (featureName.toLowerCase().includes(query)) {
              // Show the feature if the name matches the query
              layer.addLayer(feature); // Add the feature to the layer if it matches
            } else {
              // Hide the feature if it doesn't match the query
              layer.removeLayer(feature); // Remove it from the layer if it doesn't match
            }
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching WMS feature info:", error);
      });
  });
}
