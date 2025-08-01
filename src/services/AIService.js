const natural = require('natural'); // Biblioteca de NLP para Node.js
const TfIdf = natural.TfIdf;

// Declarar variáveis para os dados de treinamento no escopo do módulo.
// Elas serão preenchidas quando initializeModels() for chamado.
let trainingDataPriority;
let groupingTrainingData;

/**
 * @class AIService
 * @description Serviço que encapsula a lógica de Inteligência Artificial para
 * sugestão de prioridade, agrupamento de tarefas e reescrita de títulos.
 * Os modelos são treinados na inicialização explícita via initializeModels().
 */
class AIService {
    constructor() {
        // Inicializa classificadores e ferramentas de NLP
        this.classifier = new natural.BayesClassifier(); // Classificador para prioridade
        this.tfidfForPriority = new TfIdf();             // TF-IDF para análise de prioridade
        this.tfidfForGrouping = new TfIdf();             // TF-IDF para análise de agrupamento (embora Jaro-Winkler seja usado no MVP)

        // Flags para indicar se os modelos foram treinados
        this.isPriorityModelTrained = false;
        this.isGroupingModelTrained = false;

        // Armazena documentos do dataset de agrupamento para comparações futuras
        this.trainedGroupingDocuments = [];
    }

    /**
     * @method initializeModels
     * @description Carrega os datasets e treina os modelos de IA.
     * Garante que o treinamento ocorra apenas uma vez para a vida da instância.
     */
    initializeModels() {
        // Verifica se os modelos já foram treinados para evitar retreinamento desnecessário
        if (this.isPriorityModelTrained && this.isGroupingModelTrained) {
            console.log('Modelos de IA já foram inicializados. Pulando retreinamento.');
            return;
        }

        console.log('Inicializando modelos de IA...');

        // Importa os dados de treinamento AQUI.
        // Isso garante que os 'require()' ocorram apenas quando o método é chamado.
        if (!trainingDataPriority) {
            trainingDataPriority = require('../utils/aiDataset');
        }
        if (!groupingTrainingData) {
            groupingTrainingData = require('../utils/aiGroupingDataset');
        }

        // Chama os métodos de treinamento
        this.trainPriorityModel();
        this.trainGroupingModel();
        console.log('Modelos de IA inicializados com sucesso!');
    }

    /**
     * @method trainPriorityModel
     * @description Treina o modelo de classificação de prioridade usando o dataset 'aiDataset.js'.
     */
    trainPriorityModel() {

        // Verifica se o dataset foi carregado
        if (!trainingDataPriority) {
            console.error("Erro: trainingDataPriority não carregado. initializeModels() deve ser chamado antes do treinamento.");
            return; // Impede a execução se os dados não estão prontos
        }

        // Adiciona documentos ao TF-IDF e ao classificador Naive Bayes
        trainingDataPriority.forEach(item => {
            this.tfidfForPriority.addDocument(item.text); // Para possíveis usos futuros de TF-IDF para prioridade
            this.classifier.addDocument(item.text, item.priority);
        });

        // Treina o classificador
        this.classifier.train();
        this.isPriorityModelTrained = true;
    }

    /**
     * @method suggestPriority
     * @description Sugere a prioridade de uma tarefa com base em sua descrição.
     * @param {string} taskDescription - A descrição da tarefa.
     * @returns {string} A prioridade sugerida ('low', 'medium', 'high', 'urgent').
     */
    suggestPriority(taskDescription) {
        if (!this.isPriorityModelTrained) {
            console.warn('Modelo de IA de prioridade não treinado. Retornando prioridade padrão.');
            return 'medium'; // Retorna padrão se o modelo não estiver pronto
        }
        if (!taskDescription || taskDescription.trim() === '') {
            return 'medium'; // Retorna padrão para descrições vazias
        }

        // Classifica a descrição da tarefa usando o modelo treinado
        const predictedPriority = this.classifier.classify(taskDescription);
        return predictedPriority;
    }

