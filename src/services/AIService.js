const natural = require('natural');
const TfIdf = natural.TfIdf;   
const trainingData = require('../utils/aiDataset');
const groupingTrainingData = require('../utils/aiGroupingDataset');

class AIService {
    constructor() {
        this.classifier = null;
        this.tfidfForPriority = new TfIdf();
        this.tfidfForGrouping = new TfIdf();
        this.isPriorityModelTrained = false;
        this.isGroupingModelTrained = false;
        this.trainedGroupingDocuments = [];

        this.trainPriorityModel();
        this.trainGroupingModel();
    }

    // Método para treinar o modelo de classificação de prioridade
    trainPriorityModel() {
        console.log('Iniciando treinamento do modelo de sugestão de prioridade...');
        trainingDataPriority.forEach(item => {
            this.tfidfForPriority.addDocument(item.text);
            // O classificador Naive Bayes pode aceitar documentos textuais diretamente
            this.classifier.addDocument(item.text, item.priority);
        });
        this.classifier.train();
        this.isPriorityModelTrained = true;
        console.log('Modelo de sugestão de prioridade treinado com sucesso!');
    }

    // Método para sugerir a prioridade de uma nova tarefa
    suggestPriority(taskDescription) {
        if (!this.isPriorityModelTrained) {
            console.warn('Modelo de IA de prioridade não treinado. Retornando prioridade padrão.');
            return 'medium';
        }
        if (!taskDescription || taskDescription.trim() === '') {
            return 'medium';
        }
        const predictedPriority = this.classifier.classify(taskDescription);
        return predictedPriority;
    }

    // Método para treinar o modelo de agrupamento (calcula TF-IDF para o dataset)
    trainGroupingModel() {
        console.log('Iniciando treinamento do modelo de agrupamento de tarefas...');
        groupingTrainingData.forEach(doc => {
            this.tfidfForGrouping.addDocument(doc);
            this.trainedGroupingDocuments.push(doc); // Armazena os documentos originais
        });
        this.isGroupingModelTrained = true;
        console.log('Modelo de agrupamento de tarefas treinado com sucesso!');
    }

    /**
     * Calcula a similaridade de cosseno entre dois vetores TF-IDF.
     * Esta é uma função auxiliar para o agrupamento.
     * @param {Array<Number>} vec1 - Primeiro vetor TF-IDF.
     * @param {Array<Number>} vec2 - Segundo vetor TF-IDF.
     * @returns {Number} - Similaridade de cosseno entre 0 e 1.
     */
    cosineSimilarity(vec1, vec2) {
        let dotProduct = 0;
        let magnitude1 = 0;
        let magnitude2 = 0;

        // Ensure both vectors have the same length (pad with zeros if necessary)
        const maxLength = Math.max(vec1.length, vec2.length);
        const paddedVec1 = [...vec1];
        const paddedVec2 = [...vec2];
        while (paddedVec1.length < maxLength) paddedVec1.push(0);
        while (paddedVec2.length < maxLength) paddedVec2.push(0);

        for (let i = 0; i < maxLength; i++) {
            dotProduct += paddedVec1[i] * paddedVec2[i];
            magnitude1 += paddedVec1[i] * paddedVec1[i];
            magnitude2 += paddedVec2[i] * paddedVec2[i];
        }

        magnitude1 = Math.sqrt(magnitude1);
        magnitude2 = Math.sqrt(magnitude2);

        if (magnitude1 === 0 || magnitude2 === 0) return 0; // Evitar divisão por zero

        return dotProduct / (magnitude1 * magnitude2);
    }

