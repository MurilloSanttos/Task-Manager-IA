const rateLimit = require('express-rate-limit'); // Importa a biblioteca express-rate-limit

/**
 * @function apiLimiter
 * @description Configuração de rate limiting padrão para a maioria das rotas da API.
 * Permite 100 requisições a cada 15 minutos por IP.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Janela de 15 minutos (em milissegundos)
  max: 100, // Limite de 100 requisições por IP dentro da janela
  message: 'Muitas requisições deste IP, tente novamente após 15 minutos.', // Mensagem de erro
  statusCode: 429, // Código de status HTTP para 'Too Many Requests'
});

/**
 * @function authLimiter
 * @description Configuração de rate limiting mais restritiva para rotas de autenticação (login, registro).
 * Permite 10 requisições a cada 15 minutos por IP.
 * Essencial para prevenir ataques de força bruta.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Janela de 15 minutos
  max: 10, // Limite de 10 requisições por IP
  message: 'Muitas tentativas de login/registro deste IP, tente novamente após 15 minutos.', // Mensagem de erro
  statusCode: 429, // Código de status HTTP para 'Too Many Requests'
});

// Exporta as instâncias dos limitadores de taxa para serem usadas nos middlewares do Express.
module.exports = {
  apiLimiter,
  authLimiter
};