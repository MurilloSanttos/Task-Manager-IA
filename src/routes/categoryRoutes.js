const express = require('express');
const router = express.Router();

// Importar a CLASSE do CategoryTagController
// CategoryTagController.js exporta 'new CategoryTagController()', então importei a instância diretamente.
const CategoryTagController = require('../controllers/CategoryTagController');

// Importar o middleware de autenticação
const authMiddleware = require('../middleware/authMiddleware');

// ====================================================================
// Rotas de Gerenciamento de Categorias (Todos requerem autenticação JWT)
// ====================================================================

// Rota para criar uma nova categoria
// Método: POST
// URL: /categories
router.post('/', authMiddleware, CategoryTagController.createCategory); // Usando a instância importada

// Exportar o roteador configurado
module.exports = router;