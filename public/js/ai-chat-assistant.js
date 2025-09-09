/*
🤖 IA CHAT ASSISTANT - GEMINI QUISPE
Asistente de chat inteligente para consultas financieras
*/

class IAChatAssistant {
    constructor() {
        this.isOpen = false;
        this.conversationHistory = [];
        this.apiService = null;
        
        // Patrones de intenciones
        this.intentPatterns = {
            'consultar_gastos': {
                patterns: ['gasto', 'gasté', 'cuanto gasté', 'mis gastos', 'gastos de', 'dinero gastado'],
                response: this.handleGastosQuery.bind(this)
            },
            'consultar_ingresos': {
                patterns: ['ingreso', 'gané', 'cuanto gané', 'mis ingresos', 'ingresos de', 'dinero ganado'],
                response: this.handleIngresosQuery.bind(this)
            },
            'balance': {
                patterns: ['balance', 'saldo', 'cuanto tengo', 'mi situación', 'resumen', 'estado financiero'],
                response: this.handleBalanceQuery.bind(this)
            },
            'categorias': {
                patterns: ['categoría', 'categoria', 'qué categoria', 'tipos de gasto', 'clasificación'],
                response: this.handleCategoriasQuery.bind(this)
            },
            'ayuda': {
                patterns: ['ayuda', 'help', 'qué puedes hacer', 'como funciona', 'comandos'],
                response: this.handleAyudaQuery.bind(this)
            },
            'saludo': {
                patterns: ['hola', 'hi', 'hello', 'buenos días', 'buenas tardes', 'hey'],
                response: this.handleSaludoQuery.bind(this)
            }
        };
        
        console.log('🤖 IA Chat Assistant inicializado - Gemini Quispe');
    }

    /**
     * Inicializa el chat assistant
     */
    init() {
        this.createChatUI();
        this.bindEvents();
        
        // Obtener referencia al API Service
        if (window.apiService) {
            this.apiService = window.apiService;
        } else {
            console.warn('⚠️ API Service no disponible para Chat Assistant');
        }
        
        console.log('🤖 Chat Assistant listo');
    }

    /**
     * Crea la interfaz del chat
     */
    createChatUI() {
        // Botón flotante
        const floatingButton = document.createElement('div');
        floatingButton.id = 'ai-chat-button';
        floatingButton.className = 'fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg cursor-pointer transition-all duration-300 transform hover:scale-110';
        floatingButton.innerHTML = `
            <div class="flex items-center justify-center w-6 h-6">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"></path>
                </svg>
            </div>
        `;

        // Ventana de chat
        const chatWindow = document.createElement('div');
        chatWindow.id = 'ai-chat-window';
        chatWindow.className = 'fixed bottom-24 right-6 z-50 bg-white rounded-lg shadow-2xl border border-gray-200 w-80 h-96 hidden flex-col';
        chatWindow.innerHTML = `
            <!-- Header -->
            <div class="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
                <div class="flex items-center space-x-2">
                    <span class="text-lg">🤖</span>
                    <span class="font-semibold">Asistente IA</span>
                </div>
                <button id="ai-chat-close" class="text-white hover:text-gray-200">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                </button>
            </div>
            
            <!-- Messages Area -->
            <div id="ai-chat-messages" class="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
                <div class="text-sm text-gray-600 text-center">
                    🤖 ¡Hola! Soy tu asistente financiero. Pregúntame sobre tus gastos, ingresos o balance.
                </div>
            </div>
            
            <!-- Input Area -->
            <div class="border-t border-gray-200 p-4">
                <div class="flex space-x-2">
                    <input type="text" id="ai-chat-input" 
                           class="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" 
                           placeholder="Pregunta algo...">
                    <button id="ai-chat-send" 
                            class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium">
                        Enviar
                    </button>
                </div>
            </div>
        `;

        // Agregar al body
        document.body.appendChild(floatingButton);
        document.body.appendChild(chatWindow);
    }

    /**
     * Vincula eventos de la UI
     */
    bindEvents() {
        const button = document.getElementById('ai-chat-button');
        const window = document.getElementById('ai-chat-window');
        const closeBtn = document.getElementById('ai-chat-close');
        const input = document.getElementById('ai-chat-input');
        const sendBtn = document.getElementById('ai-chat-send');

        // Abrir/cerrar chat
        button?.addEventListener('click', () => this.toggleChat());
        closeBtn?.addEventListener('click', () => this.closeChat());

        // Enviar mensaje
        sendBtn?.addEventListener('click', () => this.sendMessage());
        input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }

    /**
     * Toggle del chat
     */
    toggleChat() {
        this.isOpen = !this.isOpen;
        const chatWindow = document.getElementById('ai-chat-window');
        
        if (this.isOpen) {
            chatWindow.classList.remove('hidden');
            chatWindow.classList.add('flex');
            document.getElementById('ai-chat-input')?.focus();
        } else {
            chatWindow.classList.add('hidden');
            chatWindow.classList.remove('flex');
        }
    }

    /**
     * Cerrar chat
     */
    closeChat() {
        this.isOpen = false;
        const chatWindow = document.getElementById('ai-chat-window');
        chatWindow.classList.add('hidden');
        chatWindow.classList.remove('flex');
    }

    /**
     * Enviar mensaje
     */
    async sendMessage() {
        const input = document.getElementById('ai-chat-input');
        const message = input.value.trim();
        
        if (!message) return;

        // Agregar mensaje del usuario
        this.addMessage(message, 'user');
        input.value = '';

        // Mostrar typing indicator
        this.showTyping();

        // Procesar mensaje y generar respuesta
        try {
            const response = await this.processMessage(message);
            this.hideTyping();
            this.addMessage(response, 'assistant');
        } catch (error) {
            this.hideTyping();
            this.addMessage('Lo siento, hubo un error procesando tu consulta. ¿Podrías intentar de nuevo?', 'assistant');
            console.error('Error en Chat Assistant:', error);
        }
    }

