const jwt = require('jsonwebtoken'); // Para verificar o token
require('dotenv').config(); // Para acessar JWT_SECRET do .env

const authMiddleware = (req, res, next) => {
    // 1. Obter o token do cabeçalho da requisição
    // O token geralmente vem no formato: "Bearer SEU_TOKEN_AQUI"
    const authHeader = req.headers.authorization;

    // Se não houver cabeçalho de autorização, ou ele não começar com 'Bearer'
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Acesso negado. Token não fornecido ou formato inválido.' });
    }

    // Extrair apenas o token (remover "Bearer ")
    const token = authHeader.split(' ')[1];

    try {
        // 2. Verificar o token
        // jwt.verify decodifica o token e verifica sua validade (assinatura e expiração)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Anexar as informações do usuário decodificadas ao objeto de requisição
        // Isso torna o ID e e-mail do usuário acessíveis nas rotas protegidas
        req.userId = decoded.id;
        req.userEmail = decoded.email;

        // 4. Chamar next() para passar a requisição para a próxima função na cadeia (o controlador da rota)
        next();

    } catch (error) {
        // Lidar com diferentes tipos de erros de token
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expirado. Faça login novamente.' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({ message: 'Token inválido ou corrompido.' });
        }
        console.error('Erro de autenticação:', error);
        return res.status(500).json({ message: 'Erro interno do servidor ao autenticar.' });
    }
};

module.exports = authMiddleware;