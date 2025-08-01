// Importa a instância do AIService, que é exportada por src/app.js.
const aiService = require('../app').aiService; // <-- Importa a instância do AIService
const db = require('../database/connection'); // Para buscar tarefas do DB (usado em getSimilarTasksByText)


/**
 * @class AIController
 * @description Controlador responsável por expor as funcionalidades
 * diretas dos modelos de Inteligência Artificial via API.
 */
class AIController {
    /**
     * @method suggestPriority
     * @description Endpoint para sugerir a prioridade de um texto fornecido pela IA.
     * @param {Object} req - Objeto de requisição (contém 'text' na query string).
     * @param {Object} res - Objeto de resposta.
     */
    async suggestPriority(req, res) {
        const { text } = req.query; // Pega o texto da query string (ex: ?text=...)

        // Validação: texto é obrigatório
        if (!text || text.trim() === '') {
            return res.status(400).json({ message: 'O texto é obrigatório para a sugestão de prioridade.' });
        }

        try {
            // Usa a instância do AIService para obter a sugestão de prioridade
            const suggestedPriority = aiService.suggestPriority(text);

            return res.status(200).json({
                originalText: text,
                suggestedPriority: suggestedPriority,
                message: 'Sugestão de prioridade gerada pela IA.'
            });
        } catch (error) {
            console.error('Erro ao sugerir prioridade via API:', error);
            return res.status(500).json({ message: 'Erro interno do servidor ao gerar sugestão de prioridade.' });
        }
    }

    /**
     * @method suggestTitleRewrite
     * @description Endpoint para sugerir uma reescrita mais clara para um título fornecido pela IA.
     * @param {Object} req - Objeto de requisição (contém 'title' na query string).
     * @param {Object} res - Objeto de resposta.
     */
    async suggestTitleRewrite(req, res) {
        const { title } = req.query; // Pega o título da query string (ex: ?title=...)

        // Validação: título é obrigatório
        if (!title || title.trim() === '') {
            return res.status(400).json({ message: 'O título é obrigatório para sugestão de reescrita.' });
        }

        try {
            // Usa a instância do AIService para reescrever o título
            const suggestedTitle = aiService.rewriteTitle(title);

            return res.status(200).json({
                originalTitle: title,
                suggestedTitle: suggestedTitle,
                message: 'Sugestão de reescrita de título gerada.'
            });
        } catch (error) {
            console.error('Erro ao sugerir reescrita de título via API:', error);
            return res.status(500).json({ message: 'Erro interno do servidor ao sugerir reescrita de título.' });
        }
    }

    /**
     * @method getSimilarTasksByText
     * @description Endpoint para sugerir tarefas similares a uma descrição de texto fornecida.
     * Busca entre as tarefas ativas do usuário.
     * @param {Object} req - Objeto de requisição (req.userId do authMiddleware, 'description' na query string).
     * @param {Object} res - Objeto de resposta.
     */
    async getSimilarTasksByText(req, res) {
        const { userId } = req; // ID do usuário autenticado (do JWT)
        const { description: queryDescription } = req.query; // Descrição de texto para buscar similares

        // Validação: descrição é obrigatória
        if (!queryDescription || queryDescription.trim() === '') {
            return res.status(400).json({ message: 'A descrição é obrigatória para buscar tarefas similares.' });
        }

        try {
            // Obter todas as tarefas ATIVAS do usuário para que a IA possa comparar
            const allUserActiveTasks = await db('tasks')
                .where({ user_id: userId })
                .whereNotIn('status', ['completed', 'cancelled']); // Não inclui tarefas concluídas ou canceladas

            // Usa a instância do AIService para encontrar tarefas similares
            const similarTasks = aiService.suggestSimilarTasks(queryDescription, allUserActiveTasks);

            return res.status(200).json({
                message: 'Sugestões de tarefas similares.',
                baseDescription: queryDescription,
                similarTasks: similarTasks
            });
        } catch (error) {
            console.error('Erro ao obter tarefas similares via API:', error);
            return res.status(500).json({ message: 'Erro interno do servidor ao buscar tarefas similares.' });
        }
    }
}

// Exporta uma instância do AIController.
module.exports = new AIController();