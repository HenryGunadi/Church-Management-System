const knex = require("knex");
const knexConfig = require("./knexfile");

const db = knex(knexConfig.development);

async function checkDb() {
  try {
    await db.raw("SELECT 1");
    console.log("DB connected ✅");
  } catch (err) {
    console.error(err);
    console.error("DB connection failed ❌", err.message);
  }
}

module.exports = { db, checkDb };
