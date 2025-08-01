const express = require('express');
const router = express.Router();

// Importar a CLASSE do AuthController
// AuthController.js agora exporta 'new AuthController()', então importei a instância diretamente.
const AuthController = require('../controllers/AuthController');

// Importar a instância do Passport.js
const passport = require('passport');

// Importar o jsonwebtoken
const jwt = require('jsonwebtoken'); // Usado para gerar tokens após login/OAuth

// ====================================================================
// Rotas de Autenticação
// ====================================================================

// Rota para registro de usuário (cadastro)
// Método: POST
// URL: /auth/register
router.post('/register', AuthController.register); // Usando a instância importada

// Rota para login de usuário
// Método: POST
// URL: /auth/login
router.post('/login', AuthController.login); // Usando a instância importada

// --- Rotas para Autenticação Google OAuth ---

// Rota para iniciar o fluxo de autenticação com o Google
// Método: GET
// URL: /auth/google
// Redireciona o usuário para a tela de consentimento do Google
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Rota de callback do Google
// Método: GET
// URL: /auth/google/callback
// O Google redireciona para esta URL após a autenticação do usuário.
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/auth/login-failure', session: false }),
    (req, res) => {
        const user = req.user;
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token expira em 1 hora
        );
        res.redirect(`http://localhost:3000/auth/callback?token=${token}&userId=${user.id}&userEmail=${user.email}`);
    }
);

// Rota para redirecionar em caso de falha no login Google
// Método: GET
// URL: /auth/login-failure
router.get('/login-failure', (req, res) => {
    res.status(401).json({ message: 'Falha na autenticação Google.' });
});

// Exportar o roteador configurado
module.exports = router;