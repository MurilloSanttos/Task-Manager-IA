const bcrypt = require('bcryptjs'); // Para hashear e comparar senhas
const jwt = require('jsonwebtoken');   // Para criar e verificar JSON Web Tokens
const db = require('../database/connection'); // Conexão com o banco de dados

/**
 * @class AuthController
 * @description Controlador responsável por gerenciar todas as operações
 * de autenticação de usuários (registro, login e OAuth).
 */
class AuthController {

    /**
     * @method register
     * @description Registra um novo usuário com e-mail e senha.
     * Hasheia a senha antes de armazená-la.
     * @param {Object} req - Objeto de requisição (contém email e password no corpo).
     * @param {Object} res - Objeto de resposta.
     */
    async register(req, res) {
        const { email, password } = req.body;

        // Validação básica: verifica se email e senha foram fornecidos
        if (!email || !password) {
            return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
        }

        try {
            // Verificar se o usuário já existe
            const existingUser = await db('users').where({ email }).first();
            if (existingUser) {
                return res.status(409).json({ message: 'E-mail já cadastrado.' });
            }

            // Hashear a senha
            // O custo de 10 é um bom equilíbrio entre segurança e performance para bcrypt.
            const hashedPassword = await bcrypt.hash(password, 10);

            // Inserir o novo usuário no banco de dados
            // Retorna o ID do usuário recém-criado.
            const [userId] = await db('users').insert({
                email,
                password_hash: hashedPassword
            });

            // Retornar uma resposta de sucesso
            // Não enviei o hash da senha de volta na resposta por segurança.
            return res.status(201).json({
                message: 'Usuário registrado com sucesso!',
                user: { id: userId, email: email }
            });

        } catch (error) {
            console.error('Erro ao registrar usuário:', error);
            return res.status(500).json({ message: 'Erro interno do servidor ao registrar usuário.' });
        }
    }

    /**
     * @method login
     * @description Autentica um usuário com e-mail e senha, e retorna um JWT.
     * @param {Object} req - Objeto de requisição (contém email e password no corpo).
     * @param {Object} res - Objeto de resposta.
     */
    async login(req, res) {
        const { email, password } = req.body;

        // Validação básica
        if (!email || !password) {
            return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
        }

        try {
            // Encontrar o usuário pelo e-mail no banco de dados
            const user = await db('users').where({ email }).first();

            // Se o usuário não for encontrado ou não tiver hash de senha (pode ser um usuário OAuth)
            if (!user || !user.password_hash) {
                return res.status(401).json({ message: 'Credenciais inválidas.' });
            }

            // Comparar a senha fornecida com o hash armazenado
            const isPasswordValid = await bcrypt.compare(password, user.password_hash);

            // Se a senha não for válida
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Credenciais inválidas.' });
            }

            // Gerar um JSON Web Token (JWT)
            // O payload inclui o ID e e-mail do usuário. A chave secreta é do .env.
            // O token expira em 1 hora.
            const token = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            // Retornar o token e informações do usuário
            return res.status(200).json({
                message: 'Login realizado com sucesso!',
                token, // Retorna o token gerado
                user: { id: user.id, email: user.email }
            });

        } catch (error) {
            console.error('Erro ao fazer login:', error);
            return res.status(500).json({ message: 'Erro interno do servidor ao fazer login.' });
        }
    }
}

// Exporta uma instância do AuthController.
module.exports = new AuthController();