    /**
     * Sugere tarefas similares a uma dada descrição, com base em um conjunto de tarefas existentes.
     * Para o MVP, usei o groupingTrainingData como meu "corpus" de tarefas existentes.
     * Em um ambiente real, isso usaria as tarefas ativas do usuário do DB.
     * @param {string} inputDescription - A descrição da tarefa para a qual buscar similares.
     * @param {Array<Object>} existingTasks - Um array de objetos de tarefas { id: string, title: string, description: string }.
     * @returns {Array<Object>} - Uma lista de tarefas similares com seus scores de similaridade.
     */
    suggestSimilarTasks(inputDescription, existingTasks = []) {
        if (!this.isGroupingModelTrained) {
            console.warn('Modelo de IA de agrupamento não treinado.');
            return [];
        }
        if (!inputDescription || inputDescription.trim() === '') {
            return [];
        }

        const similarities = [];
        const combinedCorpus = existingTasks.map(task => task.description || task.title || ''); // Pega descrições de tarefas existentes

        // Adiciona temporariamente a descrição de entrada e as tarefas existentes ao TF-IDF para cálculo
        // Criei um novo TfIdf temporário para cada chamada, para evitar modificar o TfIdf global
        // com documentos que não fazem parte do treinamento principal e garantir que
        // os vetores sejam calculados sobre o corpus atual da requisição.
        // Isso é mais custoso computacionalmente, mas simples para MVP.
        const currentTfIdf = new TfIdf();
        currentTfIdf.addDocument(inputDescription);
        combinedCorpus.forEach(doc => currentTfIdf.addDocument(doc));

        // Obter o vetor TF-IDF da descrição de entrada
        const inputTerms = natural.PorterStemmerPt.tokenizeAndStem(inputDescription); // Usar stemmer para PT
        const inputTfIdfVector = [];
        inputTerms.forEach(term => {
            currentTfIdf.tfidfs(term, 0, (i, measure) => {
                inputTfIdfVector.push(measure); // Medida TF-IDF do termo na descrição de entrada
            });
        });

        // Comparar com cada tarefa existente
        existingTasks.forEach((task, index) => {
            const taskText = task.description || task.title || '';
            const taskTerms = natural.PorterStemmerPt.tokenizeAndStem(taskText);
            const taskTfIdfVector = [];
            taskTerms.forEach(term => {
                currentTfIdf.tfidfs(term, index + 1, (i, measure) => { // Index + 1 porque 0 é o inputDescription
                    taskTfIdfVector.push(measure);
                });
            });

            const similarity = natural.JaroWinklerDistance(inputDescription, taskText, undefined, false); // Considera a ordem

            // Define um limiar de similaridade (pode ser ajustado)
            if (similarity > 0.6) { // Por exemplo, tarefas com mais de 60% de similaridade
                similarities.push({
                    taskId: task.id,
                    title: task.title,
                    description: task.description,
                    similarityScore: similarity
                });
            }
        });

        // Ordena por score de similaridade decrescente e limita o número de sugestões
        return similarities.sort((a, b) => b.similarityScore - a.similarityScore).slice(0, 5); // Sugere as 5 mais similares
    }

    // Método de Reescrita Inteligente de Títulos
    /**
     * Sugere uma reescrita mais clara ou completa para um título de tarefa.
     * Esta é uma implementação baseada em regras para o MVP.
     * @param {string} originalTitle - O título original da tarefa.
     * @returns {string} - O título reescrito ou o original se nenhuma regra se aplicar.
     */
    rewriteTitle(originalTitle) {
        if (!originalTitle || originalTitle.trim() === '') {
            return originalTitle; // Retorna o original se estiver vazio
        }

        let rewrittenTitle = originalTitle.trim();
        const lowerCaseTitle = rewrittenTitle.toLowerCase();

        // Regras de reescrita baseadas em padrões comuns
        // 1. Títulos genéricos/incompletos
        if (lowerCaseTitle === 'fazer' || lowerCaseTitle === 'resolver' || lowerCaseTitle === 'verificar') {
            return `${rewrittenTitle} [Detalhes Necessários]`;
        }
        if (lowerCaseTitle.includes('reunião')) {
            if (!lowerCaseTitle.includes('com') && !lowerCaseTitle.includes('sobre')) {
                return `Reunião: [Assunto e Participantes]`;
            }
        }
        if (lowerCaseTitle.includes('email') || lowerCaseTitle.includes('e-mail')) {
             if (!lowerCaseTitle.includes('responder') && !lowerCaseTitle.includes('enviar')) {
                return `Enviar/Responder E-mail: [Assunto/Destinatário]`;
            }
        }
        if (lowerCaseTitle.includes('bug') && !lowerCaseTitle.includes('corrigir') && !lowerCaseTitle.includes('resolver')) {
            return `Corrigir Bug: [Nome do Módulo/Problema]`;
        }
        if (lowerCaseTitle.includes('relatório')) {
             if (!lowerCaseTitle.includes('fazer') && !lowerCaseTitle.includes('finalizar')) {
                return `Finalizar Relatório: [Tipo de Relatório]`;
            }
        }
        if (lowerCaseTitle.includes('código') && !lowerCaseTitle.includes('revisar') && !lowerCaseTitle.includes('escrever')) {
            return `Revisar/Escrever Código: [Módulo/Funcionalidade]`;
        }

        // 2. Padronização (Exemplos)
        // Padronizar "fix bug" para "Corrigir Bug"
        if (lowerCaseTitle.includes('fix bug')) {
            rewrittenTitle = rewrittenTitle.replace(/fix bug/i, 'Corrigir Bug');
        }
        // Padronizar "implementar" para "Implementar" no início
        if (lowerCaseTitle.startsWith('implementar')) {
            rewrittenTitle = 'Implementar ' + rewrittenTitle.substring('implementar'.length).trim();
        }

        // 3. Adicionar detalhes sugeridos (muito básico)
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

        // Remover espaços extras
        rewrittenTitle = rewrittenTitle.replace(/\s+/g, ' ').trim();

        // Capitalizar a primeira letra, se for uma frase completa (heurística simples)
        if (rewrittenTitle.length > 0) {
            rewrittenTitle = rewrittenTitle.charAt(0).toUpperCase() + rewrittenTitle.slice(1);
        }

        return rewrittenTitle;
    }
}

// Exporta uma única instância do AIService
module.exports = new AIService();