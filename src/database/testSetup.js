const knex = require('knex'); // Importa a biblioteca Knex
const knexfile = require('../../knexfile'); // Importa o arquivo de configuração do Knex

// Cria uma instância do Knex configurada para o ambiente de 'test'.
// Esta instância se conectará ao arquivo 'test.sqlite3' conforme definido em knexfile.js.
const testDb = knex(knexfile.test);

/**
 * @function setupDatabase
 * @description Configura o banco de dados para os testes.
 * Executa todas as migrações para criar as tabelas necessárias no banco de dados de teste.
 * Garante que o banco de dados esteja em um estado conhecido antes de cada rodada de testes.
 */
const setupDatabase = async () => {
  try {
    // Executa todas as migrações pendentes para o ambiente de teste.
    // Isso criará todas as tabelas definidas nas migrações.
    await testDb.migrate.latest();
    console.log('Database migrated for tests.');
  } catch (error) {
    console.error('Erro ao migrar o banco de dados para testes:', error);
    // Lança o erro novamente para que o Jest o capture e o teste falhe
    throw error;
  }
};

/**
 * @function teardownDatabase
 * @description Limpa o banco de dados após a execução dos testes.
 * Desfaz todas as migrações (rollback) para remover todas as tabelas,
 * garantindo que não haja resíduos de dados de testes anteriores.
 * Fecha a conexão com o banco de dados.
 */
const teardownDatabase = async () => {
  try {
    // Desfaz todas as migrações para reverter o banco de dados ao estado inicial (vazio).
    // 'null' para reverter todas as batches, 'true' para forçar a execução.
    await testDb.migrate.rollback(null, true);
    console.log('Database rolled back for tests.');
  } catch (error) {
    console.error('Erro ao reverter o banco de dados para testes:', error);
    throw error;
  } finally {
    // Sempre fecha a conexão com o banco de dados para liberar recursos.
    // Isso é crucial para evitar 'open handles' que impedem o Jest de sair.
    await testDb.destroy();
    console.log('Database connection closed.');
  }
};

// Exporta a instância do Knex para o ambiente de teste e as funções de setup/teardown.
module.exports = { testDb, setupDatabase, teardownDatabase };