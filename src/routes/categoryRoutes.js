const express = require('express');
const router = express.Router();
const CategoryTagController = require('../controllers/CategoryTagController');
const authMiddleware = require('../middleware/authMiddleware');

// Rota para criar uma nova categoria
router.post('/', authMiddleware, CategoryTagController.createCategory);

module.exports = router;