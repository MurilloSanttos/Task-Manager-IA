const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/TaskController');
const authMiddleware = require('../middleware/authMiddleware');

// Rotas protegidas por authMiddleware

// Rota para criar uma nova tarefa (POST /tasks)
router.post('/', authMiddleware, TaskController.createTask);

// Rota para editar uma tarefa existente (PUT /tasks/:id)
router.put('/:id', authMiddleware, TaskController.updateTask);

// Rota para listar tarefas com filtros (GET /tasks)
router.get('/', authMiddleware, TaskController.listTasks);

// Rota para deletar uma tarefa (DELETE /tasks/:id)
router.delete('/:id', authMiddleware, TaskController.deleteTask);

module.exports = router;