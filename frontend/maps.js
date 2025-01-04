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

const heatmapBackgroundLayer = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  {
    attribution:
      "&copy; <a href='https://www.carto.com/'>CARTO</a> | Dark Heatmap",
  }
);

let heatmapLayerInstance = null;

function loadHeatmapData() {
  fetch("heatmap-layer.csv")
    .then((response) => response.text())
    .then((csv) => {
      Papa.parse(csv, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
          const heatmapData = results.data.map((row) => {
            const lat = parseFloat(row.latitude);
            const lng = parseFloat(row.longitude);
            const intensity = parseFloat(row.pop_max || 1);
            return [lat, lng, intensity];
          });

          createHeatmapLayer(heatmapData);
        },
      });
    });
}

function createHeatmapLayer(data) {
  if (heatmapLayerInstance) {
    map.removeLayer(heatmapLayerInstance);
  }
  heatmapLayerInstance = L.heatLayer(data, {
    radius: 20,
    blur: 25,
    maxZoom: 16,
  });
}
const espoLayer = L.tileLayer.wms("http://localhost:8081/geoserver/wms", {
  layers: "sig28837:esposende",
  format: "image/png",
  transparent: true,
});

const praiasLayer = L.tileLayer
  .wms("http://localhost:8081/geoserver/wms", {
    layers: "sig28837:praias",
    format: "image/png",
    transparent: true,
  })
  .addTo(map);

const entidadesLayer = L.tileLayer
  .wms("http://localhost:8081/geoserver/wms", {
    layers: "sig28837:entidades",
    format: "image/png",
    transparent: true,
  })
  .addTo(map);

const estradasLayer = L.tileLayer
  .wms("http://localhost:8081/geoserver/wms", {
    layers: "sig28837:estradas",
    format: "image/png",
    transparent: true,
  })
  .addTo(map);

const poisLayer = L.tileLayer
  .wms("http://localhost:8081/geoserver/wms", {
    layers: "sig28837:pois",
    format: "image/png",
    transparent: true,
  })
  .addTo(map);

