const express = require("express");
const TrilhosController = require("../controllers/trilhos.controller");

const router = express.Router();

// Get all trilhos
router.get("/", async (req, res) => {
  await TrilhosController.getAll(req, res);
});

// Get trilho by ID
router.get("/:id", async (req, res) => {
  await TrilhosController.getById(req, res);
});

module.exports = router;
