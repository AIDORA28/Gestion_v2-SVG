/*
🤖 IA API ENDPOINT - GEMINI QUISPE  
Definición de endpoints para funcionalidades de IA
*/

class AIAPIEndpoint {
    constructor() {
        this.baseUrl = '/api/ai';
        console.log('🤖 AI API Endpoint inicializado - Gemini Quispe');
    }

    /**
     * Endpoint para categorización inteligente
     * POST /api/ai/categorize
     */
    async categorizeExpense(descripcion, userId = null) {
        try {
            // Por ahora usar la lógica cliente, futuro: llamada a servidor
            if (window.smartCategorization) {
                const result = window.smartCategorization.getSuggestionWithConfidence(descripcion);
                
                // Simular respuesta de API
                return {
                    success: true,
                    data: {
                        categoria: result.categoria,
                        confidence: result.confidence,
                        reason: result.reason,
                        method: 'client-side-ml',
                        timestamp: new Date().toISOString()
                    }
                };
            }
            
            throw new Error('Smart Categorization no disponible');
            
        } catch (error) {
            console.error('Error en categorización IA:', error);
            return {
                success: false,
                error: error.message,
                fallback: 'otros'
            };
        }
    }

    /**
     * Endpoint para consultas del chat assistant
     * POST /api/ai/chat
     */
    async processChatQuery(message, userId = null, conversationId = null) {
        try {
            // Por ahora usar la lógica cliente, futuro: llamada a servidor
            if (window.aiChatAssistant) {
                const response = await window.aiChatAssistant.processMessage(message);
                
                return {
                    success: true,
                    data: {
                        response: response,
                        intent: window.aiChatAssistant.detectIntent(message),
                        conversationId: conversationId || 'local-session',
                        timestamp: new Date().toISOString()
                    }
                };
            }
            
            throw new Error('Chat Assistant no disponible');
            
        } catch (error) {
            console.error('Error en chat IA:', error);
            return {
                success: false,
                error: error.message,
                fallback: 'Lo siento, no pude procesar tu consulta.'
            };
        }
    }

    /**
     * Endpoint para entrenamiento personalizado
     * POST /api/ai/learn
     */
    async learnFromUser(descripcion, categoria, userId) {
        try {
            if (window.smartCategorization) {
                window.smartCategorization.learnFromUser(descripcion, categoria);
                
                return {
                    success: true,
                    data: {
                        learned: true,
                        descripcion,
                        categoria,
                        userId,
                        timestamp: new Date().toISOString()
                    }
                };
            }
            
            throw new Error('Smart Categorization no disponible');
            
        } catch (error) {
            console.error('Error en aprendizaje IA:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Endpoint para obtener estadísticas de IA
     * GET /api/ai/stats
     */
    async getAIStats(userId) {
        try {
            const stats = {
                smart_categorization: {
                    enabled: !!window.smartCategorization,
                    categories_available: window.smartCategorization ? 
                        Object.keys(window.smartCategorization.categoryPatterns).length : 0,
                    learning_enabled: true
                },
                chat_assistant: {
                    enabled: !!window.aiChatAssistant,
                    intents_available: window.aiChatAssistant ? 
                        Object.keys(window.aiChatAssistant.intentPatterns).length : 0,
                    conversation_active: window.aiChatAssistant ? window.aiChatAssistant.isOpen : false
                },
                general: {
                    ai_version: '1.0.0',
                    developer: 'Gemini Quispe',
                    last_updated: '2025-09-09'
                }
            };

            return {
                success: true,
                data: stats
            };
            
        } catch (error) {
            console.error('Error obteniendo stats IA:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Futuro: Endpoint para análisis predictivo
     * POST /api/ai/predict
     */
    async predictFinancialTrends(userId, timeframe = 'month') {
        // Placeholder para futura implementación
        return {
            success: false,
            message: 'Funcionalidad en desarrollo - Gemini Quispe',
            roadmap: 'Análisis predictivo será implementado en versión 2.0'
        };
    }
}

// Instancia global
window.aiAPIEndpoint = new AIAPIEndpoint();

// API wrapper functions para fácil integración
window.aiAPI = {
    categorize: (descripcion, userId) => window.aiAPIEndpoint.categorizeExpense(descripcion, userId),
    chat: (message, userId, conversationId) => window.aiAPIEndpoint.processChatQuery(message, userId, conversationId),
    learn: (descripcion, categoria, userId) => window.aiAPIEndpoint.learnFromUser(descripcion, categoria, userId),
    stats: (userId) => window.aiAPIEndpoint.getAIStats(userId)
};

console.log('🤖 AI API Endpoints disponibles:', Object.keys(window.aiAPI));