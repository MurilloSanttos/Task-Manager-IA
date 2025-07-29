const request = require('supertest');
const app = require('../../server');
const { testDb, setupDatabase, teardownDatabase } = require('../../src/database/testSetup');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Variáveis para usar nos testes
const TEST_USER = {
    email: `test_auth_${Date.now()}@example.com`,
    password: 'password123'
};
const INVALID_USER = {
    email: 'nonexistent@example.com',
    password: 'wrongpassword'
};
let authToken = ''; // Para armazenar o token JWT após o login
let server;

// Hooks do Jest para setup e teardown do banco de dados de teste
beforeAll(async () => {
    // Antes de todos os testes, configure o banco de dados de teste
    server = app.listen(0);
    await setupDatabase();
});

afterAll(async () => {
    // Depois de todos os testes, limpe o banco de dados de teste e feche a conexão
    await new Promise(resolve => server.close(resolve));
    await teardownDatabase();
});

describe('Auth API', () => {
    // Teste de Registro de Usuário
    it('should register a new user successfully', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send(TEST_USER);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('message', 'Usuário registrado com sucesso!');
        expect(res.body.user).toHaveProperty('id');
        expect(res.body.user).toHaveProperty('email', TEST_USER.email);
        // Não deve retornar a senha
        expect(res.body.user).not.toHaveProperty('password_hash');
    });

    it('should not register a user with an existing email', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send(TEST_USER); // Tenta registrar o mesmo usuário novamente

        expect(res.statusCode).toEqual(409);
        expect(res.body).toHaveProperty('message', 'E-mail já cadastrado.');
    });

    it('should return 400 if email or password are missing during registration', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send({ email: 'incomplete@example.com' }); // Falta a senha

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'E-mail e senha são obrigatórios.');
    });

    // Teste de Login de Usuário
    it('should login a registered user successfully and return a JWT', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send(TEST_USER);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Login realizado com sucesso!');
        expect(res.body).toHaveProperty('token');
        expect(res.body.user).toHaveProperty('id');
        expect(res.body.user).toHaveProperty('email', TEST_USER.email);

        authToken = res.body.token; // Armazena o token para testes futuros

        // Verificar o payload do JWT
        const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
        expect(decoded).toHaveProperty('id', res.body.user.id);
        expect(decoded).toHaveProperty('email', TEST_USER.email);
        expect(decoded).toHaveProperty('exp'); // Deve ter expiração
        expect(decoded).toHaveProperty('iat'); // Deve ter data de criação
    });

    it('should return 401 for invalid login credentials', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send(INVALID_USER); // Usuário não registrado

        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty('message', 'Credenciais inválidas.');
    });

    it('should return 400 if email or password are missing during login', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'incomplete@example.com' }); // Falta a senha

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'E-mail e senha são obrigatórios.');
    });

    // Teste de Rota Protegida
    it('should access a protected route with a valid token', async () => {
        const res = await request(app)
            .get('/protected')
            .set('Authorization', `Bearer ${authToken}`); // Usa o token obtido no login

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message');
        expect(res.body).toHaveProperty('userId');
        expect(res.body).toHaveProperty('userEmail', TEST_USER.email);
    });

    it('should return 401 if accessing a protected route without a token', async () => {
        const res = await request(app)
            .get('/protected'); // Sem token

        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty('message', 'Acesso negado. Token não fornecido ou formato inválido.');
    });

    it('should return 403 if accessing a protected route with an invalid token', async () => {
        const res = await request(app)
            .get('/protected')
            .set('Authorization', `Bearer invalid.token.string`); // Token inválido

        expect(res.statusCode).toEqual(403);
        expect(res.body).toHaveProperty('message', 'Token inválido ou corrompido.');
    });
});