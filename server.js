const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

const app = express();
app.use(cors());
const port = 3000;

app.use(bodyParser.json());

// Create a connection pool
const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "postgres",
  database: "tp-sig",
  max: 20, // Number of connections in the pool
  idleTimeoutMillis: 30000, // 30 seconds
  connectionTimeoutMillis: 2000, // 2 seconds
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
