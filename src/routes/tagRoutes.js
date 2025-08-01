const express = require('express');
const router = express.Router();

// Importar a CLASSE do CategoryTagController
// CategoryTagController.js exporta 'new CategoryTagController()', então importei a instância diretamente.
const CategoryTagController = require('../controllers/CategoryTagController');

// Importar o middleware de autenticação
const authMiddleware = require('../middleware/authMiddleware');

// ====================================================================
// Rotas de Gerenciamento de Tags (Todos requerem autenticação JWT)
// ====================================================================

// Rota para criar uma nova tag
// Método: POST
// URL: /tags
router.post('/', authMiddleware, CategoryTagController.createTag); // Usando a instância importada

// Exportar o roteador configurado
module.exports = router;