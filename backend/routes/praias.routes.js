const express = require("express");
const PraiasController = require("../controllers/praias.controller");

const router = express.Router();

// Get all praias
router.get("/", async (req, res) => {
  await PraiasController.getAll(req, res);
});

// Get praia by ID
router.get("/:id", async (req, res) => {
  await PraiasController.getById(req, res);
});

module.exports = router;
