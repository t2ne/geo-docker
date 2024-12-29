const EntidadesModel = require("../models/entidades.model");

class EntidadesController {
  async getAll(req, res) {
    try {
      const entidades = await EntidadesModel.getAll();
      res.status(200).json(entidades);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch entidades" });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const entidade = await EntidadesModel.getById(id);
      if (entidade) {
        res.status(200).json(entidade);
      } else {
        res.status(404).json({ error: "Entidade not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch entidade" });
    }
  }
}

module.exports = new EntidadesController();
