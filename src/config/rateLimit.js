const rateLimit = require('express-rate-limit');

// Configuração básica do rate limiting para toda a API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos (tempo de duração da janela)
  max: 100, // Limite de 100 requisições por IP por `windowMs`
  message: 'Muitas requisições deste IP, tente novamente após 15 minutos.',
  // header: true, // Adiciona os headers X-RateLimit-Limit, X-RateLimit-Remaining e Retry-After
  // Para APIs, geralmente enviamos apenas o status 429
  statusCode: 429, // Too Many Requests
  // keyGenerator: (req, res) => req.ip, // Padrão: usa o IP do cliente
  // store: new RateLimitStore(), // Pode usar um store diferente (Redis, Memcached) para escala
});

// Configuração mais restritiva para rotas de autenticação (login, registro)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Limite de 10 requisições por IP por `windowMs`
  message: 'Muitas tentativas de login/registro deste IP, tente novamente após 15 minutos.',
  statusCode: 429,
});

module.exports = {
  apiLimiter,
  authLimiter
};