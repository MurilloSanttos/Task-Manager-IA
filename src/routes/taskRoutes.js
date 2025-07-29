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

// NRota para obter tarefas próximas ao vencimento (GET /tasks/due)
router.get('/due', authMiddleware, TaskController.getDueTasks);

// Rota para obter tarefas similares (GET /tasks/similar/:taskId ou /tasks/similar?description=...)
router.get('/similar/:taskId?', authMiddleware, TaskController.getSimilarTasks);

// Rota para sugerir reescrita de título (GET /tasks/rewrite-title?title=...)
router.get('/rewrite-title', authMiddleware, TaskController.suggestTitleRewrite);

// Rota para geração de resumo diário (GET /tasks/summary/daily)
router.get('/summary/daily', authMiddleware, TaskController.getDailySummary);

module.exports = router;