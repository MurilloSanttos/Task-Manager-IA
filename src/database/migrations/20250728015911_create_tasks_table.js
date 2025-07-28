/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('tasks', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE'); // Chave estrangeira para usuários
    table.integer('category_id').unsigned().references('id').inTable('categories').onDelete('SET NULL');
    table.string('title').notNullable();
    table.text('description'); // TEXT para descrições mais longas
    table.timestamp('deadline'); // Pode ser nulo
    table.string('priority').defaultTo('medium').notNullable(); // 'low', 'medium', 'high', 'urgent'
    table.string('status').defaultTo('pending').notNullable(); // 'pending', 'in_progress', 'completed', 'cancelled', 'rescheduled'
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('tasks');
};