const db = require("../database/db");

class TrilhosModel {
  async getAll() {
    const result = await db.query(
      "SELECT id, nome, descricao, ST_AsGeoJSON(geom) AS geometry FROM trilhos"
    );
    return result.rows;
  }

  async getById(id) {
    const result = await db.query(
      "SELECT id, nome, descricao, ST_AsGeoJSON(geom) AS geometry FROM trilhos WHERE id = $1",
      [id]
    );
    return result.rows[0];
  }
}

module.exports = new TrilhosModel();
