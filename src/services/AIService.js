const natural = require('natural');
const TfIdf = natural.TfIdf;   
const trainingData = require('../utils/aiDataset'); 

class AIService {
    constructor() {
        this.classifier = null; // O classificador que será treinado
        this.tfidf = new TfIdf(); // Instância para extrair features do texto
        this.isModelTrained = false;
        this.trainModel(); // Treina o modelo assim que o serviço é instanciado
    }

    // Método para treinar o modelo de classificação de prioridade
    trainModel() {
        console.log('Iniciando treinamento do modelo de sugestão de prioridade...');

        // 1. Preparar os dados para o TF-IDF (Term Frequency-Inverse Document Frequency)
        // TF-IDF é uma técnica para converter texto em um formato numérico que modelos de ML podem entender.
        // Ele pesa a importância de uma palavra em um documento em relação a todo o corpus.
        trainingData.forEach(item => {
            this.tfidf.addDocument(item.text); // Adiciona cada descrição de tarefa
        });

        // 2. Criar o classificador Naive Bayes
        // É um classificador leve e eficaz para problemas de classificação de texto.
        this.classifier = new natural.BayesClassifier();

        // 3. Adicionar documentos ao classificador com seus rótulos (prioridades)
        trainingData.forEach(item => {
            // Em vez de passar o texto diretamente, passamos as features TF-IDF.
            // O classificador 'natural' pode aceitar documentos textuais diretamente
            // e fará a tokenização e TF-IDF internamente se não passarmos um vetor.
            // Para simplicidade e eficácia com 'natural', passei o texto.
            this.classifier.addDocument(item.text, item.priority);
        });

        // 4. Treinar o classificador
        this.classifier.train();
        this.isModelTrained = true;
        console.log('Modelo de sugestão de prioridade treinado com sucesso!');
    }

    // Método para sugerir a prioridade de uma nova tarefa
    suggestPriority(taskDescription) {
        if (!this.isModelTrained) {
            console.warn('Modelo de IA não treinado. Retornando prioridade padrão.');
            return 'medium'; // Retorna padrão se o modelo não estiver pronto
        }
        if (!taskDescription || taskDescription.trim() === '') {
            return 'medium'; // Retorna padrão para descrições vazias
        }

        // Classifica a descrição da tarefa
        // O método 'classify' do Naive Bayes já faz o pré-processamento necessário
        const predictedPriority = this.classifier.classify(taskDescription);
        return predictedPriority;
    }

    // Futuras funções de IA podem ser adicionadas aqui
}

// Exporta uma única instância do AIService para que o modelo seja treinado uma vez
module.exports = new AIService();