/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    await knex.schema.createTable('events', (table) => {
        table.increments('id').primary();
        table.string('event_name').notNullable();
        table.string('place').notNullable();
        table.string('image_url').nullable();
        table.text('description').nullable();

        table.timestamps(true, true); // created_at, updated_at
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.dropTableIfExists('events');
};
