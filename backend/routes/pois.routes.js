const express = require("express");
const Database = require("../database/db");

const router = express.Router();

router.get("/", async (req, res) => {
  const db = new Database();
  try {
    await db.connect();
    const ids = await db.getPoisId();
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
    const info = await db.getPoisInfo(id);
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
    const tipo = await db.getPoisTipo(id);
    if (tipo) {
      res.json({ id, tipo });
    } else {
      res.status(404).json({ error: "Poi not found" });
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
    const coords = await db.getPoisCoords(id);
    if (coords) {
      res.json({ id, coords });
    } else {
      res
        .status(404)
        .json({ error: "Poi not found or no coordinates available" });
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
    const buffer = await db.getBufferPois(id, distance);
    if (buffer) {
      res.json({ id, buffer });
    } else {
      res.status(404).json({ error: "POI not found or buffer failed" });
    }
  } catch (error) {
    console.error("Error creating buffer for POI:", error);
    res.status(500).json({ error: "Failed to create buffer" });
  } finally {
    await db.disconnect();
  }
});


module.exports = router;
