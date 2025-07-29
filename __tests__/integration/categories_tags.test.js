const request = require('supertest');
const app = require('../../server');
const { testDb, setupDatabase, teardownDatabase } = require('../../src/database/testSetup');

// Precisa registrar e logar um usuário para obter um token válido
const TEST_USER = {
    email: `test_category_tag_${Date.now()}@example.com`,
    password: 'password123'
};
let authToken = '';
let server;

beforeAll(async () => {
    server = app.listen(0);
    await setupDatabase();
    // Registrar e logar o usuário de teste para obter um token
    await request(app).post('/auth/register').send(TEST_USER);
    const res = await request(app).post('/auth/login').send(TEST_USER);
    authToken = res.body.token;
});

afterAll(async () => {
    await new Promise(resolve => server.close(resolve));
    await teardownDatabase();
});

describe('Category and Tag API', () => {
    // Testes de Categoria
    it('should create a new category successfully', async () => {
        const res = await request(app)
            .post('/categories')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ name: 'Work' });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('message', 'Categoria criada com sucesso!');
        expect(res.body.category).toHaveProperty('id');
        expect(res.body.category).toHaveProperty('name', 'Work');
        expect(res.body.category).toHaveProperty('user_id');
    });

    it('should not create a category with a duplicate name for the same user', async () => {
        const res = await request(app)
            .post('/categories')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ name: 'Work' }); // Tenta criar duplicata

        expect(res.statusCode).toEqual(409);
        expect(res.body).toHaveProperty('message', 'Você já possui uma categoria com este nome.');
    });

    it('should return 400 if category name is missing', async () => {
        const res = await request(app)
            .post('/categories')
            .set('Authorization', `Bearer ${authToken}`)
            .send({});

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'O nome da categoria é obrigatório.');
    });

    // Testes de Tag
    it('should create a new tag successfully', async () => {
        const res = await request(app)
            .post('/tags')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ name: 'Urgent' });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('message', 'Tag criada com sucesso!');
        expect(res.body.tag).toHaveProperty('id');
        expect(res.body.tag).toHaveProperty('name', 'Urgent');
        expect(res.body.tag).toHaveProperty('user_id');
    });

    it('should not create a tag with a duplicate name for the same user', async () => {
        const res = await request(app)
            .post('/tags')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ name: 'Urgent' }); // Tenta criar duplicata

        expect(res.statusCode).toEqual(409);
        expect(res.body).toHaveProperty('message', 'Você já possui uma tag com este nome.');
    });

    it('should return 400 if tag name is missing', async () => {
        const res = await request(app)
            .post('/tags')
            .set('Authorization', `Bearer ${authToken}`)
            .send({});

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'O nome da tag é obrigatório.');
    });

    // Testes de acesso sem autenticação para rotas de categoria/tag
    it('should return 401 if trying to create category without token', async () => {
        const res = await request(app)
            .post('/categories')
            .send({ name: 'Free' });

        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty('message', 'Acesso negado. Token não fornecido ou formato inválido.');
    });
});