const express = require("express");
const Database = require("../database/db");

const router = express.Router();

// Get all Trilho IDs
router.get("/", async (req, res) => {
  const db = new Database();
  try {
    await db.connect();
    const ids = await db.getTrilhosId();
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
    const info = await db.getTrilhosInfo(id);
    res.json({ info });
  } catch (error) {
    console.error("Error fetching info:", error);
    res.status(500).json({ error: "Failed to fetch info" });
  } finally {
    await db.disconnect();
  }
});

// Get Trilho coordinates by ID
router.get("/:id/coords", async (req, res) => {
  const { id } = req.params;
  const db = new Database();
  try {
    await db.connect();
    const coords = await db.getTrilhosCoords(id);
    if (coords) {
      res.json({ id, coords });
    } else {
      res
        .status(404)
        .json({ error: "Trilho not found or no coordinates available" });
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
    const buffer = await db.getBufferTrilhos(id, distance);
    if (buffer) {
      res.json({ id, buffer });
    } else {
      res.status(404).json({ error: "Trilho not found or buffer failed" });
    }
  } catch (error) {
    console.error("Error creating buffer for trilho:", error);
    res.status(500).json({ error: "Failed to create buffer" });
  } finally {
    await db.disconnect();
  }
});


module.exports = router;
