const AIService = require('../services/AIService');
const db = require('../database/connection');

class AIController {
    /**
     * Endpoint para sugerir prioridade de um texto fornecido.
     * @param {Object} req - Objeto de requisição.
     * @param {Object} res - Objeto de resposta.
     */
    async suggestPriority(req, res) {
        const { text } = req.query; // Espera o texto na query string

        if (!text || text.trim() === '') {
            return res.status(400).json({ message: 'O texto é obrigatório para a sugestão de prioridade.' });
        }

        try {
            const suggestedPriority = AIService.suggestPriority(text);
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
     * Endpoint para sugerir reescrita de título de um texto fornecido.
     * Replicando a funcionalidade de /tasks/rewrite-title para um endpoint /ai/rewrite-title.
     * @param {Object} req - Objeto de requisição.
     * @param {Object} res - Objeto de resposta.
     */
    async suggestTitleRewrite(req, res) {
        const { title } = req.query;

        if (!title || title.trim() === '') {
            return res.status(400).json({ message: 'O título é obrigatório para sugestão de reescrita.' });
        }

        try {
            const suggestedTitle = AIService.rewriteTitle(title);
            return res.status(200).json({
                originalTitle: title,
                suggestedTitle: suggestedTitle,
                message: 'Sugestão de reescrita de título gerada pela IA.'
            });
        } catch (error) {
            console.error('Erro ao sugerir reescrita de título via API:', error);
            return res.status(500).json({ message: 'Erro interno do servidor ao sugerir reescrita de título.' });
        }
    }

    /**
     * Endpoint para sugerir tarefas similares com base em um texto.
     * Replicando a funcionalidade de /tasks/similar para um endpoint /ai/similar-tasks.
     * Este endpoint usará a descrição diretamente para buscar similares.
     * @param {Object} req - Objeto de requisição.
     * @param {Object} res - Objeto de resposta.
     */
    async getSimilarTasksByText(req, res) {
        const { userId } = req; // Do authMiddleware
        const { description: queryDescription } = req.query;

        if (!queryDescription || queryDescription.trim() === '') {
            return res.status(400).json({ message: 'A descrição é obrigatória para buscar tarefas similares.' });
        }

        try {
            // Obter todas as tarefas ATIVAS do usuário para comparar
            const allUserActiveTasks = await db('tasks')
                .where({ user_id: userId })
                .whereNotIn('status', ['completed', 'cancelled']);

            const similarTasks = AIService.suggestSimilarTasks(queryDescription, allUserActiveTasks);

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

module.exports = new AIController();