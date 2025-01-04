const express = require("express");
const Database = require("../database/db");

const router = express.Router();

router.get("/", async (req, res) => {
  const db = new Database();
  try {
    await db.connect();
    const ids = await db.getEntidadesId();
    res.json({ ids });
  } catch (error) {
    console.error("Error fetching IDs:", error);
    res.status(500).json({ error: "Failed to fetch IDs" });
  } finally {
    await db.disconnect();
  }
});

router.get("/:id/", async (req, res) => {
  const { id } = req.params;
  const db = new Database();
  try {
    await db.connect();
    const info = await db.getEntidadesInfo(id);
    res.json({ info });
  } catch (error) {
    console.error("Error fetching info:", error);
    res.status(500).json({ error: "Failed to fetch info" });
  } finally {
    await db.disconnect();
  }
});

router.get("/:id/tipo/", async (req, res) => {
  const { id } = req.params;
  const db = new Database();
  try {
    await db.connect();
    const tipo = await db.getEntidadesTipo(id);
    if (tipo) {
      res.json({ id, tipo });
    } else {
      res.status(404).json({ error: "Entity not found" });
    }
  } catch (error) {
    console.error("Error fetching type:", error);
    res.status(500).json({ error: "Failed to fetch type" });
  } finally {
    await db.disconnect();
  }
});

router.get("/:id/coords", async (req, res) => {
  const { id } = req.params;
  const db = new Database();
  try {
    await db.connect();
    const coords = await db.getEntidadesCoords(id);
    if (coords) {
      res.json({ id, coords });
    } else {
      res
        .status(404)
        .json({ error: "Entity not found or no coordinates available" });
    }
  } catch (error) {
    console.error("Error fetching coordinates:", error);
    res.status(500).json({ error: "Failed to fetch coordinates" });
  } finally {
    await db.disconnect();
  }
});

router.get("/:id/buffer/:distance", async (req, res) => {
  const { id, distance } = req.params;
  const db = new Database();
  try {
    await db.connect();
    const bufferValue = parseFloat(distance);
    if (isNaN(bufferValue)) {
      return res.status(400).json({ error: "Invalid buffer distance" });
    }

    const bufferedGeom = await db.getBufferEntidades(id, bufferValue);
    if (bufferedGeom) {
      res.json({ id, bufferValue, bufferedGeom });
    } else {
      res
        .status(404)
        .json({ error: "Entity not found or no geometry available" });
    }
  } catch (error) {
    console.error("Error fetching buffered geometry:", error);
    res.status(500).json({ error: "Failed to fetch buffered geometry" });
  } finally {
    await db.disconnect();
  }
});

module.exports = router;
