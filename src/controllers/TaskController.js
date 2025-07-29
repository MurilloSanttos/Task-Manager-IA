const db = require('../database/connection');
const moment = require('moment');
const AIService = require('../services/AIService');

class TaskController {
    // Método para criar uma nova tarefa
    async createTask(req, res) {
        const { userId } = req;
        let { title, description, deadline, priority, category_id, tags } = req.body; // 'priority' agora é 'let'

        // Validação básica
        if (!title) {
            return res.status(400).json({ message: 'O título da tarefa é obrigatório.' });
        }

        try {
            // Se a prioridade não for fornecida pelo usuário, sugere com IA
            if (!priority) {
                priority = AIService.suggestPriority(description || title); // Sugere com base na descrição ou título
                console.log(`IA sugeriu prioridade: ${priority} para a tarefa "${title}"`);
            }

            const [taskId] = await db('tasks').insert({
                user_id: userId,
                title,
                description,
                deadline,
                priority, // Usa a prioridade sugerida ou fornecida
                category_id
            });

            if (tags && tags.length > 0) {
                const taskTagsToInsert = tags.map(tagId => ({
                    task_id: taskId,
                    tag_id: tagId
                }));
                await db('task_tags').insert(taskTagsToInsert);
            }

            const newTask = await db('tasks').where({ id: taskId }).first();
            return res.status(201).json({
                message: 'Tarefa criada com sucesso!',
                task: newTask
            });

        } catch (error) {
            console.error('Erro ao criar tarefa:', error);
            if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
                return res.status(400).json({ message: 'Categoria ou tag(s) inválida(s). Verifique se existem.' });
            }
            return res.status(500).json({ message: 'Erro interno do servidor ao criar tarefa.' });
        }
    }

    // Método para editar uma tarefa existente
    async updateTask(req, res) {
        const { userId } = req;
        const { id } = req.params;
        let { title, description, deadline, priority, status, category_id, tags } = req.body; // 'priority' agora é 'let'

        // Validação básica
        if (!title) {
            return res.status(400).json({ message: 'O título da tarefa não pode ser vazio.' });
        }

        try {
            const task = await db('tasks').where({ id, user_id: userId }).first();

            if (!task) {
                return res.status(404).json({ message: 'Tarefa não encontrada ou você não tem permissão para editá-la.' });
            }

            // Se a prioridade NÃO for fornecida explicitamente na atualização,
            // e a descrição/título foi alterada ou prioridade é nula,
            // sugere uma nova prioridade com IA.
            // Para simplicidade no MVP, vou sempre sugerir se não for fornecida.
            if (!priority) { // Se a prioridade não foi explicitamente definida na requisição PUT
                // Usa a descrição ou título fornecido na requisição, ou os existentes na tarefa
                const textToAnalyze = description || title || task.description || task.title;
                if (textToAnalyze) {
                   priority = AIService.suggestPriority(textToAnalyze);
                   console.log(`IA sugeriu prioridade: ${priority} para a tarefa "${title || task.title}" na atualização`);
                } else {
                   priority = task.priority; // Mantém a prioridade existente se não houver texto para analisar
                }
            }

            // 2. Atualizar os dados da tarefa principal
            await db('tasks')
                .where({ id })
                .update({
                    title,
                    description,
                    deadline,
                    priority, // Usa a prioridade sugerida ou fornecida
                    status,
                    category_id,
                    updated_at: db.fn.now()
                });

            if (tags !== undefined) {
                await db('task_tags').where({ task_id: id }).del();
                if (tags.length > 0) {
                    const taskTagsToInsert = tags.map(tagId => ({
                        task_id: id,
                        tag_id: tagId
                    }));
                    await db('task_tags').insert(taskTagsToInsert);
                }
            }

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

    // Método para obter tarefas similares
    async getSimilarTasks(req, res) {
        const { userId } = req; // ID do usuário logado
        const { taskId } = req.params; // ID da tarefa base para encontrar similares
        const { description: queryDescription } = req.query; // Ou uma descrição fornecida diretamente na query param

        let taskDescriptionToAnalyze = '';

        try {
            // Se um taskId for fornecido, busca a descrição da tarefa no banco de dados
            if (taskId) {
                const task = await db('tasks').where({ id: taskId, user_id: userId }).first();
                if (!task) {
                    return res.status(404).json({ message: 'Tarefa base não encontrada ou você não tem permissão para acessá-la.' });
                }
                taskDescriptionToAnalyze = task.description || task.title;
            } else if (queryDescription) {
                // Se uma descrição for fornecida via query param, usa essa descrição
                taskDescriptionToAnalyze = queryDescription;
            } else {
                return res.status(400).json({ message: 'É necessário fornecer um taskId ou uma descrição (queryDescription) para buscar tarefas similares.' });
            }

            if (!taskDescriptionToAnalyze || taskDescriptionToAnalyze.trim() === '') {
                 return res.status(400).json({ message: 'Não há texto para analisar similaridade da tarefa.' });
            }

            // Obter todas as tarefas ATIVAS do usuário para comparar
            // Excluir a própria tarefa de base se for o caso
            const allUserActiveTasks = await db('tasks')
                .where({ user_id: userId })
                .whereNotIn('status', ['completed', 'cancelled']); // Considera apenas tarefas ativas

            const tasksToCompare = allUserActiveTasks.filter(task => task.id !== parseInt(taskId));


            // Usar o AIService para sugerir tarefas similares
            const similarTasks = AIService.suggestSimilarTasks(taskDescriptionToAnalyze, tasksToCompare);

            return res.status(200).json({
                message: 'Sugestões de tarefas similares.',
                baseDescription: taskDescriptionToAnalyze,
                similarTasks: similarTasks
            });

        } catch (error) {
            console.error('Erro ao obter tarefas similares:', error);
            return res.status(500).json({ message: 'Erro interno do servidor ao buscar tarefas similares.' });
        }
    }
}

module.exports = new TaskController();