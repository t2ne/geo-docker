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

  async getId() {}

  async getDescricao(id) {}

  async getTipo(id) {}

  async getCoords(id) {}
}
module.exports = Database;
