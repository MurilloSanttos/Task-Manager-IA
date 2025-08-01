const knex = require('knex'); // Importa a biblioteca Knex
const knexfile = require('../../knexfile'); // Importa o arquivo de configuração do Knex

// Cria uma instância do Knex configurada especificamente para o ambiente de 'development'.
// Esta instância se conectará ao arquivo 'dev.sqlite3' conforme definido em knexfile.js.
const db = knex(knexfile.development);

// Exporta a instância da conexão com o banco de dados.
// Esta instância 'db' será usada por todos os controladores e serviços
// para interagir com o banco de dados da aplicação em ambiente de desenvolvimento.
module.exports = db;