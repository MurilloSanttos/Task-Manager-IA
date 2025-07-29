require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./src/database/connection');
const authRoutes = require('./src/routes/authRoutes');
const authMiddleware = require('./src/middleware/authMiddleware');
const passport = require('./src/config/passport');
const taskRoutes = require('./src/routes/taskRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const tagRoutes = require('./src/routes/tagRoutes'); 

const aiRoutes = require('./src/routes/aiRoutes');

const { apiLimiter, authLimiter } = require('./src/config/rateLimit');

const app = express();

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Aplicação dos limitadores
app.use('/auth', authLimiter, authRoutes);
app.use(apiLimiter);

// Rota de teste (Health Check)
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Bem-vindo à API do Gerenciador de Tarefas com IA!' });
});

// Usar as Rotas da Aplicação
app.use('/tasks', taskRoutes);
app.use('/categories', categoryRoutes);
app.use('/tags', tagRoutes);
app.use('/ai', aiRoutes);

// --- Rota Protegida ---
// Esta rota usará o authMiddleware para garantir que o usuário está autenticado
app.get('/protected', authMiddleware, (req, res) => {
    // Se a requisição chegou aqui, significa que o token foi validado
    // e as informações do usuário (req.userId, req.userEmail) estão disponíveis
    res.status(200).json({
        message: `Bem-vindo, usuário autenticado! Seu ID é: ${req.userId} e e-mail: ${req.userEmail}.`,
        userId: req.userId,
        userEmail: req.userEmail
    });
});
// --- Fim ---

// Testar conexão com o banco de dados
db.raw('SELECT 1+1 AS result')
  .then(() => console.log('Conexão com o banco de dados estabelecida com sucesso!'))
  .catch((err) => console.error('Erro ao conectar com o banco de dados:', err));

// Definir a Porta do Servidor
const PORT = process.env.PORT || 3001;

// Exporta a instância do Express 'app' e
// Opcionalmente, inicia o servidor apenas se o arquivo for executado diretamente (não por import)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
        console.log(`Acesse: http://localhost:${PORT}`);
    });
}

module.exports = app;