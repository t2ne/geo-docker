const EstradasModel = require("../models/estradas.model");

class EstradasController {
  async getAll(req, res) {
    try {
      const estradas = await EstradasModel.getAll();
      res.status(200).json(estradas);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch estradas" });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const estrada = await EstradasModel.getById(id);
      if (estrada) {
        res.status(200).json(estrada);
      } else {
        res.status(404).json({ error: "Estrada not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch estrada" });
    }
  }
}

module.exports = new EstradasController();
