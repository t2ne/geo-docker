const PraiasModel = require("../models/praias.model");

class PraiasController {
  async getAll(req, res) {
    try {
      const praias = await PraiasModel.getAll();
      res.status(200).json(praias);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch praias" });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const praia = await PraiasModel.getById(id);
      if (praia) {
        res.status(200).json(praia);
      } else {
        res.status(404).json({ error: "Praia not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch praia" });
    }
  }
}

module.exports = new PraiasController();
