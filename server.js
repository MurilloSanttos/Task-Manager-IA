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

const { apiLimiter, authLimiter } = require('./src/config/rateLimit');

const app = express();

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// --- APLICAÇÃO DOS LIMITADORES ---

// 1. Aplica o limitador mais restritivo nas rotas de autenticação
app.use('/auth', authLimiter, authRoutes); // authLimiter será aplicado apenas às rotas de /auth

// 2. Aplica o limitador geral para todas as outras rotas da API
app.use(apiLimiter); // Aplica a todas as rotas que vêm depois, sem um limitador específico


// Rota de teste (Health Check)
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Bem-vindo à API do Gerenciador de Tarefas com IA!' });
});

// --- Rota Protegida ---
// Esta rota usará o authMiddleware para garantir que o usuário está autenticado
app.get('/protected', authMiddleware, (req, res) => { // <-- VERIFIQUE ESTA LINHA
    // Se a requisição chegou aqui, significa que o token foi validado
    // e as informações do usuário (req.userId, req.userEmail) estão disponíveis
    res.status(200).json({
        message: `Bem-vindo, usuário autenticado! Seu ID é: ${req.userId} e e-mail: ${req.userEmail}.`,
        userId: req.userId,
        userEmail: req.userEmail
    });
});
// --- Fim ---

// Usar as Rotas de Tarefas
app.use('/tasks', taskRoutes);

// Usar as Rotas de Categorias (Protegidas)
app.use('/categories', categoryRoutes);

// Usar as Rotas de Tags (Protegidas)
app.use('/tags', tagRoutes); 

// Testar conexão com o banco de dados
db.raw('SELECT 1+1 AS result')
  .then(() => console.log('Conexão com o banco de dados estabelecida com sucesso!'))
  .catch((err) => console.error('Erro ao conectar com o banco de dados:', err));

// Definir a Porta do Servidor
const PORT = process.env.PORT || 3001;

// Iniciar o Servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});