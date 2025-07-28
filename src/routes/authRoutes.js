const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const passport = require('passport'); 
const jwt = require('jsonwebtoken');

// Rota para registro de usuário
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// --- Rotas para Autenticação Google OAuth ---

// 1. Rota para iniciar o fluxo de autenticação com o Google
// Redireciona o usuário para a tela de consentimento do Google
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// 2. Rota de callback do Google
// O Google redireciona para esta URL após a autenticação do usuário.
// Aqui, o Passport.js processa a resposta do Google.
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/auth/login-failure', session: false }),
    (req, res) => {
        const user = req.user;

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Autenticação Google bem-sucedida! JWT gerado.',
            token: token,
            user: { id: user.id, email: user.email }
        });
    }
);

// Rota para redirecionar em caso de falha no login Google
router.get('/login-failure', (req, res) => {
    res.status(401).json({ message: 'Falha na autenticação Google.' });
});

module.exports = router;