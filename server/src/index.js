const Server = require('./api/server');
const dotenv = require('dotenv');
const path = require('path');
const { checkDb } = require('./db/db');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function init() {
    await checkDb();
    const server = new Server(process.env.PORT, 'localhost');
    server.run();
}

init();
