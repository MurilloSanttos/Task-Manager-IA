const express = require('express');
const router = express.Router();
const CategoryTagController = require('../controllers/CategoryTagController');
const authMiddleware = require('../middleware/authMiddleware');

// Rota para criar uma nova tag
router.post('/', authMiddleware, CategoryTagController.createTag);

module.exports = router;