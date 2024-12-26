const PoisModel = require("../models/pois.model");

class PoisController {
  async getAll(req, res) {
    try {
      const pois = await PoisModel.getAll();
      res.status(200).json(pois);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch POIs" });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const poi = await PoisModel.getById(id);
      if (poi) {
        res.status(200).json(poi);
      } else {
        res.status(404).json({ error: "POI not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch POI" });
    }
  }
}

module.exports = new PoisController();
