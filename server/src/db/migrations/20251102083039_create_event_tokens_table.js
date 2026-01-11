/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable("event_tokens", (table) => {
    table.increments("id").primary();

    table.string("token", 255).notNullable().unique(); // UUID token

    table
      .integer("schedule_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("event_schedules")
      .onDelete("CASCADE");

    table.unique(["schedule_id"]); // 👈 enforce 1 token per schedule

    table.boolean("is_used").defaultTo(false);

    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("expires_at").nullable();

    table.index(["token"]); // 👈 fast lookup on scan
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("event_tokens");
};
