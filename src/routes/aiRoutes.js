const express = require('express');
const router = express.Router();
const AIController = require('../controllers/AIController');
const authMiddleware = require('../middleware/authMiddleware');

// Todas as rotas abaixo usarão o authMiddleware, ou seja, exigem autenticação

// Rota para sugerir prioridade de um texto
router.get('/suggest-priority', authMiddleware, AIController.suggestPriority);

// Rota para sugerir reescrita de título
router.get('/rewrite-title', authMiddleware, AIController.suggestTitleRewrite);

// Rota para sugerir tarefas similares com base em um texto
router.get('/similar-tasks', authMiddleware, AIController.getSimilarTasksByText);


module.exports = router;