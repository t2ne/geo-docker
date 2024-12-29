const { Client } = require("pg");

class Database {
  constructor() {
    this.conexao = new Client({
      host: "localhost",
      port: 5432,
      user: "postgres",
      password: "postgres",
      database: "tp-sig",
    });
  }

  async connect() {
    await this.conexao.connect();
  }

  async disconnect() {
    await this.conexao.end();
  }

  async getNomes(nome) {
    const query = `
      SELECT 
        'entidades' AS table_name, e.id, e.nome 
      FROM entidades e 
      WHERE e.nome = $1
      UNION ALL
      SELECT 
        'praias' AS table_name, p.id, p.nome 
      FROM praias p 
      WHERE p.nome = $1
      UNION ALL
      SELECT 
        'pois' AS table_name, po.id, po.nome 
      FROM pois po 
      WHERE po.nome = $1
      UNION ALL
      SELECT 
        'estradas' AS table_name, es.id, es.nome 
      FROM estradas es 
      WHERE es.nome = $1
      UNION ALL
      SELECT 
        'trilhos' AS table_name, tr.id, tr.nome 
      FROM trilhos tr 
      WHERE tr.nome = $1
    `;

    const result = await this.conexao.query(query, [nome]);
    return result.rows;
  }

  // Entidades methods
  async getEntidadesId() {
    const result = await this.conexao.query("SELECT id FROM entidades");
    return result.rows.map((row) => row.id);
  }

  async getEntidadesInfo(id) {
    const result = await this.conexao.query(
      `SELECT e.id, e.nome, e.tipo, t.nome AS nome_tipo 
       FROM entidades e 
       JOIN tipos t ON e.tipo = t.id 
       WHERE e.id = $1`,
      [id]
    );
    const entidade = result.rows[0];
    const nome_tipo = entidade.nome_tipo;
    const coords = await this.getEntidadesCoords(id);

    return {
      id: entidade.id,
      nome: entidade.nome,
      tipo: entidade.tipo,
      nome_tipo: nome_tipo,
      coords: coords,
    };
  }

  async getEntidadesTipo(id) {
    const result = await this.conexao.query(
      `SELECT t.nome AS tipo_nome 
       FROM entidades e 
       JOIN tipos t ON e.tipo = t.id 
       WHERE e.id = $1`,
      [id]
    );
    return result.rows.length > 0 ? result.rows[0].tipo_nome : null;
  }

  async getEntidadesCoords(id) {
    const latitude = await this.getLatitude(id, "entidades");
    const longitude = await this.getLongitude(id, "entidades");

    if (latitude && longitude) {
      return { latitude, longitude };
    }
    return null;
  }

  // Praia methods
  async getPraiasId() {
    const result = await this.conexao.query("SELECT id FROM praias");
    return result.rows.map((row) => row.id);
  }

  async getPraiasDescricao(id) {
    const result = await this.conexao.query(
      "SELECT descricao FROM praias WHERE id = $1",
      [id]
    );
    return result.rows.length > 0 ? result.rows[0].descricao : null;
  }

  async getPraiasCoords(id) {
    const latitude = await this.getLatitude(id, "praias");
    const longitude = await this.getLongitude(id, "praias");

    if (latitude && longitude) {
      return { latitude, longitude };
    }
    return null;
  }

  // POI methods
  async getPoisId() {
    const result = await this.conexao.query("SELECT id FROM pois");
    return result.rows.map((row) => row.id);
  }

  async getPoisDescricao(id) {
    const result = await this.conexao.query(
      "SELECT descricao FROM pois WHERE id = $1",
      [id]
    );
    return result.rows.length > 0 ? result.rows[0].descricao : null;
  }

  async getPoisTipo(id) {
    const result = await this.conexao.query(
      "SELECT tipo FROM pois WHERE id = $1",
      [id]
    );
    return result.rows.length > 0 ? result.rows[0].tipo : null;
  }

  async getPoisCoords(id) {
    const latitude = await this.getLatitude(id, "pois");
    const longitude = await this.getLongitude(id, "pois");

    if (latitude && longitude) {
      return { latitude, longitude };
    }
    return null;
  }

  // Estradas and Trilhos methods
  async getEstradasId() {
    const result = await this.conexao.query("SELECT id FROM estradas");
    return result.rows.map((row) => row.id);
  }

  async getEstradasCoords(id) {
    const latitude = await this.getLatitude(id, "estradas");
    const longitude = await this.getLongitude(id, "estradas");

    if (latitude && longitude) {
      return { latitude, longitude };
    }
    return null;
  }

  async getTrilhosId() {
    const result = await this.conexao.query("SELECT id FROM trilhos");
    return result.rows.map((row) => row.id);
  }

  async getTrilhosCoords(id) {
    const latitude = await this.getLatitude(id, "trilhos");
    const longitude = await this.getLongitude(id, "trilhos");

    if (latitude && longitude) {
      return { latitude, longitude };
    }
    return null;
  }

  // Shared methods to get Latitude and Longitude
  async getLatitude(id, table) {
    const result = await this.conexao.query(
      `SELECT ST_Y(ST_Transform(ST_Centroid(geom), 3763)) AS latitude FROM ${table} WHERE id = $1`,
      [id]
    );
    return result.rows.length > 0
      ? parseFloat(result.rows[0].latitude.toFixed(5))
      : null;
  }

  async getLongitude(id, table) {
    const result = await this.conexao.query(
      `SELECT ST_X(ST_Transform(ST_Centroid(geom), 3763)) AS longitude FROM ${table} WHERE id = $1`,
      [id]
    );
    return result.rows.length > 0
      ? parseFloat(result.rows[0].longitude.toFixed(5))
      : null;
  }
}

module.exports = Database;
