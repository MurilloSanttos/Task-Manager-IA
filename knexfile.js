require('dotenv').config(); // Carrega as variáveis de ambiente

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      // O banco de dados será um arquivo chamado 'dev.sqlite3' dentro da pasta 'src/database'
      filename: './src/database/dev.sqlite3'
    },
    // Configura o uso de chaves estrangeiras para SQLite
    // Necessário para manter a integridade referencial
    pool: {
      afterCreate: (conn, cb) => {
        conn.run('PRAGMA foreign_keys = ON', cb);
      }
    },
    migrations: {
      directory: './src/database/migrations'
    },
    seeds: { // Opcional: para popular o DB com dados de teste
      directory: './src/database/seeds'
    },
    useNullAsDefault: true // Recomendado para SQLite para tratar valores padrão
  },

  // Configurações diferentes para staging e production
  // production: {
  //   client: 'sqlite3',
  //   connection: {
  //     filename: './src/database/prod.sqlite3'
  //   },
  //   migrations: {
  //     directory: './src/database/migrations'
  //   },
  //   useNullAsDefault: true
  // }
};