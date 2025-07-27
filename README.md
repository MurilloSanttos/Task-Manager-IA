# 🚀 TaskFlow AI - Back-end

Bem-vindo ao repositório do back-end do **TaskFlow AI**, uma plataforma web inteligente para gerenciamento de tarefas com foco em eficiência, automação e usabilidade. Este módulo é o coração do sistema, responsável por toda a lógica de negócio, persistência de dados e integração com os modelos de Inteligência Artificial.

---

## 🌟 Sobre o Projeto

O TaskFlow AI visa transformar a maneira como você gerencia suas tarefas. Com a inteligência artificial, ele não apenas organiza, prioriza e acompanha suas atividades, mas também oferece sugestões inteligentes, agrupamentos automáticos e relatórios diários para otimizar sua rotina e aumentar seu foco.

Este repositório contém o código-fonte da API RESTful que serve como ponte entre o front-end e o banco de dados, além de orquestrar a comunicação com os serviços de IA.

---

## ✨ Funcionalidades Essenciais (MVP)

### Core
* **Autenticação de Usuários:** Login via e-mail/senha e OAuth (Google).
* **Gestão de Tarefas (CRUD):** Cadastro, edição, listagem (com filtros por status, data e prioridade) e remoção de tarefas.
* **Categorias e Tags:** Criação e associação de categorias e tags personalizadas por usuário.
* **Alertas de Vencimento:** Notificações para prazos de tarefas.

### Inteligência Artificial
* **Sugestão de Prioridade:** IA sugere a prioridade da tarefa com base em sua descrição.
* **Agrupamento Inteligente:** Sugestão de agrupamento de tarefas similares.
* **Reescrita de Títulos:** Correção e aprimoramento de títulos confusos ou incompletos.
* **Resumo Diário:** Geração automática de um resumo com tarefas do dia, atrasadas, reagendáveis e sem prioridade.

---

## 🛠️ Tecnologias Utilizadas

* **Node.js**: Ambiente de execução JavaScript.
* **Express.js**: Framework web para construção da API RESTful.
* **SQLite3**: Banco de dados relacional leve e baseado em arquivo para persistência dos dados (ideal para desenvolvimento e MVP).
* **JWT (JSON Web Tokens)**: Para autenticação e autorização de usuários.
* **`dotenv`**: Para gerenciamento de variáveis de ambiente.
* **`cors`**: Middleware para habilitar Cross-Origin Resource Sharing.

---

## 🚀 Como Rodar o Projeto (Desenvolvimento)

Siga os passos abaixo para configurar e rodar o back-end em seu ambiente local.

### Pré-requisitos
Certifique-se de ter instalado:
* [Node.js](https://nodejs.org/en/download/) (versão LTS recomendada)
* [npm](https://www.npmjs.com/get-npm) (gerenciador de pacotes do Node.js)

### 1. Clonar o Repositório
```bash
git clone <https://github.com/MurilloSanttos/Task-Manager-IA>
cd task-manager-ia
```

### 2. Instalar as Dependências
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto (`task-manager-ia/.env`) e configure as variáveis necessárias.

```bash
# Configurações do Servidor
PORT=3001

# Segredo para JWT (gere uma string aleatória e complexa)
JWT_SECRET=sua_chave_secreta_jwt_super_segura

# Credenciais Google OAuth (serão configuradas posteriormente)
GOOGLE_CLIENT_ID=seu_google_client_id
GOOGLE_CLIENT_SECRET=seu_google_client_secret
```

Importante: Nunca commite o arquivo `.env` para o controle de versão! Ele já está incluído no `.gitignore`.

### 4. Configurar e Rodar o Banco de Dados
O SQLite3 não requer um servidor de banco de dados rodando separadamente. As tabelas serão criadas quando as migrações forem executadas.

### 5. Iniciar o Servidor
```bash
npm start # ou node server.js
```

O servidor estará rodando em `http://localhost:3001` (ou na porta que você definiu em `PORT`).

## 🗺️ Estrutura do Projeto (Em Construção)
```bash
task-manager-ia/
├── node_modules/
├── src/
│   ├── config/             # Configurações gerais (db, jwt, etc.)
│   ├── controllers/        # Lógica de negócio e manipulação de requisições
│   ├── models/             # Definição dos modelos de dados (tarefas, usuários, etc.)
│   ├── routes/             # Definição das rotas da API
│   ├── services/           # Lógica de serviço (ex: comunicação com IA, envio de e-mail)
│   ├── middleware/         # Funções middleware (autenticação, validação)
│   ├── database/           # Configuração do DB e migrações
│   └── utils/              # Funções utilitárias
├── .env                    # Variáveis de ambiente (IGNORADO PELO GIT)
├── .gitignore              # Arquivos/pastas a serem ignorados pelo Git
├── package.json            # Metadados do projeto e dependências
├── package-lock.json       # Bloqueio de versões das dependências
└── server.js               # Ponto de entrada da aplicação
└── README.md               # Este arquivo
```

## 🤝 Contribuição
Este projeto está sendo desenvolvido de forma iterativa. Sinta-se à vontade para propor melhorias, reportar issues ou enviar pull requests.

## 📄 Licença
MIT License 

## 📞 Contato
Para dúvidas ou sugestões, entre em contato:

Murilo Santos - murilo.azevedo.d.santos@gmail.com