    /**
     * @method trainGroupingModel
     * @description Treina o "modelo" de agrupamento (prepara os documentos para similaridade).
     * No MVP, isso significa calcular TF-IDF (não usado diretamente para Jaro-Winkler)
     * e armazenar os documentos para comparação futura.
    */
    trainGroupingModel() {
        // Verifica se o dataset foi carregado
        if (!groupingTrainingData) {
            console.error("Erro: groupingTrainingData não carregado. initializeModels() deve ser chamado antes do treinamento.");
            return; // Impede a execução se os dados não estão prontos
        }

        // Adiciona cada documento ao TF-IDF e armazena para referência
        groupingTrainingData.forEach(doc => {
            this.tfidfForGrouping.addDocument(doc);
            this.trainedGroupingDocuments.push(doc);
        });
        this.isGroupingModelTrained = true;
    }

    /**
     * @method suggestSimilarTasks
     * @description Sugere tarefas similares com base em um score de similaridade de palavras,
     * considerando palavras importantes e ordenando por relevância.
     * @param {string} baseDescription - Descrição base para comparação.
     * @param {Array<Object>} tasks - Array de tarefas {id, title, description}.
     * @returns {Array<Object>} - Lista de tarefas similares ordenadas por similaridade.
     */
    suggestSimilarTasks(baseDescription, tasks) {
        if (!baseDescription || baseDescription.trim() === '') {
            return [];
        }

        // Reintroduzindo uma abordagem baseada em Jaro-Winkler para similaridade textual.
        if (!this.isGroupingModelTrained) {
            console.warn('Modelo de IA de agrupamento não treinado. Retornando array vazio.');
            return [];
        }

        const similarities = [];
        const THRESHOLD = 0.6; // Limiar de similaridade (ajustável)

        tasks.forEach((task) => {
            const taskText = task.description || task.title || '';
            const similarityScore = natural.JaroWinklerDistance(baseDescription, taskText, undefined, false);

            if (similarityScore > THRESHOLD) {
                similarities.push({
                    taskId: task.id,
                    title: task.title,
                    description: task.description,
                    similarityScore: similarityScore
                });
            }
        });

        // Ordena por score de similaridade decrescente e limita o número de sugestões
        return similarities.sort((a, b) => b.similarityScore - a.similarityScore).slice(0, 5);
    }

