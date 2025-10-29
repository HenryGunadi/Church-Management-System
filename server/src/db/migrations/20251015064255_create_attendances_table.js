// migrations/20251015_create_attendance.js

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function (knex) {
    await knex.schema.createTable('attendance', (table) => {
        table.increments('id').primary();
        table
            .integer('event_id')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable('events')
            .onDelete('CASCADE');
        table
            .integer('user_id')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable('users')
            .onDelete('CASCADE');
        table.timestamp('scanned_at').defaultTo(knex.fn.now());
        table.enu('status', ['Present', 'Absent']).defaultTo('Present');
    });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function (knex) {
    await knex.schema.dropTableIfExists('attendance');
};
