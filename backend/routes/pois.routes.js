const express = require("express");
const PoisController = require("../controllers/pois.controller");

const router = express.Router();

// Get all POIs
router.get("/", async (req, res) => {
  await PoisController.getAll(req, res);
});

// Get POI by ID
router.get("/:id", async (req, res) => {
  await PoisController.getById(req, res);
});

module.exports = router;
