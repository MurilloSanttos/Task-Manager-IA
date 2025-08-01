// Carregar variáveis de ambiente
require('dotenv').config();

// Importar o aplicativo Express configurado (de src/app.js)
const app = require('./src/app');

// Importar a conexão com o banco de dados
const db = require('./src/database/connection');

// Importar a instância do AIService (que é exportada por src/app.js)
// Esta instância será a *real* na execução normal, sem mocks complexos em testes.
const aiService = require('./src/app').aiService;

// Definir a Porta do Servidor
// Pega a porta da variável de ambiente PORT, ou usa 3001 como padrão.
const PORT = process.env.PORT || 3001;

// Testar conexão com o banco de dados (para depuração na inicialização)
// Isso ajuda a verificar se o DB está acessível quando o servidor tenta iniciar.
db.raw('SELECT 1+1 AS result')
  .then(() => console.log('Conexão com o banco de dados estabelecida com sucesso!'))
  .catch((err) => console.error('Erro ao conectar com o banco de dados:', err));

// Inicializar os modelos de IA
// Os modelos de IA (prioridade, agrupamento) serão treinados APENAS UMA VEZ
// quando o `server.js` for o módulo principal (ou seja, quando o aplicativo é realmente iniciado,
// e não quando é importado por um teste ou outro módulo).
if (require.main === module) {
    console.log('Ambiente de execução principal detectado. Inicializando modelos de IA...');
    aiService.initializeModels();
} else {
    console.log('Ambiente de teste ou importação detectado. Modelos de IA não serão inicializados aqui.');
}

// Iniciar o Servidor HTTP
// app.listen() retorna uma instância do servidor HTTP.
// Exportei esta instância para que o Supertest possa fechar o servidor após os testes.
const server = app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});

// Exportar o servidor para uso em testes
// Nos testes de integração, eles importarão 'server' para testar as rotas.
module.exports = server;