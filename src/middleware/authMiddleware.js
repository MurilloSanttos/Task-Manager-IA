const jwt = require('jsonwebtoken'); // Importa a biblioteca para verificar JWTs
require('dotenv').config(); // Para acessar a chave secreta JWT do arquivo .env

/**
 * @function authMiddleware
 * @description Middleware para verificar a autenticidade de um JSON Web Token (JWT).
 * Se o token for válido, anexa o ID e e-mail do usuário à requisição (req.userId, req.userEmail)
 * e permite que a requisição prossiga. Caso contrário, retorna um erro de autenticação.
 * @param {Object} req - Objeto de requisição do Express.
 * @param {Object} res - Objeto de resposta do Express.
 * @param {Function} next - Função para passar o controle para o próximo middleware/rota.
 */
const authMiddleware = (req, res, next) => {
    // Obter o token do cabeçalho da requisição
    // O token é esperado no formato: "Bearer SEU_TOKEN_AQUI"
    const authHeader = req.headers.authorization;

    // Se o cabeçalho de autorização não estiver presente ou não começar com 'Bearer'
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.warn('Tentativa de acesso não autorizado: Token não fornecido ou formato inválido.');
        return res.status(401).json({ message: 'Acesso negado. Token não fornecido ou formato inválido.' });
    }

    // Extrair apenas o token (remover o prefixo "Bearer ")
    const token = authHeader.split(' ')[1];

    try {
        // Verificar o token
        // jwt.verify decodifica o token usando a chave secreta e verifica sua validade (assinatura e expiração).
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Anexar as informações do usuário decodificadas ao objeto de requisição
        // Isso torna o ID e e-mail do usuário autenticado acessíveis nas rotas protegidas.
        req.userId = decoded.id;
        req.userEmail = decoded.email;

        // Chamar next() para passar o controle para a próxima função na cadeia de middlewares/rotas.
        next();

    } catch (error) {
        // Lidar com diferentes tipos de erros relacionados ao token
        if (error.name === 'TokenExpiredError') {
            console.warn('Tentativa de acesso com token expirado.');
            return res.status(401).json({ message: 'Token expirado. Faça login novamente.' });
        }
        if (error.name === 'JsonWebTokenError') {
            console.warn('Tentativa de acesso com token inválido ou corrompido.');
            return res.status(403).json({ message: 'Token inválido ou corrompido.' });
        }
        // Para outros erros inesperados na verificação do token
        console.error('Erro interno do servidor ao autenticar token:', error);
        return res.status(500).json({ message: 'Erro interno do servidor ao autenticar.' });
    }
};

// Exportar o middleware para ser utilizado nas rotas
module.exports = authMiddleware;