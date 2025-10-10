const Server = require('./api/server');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const server = new Server(process.env.PORT, 'localhost');
server.run();
