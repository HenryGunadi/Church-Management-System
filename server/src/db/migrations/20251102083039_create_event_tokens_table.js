/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable("event_tokens", (table) => {
    table.increments("id").primary();
    table.string("token", 255).notNullable().unique(); // UUID token
    table
      .integer("event_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("events")
      .onDelete("CASCADE"); // If event deleted, remove tokens too
    table.boolean("is_used").defaultTo(false); // Optional: track if token has been used
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("expires_at").nullable(); // Optional: add if token expiration is needed
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("event_tokens");
};
