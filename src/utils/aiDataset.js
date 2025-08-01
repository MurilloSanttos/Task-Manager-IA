/**
 * Dados de treinamento simulados para o modelo de sugestão de prioridade (pt-br).
 * Cada objeto contém uma descrição de tarefa e sua prioridade associada.
 * Este dataset é usado para treinar o classificador que sugere a prioridade.
 */
const trainingData = [
    // ========================
    // Prioridade: URGENT (Crítico, requer atenção imediata)
    // ========================
    { text: "Resolver bug crítico na produção", priority: "urgent" },
    { text: "Atender chamado de segurança emergencial", priority: "urgent" },
    { text: "Corrigir falha no sistema de pagamentos imediatamente", priority: "urgent" },
    { text: "Responder cliente com problema de acesso agora", priority: "urgent" },
    { text: "Deploy da correção de segurança urgente", priority: "urgent" },
    { text: "Problema grave no servidor principal", priority: "urgent" },
    { text: "Falha de comunicação no módulo principal, verificar já", priority: "urgent" },
    { text: "Revisar relatório de erros críticos", priority: "urgent" },
    { text: "Pagamento de fornecedor pendente, precisa ser hoje", priority: "urgent" },
    { text: "Backup de dados corrompido, restaurar urgente", priority: "urgent" },
    { text: "Sistema está fora do ar, verificar urgentemente", priority: "urgent" },
    { text: "Vulnerabilidade de segurança crítica descoberta", priority: "urgent" },
    { text: "Interrupção de serviço, precisa de hotfix", priority: "urgent" },
    { text: "Bloqueio de usuário com urgência", priority: "urgent" },
    { text: "Corrigir falha que afeta todos os usuários", priority: "urgent" },
    { text: "Recuperar dados perdidos no sistema", priority: "urgent" },
    { text: "Atualização emergencial de segurança", priority: "urgent" },
    { text: "Erro fatal impedindo o uso do aplicativo", priority: "urgent" },
    { text: "Problema no ambiente de produção que parou tudo", priority: "urgent" },
    { text: "Cliente não consegue acessar, prioridade máxima", priority: "urgent" },

    // ========================
    // Prioridade: HIGH (Importante, prazo próximo, alto impacto)
    // ========================
    { text: "Preparar apresentação para reunião com diretoria amanhã", priority: "high" },
    { text: "Finalizar relatório mensal de vendas", priority: "high" },
    { text: "Desenvolver nova feature para o sprint atual", priority: "high" },
    { text: "Revisar código do módulo de autenticação", priority: "high" },
    { text: "Entregar proposta para cliente importante", priority: "high" },
    { text: "Agendar reunião com equipe para planejamento da próxima semana", priority: "high" },
    { text: "Pesquisar soluções para otimização de banco de dados", priority: "high" },
    { text: "Escrever documentação técnica de nova API", priority: "high" },
    { text: "Entrevistar candidato para vaga de desenvolvedor", priority: "high" },
    { text: "Configurar ambiente de homologação para testes", priority: "high" },
    { text: "Discutir arquitetura para o próximo módulo", priority: "high" },
    { text: "Preparar demo para o cliente final", priority: "high" },
    { text: "Otimizar performance de querys de alto impacto", priority: "high" },
    { text: "Revisar pull request de funcionalidade principal", priority: "high" },
    { text: "Atualizar dependências de segurança do projeto", priority: "high" },
    { text: "Planejar próximos passos da integração de sistema", priority: "high" },
    { text: "Criar testes de regressão para nova versão", priority: "high" },
    { text: "Treinar novo membro da equipe sobre o projeto", priority: "high" },
    { text: "Solicitar feedback do usuário beta sobre a nova feature", priority: "high" },
    { text: "Definir próximos objetivos estratégicos", priority: "high" },

    // ========================
    // Prioridade: MEDIUM (Normal, importante, mas sem urgência imediata)
    // ========================
    { text: "Organizar a caixa de entrada de e-mails", priority: "medium" },
    { text: "Atualizar meu perfil no LinkedIn", priority: "medium" },
    { text: "Ler artigos sobre novas tecnologias", priority: "medium" },
    { text: "Revisar lista de tarefas da semana", priority: "medium" },
    { text: "Limpar área de trabalho do computador", priority: "medium" },
    { text: "Fazer exercícios físicos pela manhã", priority: "medium" },
    { text: "Comprar mantimentos para a casa", priority: "medium" },
    { text: "Responder e-mails não urgentes", priority: "medium" },
    { text: "Planejar refeições da semana", priority: "medium" },
    { text: "Organizar arquivos na nuvem", priority: "medium" },
    { text: "Pesquisar cursos online para aprimoramento", priority: "medium" },
    { text: "Agendar consulta de rotina", priority: "medium" },
    { text: "Limpar a cozinha", priority: "medium" },
    { text: "Fazer uma ligação para um amigo", priority: "medium" },
    { text: "Revisar contas pessoais do mês", priority: "medium" },
    { text: "Separar roupas para lavar", priority: "medium" },
    { text: "Aprender uma nova receita", priority: "medium" },
    { text: "Organizar fotos antigas no computador", priority: "medium" },
    { text: "Pagar conta de luz", priority: "medium" },
    { text: "Pesquisar um novo livro para ler", priority: "medium" },

    // ========================
    // Prioridade: LOW (Opcional, pode ser feito quando houver tempo)
    // ========================
    { text: "Assistir a um webinar sobre marketing digital", priority: "low" },
    { text: "Explorar novas extensões do VS Code", priority: "low" },
    { text: "Limpar a poeira da mesa", priority: "low" },
    { text: "Revisar velhas anotações de curso", priority: "low" },
    { text: "Organizar meus livros da estante", priority: "low" },
    { text: "Planejar as férias para o final do ano", priority: "low" },
    { text: "Pesquisar novos hobbies", priority: "low" },
    { text: "Assistir um filme ou série", priority: "low" },
    { text: "Navegar em redes sociais", priority: "low" },
    { text: "Ler notícias aleatórias", priority: "low" },
    { text: "Jogar videogame por uma hora", priority: "low" },
    { text: "Maratonar uma série nova", priority: "low" },
    { text: "Aprender uma palavra nova por dia", priority: "low" },
    { text: "Colorir um livro de colorir", priority: "low" },
    { text: "Passear no parque sem pressa", priority: "low" },
    { text: "Ouvir um álbum de música completo", priority: "low" },
    { text: "Experimentar um café diferente", priority: "low" },
    { text: "Assistir documentários aleatórios", priority: "low" },
    { text: "Ver fotos antigas de viagem", priority: "low" },
    { text: "Escrever no diário pessoal", priority: "low" },
];

module.exports = trainingData;