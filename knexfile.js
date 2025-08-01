// Carrega as variáveis de ambiente do arquivo .env.
require('dotenv').config();

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {

  // ====================================================================
  // Ambiente de Desenvolvimento (development)
  // Utilizado para o desenvolvimento local do aplicativo.
  // ====================================================================
  development: {
    client: 'sqlite3', // Define o cliente do banco de dados como SQLite3
    connection: {
      // O banco de dados será um arquivo chamado 'dev.sqlite3'
      // localizado dentro da pasta 'src/database'.
      filename: './src/database/dev.sqlite3'
    },
    // Configuração do pool para SQLite3:
    // Garante que as chaves estrangeiras (FOREIGN KEYS) sejam ativadas.
    // Isso é VITAL para a integridade referencial no SQLite.
    pool: {
      afterCreate: (conn, cb) => {
        conn.run('PRAGMA foreign_keys = ON', cb);
      }
    },
    // Define o diretório onde os arquivos de migração estão localizados.
    migrations: {
      directory: './src/database/migrations'
    },
    // Define o diretório para arquivos de "seeds" (população de dados de teste),
    // que são úteis para preencher o DB com dados iniciais.
    seeds: {
      directory: './src/database/seeds' // Ainda não uso seeds, mas é bom ter
    },
    // Recomendado para SQLite para lidar com valores padrão de colunas.
    useNullAsDefault: true
  },

  // ====================================================================
  // Ambiente de Teste (test)
  // Utilizado especificamente para a execução dos testes automatizados.
  // Garante um banco de dados limpo e isolado para cada rodada de testes.
  // ====================================================================
  test: {
    client: 'sqlite3', // Cliente SQLite3
    connection: {
      // Um banco de dados SEPARADO para testes, 'test.sqlite3'.
      // Isso evita que os testes poluam ou dependam dos dados de desenvolvimento.
      filename: './src/database/test.sqlite3'
    },
    // Ativa as chaves estrangeiras para o banco de dados de teste.
    pool: {
      afterCreate: (conn, cb) => {
        conn.run('PRAGMA foreign_keys = ON', cb);
      }
    },
    // As migrações são as mesmas para todos os ambientes.
    migrations: {
      directory: './src/database/migrations'
    },
    // Seeds também podem ser usados em testes para preparar dados específicos.
    seeds: {
      directory: './src/database/seeds'
    },
    // Recomendado para SQLite.
    useNullAsDefault: true
  },
};