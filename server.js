const express = require("express");
const path = require("path");
const database = require("./backend/database");

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, "frontend")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

// Route: /api/vizinhos/:id
// app.get("/api/vizinhos/:id", async (req, res) => {
//   const id = parseInt(req.params.id);
//   if (isNaN(id)) {
//     return res.status(400).json({ error: "ID deve ser um número" });
//   }
//   try {
//     const db = new database();
//     await db.connect();
//     const numVizinhos = await db.getNumVizinhos(id);
//     await db.disconnect();
//     if (!numVizinhos) {
//       return res
//         .status(404)
//         .json({ error: "Erro ao obter o número de vizinhos" });
//     }
//     res.json({ numVizinhos });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

app.listen(port, () => {
  console.log(`Servidor a correr em http://localhost:${port}`);
});
