/**
 * Dados de treinamento simulados para o modelo de agrupamento de tarefas (pt-br).
 * Este dataset é um conjunto de descrições de tarefas que o modelo usará para
 * identificar similaridades e sugerir agrupamentos. Não há rótulos explícitos de grupo,
 * o modelo aprende os padrões de similaridade textuais.
 */
const groupingTrainingData = [
    // ========================
    // Tema: Desenvolvimento Front-end (Foco em UI, UX, React, Next.js, CSS, JS)
    // ========================
    "Implementar barra de navegação responsiva em React",
    "Criar componente de formulário de login no Next.js",
    "Otimizar carregamento de imagens no site para mobile",
    "Fazer refatoração do CSS do projeto, usando styled-components",
    "Adicionar validação de formulário com Yup e Formik",
    "Integrar API de tarefas com o estado global da aplicação",
    "Desenvolver nova seção de dashboard com gráficos",
    "Correção de bugs na interface do usuário (UI)",
    "Testar compatibilidade do site em diferentes navegadores",
    "Adicionar animações suaves aos elementos da página",
    "Configurar sistema de rotas no React Router Dom",
    "Estilizar botões e inputs usando Tailwind CSS",
    "Desenvolver modal de confirmação em JavaScript puro",
    "Refatorar código legado do frontend para Hooks",
    "Ajustar layout responsivo para tablets",
    "Implementar lazy loading para componentes pesados",
    "Melhorar a acessibilidade da interface do usuário (ARIA)",
    "Criar tema escuro para o aplicativo web",
    "Migrar componentes para TypeScript no frontend",
    "Otimizar renderização de listas longas em React",

    // ========================
    // Tema: Desenvolvimento Back-end (Foco em API, Banco de Dados, Segurança, Server)
    // ========================
    "Desenvolver endpoint REST para cadastro de usuários",
    "Implementar autenticação JWT no Node.js com Express",
    "Configurar conexão com banco de dados PostgreSQL",
    "Escrever testes unitários para o controlador de tarefas",
    "Otimizar consultas SQL para melhor performance",
    "Criar microsserviço de notificação de e-mail",
    "Adicionar rate limiting nas rotas da API",
    "Desenvolver lógica de agendamento de tarefas",
    "Integrar API externa de pagamentos",
    "Configurar ambiente de deploy em nuvem (Docker/Kubernetes)",
    "Implementar cache no servidor para dados frequentemente acessados",
    "Criar sistema de logs centralizado no backend",
    "Desenvolver worker para processamento assíncrono de dados",
    "Configurar servidor de produção Nginx",
    "Escrever documentação da API para o frontend",
    "Auditar segurança dos endpoints REST",
    "Adicionar validação de payload em requests da API",
    "Desenvolver migrações de banco de dados para nova feature",
    "Configurar CI/CD para o backend",
    "Monitorar performance da aplicação no servidor",

    // ========================
    // Tema: Gerenciamento de Projetos e Liderança (Foco em Equipe, Cronograma, Planejamento)
    // ========================
    "Reunião de planejamento semanal com a equipe",
    "Atualizar cronograma do projeto no Jira",
    "Escrever user stories para a próxima sprint",
    "Preparar apresentação de progresso para stakeholders",
    "Fazer reunião de retrospectiva da sprint atual",
    "Alinhar expectativas com o cliente sobre novas funcionalidades",
    "Delegar tarefas para membros da equipe",
    "Acompanhar métricas de desempenho do projeto",
    "Elaborar orçamento para a fase 2 do projeto",
    "Gerenciar riscos e dependências do projeto",
    "Conduzir daily scrum com o time de desenvolvimento",
    "Priorizar itens do backlog do produto",
    "Facilitar sessões de brainstorming para novas ideias",
    "Resolver impedimentos da equipe",
    "Fazer coaching para desenvolvedores juniores",
    "Revisar o escopo do projeto com o cliente",
    "Criar um plano de comunicação para o projeto",
    "Avaliar o desempenho individual da equipe",
    "Planejar treinamentos para a equipe",
    "Documentar decisões de arquitetura do projeto",

    // ========================
    // Tema: Marketing e Conteúdo (Foco em SEO, Redes Sociais, Campanhas)
    // ========================
    "Escrever novo artigo para o blog sobre IA em tarefas",
    "Criar postagens para redes sociais sobre lançamento",
    "Pesquisar palavras-chave para SEO do site",
    "Preparar newsletter semanal para a base de usuários",
    "Analisar métricas de campanha de marketing",
    "Desenvolver estratégia de conteúdo para o próximo trimestre",
    "Criar artes visuais para anúncios online",
    "Fazer pesquisa de mercado sobre público-alvo",
    "Atualizar a página 'Sobre Nós' do site",
    "Gravar vídeo tutorial sobre o uso da plataforma",
    "Agendar posts para as redes sociais da semana",
    "Responder comentários e mensagens nas redes sociais",
    "Criar e-mail marketing para promoção de feriado",
    "Otimizar metadescrições e títulos para SEO",
    "Fazer pesquisa de tendências de conteúdo",
    "Contratar influenciadores para campanha de lançamento",
    "Preparar relatório de engajamento de redes sociais",
    "Desenvolver um novo lead magnet para o site",
    "Cuidar da identidade visual da marca",
    "Campanha de anúncios pagos no Google Ads",

    // ========================
    // Tema: Administrativo/Operacional e Pessoal (Foco em Rotina, Finanças, Burocracia)
    // ========================
    "Organizar documentos fiscais para a contabilidade",
    "Pagar contas de energia e internet",
    "Comprar material de escritório novo",
    "Agendar manutenção do ar condicionado",
    "Revisar contratos com fornecedores",
    "Atualizar cadastro de clientes",
    "Fazer levantamento de estoque de produtos",
    "Organizar a sala de reuniões",
    "Entrevistar candidatos para vaga administrativa",
    "Enviar faturas e recibos para clientes",
    "Conciliar extrato bancário do mês",
    "Digitalizar documentos importantes",
    "Renovar licença de software",
    "Fazer agendamento médico",
    "Limpar e organizar o armário",
    "Planejar viagem de férias",
    "Revisar apólice de seguro",
    "Fazer a declaração de imposto de renda",
    "Reorganizar a garagem",
    "Cancelar assinaturas não utilizadas",

    // ========================
    // Exemplo de algumas tarefas "fora" dos grupos claros ou com múltiplos temas
    // (Úteis para testar a capacidade do modelo de encontrar similaridades mais amplas)
    // ========================
    "Pesquisar ferramenta de monitoramento de servidor e apresentar para a equipe de back-end", // Back-end + Gerenciamento
    "Discutir requisitos da nova feature de relatório de vendas com o time de front-end", // Front-end + Gerenciamento
    "Revisar o código de autenticação e otimizar a rota de login", // Back-end + Segurança
    "Preparar conteúdo para o blog e analisar métricas de acesso para melhorar SEO", // Marketing + Conteúdo
    "Agendar reunião com o cliente para discutir o orçamento e o cronograma do projeto", // Gerenciamento + Administrativo
    "Configurar ambiente de teste para feature de pagamento e depois documentar o processo", // Back-end + Documentação
    "Criar um formulário de feedback do usuário para o site e analisar as respostas", // Front-end + Marketing
    "Desenvolver um novo fluxo de integração de dados entre sistemas existentes", // Back-end + Integração
    "Otimizar a performance da landing page do produto para SEO", // Front-end + Marketing
    "Fazer o deploy da nova versão do backend e monitorar os logs de erro", // Back-end + Operacional
];

module.exports = groupingTrainingData;