    /**
     * @method rewriteTitle
     * @description Sugere uma reescrita mais clara ou completa para um título de tarefa.
     * Implementação baseada em regras heurísticas para o MVP.
     * @param {string} originalTitle - O título original da tarefa.
     * @returns {string} - O título reescrito ou o original se nenhuma regra se aplicar.
     */
    rewriteTitle(originalTitle) {
        if (!originalTitle || originalTitle.trim() === '') {
            return originalTitle;
        }

        let rewrittenTitle = originalTitle.trim();
        const lowerCaseTitle = rewrittenTitle.toLowerCase();
        const normalizedTitle = lowerCaseTitle.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Para 'reuniao' vs 'reunião'

        // Regras para títulos genéricos/incompletos
        if (lowerCaseTitle === 'fazer' || lowerCaseTitle === 'resolver' || lowerCaseTitle === 'verificar') {
            rewrittenTitle = `${rewrittenTitle} [Detalhes Necessários]`;
        }
        // Correção de acentos para "reunião" antes das regras
        rewrittenTitle = rewrittenTitle.replace(/reuniao/gi, 'reunião'); // Padroniza para a forma correta com acento


        // Lógica para reuniões: se contém 'reunião' e não tem palavras-chave de detalhe
        // A ordem é importante aqui. Se um título já tem detalhes, ele não deve ser generalizado.
        if (normalizedTitle.includes('reuniao')) { // Usar normalizedTitle para evitar problemas com acentuação
            const detailKeywords = ['com', 'sobre', 'de ', 'para ', 'do ', 'da ', 'com o ', 'equipe', 'cliente', 'projeto']; // Expandir palavras-chave
            const hasDetail = detailKeywords.some(keyword => normalizedTitle.includes(keyword));
            if (!hasDetail) {
                rewrittenTitle = 'Reunião: [Assunto e Participantes]';
            }
        }
        // Lógica para e-mails: se contém 'email'/'e-mail' e não tem 'responder'/'enviar'
        else if (lowerCaseTitle.includes('email') || lowerCaseTitle.includes('e-mail')) {
             if (!lowerCaseTitle.includes('responder') && !lowerCaseTitle.includes('enviar')) {
                rewrittenTitle = `Enviar/Responder E-mail: [Assunto/Destinatário]`;
            }
        }
        // Regra para títulos de bug específicos que adicionam [Módulo/Problema]
        // Esta regra deve ser mais específica para 'bug' como um título principal,
        // e não para títulos que já contêm detalhes.
        else if (
            (lowerCaseTitle === 'bug' || lowerCaseTitle === 'fix bug' || lowerCaseTitle === 'corrigir bug') &&
            !lowerCaseTitle.includes('corrigir') && !lowerCaseTitle.includes('resolver')
        ) {
            rewrittenTitle = `Corrigir Bug: [Nome do Módulo/Problema]`;
        }
        // Casos com "relatório"
        else if (lowerCaseTitle.includes('relatório')) {
             if (!lowerCaseTitle.includes('fazer') && !lowerCaseTitle.includes('finalizar')) {
                rewrittenTitle = `Finalizar Relatório: [Tipo de Relatório]`;
            }
        }
        // Casos com "código"
        else if (lowerCaseTitle.includes('código') && !lowerCaseTitle.includes('revisar') && !lowerCaseTitle.includes('escrever')) {
            rewrittenTitle = `Revisar/Escrever Código: [Módulo/Funcionalidade]`;
        }

        // Regra que capitaliza a palavra "Bug" em qualquer lugar
        rewrittenTitle = rewrittenTitle.replace(/\bbug\b/gi, 'Bug'); // Regex para palavra completa, global, case-insensitive

        // Regras de Padronização (aplicadas após as regras gerais mais importantes)
        // Padroniza "fix bug" para "Corrigir Bug" (já coberto pela regex acima, mas mantido para clareza)
        if (lowerCaseTitle.includes('fix bug')) { // Use lowerCaseTitle para a condição
            rewrittenTitle = rewrittenTitle.replace(/fix bug/i, 'Corrigir Bug');
        }
        // Padroniza "implementar" no início da frase
        if (lowerCaseTitle.startsWith('implementar')) { // Use lowerCaseTitle para a condição
            rewrittenTitle = 'Implementar ' + rewrittenTitle.substring('implementar'.length).trim();
        }

        // Regras para Adicionar Detalhes Sugeridos (heurísticas de preenchimento)
        if (lowerCaseTitle.includes('pesquisar')) {
            if (!lowerCaseTitle.includes('sobre')) {
                rewrittenTitle += ' sobre [Assunto Específico]';
            }
        }
        if (lowerCaseTitle.includes('criar')) {
            if (!lowerCaseTitle.includes('para')) {
                rewrittenTitle += ' para [Propósito]';
            }
        }

        // Limpeza Final e Capitalização da Primeira Letra da Frase
        rewrittenTitle = rewrittenTitle.replace(/\s+/g, ' ').trim(); // Remove múltiplos espaços e trim
        if (rewrittenTitle.length > 0) {
            // Capitaliza a primeira letra da string final
            rewrittenTitle = rewrittenTitle.charAt(0).toUpperCase() + rewrittenTitle.slice(1);
        }

        return rewrittenTitle;
    }
}

// Crie a instância ÚNICA do AIService para toda a aplicação.
// Esta instância será exportada e usada por outros módulos.
const aiServiceInstance = new AIService();

// Exporta a INSTÂNCIA pré-configurada do AIService.
module.exports = aiServiceInstance;