const trilhosLayer = L.tileLayer
  .wms("http://localhost:8081/geoserver/wms", {
    layers: "sig28837:trilhos",
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
};

const wmsLayers = [
  praiasLayer,
  entidadesLayer,
  estradasLayer,
  poisLayer,
  trilhosLayer,
];

wmsLayers.forEach((layer) => layer.addTo(map));

const layerSelectBox = document.getElementById("layer-select");

layerSelectBox.addEventListener("change", (e) => {
  const selectedLayerName = e.target.value;

  Object.values(baseLayers).forEach((layer) => {
    if (map.hasLayer(layer)) {
      map.removeLayer(layer);
    }
  });

  wmsLayers.forEach((layer) => {
    if (map.hasLayer(layer)) {
      map.removeLayer(layer);
    }
  });

  if (selectedLayerName === "HeatMap") {
    heatmapBackgroundLayer.addTo(map);
    if (heatmapLayerInstance) {
      heatmapLayerInstance.addTo(map);
    }
  } else {
    if (map.hasLayer(heatmapBackgroundLayer)) {
      map.removeLayer(heatmapBackgroundLayer);
    }

    if (heatmapLayerInstance) {
      map.removeLayer(heatmapLayerInstance);
    }

    baseLayers[selectedLayerName].addTo(map);
    wmsLayers.forEach((layer) => layer.addTo(map));
  }
});

loadHeatmapData();

let bufferLayer = null;
let points = [];
let currentLocationMarker = null;
let measureControl = null;
let measureLayer = null;

function onMapClick(e) {
  if (bufferLayer) {
    map.removeLayer(bufferLayer);
    bufferLayer = null;
  }
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
                    map.removeLayer(bufferLayer);
                  }

                  if (bufferDistance > 0) {
                    fetch(
                      `http://localhost:3000/api/${tableName}/${featureId}/buffer/${bufferDistance}`
                    )
                      .then((bufferResponse) => bufferResponse.json())
                      .then((bufferData) => {
                        if (bufferData.buffer) {
                          const bufferedGeoJSON = JSON.parse(bufferData.buffer);

                          function getOffset(table, geomType) {
                            const offsets = {
                              praias: { polygon: [50.32, 50.32] },
                              entidades: { polygon: [50.35, 50.35] },
                              estradas: { line: [50.3, 50.3] },
                              pois: { polygon: [50.33, 50.33] },
                              trilhos: { line: [50.29, 50.29] },
                            };
                            return (
                              offsets[table][geomType] || [50.3155, 50.3155]
                            );
                          }

                          const geomType = bufferedGeoJSON.type.toLowerCase();

                          const [lonOffset, latOffset] = getOffset(
                            tableName,
                            geomType
                          );

                          const transformedGeoJSON = {
                            ...bufferedGeoJSON,
                            coordinates: bufferedGeoJSON.coordinates.map(
                              (ring) =>
                                ring.map((coord) => {
                                  const transformed = proj4(
                                    "EPSG:3763",
                                    "EPSG:4326",
                                    coord
                                  );
                                  return [
                                    transformed[1] - lonOffset,
                                    transformed[0] + latOffset,
                                  ];
                                })
                            ),
                          };

                          if (bufferLayer) {
                            map.removeLayer(bufferLayer);
                          }

                          bufferLayer = L.geoJSON(transformedGeoJSON, {
                            style: {
                              color: "blue",
                              weight: 2,
                              opacity: 0.5,
                              fillOpacity: 0.2,
                            },
                          }).addTo(map);
                          map.fitBounds(bufferLayer.getBounds(), {
                            padding: [50, 50],
                          });
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
  "+proj=tmerc +lat_0=39.66825833333333 +lon_0=-8.133108333333334 +k=1 +x_0=0 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
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
  const query = document.getElementById("searchBox").value.toLowerCase().trim();

  wmsLayers.forEach((layer) => {
    if (layer && layer.wmsParams) {
      if (query) {
        layer.setParams({
          CQL_FILTER: `nome ILIKE '%${query}%'`,
          random: Math.random(),
        });
      } else {
        const params = { ...layer.wmsParams };
        delete params.CQL_FILTER;
        layer.setParams(params);
      }
    }
  });
}

measureLayer = new L.FeatureGroup().addTo(map);

function updateMeasureControl(measureType) {
  if (measureControl) {
    measureControl.remove();
  }

  if (measureLayer) {
    measureLayer.clearLayers();
  }

  if (measureType === "none") {
    return;
  }

  const drawOptions = {
    position: "topleft",
    draw: {
      polyline:
        measureType === "distance"
          ? {
              shapeOptions: {
                color: "#2196F3",
                weight: 3,
              },
              metric: true,
              showLength: true,
            }
          : false,
      polygon:
        measureType === "area"
          ? {
              shapeOptions: {
                color: "#2196F3",
                fillColor: "#2196F3",
                fillOpacity: 0.1,
                weight: 3,
              },
              metric: true,
              showArea: true,
              allowIntersection: false,
            }
          : false,
      rectangle: false,
      circle: false,
      circlemarker: false,
      marker: false,
    },
    edit: {
      featureGroup: measureLayer,
      remove: true,
    },
  };

  measureControl = new L.Control.Draw(drawOptions);
  map.addControl(measureControl);
}

document
  .getElementById("measure-select")
  .addEventListener("change", function (e) {
    updateMeasureControl(e.target.value);
  });

map.on("draw:created", function (e) {
  const layer = e.layer;
  measureLayer.addLayer(layer);

  if (e.layerType === "polyline") {
    let distance = 0;
    const latlngs = layer.getLatLngs();

    for (let i = 0; i < latlngs.length - 1; i++) {
      distance += latlngs[i].distanceTo(latlngs[i + 1]);
    }

    layer.bindTooltip(`Distância: ${distance.toFixed(0)} metros`, {
      permanent: true,
      direction: "right",
    });
  } else if (e.layerType === "polygon") {
    const area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);

    layer.bindTooltip(`Área: ${area.toFixed(0)} m²`, {
      permanent: true,
      direction: "center",
    });
  }
});

map.on("draw:edited", function (e) {
  const layers = e.layers;
  layers.eachLayer(function (layer) {
    if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) {
      let distance = 0;
      const latlngs = layer.getLatLngs();

      for (let i = 0; i < latlngs.length - 1; i++) {
        distance += latlngs[i].distanceTo(latlngs[i + 1]);
      }

      layer.setTooltipContent(`Distância: ${distance.toFixed(0)} metros`);
    } else if (layer instanceof L.Polygon) {
      const area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
      layer.setTooltipContent(`Área: ${area.toFixed(0)} m²`);
    }
  });
});

map.on("draw:deleted", function (e) {
  const layers = e.layers;
  layers.eachLayer(function (layer) {
    measureLayer.removeLayer(layer);
  });
});

updateMeasureControl("none");
