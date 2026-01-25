/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable("users", (table) => {
    table.increments("id").primary();
    table.string("name", 100).nullable();
    table.string("email", 100).notNullable().unique();
    table.string("password", 255).notNullable();
    table.enu("role", ["admin", "member"]).notNullable().defaultTo("member");
    table.enu("gender", ["Male", "Female"]).nullable();
    table.date("birth_date").nullable();
    table.string("phone_number", 20).nullable();
    table.text("address").nullable();
    table.timestamp("joined_at").defaultTo(knex.fn.now());
    table.timestamps(true, true); // created_at, updated_at
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("users");
};
