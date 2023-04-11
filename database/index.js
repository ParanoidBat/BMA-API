if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const Pool = require("pg-pool");
const url = require("url");

const params = url.parse(process.env.DATABASE_URL);
const auth = params.auth.split(":");

var pool = new Pool({
  database: params.pathname.split("/")[1],
  user: auth[0],
  password: auth[1],
  port: params.port,
  ssl: false,
  max: 20, // set pool max size to 20
  idleTimeoutMillis: 1000, // close idle clients after 1 second
  connectionTimeoutMillis: 1000, // return an error after 1 second if connection could not be established
  maxUses: 7500, // close (and replace) a connection after it has been used 7500 times (see below for discussion)
});

class Database {
  constructor() {
    this.pool = pool;
  }

  async queryOne(sql, params) {
    const result = await this.pool.query(sql, params);

    switch (result.rowCount) {
      case 0:
        return null;
      case 1:
        return result.rows[0];
      default:
        throw new Error(
          `#queryOne expects one row but ${rowCount} were returned.\n\n${sql}`
        );
    }
  }

  async query(sql, params) {
    const result = await this.pool.query(sql, params);

    return result.rows;
  }
}

const db = new Database();

module.exports = db;
