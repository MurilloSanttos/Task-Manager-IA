exports.up = function(knex) {
  return knex.schema.createTable('tags', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('name').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.unique(['user_id', 'name']); // Garante unicidade por usuário
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('tags');
};