    /**
     * Agregar mensaje al chat
     */
    addMessage(text, sender) {
        const messagesArea = document.getElementById('ai-chat-messages');
        const messageDiv = document.createElement('div');
        
        if (sender === 'user') {
            messageDiv.className = 'flex justify-end';
            messageDiv.innerHTML = `
                <div class="bg-blue-600 text-white rounded-lg px-3 py-2 max-w-xs text-sm">
                    ${text}
                </div>
            `;
        } else {
            messageDiv.className = 'flex justify-start';
            messageDiv.innerHTML = `
                <div class="bg-white border border-gray-200 rounded-lg px-3 py-2 max-w-xs text-sm">
                    ${text}
                </div>
            `;
        }

        messagesArea.appendChild(messageDiv);
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }

    /**
     * Mostrar indicador de typing
     */
    showTyping() {
        const messagesArea = document.getElementById('ai-chat-messages');
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.className = 'flex justify-start';
        typingDiv.innerHTML = `
            <div class="bg-gray-100 rounded-lg px-3 py-2 text-sm">
                🤖 Escribiendo...
            </div>
        `;
        messagesArea.appendChild(typingDiv);
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }

    /**
     * Ocultar indicador de typing
     */
    hideTyping() {
        const typingDiv = document.getElementById('typing-indicator');
        if (typingDiv) {
            typingDiv.remove();
        }
    }

    /**
     * Procesar mensaje del usuario
     */
    async processMessage(message) {
        const intent = this.detectIntent(message);
        console.log(`🤖 Intent detectado: ${intent} para mensaje: "${message}"`);

        if (this.intentPatterns[intent]) {
            return await this.intentPatterns[intent].response(message);
        } else {
            return "No entiendo tu consulta. Puedes preguntarme sobre gastos, ingresos, balance o escribir 'ayuda' para ver qué puedo hacer.";
        }
    }

    /**
     * Detectar intención del mensaje
     */
    detectIntent(message) {
        const lowerMessage = message.toLowerCase();
        
        for (let [intent, config] of Object.entries(this.intentPatterns)) {
            for (let pattern of config.patterns) {
                if (lowerMessage.includes(pattern)) {
                    return intent;
                }
            }
        }
        
        return 'unknown';
    }

    /**
     * Manejar consultas de gastos
     */
    async handleGastosQuery(message) {
        if (!this.apiService) {
            return "Lo siento, no puedo acceder a tus datos en este momento.";
        }

        try {
            const userId = localStorage.getItem('user_id');
            if (!userId) {
                return "Necesitas estar logueado para consultar tus gastos.";
            }

            // Obtener gastos (esto debería ser implementado en el API service)
            // Por ahora, respuesta simulada
            return "📊 Según mis cálculos, este mes has gastado $1,250 principalmente en alimentación ($450) y transporte ($300). ¿Te gustaría más detalles sobre alguna categoría específica?";
            
        } catch (error) {
            console.error('Error obteniendo gastos:', error);
            return "Hubo un problema consultando tus gastos. ¿Podrías intentar de nuevo?";
        }
    }

    /**
     * Manejar consultas de ingresos
     */
    async handleIngresosQuery(message) {
        return "💰 Este mes tus ingresos totales son de $2,800. El ingreso más alto fue tu salario ($2,500). ¡Mantén el buen trabajo!";
    }

    /**
     * Manejar consultas de balance
     */
    async handleBalanceQuery(message) {
        return "⚖️ Tu balance actual es de +$1,550. Ingresos: $2,800, Gastos: $1,250. ¡Estás ahorrando bien este mes!";
    }

    /**
     * Manejar consultas de categorías
     */
    async handleCategoriasQuery(message) {
        return "📋 Las categorías disponibles son: Alimentación 🍽️, Transporte 🚗, Vivienda 🏠, Salud 🏥, Entretenimiento 🎬, Educación 📚, Tecnología 💻, Ropa 👕, Servicios 🔧 y Otros 📝.";
    }

    /**
     * Manejar consultas de ayuda
     */
    async handleAyudaQuery(message) {
        return `🤖 Puedo ayudarte con:

• 📊 "¿Cuánto gasté este mes?" - Consultar gastos
• 💰 "¿Cuáles son mis ingresos?" - Ver ingresos  
• ⚖️ "¿Cuál es mi balance?" - Estado financiero
• 📋 "¿Qué categorías hay?" - Lista de categorías
• 🤖 "Ayuda" - Este mensaje

¡Pregúntame lo que necesites!`;
    }

    /**
     * Manejar saludos
     */
    async handleSaludoQuery(message) {
        const saludos = [
            "¡Hola! 👋 Soy tu asistente financiero. ¿En qué puedo ayudarte hoy?",
            "¡Hey! 🤖 ¿Quieres revisar tus finanzas? Pregúntame lo que necesites.",
            "¡Buenas! 😊 Estoy aquí para ayudarte con tus gastos e ingresos."
        ];
        return saludos[Math.floor(Math.random() * saludos.length)];
    }
}

// Instancia global
window.aiChatAssistant = new IAChatAssistant();

// Auto-inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    if (window.aiChatAssistant) {
        // Pequeño delay para asegurar que otros scripts se carguen
        setTimeout(() => {
            window.aiChatAssistant.init();
        }, 1000);
    }
});