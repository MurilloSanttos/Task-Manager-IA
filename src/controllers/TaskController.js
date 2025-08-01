const db = require('../database/connection'); // Conexão com o banco de dados
const moment = require('moment'); // Para manipulação de datas
const aiService = require('../app').aiService; // Importa a instância do AIService de src/app.js

/**
 * @class TaskController
 * @description Controlador responsável por gerenciar todas as operações
 * relacionadas a tarefas (CRUD, alertas, similaridade, resumo diário).
 */
class TaskController {

    /**
     * @method createTask
     * @description Cria uma nova tarefa para o usuário autenticado.
     * Sugere prioridade com IA se não for fornecida.
     * @param {Object} req - Objeto de requisição (contém req.userId do authMiddleware).
     * @param {Object} res - Objeto de resposta.
     */
    async createTask(req, res) {
        const { userId } = req; // ID do usuário do token JWT
        let { title, description, deadline, priority, category_id, tags } = req.body;

        // Validação básica: título é obrigatório
        if (!title) {
            return res.status(400).json({ message: 'O título da tarefa é obrigatório.' });
        }

        try {
            // Se a prioridade NÃO foi fornecida pelo usuário, a IA sugere
            if (!priority) {
                priority = aiService.suggestPriority(description || title); // Usa aiService
                console.log(`IA sugeriu prioridade: ${priority} para a tarefa "${title}"`);
            }

            // Inserir a tarefa principal no banco de dados
            const [taskId] = await db('tasks').insert({
                user_id: userId,
                title,
                description,
                deadline,
                priority,
                category_id // Pode ser null
            });

            // Lidar com as tags (se fornecidas)
            if (tags && tags.length > 0) {
                // Prepara as entradas para a tabela de ligação task_tags
                const taskTagsToInsert = tags.map(tagId => ({
                    task_id: taskId,
                    tag_id: tagId
                }));
                await db('task_tags').insert(taskTagsToInsert);
            }

            // Retornar a tarefa criada
            const newTask = await db('tasks').where({ id: taskId }).first();
            return res.status(201).json({
                message: 'Tarefa criada com sucesso!',
                task: newTask
            });

        } catch (error) {
            console.error('Erro ao criar tarefa:', error);
            // Captura erros de chave estrangeira (categoria ou tag inválida)
            if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
                return res.status(400).json({ message: 'Categoria ou tag(s) inválida(s). Verifique se existem.' });
            }
            return res.status(500).json({ message: 'Erro interno do servidor ao criar tarefa.' });
        }
    }

    /**
     * @method listTasks
     * @description Lista as tarefas do usuário autenticado, com opções de filtro.
     * @param {Object} req - Objeto de requisição (req.userId, req.query para filtros).
     * @param {Object} res - Objeto de resposta.
     */
    async listTasks(req, res) {
        const { userId } = req;
        // Filtros da query string
        const { status, priority, deadline_before, deadline_after } = req.query;

        try {
            let query = db('tasks')
                .where({ user_id: userId }); // Sempre filtra por usuário

            // Aplica filtros se fornecidos
            if (status) {
                query = query.where({ status });
            }
            if (priority) {
                query = query.where({ priority });
            }
            if (deadline_before) {
                query = query.where('deadline', '<=', deadline_before);
            }
            if (deadline_after) {
                query = query.where('deadline', '>=', deadline_after);
            }

            // Ordenação padrão
            query = query.orderBy('deadline', 'asc').orderBy('priority', 'desc');

            const tasks = await query;

            return res.status(200).json({
                message: 'Tarefas listadas com sucesso!',
                tasks: tasks
            });

        } catch (error) {
            console.error('Erro ao listar tarefas:', error);
            return res.status(500).json({ message: 'Erro interno do servidor ao listar tarefas.' });
        }
    }

    /**
     * @method updateTask
     * @description Atualiza uma tarefa existente do usuário autenticado.
     * Pode sugerir nova prioridade com IA se o campo for omitido.
     * @param {Object} req - Objeto de requisição (req.userId, req.params.id para ID da tarefa).
     * @param {Object} res - Objeto de resposta.
     */
    async updateTask(req, res) {
        const { userId } = req;
        const { id } = req.params; // ID da tarefa da URL
        let { title, description, deadline, priority, status, category_id, tags } = req.body;

        // Validação básica
        if (!title) {
            return res.status(400).json({ message: 'O título da tarefa não pode ser vazio.' });
        }

        try {
            // Verificar se a tarefa existe E pertence ao usuário logado (segurança!)
            const task = await db('tasks').where({ id, user_id: userId }).first();

            if (!task) {
                return res.status(404).json({ message: 'Tarefa não encontrada ou você não tem permissão para editá-la.' });
            }

            // Se a prioridade NÃO foi fornecida explicitamente na atualização, a IA sugere
            if (!priority) {
                // Usa a descrição ou título fornecido na requisição, ou os existentes na tarefa
                const textToAnalyze = description || title || task.description || task.title;
                if (textToAnalyze) {
                   priority = aiService.suggestPriority(textToAnalyze); // Usa aiService
                   console.log(`IA sugeriu prioridade: ${priority} para a tarefa "${title || task.title}" na atualização`);
                } else {
                   priority = task.priority; // Mantém a prioridade existente se não houver texto para analisar
                }
            }

            // Atualizar os dados da tarefa principal
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

            // Lidar com as tags (remover antigas e adicionar novas)
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

            // Retornar a tarefa atualizada
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

    /**
     * @method deleteTask
     * @description Exclui uma tarefa do usuário autenticado.
     * @param {Object} req - Objeto de requisição (req.userId, req.params.id para ID da tarefa).
     * @param {Object} res - Objeto de resposta.
     */
    async deleteTask(req, res) {
        const { userId } = req;
        const { id } = req.params;

        try {
            // Verifica se a tarefa existe e pertence ao usuário para exclusão segura
            const deletedRows = await db('tasks')
                .where({ id, user_id: userId })
                .del(); // Retorna o número de linhas deletadas

            if (deletedRows === 0) {
                // Se 0 linhas foram deletadas, a tarefa não foi encontrada ou não pertence ao usuário.
                return res.status(404).json({ message: 'Tarefa não encontrada ou você não tem permissão para deletá-la.' });
            }

            // Retorna status 204 No Content para exclusão bem-sucedida sem conteúdo.
            return res.status(204).send();

        } catch (error) {
            console.error('Erro ao deletar tarefa:', error);
            return res.status(500).json({ message: 'Erro interno do servidor ao deletar tarefa.' });
        }
    }

    /**
     * @method getDueTasks
     * @description Obtém tarefas do usuário que vencem em um período próximo (alertas de vencimento).
     * @param {Object} req - Objeto de requisição (req.userId, req.query.daysAhead opcional).
     * @param {Object} res - Objeto de resposta.
     */
    async getDueTasks(req, res) {
        const { userId } = req;
        const daysAhead = parseInt(req.query.daysAhead) || 7; // Padrão: 7 dias

        const now = moment().startOf('day');
        const dueDateLimit = moment().add(daysAhead, 'days').endOf('day');

        try {
            const dueTasks = await db('tasks')
                .where({ user_id: userId })
                .whereNotIn('status', ['completed', 'cancelled']) // Ignora tarefas já concluídas ou canceladas
                .whereNotNull('deadline') // Apenas tarefas com deadline definida
                .whereBetween('deadline', [now.toISOString(), dueDateLimit.toISOString()])
                .orderBy('deadline', 'asc');

            return res.status(200).json({
                message: `Tarefas com vencimento nos próximos ${daysAhead} dias.`,
                tasks: dueTasks
            });

        } catch (error) {
            console.error('Erro ao obter tarefas próximas ao vencimento:', error);
            return res.status(500).json({ message: 'Erro interno do servidor ao obter alertas de vencimento.' });
        }
    }

    /**
     * @method getSimilarTasks
     * @description Sugere tarefas similares a uma tarefa existente ou a uma descrição de texto.
     * @param {Object} req - Objeto de requisição (req.userId, req.params.taskId ou req.query.description).
     * @param {Object} res - Objeto de resposta.
     */
    async getSimilarTasks(req, res) {
        const { userId } = req;
        const { taskId } = req.params; // ID da tarefa base
        const { description: queryDescription } = req.query; // Descrição fornecida

        let taskDescriptionToAnalyze = '';

        try {
            // Prioriza taskId, senão usa queryDescription
            if (taskId) {
                const task = await db('tasks').where({ id: taskId, user_id: userId }).first();
                if (!task) {
                    return res.status(404).json({ message: 'Tarefa base não encontrada ou você não tem permissão para acessá-la.' });
                }
                taskDescriptionToAnalyze = task.description || task.title;
            } else if (queryDescription) {
                taskDescriptionToAnalyze = queryDescription;
            } else {
                return res.status(400).json({ message: 'É necessário fornecer um taskId ou uma descrição (queryDescription) para buscar tarefas similares.' });
            }

            if (!taskDescriptionToAnalyze || taskDescriptionToAnalyze.trim() === '') {
                 return res.status(400).json({ message: 'Não há texto para analisar similaridade da tarefa.' });
            }

            // Obtém todas as tarefas ATIVAS do usuário para comparar
            const allUserActiveTasks = await db('tasks')
                .where({ user_id: userId })
                .whereNotIn('status', ['completed', 'cancelled']); // Não inclui tarefas concluídas ou canceladas

            // Filtra a própria tarefa de base da lista de comparação (se for o caso)
            const tasksToCompare = allUserActiveTasks.filter(task => task.id !== parseInt(taskId));

            // Usa a instância do AIService para encontrar tarefas similares
            const similarTasks = aiService.suggestSimilarTasks(taskDescriptionToAnalyze, tasksToCompare); // Usa aiService

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

    /**
     * @method suggestTitleRewrite
     * @description Sugere uma reescrita mais clara ou completa para um título de tarefa usando IA.
     * @param {Object} req - Objeto de requisição (req.query.title para o título original).
     * @param {Object} res - Objeto de resposta.
     */
    async suggestTitleRewrite(req, res) {
        const { title } = req.query; // Título original da query string

        if (!title || title.trim() === '') {
            return res.status(400).json({ message: 'O título é obrigatório para sugestão de reescrita.' });
        }

        try {
            // Usa a instância do AIService para reescrever o título
            const suggestedTitle = aiService.rewriteTitle(title); // Usa aiService

            return res.status(200).json({
                originalTitle: title,
                suggestedTitle: suggestedTitle,
                message: 'Sugestão de reescrita de título gerada.'
            });

        } catch (error) {
            console.error('Erro ao sugerir reescrita de título:', error);
            return res.status(500).json({ message: 'Erro interno do servidor ao sugerir reescrita de título.' });
        }
    }

    /**
     * @method getDailySummary
     * @description Gera um resumo diário das tarefas do usuário, categorizando-as.
     * @param {Object} req - Objeto de requisição (req.userId).
     * @param {Object} res - Objeto de resposta.
     */
    async getDailySummary(req, res) {
        const { userId } = req;
        // Define as datas de hoje para as consultas
        const todayStart = moment().startOf('day').toISOString();
        const todayEnd = moment().endOf('day').toISOString();
        const now = moment().toISOString();

        try {
            // Tarefas do Dia (com deadline hoje e não completas/canceladas)
            const tasksForToday = await db('tasks')
                .where({ user_id: userId })
                .whereNotIn('status', ['completed', 'cancelled'])
                .whereNotNull('deadline')
                .whereBetween('deadline', [todayStart, todayEnd])
                .orderBy('deadline', 'asc');

            // Tarefas Atrasadas (deadline no passado e status pendente/em progresso)
            const overdueTasks = await db('tasks')
                .where({ user_id: userId })
                .whereNotIn('status', ['completed', 'cancelled'])
                .whereNotNull('deadline')
                .where('deadline', '<', now)
                .orderBy('deadline', 'asc');

            // Tarefas que podem ser reagendadas (atrasadas há menos de 7 dias)
            const potentiallyRescheduleTasks = overdueTasks.filter(task => {
                const daysOverdue = moment().diff(moment(task.deadline), 'days');
                return daysOverdue <= 7; // Tarefas atrasadas há no máximo 7 dias
            });

            // Tarefas sem Prioridade Definida (com status ativo e prioridade padrão 'medium')
            const tasksWithoutDefinedPriority = await db('tasks')
                .where({ user_id: userId, priority: 'medium' }) // Assume 'medium' é o default/não definido
                .whereNotIn('status', ['completed', 'cancelled'])
                .orderBy('created_at', 'asc'); // Ordena pelas mais antigas para revisão

            // Filtra as tarefas sem prioridade que já não estão em outras categorias do resumo
            const allSummarizedTaskIds = new Set([
                ...tasksForToday.map(t => t.id),
                ...overdueTasks.map(t => t.id),
                ...potentiallyRescheduleTasks.map(t => t.id)
            ]);
            const uniqueTasksWithoutDefinedPriority = tasksWithoutDefinedPriority.filter(
                task => !allSummarizedTaskIds.has(task.id)
            );

            // Monta o objeto de resumo diário
            const dailySummary = {
                date: moment().format('YYYY-MM-DD'),
                totalTasksToday: tasksForToday.length,
                tasksForToday,
                totalOverdueTasks: overdueTasks.length,
                overdueTasks,
                totalPotentiallyRescheduleTasks: potentiallyRescheduleTasks.length,
                potentiallyRescheduleTasks,
                totalTasksWithoutDefinedPriority: uniqueTasksWithoutDefinedPriority.length,
                tasksWithoutDefinedPriority: uniqueTasksWithoutDefinedPriority
            };

            return res.status(200).json({
                message: 'Resumo diário gerado com sucesso!',
                summary: dailySummary
            });

        } catch (error) {
            console.error('Erro ao gerar resumo diário:', error);
            return res.status(500).json({ message: 'Erro interno do servidor ao gerar resumo diário.' });
        }
    }
}

// Exporta uma instância do TaskController.
module.exports = new TaskController();