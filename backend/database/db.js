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

  async getPraiasInfo(id) {
    const result = await this.conexao.query(
      `SELECT pr.id, pr.nome, pr.descricao
       FROM praias pr 
       WHERE pr.id = $1`,
      [id]
    );
    const praia = result.rows[0];
    const coords = await this.getPraiasCoords(id);

    return {
      id: praia.id,
      nome: praia.nome,
      descricao: praia.descricao,
      coords: coords,
    };
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

  async getPoisInfo(id) {
    const result = await this.conexao.query(
      `SELECT p.id, p.nome, p.tipo, p.descricao, t.nome AS nome_tipo 
       FROM pois p 
       JOIN tipos t ON p.tipo = t.id 
       WHERE p.id = $1`,
      [id]
    );
    const poi = result.rows[0];
    const nome_tipo = poi.nome_tipo;
    const coords = await this.getPoisCoords(id);

    return {
      id: poi.id,
      nome: poi.nome,
      tipo: poi.tipo,
      descricao: poi.descricao,
      nome_tipo: nome_tipo,
      coords: coords,
    };
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

  async getEstradasInfo(id) {
    const result = await this.conexao.query(
      `SELECT e.id, e.nome, e.tipo, t.nome AS nome_tipo 
       FROM estradas e 
       JOIN tipos t ON e.tipo = t.id 
       WHERE e.id = $1`,
      [id]
    );
    const estrada = result.rows[0];
    const nome_tipo = estrada.nome_tipo;
    const coords = await this.getEstradasCoords(id);

    return {
      id: estrada.id,
      nome: estrada.nome,
      tipo: estrada.tipo,
      nome_tipo: nome_tipo,
      coords: coords,
    };
  }

  async getEstradasTipo(id) {
    const result = await this.conexao.query(
      "SELECT tipo FROM estradas WHERE id = $1",
      [id]
    );
    return result.rows.length > 0 ? result.rows[0].tipo : null;
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

  async getTrilhosInfo(id) {
    const result = await this.conexao.query(
      `SELECT tr.id, tr.nome, tr.tipo, tr.descricao, t.nome AS nome_tipo 
       FROM trilhos tr
       JOIN tipos t ON tr.tipo = t.id 
       WHERE tr.id = $1`,
      [id]
    );
    const trilho = result.rows[0];
    const nome_tipo = trilho.nome_tipo;
    const coords = await this.getTrilhosCoords(id);

    return {
      id: trilho.id,
      nome: trilho.nome,
      tipo: trilho.tipo,
      descricao: trilho.descricao,
      nome_tipo: nome_tipo,
      coords: coords,
    };
  }

  async getTrilhosTipo(id) {
    const result = await this.conexao.query(
      "SELECT tipo FROM trilhos WHERE id = $1",
      [id]
    );
    return result.rows.length > 0 ? result.rows[0].tipo : null;
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

  //

  async getBufferEntidades(id, bufferValue) {
    const query = `
      SELECT ST_AsGeoJSON(ST_Buffer(ST_Transform(geom, 3763), $1)) AS buffered_geom
      FROM entidades
      WHERE id = $2
    `;
    const result = await this.conexao.query(query, [bufferValue, id]);
    return result.rows.length > 0 ? result.rows[0].buffered_geom : null;
  }

  async getBufferPraias(id, bufferValue) {
    const query = `
      SELECT ST_AsGeoJSON(ST_Buffer(ST_Transform(geom, 3763), $1)) AS buffered_geom
      FROM praias
      WHERE id = $2
    `;
    const result = await this.conexao.query(query, [bufferValue, id]);
    return result.rows.length > 0 ? result.rows[0].buffered_geom : null;
  }

  async getBufferPois(id, bufferValue) {
    const query = `
      SELECT ST_AsGeoJSON(ST_Buffer(ST_Transform(geom, 3763), $1)) AS buffered_geom
      FROM pois
      WHERE id = $2
    `;
    const result = await this.conexao.query(query, [bufferValue, id]);
    return result.rows.length > 0 ? result.rows[0].buffered_geom : null;
  }

  async getBufferEstradas(id, bufferValue) {
    const query = `
      SELECT ST_AsGeoJSON(ST_Buffer(ST_Transform(geom, 3763), $1)) AS buffered_geom
      FROM estradas
      WHERE id = $2
    `;
    const result = await this.conexao.query(query, [bufferValue, id]);
    return result.rows.length > 0 ? result.rows[0].buffered_geom : null;
  }

  async getBufferTrilhos(id, bufferValue) {
    const query = `
      SELECT ST_AsGeoJSON(ST_Buffer(ST_Transform(geom, 3763), $1)) AS buffered_geom
      FROM trilhos
      WHERE id = $2
    `;
    const result = await this.conexao.query(query, [bufferValue, id]);
    return result.rows.length > 0 ? result.rows[0].buffered_geom : null;
  }
}

module.exports = Database;
