const request = require('supertest');
const app = require('../../server');
const { testDb, setupDatabase, teardownDatabase } = require('../../src/database/testSetup');
const moment = require('moment');

// Mockar o AIService para testes, para não depender do treinamento real da IA
jest.mock('../../src/services/AIService');
const AIService = require('../../src/services/AIService');

// Usuário de teste e token
const TEST_USER_TASK = {
    email: `test_task_${Date.now()}@example.com`,
    password: 'password123'
};
let authToken = '';
let userId = null;
let categoryId = null;
let tagId = null;
let taskId = null;
let server;

beforeAll(async () => {
    server = app.listen(0);
    await setupDatabase();
    // Registrar e logar o usuário de teste
    const authRes = await request(app).post('/auth/register').send(TEST_USER_TASK);
    const loginRes = await request(app).post('/auth/login').send(TEST_USER_TASK);
    authToken = loginRes.body.token;
    userId = loginRes.body.user.id;

    // Criar uma categoria e tag para testes de associação
    const categoryRes = await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: `Project_${Date.now()}` });
    categoryId = categoryRes.body.category.id;

    const tagRes = await request(app)
        .post('/tags')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: `Deadline_${Date.now()}` });
    tagId = tagRes.body.tag.id;

    // Configurar o mock da IA para simular sugestões
    AIService.suggestPriority.mockImplementation((description) => {
        if (description.includes('crítico')) return 'urgent';
        if (description.includes('importante')) return 'high';
        return 'medium';
    });
});

afterAll(async () => {
    await new Promise(resolve => server.close(resolve));
    await teardownDatabase();
});

describe('Tasks API', () => {
    // Teste de Criação de Tarefa
    it('should create a new task successfully', async () => {
        const res = await request(app)
            .post('/tasks')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                title: 'Develop new feature X',
                description: 'Implement core logic for feature X, importante.',
                deadline: '2025-08-15T10:00:00Z',
                category_id: categoryId,
                tags: [tagId]
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('message', 'Tarefa criada com sucesso!');
        expect(res.body.task).toHaveProperty('id');
        expect(res.body.task).toHaveProperty('title', 'Develop new feature X');
        expect(res.body.task).toHaveProperty('user_id', userId);
        expect(res.body.task).toHaveProperty('priority', 'high'); // IA sugeriu 'high'
        expect(res.body.task).toHaveProperty('category_id', categoryId);

        taskId = res.body.task.id; // Armazena o ID da tarefa para outros testes
    });

    it('should create a task and AI suggests priority if not provided', async () => {
        const res = await request(app)
            .post('/tasks')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                title: 'Fix critical bug',
                description: 'Resolve security vulnerability - crítico.'
                // priority is omitted, IA should suggest 'urgent'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.task).toHaveProperty('priority', 'urgent');
    });

    it('should return 400 if task title is missing during creation', async () => {
        const res = await request(app)
            .post('/tasks')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ description: 'A task without a title.' });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'O título da tarefa é obrigatório.');
    });

    // Teste de Listagem de Tarefas
    it('should list all tasks for the authenticated user', async () => {
        const res = await request(app)
            .get('/tasks')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Tarefas listadas com sucesso!');
        expect(Array.isArray(res.body.tasks)).toBeTruthy();
        expect(res.body.tasks.length).toBeGreaterThanOrEqual(1); // Deve ter pelo menos a tarefa criada
    });

    it('should list tasks filtered by status', async () => {
        // Criar uma tarefa com status específico para testar o filtro
        await request(app)
            .post('/tasks')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ title: 'Pending task', status: 'pending' });

        const res = await request(app)
            .get('/tasks?status=pending')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.tasks.every(task => task.status === 'pending')).toBeTruthy();
        expect(res.body.tasks.length).toBeGreaterThanOrEqual(1);
    });

    it('should list tasks due in the next 7 days', async () => {
        // Criar uma tarefa com deadline para daqui a 3 dias
        const futureDate = moment().add(3, 'days').toISOString();
        await request(app)
            .post('/tasks')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ title: 'Task due in 3 days', deadline: futureDate, status: 'pending' });

        const res = await request(app)
            .get('/tasks/due')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toContain('Tarefas com vencimento nos próximos 7 dias.');
        expect(Array.isArray(res.body.tasks)).toBeTruthy();
        expect(res.body.tasks.length).toBeGreaterThanOrEqual(1);
        expect(res.body.tasks.every(task => moment(task.deadline).isBetween(moment().startOf('day'), moment().add(7, 'days').endOf('day'), undefined, '[]') && task.status !== 'completed' && task.status !== 'cancelled')).toBeTruthy();
    });


    // Teste de Edição de Tarefa
    it('should update an existing task successfully', async () => {
        const updatedTitle = 'Updated Feature X Development';
        const res = await request(app)
            .put(`/tasks/${taskId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ title: updatedTitle, status: 'in_progress', priority: 'medium' });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Tarefa atualizada com sucesso!');
        expect(res.body.task).toHaveProperty('id', taskId);
        expect(res.body.task).toHaveProperty('title', updatedTitle);
        expect(res.body.task).toHaveProperty('status', 'in_progress');
        expect(res.body.task).toHaveProperty('priority', 'medium'); // Prioridade definida explicitamente
    });

    it('should return 404 if trying to update a non-existent task', async () => {
        const res = await request(app)
            .put(`/tasks/99999`) // ID inexistente
            .set('Authorization', `Bearer ${authToken}`)
            .send({ title: 'Non-existent task' });

        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty('message', 'Tarefa não encontrada ou você não tem permissão para editá-la.');
    });

    it('should return 404 if trying to update another user\'s task', async () => {
        // Crie outro usuário e uma tarefa para ele
        const otherUser = { email: 'other@example.com', password: 'otherpassword' };
        await request(app).post('/auth/register').send(otherUser);
        const otherLoginRes = await request(app).post('/auth/login').send(otherUser);
        const otherAuthToken = otherLoginRes.body.token;

        const otherTaskRes = await request(app)
            .post('/tasks')
            .set('Authorization', `Bearer ${otherAuthToken}`)
            .send({ title: 'Other user task' });
        const otherTaskId = otherTaskRes.body.task.id;

        // Tente atualizar a tarefa do outro usuário com o token do TEST_USER_TASK
        const res = await request(app)
            .put(`/tasks/${otherTaskId}`)
            .set('Authorization', `Bearer ${authToken}`) // Token do primeiro usuário
            .send({ title: 'Trying to hack' });

        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty('message', 'Tarefa não encontrada ou você não tem permissão para editá-la.');
    });


    // Teste de Exclusão de Tarefa
    it('should delete a task successfully', async () => {
        const res = await request(app)
            .delete(`/tasks/${taskId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toEqual(204); // No Content

        // Verificar se a tarefa realmente foi deletada tentando listá-la ou pegá-la
        const listRes = await request(app)
            .get('/tasks')
            .set('Authorization', `Bearer ${authToken}`);
        const foundTask = listRes.body.tasks.find(task => task.id === taskId);
        expect(foundTask).toBeUndefined(); // A tarefa não deve ser encontrada
    });

    it('should return 404 if trying to delete a non-existent task', async () => {
        const res = await request(app)
            .delete(`/tasks/99999`) // ID inexistente
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty('message', 'Tarefa não encontrada ou você não tem permissão para deletá-la.');
    });
});