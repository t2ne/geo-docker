const TrilhosModel = require("../models/trilhos.model");

class TrilhosController {
  async getAll(req, res) {
    try {
      const trilhos = await TrilhosModel.getAll();
      res.status(200).json(trilhos);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trilhos" });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const trilho = await TrilhosModel.getById(id);
      if (trilho) {
        res.status(200).json(trilho);
      } else {
        res.status(404).json({ error: "Trilho not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trilho" });
    }
  }
}

module.exports = new TrilhosController();
