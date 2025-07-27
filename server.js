// 1. Importar as bibliotecas necessárias
require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env
const express = require('express');
const cors = require('cors');

// 2. Criar a instância da aplicação Express
const app = express();

// 3. Configurar os Middlewares
// Middleware para habilitar CORS (Cross-Origin Resource Sharing)
// Isso é crucial para permitir que meu front-end (que estará em outro domínio/porta)
// se comunique com este back-end.
app.use(cors());

// Middleware para analisar corpos de requisição JSON
// Isso permite que o Express entenda os dados enviados no formato JSON pelo front-end.
app.use(express.json());

// 4. Definir uma Rota de Teste (Health Check)
// Esta é uma rota simples para verificar se o servidor está funcionando.
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Bem-vindo à API do Gerenciador de Tarefas com IA!' });
});

// 5. Definir a Porta do Servidor
// Usei a variável de ambiente PORT, ou a porta 3001 como fallback.
// Variáveis de ambiente são ideais para configurar a aplicação em diferentes ambientes (desenvolvimento, produção).
const PORT = process.env.PORT || 3001;

// 6. Iniciar o Servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});