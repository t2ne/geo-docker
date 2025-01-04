const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
const port = 3000;

app.use(bodyParser.json());

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
