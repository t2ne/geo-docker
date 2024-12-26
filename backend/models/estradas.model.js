const db = require("../database/db");

class EstradasModel {
  async getAll() {
    const result = await db.query(
      "SELECT id, nome, ST_AsGeoJSON(geom) AS geometry FROM estradas"
    );
    return result.rows;
  }

  async getById(id) {
    const result = await db.query(
      "SELECT id, nome, ST_AsGeoJSON(geom) AS geometry FROM estradas WHERE id = $1",
      [id]
    );
    return result.rows[0];
  }
}

module.exports = new EstradasModel();
