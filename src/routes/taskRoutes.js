const express = require('express');
const router = express.Router();

// Importar a CLASSE do TaskController
// TaskController.js exporta 'new TaskController()', então importei a instância diretamente.
const TaskController = require('../controllers/TaskController');

// Importar o middleware de autenticação
const authMiddleware = require('../middleware/authMiddleware');

// ====================================================================
// Rotas de Gerenciamento de Tarefas (Todos requerem autenticação JWT)
// ====================================================================

// Rota para criar uma nova tarefa
// Método: POST
// URL: /tasks
router.post('/', authMiddleware, TaskController.createTask);

// Rota para listar tarefas com filtros
// Método: GET
// URL: /tasks
router.get('/', authMiddleware, TaskController.listTasks);

// Rota para atualizar uma tarefa existente
// Método: PUT
// URL: /tasks/:id
router.put('/:id', authMiddleware, TaskController.updateTask);

// Rota para deletar uma tarefa
// Método: DELETE
// URL: /tasks/:id
router.delete('/:id', authMiddleware, TaskController.deleteTask);

// Rota para obter tarefas próximas ao vencimento (Alertas de Vencimento)
// Método: GET
// URL: /tasks/due
router.get('/due', authMiddleware, TaskController.getDueTasks);

// Rota para obter tarefas similares a uma tarefa existente (por ID)
// Método: GET
// URL: /tasks/similar/:taskId
router.get('/similar/:taskId', authMiddleware, TaskController.getSimilarTasks);

// Rota para obter tarefas similares a uma descrição de texto (sem ID de tarefa)
// Método: GET
// URL: /tasks/similar
router.get('/similar', authMiddleware, TaskController.getSimilarTasks);

// Rota para sugerir reescrita de título (usada pela UI para ajudar o usuário a escrever)
// Método: GET
// URL: /tasks/rewrite-title
router.get('/rewrite-title', authMiddleware, TaskController.suggestTitleRewrite);

// Rota para gerar o resumo diário de tarefas
// Método: GET
// URL: /tasks/summary/daily
router.get('/summary/daily', authMiddleware, TaskController.getDailySummary);

// Exportar o roteador configurado
module.exports = router;