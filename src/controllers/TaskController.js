const db = require('../database/connection');
const moment = require('moment');

class TaskController {
    // Método para criar uma nova tarefa
    async createTask(req, res) {
        // req.userId é definido pelo nosso authMiddleware, garantindo que saiba quem é o usuário logado
        const { userId } = req;
        const { title, description, deadline, priority, category_id, tags } = req.body;

        // Validação básica
        if (!title) {
            return res.status(400).json({ message: 'O título da tarefa é obrigatório.' });
        }

        try {
            // 1. Inserir a tarefa principal
            const [taskId] = await db('tasks').insert({
                user_id: userId,
                title,
                description,
                deadline,
                priority,
                category_id // Pode ser null
            });

            // 2. Lidar com as tags (se fornecidas)
            if (tags && tags.length > 0) {
                // Para cada tag, inserimos uma entrada na tabela task_tags
                const taskTagsToInsert = tags.map(tagId => ({
                    task_id: taskId,
                    tag_id: tagId
                }));
                await db('task_tags').insert(taskTagsToInsert);
            }

            // 3. Retornar a tarefa criada
            const newTask = await db('tasks').where({ id: taskId }).first();
            return res.status(201).json({
                message: 'Tarefa criada com sucesso!',
                task: newTask
            });

        } catch (error) {
            console.error('Erro ao criar tarefa:', error);
            // Verifica se o erro é de chave estrangeira inválida (categoria_id ou tag_id não existem)
            if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
                return res.status(400).json({ message: 'Categoria ou tag(s) inválida(s). Verifique se existem.' });
            }
            return res.status(500).json({ message: 'Erro interno do servidor ao criar tarefa.' });
        }
    }

    // Método para editar uma tarefa existente
    async updateTask(req, res) {
        const { userId } = req; // ID do usuário logado
        const { id } = req.params; // ID da tarefa a ser editada (vindo da URL)
        const { title, description, deadline, priority, status, category_id, tags } = req.body;

        // Validação básica
        if (!title) {
            return res.status(400).json({ message: 'O título da tarefa não pode ser vazio.' });
        }

        try {
            // 1. Verificar se a tarefa existe e pertence ao usuário logado
            const task = await db('tasks').where({ id, user_id: userId }).first();

            if (!task) {
                return res.status(404).json({ message: 'Tarefa não encontrada ou você não tem permissão para editá-la.' });
            }

            // 2. Atualizar os dados da tarefa principal
            await db('tasks')
                .where({ id })
                .update({
                    title,
                    description,
                    deadline,
                    priority,
                    status,
                    category_id,
                    updated_at: db.fn.now() // Atualiza a data de atualização
                });

            // 3. Lidar com as tags
            if (tags !== undefined) { // Permite que 'tags' seja um array vazio para remover todas
                await db('task_tags').where({ task_id: id }).del(); // Remove todas as tags antigas da tarefa

                if (tags.length > 0) {
                    const taskTagsToInsert = tags.map(tagId => ({
                        task_id: id,
                        tag_id: tagId
                    }));
                    await db('task_tags').insert(taskTagsToInsert); // Insere as novas tags
                }
            }

            // 4. Retornar a tarefa atualizada
            const updatedTask = await db('tasks').where({ id }).first();
            return res.status(200).json({
                message: 'Tarefa atualizada com sucesso!',
                task: updatedTask
            });

        } catch (error) {
            console.error('Erro ao atualizar tarefa:', error);
            if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
                return res.status(400).json({ message: 'Categoria ou tag(s) inválida(s). Verifique se existem.' });
            }
            return res.status(500).json({ message: 'Erro interno do servidor ao atualizar tarefa.' });
        }
    }

    // Método para listar tarefas com filtros
    async listTasks(req, res) {
        const { userId } = req; // ID do usuário logado, do authMiddleware
        // Obtém os parâmetros de filtro da query string (ex: /tasks?status=pending&priority=high)
        const { status, priority, deadline_before, deadline_after } = req.query;

        try {
            // Inicia a query para buscar tarefas do usuário logado
            let query = db('tasks')
                .where({ user_id: userId });

            // Aplica filtros se eles forem fornecidos
            if (status) {
                query = query.where({ status });
            }
            if (priority) {
                query = query.where({ priority });
            }
            // Filtro por data limite: tarefas com deadline antes de uma data específica
            if (deadline_before) {
                query = query.where('deadline', '<=', deadline_before);
            }
            // Filtro por data limite: tarefas com deadline depois de uma data específica
            if (deadline_after) {
                query = query.where('deadline', '>=', deadline_after);
            }

            // Adicionar ordenação padrão (ex: por data limite ou prioridade)
            query = query.orderBy('deadline', 'asc').orderBy('priority', 'desc');

            // Executa a query
            const tasks = await query;

            // Retorna as tarefas encontradas
            return res.status(200).json({
                message: 'Tarefas listadas com sucesso!',
                tasks: tasks
            });

        } catch (error) {
            console.error('Erro ao listar tarefas:', error);
            return res.status(500).json({ message: 'Erro interno do servidor ao listar tarefas.' });
        }
    }

    // Método para deletar uma tarefa
    async deleteTask(req, res) {
        const { userId } = req; // ID do usuário logado, do authMiddleware
        const { id } = req.params; // ID da tarefa a ser deletada (vindo da URL)

        try {
            // 1. Verificar se a tarefa existe e pertence ao usuário logado
            // É crucial garantir que o usuário só possa deletar suas próprias tarefas
            const deletedRows = await db('tasks')
                .where({ id, user_id: userId })
                .del(); // O método .del() retorna o número de linhas deletadas

            if (deletedRows === 0) {
                // Se 0 linhas foram deletadas, a tarefa não foi encontrada
                // ou não pertence ao usuário autenticado.
                return res.status(404).json({ message: 'Tarefa não encontrada ou você não tem permissão para deletá-la.' });
            }

            // 2. Retornar uma resposta de sucesso
            return res.status(204).send(); // Status 204 No Content para operações de exclusão bem-sucedidas sem retorno de conteúdo

        } catch (error) {
            console.error('Erro ao deletar tarefa:', error);
            return res.status(500).json({ message: 'Erro interno do servidor ao deletar tarefa.' });
        }
    }

    // Método para obter tarefas próximas ao vencimento
    async getDueTasks(req, res) {
        const { userId } = req; // ID do usuário logado
        // Define quantos dias à frente quero verificar para tarefas "próximas ao vencimento".
        // Pode vir como query param futuramente, mas para o MVP, vou fixar em 7 dias.
        const daysAhead = parseInt(req.query.daysAhead) || 7; // Pega daysAhead da query ou usa 7 como padrão

        try {
            // Calcula a data de hoje e a data limite para a verificação
            const now = moment().startOf('day'); // Começo do dia atual
            const dueDateLimit = moment().add(daysAhead, 'days').endOf('day'); // Final do dia 'daysAhead' no futuro

            // Busca tarefas do usuário logado que:
            // 1. Têm um status que não é 'completed' ou 'cancelled'
            // 2. Têm uma deadline definida (não nula)
            // 3. A deadline está entre hoje e o limite de dias à frente
            const dueTasks = await db('tasks')
                .where({ user_id: userId })
                .whereNotIn('status', ['completed', 'cancelled']) // Ignora tarefas concluídas ou canceladas
                .whereNotNull('deadline')
                .whereBetween('deadline', [now.toISOString(), dueDateLimit.toISOString()])
                .orderBy('deadline', 'asc'); // Ordena pela data de vencimento mais próxima

            return res.status(200).json({
                message: `Tarefas com vencimento nos próximos ${daysAhead} dias.`,
                tasks: dueTasks
            });

        } catch (error) {
            console.error('Erro ao obter tarefas próximas ao vencimento:', error);
            return res.status(500).json({ message: 'Erro interno do servidor ao obter alertas de vencimento.' });
        }
    }
}

module.exports = new TaskController();