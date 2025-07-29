class MockAIService {
    suggestPriority(taskDescription) {
        if (taskDescription && taskDescription.toLowerCase().includes('urgente')) {
            return 'urgent';
        }
        if (taskDescription && taskDescription.toLowerCase().includes('importante')) {
            return 'high';
        }
        return 'medium'; // Padrão ou para outros casos
    }
}

module.exports = new MockAIService();