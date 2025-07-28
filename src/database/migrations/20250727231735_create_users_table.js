/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.increments('id').primary(); // Coluna de ID auto-incrementável, chave primária
    table.string('email').notNullable().unique(); // E-mail do usuário, não nulo e único
    table.string('password_hash'); // Armazenará o hash da senha
    table.string('google_id').unique(); // ID para autenticação Google OAuth
    table.timestamp('created_at').defaultTo(knex.fn.now()); // Data de criação, padrão para data/hora atual
    table.timestamp('updated_at').defaultTo(knex.fn.now()); // Data de atualização, padrão para data/hora atual
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('users'); // Comando para reverter a migração (deletar a tabela)
};