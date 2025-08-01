const express = require('express');
const router = express.Router();

// AIController.js exporta 'new AIController()', então importei a instância diretamente.
const AIController = require('../controllers/AIController');

// Importar o middleware de autenticação
const authMiddleware = require('../middleware/authMiddleware');

// ====================================================================
// Rotas de Funcionalidades de IA (Todos requerem autenticação JWT)
// ====================================================================

// Rota para sugerir prioridade de um texto
// Método: GET
// URL: /ai/suggest-priority?text=...
router.get('/suggest-priority', authMiddleware, AIController.suggestPriority); // Usando a instância importada

// Rota para sugerir reescrita de título
// Método: GET
// URL: /ai/rewrite-title?title=...
router.get('/rewrite-title', authMiddleware, AIController.suggestTitleRewrite); // Usando a instância importada

// Rota para sugerir tarefas similares com base em um texto
// Método: GET
// URL: /ai/similar-tasks?description=...
router.get('/similar-tasks', authMiddleware, AIController.getSimilarTasksByText); // Usando a instância importada

// Exportar o roteador configurado
module.exports = router;