const Server = require("./api/server");
const config = require("./config/config");
const { checkDb } = require("./db/db");

async function init() {
  await checkDb();
  const server = new Server(config.server.port, config.server.host);
  server.run();
}

init();
