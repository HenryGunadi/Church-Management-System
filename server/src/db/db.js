const knex = require('knex');
const dotenv = require('dotenv');
const knexConfig = require('./knexfile');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const db = knex(knexConfig.development);

async function checkDb() {
    try {
        await db.raw('SELECT 1');
        console.log('DB connected ✅');
    } catch (err) {
        console.error('DB connection failed ❌', err.message);
    }
}

module.exports = { db, checkDb };
