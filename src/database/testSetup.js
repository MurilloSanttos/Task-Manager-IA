const knex = require('knex');
const knexfile = require('../../knexfile');

// Instância do Knex para o ambiente de teste
const testDb = knex(knexfile.test);

const setupDatabase = async () => {
    // Executa todas as migrações para criar as tabelas no DB de teste
    await testDb.migrate.latest();
    console.log('Database migrated for tests.');
};

const teardownDatabase = async () => {
    // Desfaz todas as migrações para limpar o DB de teste
    await testDb.migrate.rollback(null, true); // null = todas as batches, true = force
    console.log('Database rolled back for tests.');
    await testDb.destroy(); // Fecha a conexão com o banco de dados
    console.log('Database connection closed.');
};

module.exports = { testDb, setupDatabase, teardownDatabase };