const db = require("../database/db");

class PoisModel {
  async getAll() {
    const result = await db.query(
      "SELECT id, nome, descricao, tipo, ST_AsGeoJSON(geom) AS geometry FROM pois"
    );
    return result.rows;
  }

  async getById(id) {
    const result = await db.query(
      "SELECT id, nome, descricao, tipo, ST_AsGeoJSON(geom) AS geometry FROM pois WHERE id = $1",
      [id]
    );
    return result.rows[0];
  }
}

module.exports = new PoisModel();
