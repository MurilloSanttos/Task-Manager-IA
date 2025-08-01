// Importar bibliotecas e módulos essenciais
const express = require('express');
const cors = require('cors');
const passport = require('./config/passport'); // Configuração do Passport.js (autenticação)
const { apiLimiter, authLimiter } = require('./config/rateLimit'); // Middlewares de rate limiting

// Importar as rotas da aplicação
const authRoutes = require('./routes/authRoutes'); // Rotas de autenticação
const taskRoutes = require('./routes/taskRoutes'); // Rotas de gerenciamento de tarefas
const categoryRoutes = require('./routes/categoryRoutes'); // Rotas de categorias
const tagRoutes = require('./routes/tagRoutes'); // Rotas de tags
const aiRoutes = require('./routes/aiRoutes'); // Rotas de funcionalidades de IA

// Importar a CLASSE AIService
const aiService = require('./services/AIService');

// Criar a instância principal do aplicativo Express
const app = express();

// Configurar Middlewares Globais
// Estes middlewares serão executados para todas as requisições que chegam à API.
app.use(cors()); // Habilita o CORS para permitir requisições de diferentes origens
app.use(express.json()); // Habilita o parsing de corpos de requisição JSON
app.use(passport.initialize()); // Inicializa o Passport.js para autenticação

// Aplicar Middlewares de Rate Limiting e Montar Rotas
// A ordem é importante aqui para a aplicação dos limitadores e rotas.

//  Rotas de Autenticação (com limitador mais restritivo)
// Qualquer requisição para '/auth/*' passará primeiro pelo authLimiter.
app.use('/auth', authLimiter, authRoutes);

// Limitador Geral para TODAS AS OUTRAS ROTAS
// Este apiLimiter será aplicado a todas as rotas definidas ABAIXO dele que
// não possuem um limitador específico próprio.
app.use(apiLimiter);

//  Rota de Teste (Health Check) - Pode ser acessada para verificar se a API está de pé
// Esta rota está após o apiLimiter, então também será limitada.
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Bem-vindo à API do Gerenciador de Tarefas com IA!' });
});

// Montar as Rotas da Aplicação Principal
// Todas essas rotas serão protegidas pelo apiLimiter.
app.use('/tasks', taskRoutes);
app.use('/categories', categoryRoutes);
app.use('/tags', tagRoutes);
app.use('/ai', aiRoutes); // Rotas dedicadas às funcionalidades de IA

// Exportar o aplicativo Express configurado
// Este `app` será importado pelo `server.js` para iniciar o servidor,
// e pelos arquivos de teste para simular requisições.
module.exports = app;

// Exportar a instância do AIService separadamente
// Isso permite que `server.js` chame `initializeModels()` e que controladores a utilizem.
module.exports.aiService = aiService;