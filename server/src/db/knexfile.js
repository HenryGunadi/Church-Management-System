// Update with your config settings.
const config = require("../config/config");

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: "mysql2",
    connection: {
      host: config.db.host,
      user: config.db.user,
      password: config.db.password || "",
      database: config.db.name,
    },
    migrations: {
      directory: "./migrations",
    },
  },
};
