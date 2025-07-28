require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./src/database/connection');
const authRoutes = require('./src/routes/authRoutes');
const authMiddleware = require('./src/middleware/authMiddleware');
const passport = require('./src/config/passport');

const app = express();

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Rota de teste (Health Check)
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Bem-vindo à API do Gerenciador de Tarefas com IA!' });
});

// Usar as Rotas de Autenticação
app.use('/auth', authRoutes);

// --- Exemplo de Rota Protegida ---
// Esta rota usará o authMiddleware para garantir que o usuário está autenticado
// --- Exemplo de Rota Protegida ---
app.get('/protected', authMiddleware, (req, res) => {
    res.status(200).json({
        message: `Bem-vindo, usuário autenticado! Seu ID é: ${req.userId} e e-mail: ${req.userEmail}.`,
        userId: req.userId,
        userEmail: req.userEmail
    });
});
// --- Fim do Exemplo ---

// Testar conexão com o banco de dados (opcional)
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