const knex = require('knex');
const knexfile = require('../../knexfile'); // Importa o arquivo de configuração

// Crie a instância do Knex para o ambiente de desenvolvimento
const db = knex(knexfile.development);

module.exports = db;