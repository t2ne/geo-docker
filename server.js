const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Client } = require("pg");

const app = express();
app.use(cors());
const port = 3000;

app.use(bodyParser.json());

// ---------------------------- Save routes ----------------------------

// Save Point
app.post("/save-point", function (req, res) {
  const client = new Client({
    host: "localhost",
    user: "postgres",
    password: "postgres",
    database: "tp-sig",
  });
  client.connect();

  const pointGeom = `POINT(${req.body.lng} ${req.body.lat})`;

  client.query(
    "INSERT INTO points (shape_id, point) VALUES ($1, ST_SetSRID(ST_GeomFromText($2), 3763))",
    [req.body.shape_id, pointGeom],
    function (error, result) {
      if (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao adicionar o ponto" });
      } else {
        console.log("Ponto adicionado com sucesso.");
        res.status(200).json({ message: "Ponto salvo com sucesso" });
      }
    }
  );
});

// Save Line
app.post("/save-line", function (req, res) {
  const client = new Client({
    host: "localhost",
    user: "postgres",
    password: "postgres",
    database: "tp-sig",
  });
  client.connect();

  const lineGeom = `LINESTRING(${req.body.coord
    .map((c) => `${c[0]} ${c[1]}`)
    .join(", ")})`;

  client.query(
    "SELECT ST_GeomFromText($1, 3763)",
    [lineGeom],
    function (error, result) {
      if (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao adicionar a linha" });
      } else {
        client.query(
          "INSERT INTO lines (id, geom) VALUES ($1, $2)",
          [req.body.id, result.rows[0].st_geomfromtext],
          function (error, result) {
            if (error) {
              console.error(error);
              res.status(500).json({ error: "Erro ao salvar a linha" });
            } else {
              console.log("Linha salva com sucesso.");
              res.status(200).json({ message: "Linha salva com sucesso" });
            }
          }
        );
      }
    }
  );
});

// Save Polygon
app.post("/save-polygon", function (req, res) {
  const client = new Client({
    host: "localhost",
    user: "postgres",
    password: "postgres",
    database: "tp-sig",
  });
  client.connect();

  const polyGeom = `POLYGON((${req.body.coord[0]
    .map((c) => `${c[0]} ${c[1]}`)
    .join(", ")}))`;

  client.query(
    "SELECT ST_GeomFromText($1, 3763)",
    [polyGeom],
    function (error, result) {
      if (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao adicionar o polígono" });
      } else {
        client.query(
          "INSERT INTO polygons (id, geom) VALUES ($1, $2)",
          [req.body.id, result.rows[0].st_geomfromtext],
          function (error, result) {
            if (error) {
              console.error(error);
              res.status(500).json({ error: "Erro ao salvar o polígono" });
            } else {
              console.log("Polígono salvo com sucesso.");
              res.status(200).json({ message: "Polígono salvo com sucesso" });
            }
          }
        );
      }
    }
  );
});

// ---------------------------- API GET routes ----------------------------

// Get Point by ID
app.get("/api/points/:id", (req, res) => {
  const client = new Client({
    host: "localhost",
    user: "postgres",
    password: "postgres",
    database: "tp-sig",
  });
  client.connect();

  const id = req.params.id;
  client.query(
    "SELECT ST_AsText(point) FROM points WHERE shape_id = $1",
    [id],
    (error, result) => {
      if (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao buscar o ponto" });
      } else {
        res.json({ geom: result.rows[0] });
      }
    }
  );
});

// Get Line by ID
app.get("/api/lines/:id", (req, res) => {
  const client = new Client({
    host: "localhost",
    user: "postgres",
    password: "postgres",
    database: "tp-sig",
  });
  client.connect();

  const id = req.params.id;
  client.query(
    "SELECT ST_AsText(geom) FROM lines WHERE id = $1",
    [id],
    (error, result) => {
      if (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao buscar a linha" });
      } else {
        res.json({ geom: result.rows[0] });
      }
    }
  );
});

// Get Polygon by ID
app.get("/api/polygons/:id", (req, res) => {
  const client = new Client({
    host: "localhost",
    user: "postgres",
    password: "postgres",
    database: "tp-sig",
  });
  client.connect();

  const id = req.params.id;
  client.query(
    "SELECT ST_AsText(geom) FROM polygons WHERE id = $1",
    [id],
    (error, result) => {
      if (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao buscar o polígono" });
      } else {
        res.json({ geom: result.rows[0] });
      }
    }
  );
});

// ---------------------------- Adding the new API Routes ----------------------------

const entidadesRoutes = require("./backend/routes/entidades.routes.js");
const trilhosRoutes = require("./backend/routes/trilhos.routes.js");
const estradasRoutes = require("./backend/routes/estradas.routes.js");
const poisRoutes = require("./backend/routes/pois.routes.js");
const praiasRoutes = require("./backend/routes/praias.routes.js");

app.use("/api/entidades", entidadesRoutes);
app.use("/api/trilhos", trilhosRoutes);
app.use("/api/estradas", estradasRoutes);
app.use("/api/pois", poisRoutes);
app.use("/api/praias", praiasRoutes);

app.listen(port, () => {
  console.log(`Servidor a correr em http://localhost:${port}`);
});
