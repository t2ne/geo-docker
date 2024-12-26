const db = require("../database/db");

class EntidadesModel {
  async getAll() {
    const result = await db.query(
      "SELECT id, nome, ST_AsGeoJSON(geom) AS geometry FROM entidades"
    );
    return result.rows;
  }

  async getById(id) {
    const result = await db.query(
      "SELECT id, nome, ST_AsGeoJSON(geom) AS geometry FROM entidades WHERE id = $1",
      [id]
    );
    return result.rows[0];
  }

  async getByNome(nome) {
    const result = await db.query(
      "SELECT id, nome, ST_AsGeoJSON(geom) AS geometry FROM entidades WHERE nome = $1",
      [nome]
    );
    return result.rows[0];
  }
}

module.exports = new EntidadesModel();
