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
}

// Exporta uma única instância do AIService
module.exports = new AIService();