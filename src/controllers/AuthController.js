const bcrypt = require('bcryptjs'); // Para hashear senhas
const jwt = require('jsonwebtoken'); // Importa a biblioteca jsonwebtoken
const db = require('../database/connection'); // Conexão com o DB

class AuthController {
    // Método para registrar um novo usuário
    async register(req, res) {
        const { email, password } = req.body; // Pega email e senha do corpo da requisição

        // Validação básica: verifica se email e senha foram fornecidos
        if (!email || !password) {
            return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
        }

        try {
            // 1. Verificar se o usuário já existe
            const existingUser = await db('users').where({ email }).first();
            if (existingUser) {
                return res.status(409).json({ message: 'E-mail já cadastrado.' });
            }

            // 2. Hashear a senha
            // O 'salt' é um valor aleatório que é adicionado à senha antes do hash.
            // Isso previne ataques de "rainbow table". O 10 é o custo de processamento.
            const hashedPassword = await bcrypt.hash(password, 10);

            // 3. Inserir o novo usuário no banco de dados
            const [userId] = await db('users').insert({
                email,
                password_hash: hashedPassword
            });

            // 4. Retornar uma resposta de sucesso
            // Não enviamos o hash da senha de volta!
            return res.status(201).json({
                message: 'Usuário registrado com sucesso!',
                user: { id: userId, email: email }
            });

        } catch (error) {
            console.error('Erro ao registrar usuário:', error);
            return res.status(500).json({ message: 'Erro interno do servidor ao registrar usuário.' });
        }
    }

    // Método para fazer login de um usuário existente
    async login(req, res) {
        const { email, password } = req.body;

        // Validação básica
        if (!email || !password) {
            return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
        }

        try {
            // 1. Encontrar o usuário pelo e-mail
            const user = await db('users').where({ email }).first();

            // Se o usuário não for encontrado
            if (!user) {
                return res.status(401).json({ message: 'Credenciais inválidas.' });
            }

            // 2. Comparar a senha fornecida com o hash armazenado
            const isPasswordValid = await bcrypt.compare(password, user.password_hash);

            // Se a senha não for válida
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Credenciais inválidas.' });
            }

            // 3. Gerar um JSON Web Token (JWT)
            // O payload do token geralmente inclui informações do usuário (como o ID)
            // que não são sensíveis, mas são úteis para identificar o usuário.
            // O JWT_SECRET deve ser uma variável de ambiente segura.
            const token = jwt.sign(
                { id: user.id, email: user.email }, // Payload: dados que identificam o usuário
                process.env.JWT_SECRET,             // Chave secreta para assinar o token
                { expiresIn: '1h' }                 // Opções: token expira em 1 hora
            );

            // 4. Retornar o token e informações do usuário
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

module.exports = new AuthController(); // Exporta uma instância da classe