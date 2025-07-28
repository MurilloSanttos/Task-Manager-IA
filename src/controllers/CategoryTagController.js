const db = require('../database/connection');

class CategoryTagController {
    // Método para criar uma nova categoria
    async createCategory(req, res) {
        const { userId } = req; // ID do usuário logado, do authMiddleware
        const { name } = req.body;

        // Validação básica
        if (!name) {
            return res.status(400).json({ message: 'O nome da categoria é obrigatório.' });
        }

        try {
            // Verificar se o usuário já possui uma categoria com o mesmo nome
            const existingCategory = await db('categories')
                .where({ user_id: userId, name })
                .first();

            if (existingCategory) {
                return res.status(409).json({ message: 'Você já possui uma categoria com este nome.' });
            }

            // Inserir a nova categoria no banco de dados
            const [categoryId] = await db('categories').insert({
                user_id: userId,
                name
            });

            // Retornar a categoria criada
            const newCategory = await db('categories').where({ id: categoryId }).first();
            return res.status(201).json({
                message: 'Categoria criada com sucesso!',
                category: newCategory
            });

        } catch (error) {
            console.error('Erro ao criar categoria:', error);
            return res.status(500).json({ message: 'Erro interno do servidor ao criar categoria.' });
        }
    }

    // Método para criar uma nova tag
    async createTag(req, res) {
        const { userId } = req; // ID do usuário logado, do authMiddleware
        const { name } = req.body;

        // Validação básica
        if (!name) {
            return res.status(400).json({ message: 'O nome da tag é obrigatório.' });
        }

        try {
            // Verificar se o usuário já possui uma tag com o mesmo nome
            const existingTag = await db('tags')
                .where({ user_id: userId, name })
                .first();

            if (existingTag) {
                return res.status(409).json({ message: 'Você já possui uma tag com este nome.' });
            }

            // Inserir a nova tag no banco de dados
            const [tagId] = await db('tags').insert({
                user_id: userId,
                name
            });

            // Retornar a tag criada
            const newTag = await db('tags').where({ id: tagId }).first();
            return res.status(201).json({
                message: 'Tag criada com sucesso!',
                tag: newTag
            });

        } catch (error) {
            console.error('Erro ao criar tag:', error);
            return res.status(500).json({ message: 'Erro interno do servidor ao criar tag.' });
        }
    }
}

module.exports = new CategoryTagController();