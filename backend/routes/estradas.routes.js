const express = require("express");
const EstradasController = require("../controllers/estradas.controller");

const router = express.Router();

// Get all estradas
router.get("/", async (req, res) => {
  await EstradasController.getAll(req, res);
});

// Get estrada by ID
router.get("/:id", async (req, res) => {
  await EstradasController.getById(req, res);
});

module.exports = router;
