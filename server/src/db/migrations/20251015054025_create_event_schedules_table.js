/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable("event_schedules", (table) => {
    table.increments("id").primary();

    table
      .integer("event_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("events")
      .onDelete("CASCADE"); // delete schedules if the event is deleted

    table.datetime("start_time").notNullable();
    table.datetime("end_time").nullable();
    table.string("worship_topic").nullable();

    // 👇 QR CODE BELONGS HERE
    table.text("qr_code").nullable();

    table.timestamps(true, true); // created_at, updated_at
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("event_schedules");
};
