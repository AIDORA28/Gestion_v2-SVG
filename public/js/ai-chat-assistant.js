/*
🤖 IA CHAT ASSISTANT CON DATOS REALES - GEMINI QUISPE
Asistente financiero inteligente conectado a Supabase
*/

class IAChatAssistant {
    constructor() {
        this.isOpen = false;
        this.apiService = null;
        
        // Patrones inteligentes para detectar intenciones (más flexibles)
        this.intentPatterns = {
            'gastos_ayer': ['ayer', 'gasté ayer', 'gasto ayer', 'cuanto gasté ayer', 'gaste ayer'],
            'gastos_hoy': ['hoy', 'gasté hoy', 'gasto hoy', 'cuanto gasté hoy', 'gaste hoy'],
            'gastos_mes': ['este mes', 'gasté este mes', 'mes', 'mensual', 'cuanto gasté este mes', 'gaste este mes'],
            'gastos_total': ['gastos', 'gasté', 'cuanto gasté', 'mis gastos', 'gaste', 'cuanto gaste', 'total gastos', 'todos mis gastos'],
            'ingresos': ['ingresos', 'gané', 'cuanto gané', 'mis ingresos', 'ingreso', 'cuanto ingreso', 'gane', 'dinero que gané', 'dinero que gane', 'total ingresos'],
            'balance': ['balance', 'saldo', 'cuanto tengo', 'resumen', 'estado financiero', 'situación financiera', 'cuanto me queda'],
            'conversacional': ['como estas', 'que tal', 'como te va', 'como andas', 'todo bien'],
            'test': ['test', 'prueba', 'conexion', 'funciona'],
            'ayuda': ['ayuda', 'help', 'qué puedes hacer', 'que puedes hacer', 'comandos', 'opciones'],
            'saludo': ['hola', 'hi', 'hello', 'hey', 'buenas', 'buenos dias', 'buenas tardes']
        };
        
        console.log('🤖 IA Chat Assistant inicializado - Gemini Quispe');
    }

    // 🔑 Helper para obtener el user_id del localStorage
    getUserId() {
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            console.log('🔍 Debug - currentUser from localStorage:', currentUser);
            return currentUser.id || null;
        } catch (error) {
            console.error('Error obteniendo user_id:', error);
            return null;
        }
    }

    // 🔐 Helper para obtener el token JWT de Supabase
    getSupabaseToken() {
        const token = localStorage.getItem('supabase_access_token');
        console.log('🔍 Debug - supabase_access_token disponible:', !!token);
        return token;
    }

    // 🌐 Configuración de Supabase (igual que en el sistema)
    getSupabaseConfig() {
        return {
            url: 'https://lobyofpwqwqsszugdwnw.supabase.co',
            anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTU4NDIsImV4cCI6MjA3Mjg5MTg0Mn0.QsZ2dIU1iPffRGtHUREQIhQ5--7_w4ANowG0rJ0AtcI'
        };
    }

    // 🌐 Consultar gastos directamente desde Supabase con JWT
    async queryGastosFromSupabase(userId) {
        const config = this.getSupabaseConfig();
        const token = this.getSupabaseToken();
        
        if (!token) {
            throw new Error('No hay token JWT de Supabase');
        }

        const response = await fetch(`${config.url}/rest/v1/gastos?usuario_id=eq.${userId}&select=*&order=fecha.desc,created_at.desc`, {
            method: 'GET',
            headers: {
                'apikey': config.anonKey,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error Supabase: ${response.status}`);
        }

        return await response.json();
    }

    // 🌐 Consultar ingresos directamente desde Supabase con JWT
    async queryIngresosFromSupabase(userId) {
        const config = this.getSupabaseConfig();
        const token = this.getSupabaseToken();
        
        if (!token) {
            throw new Error('No hay token JWT de Supabase');
        }

        const response = await fetch(`${config.url}/rest/v1/ingresos?usuario_id=eq.${userId}&select=*&order=fecha.desc,created_at.desc`, {
            method: 'GET',
            headers: {
                'apikey': config.anonKey,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error Supabase: ${response.status}`);
        }

        return await response.json();
    }

    // 🧪 Función de test usando conexión directa a Supabase
    async testConnection() {
        console.log('🧪 Test - User ID:', this.getUserId());
        console.log('🧪 Test - Supabase Token:', !!this.getSupabaseToken());
        
        const userId = this.getUserId();
        const token = this.getSupabaseToken();
        
        if (!userId) return "❌ Sin user_id";
        if (!token) return "❌ Sin token JWT de Supabase";
        
        try {
            const gastosData = await this.queryGastosFromSupabase(userId);
            const ingresosData = await this.queryIngresosFromSupabase(userId);
            
            console.log('🧪 Test - Gastos obtenidos:', gastosData.length);
            console.log('🧪 Test - Ingresos obtenidos:', ingresosData.length);
            
            return `✅ Conexión directa OK!\n📊 Gastos: ${gastosData.length}\n💰 Ingresos: ${ingresosData.length}`;
        } catch (error) {
            console.error('🧪 Test - Error:', error);
            return `❌ Error: ${error.message}`;
        }
    }

    init() {
        this.createChatUI();
        this.bindEvents();
        
        // Verificar conexión directa a Supabase
        this.checkSupabaseConnection();
    }

    checkSupabaseConnection() {
        const config = this.getSupabaseConfig();
        const userId = this.getUserId();
        const token = this.getSupabaseToken();
        
        console.log('🔍 Verificando conexión directa a Supabase:');
        console.log('   URL:', config.url ? 'OK' : 'FALTA');
        console.log('   User ID:', userId ? 'OK' : 'FALTA');
        console.log('   JWT Token:', token ? 'OK' : 'FALTA');
        
        if (config.url && userId && token) {
            console.log('✅ Chat IA conectado directamente a Supabase');
        } else {
            console.warn('⚠️ Faltan credenciales para Supabase');
        }
    }

    createChatUI() {
        // Botón flotante
        const button = document.createElement('div');
        button.id = 'ai-chat-button';
        button.className = 'fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg cursor-pointer transition-all duration-300';
        button.innerHTML = `
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"></path>
            </svg>
        `;

        // Ventana de chat
        const window = document.createElement('div');
        window.id = 'ai-chat-window';
        window.className = 'fixed bottom-24 right-6 z-50 bg-white rounded-lg shadow-2xl border border-gray-200 w-80 h-96 hidden flex-col';
        window.innerHTML = `
            <div class="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
                <div class="flex items-center space-x-2">
                    <span class="text-lg">🤖</span>
                    <span class="font-semibold">Asistente IA</span>
                </div>
                <button id="ai-chat-close" class="text-white hover:text-gray-200">×</button>
            </div>
            
            <div id="ai-chat-messages" class="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
                <div class="text-sm text-gray-600 text-center">
                    🤖 ¡Hola! Pregúntame sobre tus gastos reales. Ej: "¿cuánto gasté ayer?"
                </div>
            </div>
            
            <div class="border-t border-gray-200 p-4">
                <div class="flex space-x-2">
                    <input type="text" id="ai-chat-input" 
                           class="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" 
                           placeholder="Ej: ¿Cuánto gasté ayer?">
                    <button id="ai-chat-send" 
                            class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium">
                        Enviar
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(button);
        document.body.appendChild(window);
    }

    bindEvents() {
        document.getElementById('ai-chat-button')?.addEventListener('click', () => this.toggleChat());
        document.getElementById('ai-chat-close')?.addEventListener('click', () => this.closeChat());
        document.getElementById('ai-chat-send')?.addEventListener('click', () => this.sendMessage());
        document.getElementById('ai-chat-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }

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

    closeChat() {
        this.isOpen = false;
        const chatWindow = document.getElementById('ai-chat-window');
        chatWindow.classList.add('hidden');
        chatWindow.classList.remove('flex');
    }

    async sendMessage() {
        const input = document.getElementById('ai-chat-input');
        const message = input.value.trim();
        
        if (!message) return;

        this.addMessage(message, 'user');
        input.value = '';

        this.showTyping();

        try {
            const response = await this.processMessage(message);
            this.hideTyping();
            this.addMessage(response, 'assistant');
        } catch (error) {
            this.hideTyping();
            this.addMessage('Error procesando tu consulta. ¿Podrías intentar de nuevo?', 'assistant');
            console.error('Error en Chat Assistant:', error);
        }
    }

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
                <div class="bg-white border border-gray-200 rounded-lg px-3 py-2 max-w-xs text-sm whitespace-pre-line">
                    ${text}
                </div>
            `;
        }

        messagesArea.appendChild(messageDiv);
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }

    showTyping() {
        const messagesArea = document.getElementById('ai-chat-messages');
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.className = 'flex justify-start';
        typingDiv.innerHTML = `
            <div class="bg-gray-100 rounded-lg px-3 py-2 text-sm">
                🤖 Analizando tus datos...
            </div>
        `;
        messagesArea.appendChild(typingDiv);
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }

    hideTyping() {
        const typingDiv = document.getElementById('typing-indicator');
        if (typingDiv) typingDiv.remove();
    }

    async processMessage(message) {
        const intent = this.detectIntent(message);
        console.log(`🤖 Intent: ${intent} - Mensaje: "${message}"`);

        switch (intent) {
            case 'gastos_ayer':
                return await this.getGastosYesterday();
            case 'gastos_hoy':
                return await this.getGastosToday();
            case 'gastos_mes':
                return await this.getGastosMonth();
            case 'gastos_total':
                return await this.getGastosTotal();
            case 'ingresos':
                return await this.getIngresos();
            case 'balance':
                return await this.getBalance();
            case 'conversacional':
                return this.getConversationalResponse(message);
            case 'test':
                return await this.testConnection();
            case 'ayuda':
                return this.getHelp();
            case 'saludo':
                return this.getGreeting();
            default:
                return this.getSmartResponse(message);
        }
    }

    detectIntent(message) {
        const lowerMessage = message.toLowerCase();
        
        for (let [intent, patterns] of Object.entries(this.intentPatterns)) {
            for (let pattern of patterns) {
                if (lowerMessage.includes(pattern)) {
                    return intent;
                }
            }
        }
        
        return 'unknown';
    }

    // 🔥 CONSULTAS REALES A SUPABASE

    async getGastosYesterday() {
        try {
            const userId = this.getUserId();
            console.log('🔍 Debug - userId obtenido:', userId);
            if (!userId) return "🔒 Necesitas estar logueado.";

            console.log('🔍 Debug - Consultando gastos de ayer con JWT para usuario:', userId);
            const gastosData = await this.queryGastosFromSupabase(userId);
            console.log('🔍 Debug - Datos recibidos desde Supabase:', gastosData.length);
            if (!gastosData || gastosData.length === 0) {
                return "📊 No tienes gastos registrados.";
            }

            // Filtrar gastos de ayer
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            const gastosYesterday = gastosData.filter(gasto => 
                gasto.fecha && gasto.fecha.startsWith(yesterdayStr)
            );

            if (gastosYesterday.length === 0) {
                return "📅 Ayer no registraste ningún gasto.";
            }

            const total = gastosYesterday.reduce((sum, gasto) => sum + (gasto.monto || 0), 0);
            const categorias = this.groupByCategory(gastosYesterday);

            let response = `📅 Ayer gastaste $${total.toFixed(2)}:\n\n`;
            for (let [categoria, gastos] of Object.entries(categorias)) {
                const totalCat = gastos.reduce((sum, g) => sum + g.monto, 0);
                response += `• ${categoria}: $${totalCat.toFixed(2)}\n`;
            }

            return response;

        } catch (error) {
            console.error('❌ Error consultando gastos de ayer:', error);
            return "⚠️ Hubo un problema consultando tus gastos de ayer. Verifica que estés conectado a internet y que tengas datos registrados.";
        }
    }

    async getGastosToday() {
        try {
            const userId = this.getUserId();
            if (!userId) return "🔒 Necesitas estar logueado.";

            const gastosData = await this.queryGastosFromSupabase(userId);
            if (!gastosData || gastosData.length === 0) {
                return "📊 No tienes gastos registrados.";
            }

            const today = new Date().toISOString().split('T')[0];
            const gastosToday = gastosData.filter(gasto => 
                gasto.fecha && gasto.fecha.startsWith(today)
            );

            if (gastosToday.length === 0) {
                return "📅 Hoy aún no has registrado gastos.";
            }

            const total = gastosToday.reduce((sum, gasto) => sum + (gasto.monto || 0), 0);
            const categorias = this.groupByCategory(gastosToday);

            let response = `📅 Hoy has gastado $${total.toFixed(2)}:\n\n`;
            for (let [categoria, gastos] of Object.entries(categorias)) {
                const totalCat = gastos.reduce((sum, g) => sum + g.monto, 0);
                response += `• ${categoria}: $${totalCat.toFixed(2)}\n`;
            }

            return response;

        } catch (error) {
            console.error('❌ Error consultando gastos de hoy:', error);
            return "⚠️ Hubo un problema consultando tus gastos de hoy. Verifica tu conexión.";
        }
    }

    async getGastosMonth() {
        try {
            const userId = this.getUserId();
            if (!userId) return "🔒 Necesitas estar logueado.";

            const gastosData = await this.queryGastosFromSupabase(userId);
            if (!gastosData || gastosData.length === 0) {
                return "📊 No tienes gastos registrados.";
            }

            const currentMonth = new Date().toISOString().slice(0, 7);
            const gastosMonth = gastosData.filter(gasto => 
                gasto.fecha && gasto.fecha.startsWith(currentMonth)
            );

            if (gastosMonth.length === 0) {
                return "📊 Este mes no tienes gastos registrados.";
            }

            const total = gastosMonth.reduce((sum, gasto) => sum + (gasto.monto || 0), 0);
            const categorias = this.groupByCategory(gastosMonth);

            let response = `📊 Este mes has gastado $${total.toFixed(2)}:\n\n`;
            
            const categoriasOrdenadas = Object.entries(categorias)
                .sort(([,a], [,b]) => {
                    const totalA = a.reduce((sum, g) => sum + g.monto, 0);
                    const totalB = b.reduce((sum, g) => sum + g.monto, 0);
                    return totalB - totalA;
                });

            for (let [categoria, gastos] of categoriasOrdenadas) {
                const totalCat = gastos.reduce((sum, g) => sum + g.monto, 0);
                const porcentaje = ((totalCat / total) * 100).toFixed(1);
                response += `• ${categoria}: $${totalCat.toFixed(2)} (${porcentaje}%)\n`;
            }

            return response;

        } catch (error) {
            console.error('Error:', error);
            return "Error consultando gastos del mes.";
        }
    }

    async getGastosTotal() {
        try {
            const userId = this.getUserId();
            if (!userId) return "🔒 Necesitas estar logueado.";

            const gastosData = await this.queryGastosFromSupabase(userId);
            if (!gastosData || gastosData.length === 0) {
                return "📊 No tienes gastos registrados.";
            }

            const total = gastosData.reduce((sum, gasto) => sum + (gasto.monto || 0), 0);
            const categorias = this.groupByCategory(gastosData);

            let response = `💰 Total gastado: $${total.toFixed(2)} en ${gastosData.length} gastos\n\n🏆 Top categorías:\n`;

            const topCategorias = Object.entries(categorias)
                .sort(([,a], [,b]) => {
                    const totalA = a.reduce((sum, g) => sum + g.monto, 0);
                    const totalB = b.reduce((sum, g) => sum + g.monto, 0);
                    return totalB - totalA;
                })
                .slice(0, 3);

            for (let [categoria, gastos] of topCategorias) {
                const totalCat = gastos.reduce((sum, g) => sum + g.monto, 0);
                response += `• ${categoria}: $${totalCat.toFixed(2)}\n`;
            }

            return response;

        } catch (error) {
            console.error('Error:', error);
            return "Error consultando gastos totales.";
        }
    }

    async getIngresos() {
        try {
            const userId = this.getUserId();
            if (!userId) return "🔒 Necesitas estar logueado.";

            const ingresosData = await this.queryIngresosFromSupabase(userId);
            if (!ingresosData || ingresosData.length === 0) {
                return "💰 No tienes ingresos registrados.";
            }

            const total = ingresosData.reduce((sum, ingreso) => sum + (ingreso.monto || 0), 0);
            return `💰 Ingresos totales: $${total.toFixed(2)} en ${ingresosData.length} registros`;

        } catch (error) {
            console.error('Error:', error);
            return "Error consultando ingresos.";
        }
    }

    async getBalance() {
        try {
            const userId = this.getUserId();
            if (!userId) return "🔒 Necesitas estar logueado.";

            const [gastosData, ingresosData] = await Promise.all([
                this.queryGastosFromSupabase(userId),
                this.queryIngresosFromSupabase(userId)
            ]);

            const totalGastos = gastosData?.reduce((sum, gasto) => sum + (gasto.monto || 0), 0) || 0;
            const totalIngresos = ingresosData?.reduce((sum, ingreso) => sum + (ingreso.monto || 0), 0) || 0;
            const balance = totalIngresos - totalGastos;

            let response = `⚖️ Tu balance:\n\n`;
            response += `💰 Ingresos: $${totalIngresos.toFixed(2)}\n`;
            response += `💸 Gastos: $${totalGastos.toFixed(2)}\n`;
            response += `📊 Balance: $${balance.toFixed(2)}\n\n`;

            if (balance > 0) {
                response += `✅ ¡Genial! Estás ahorrando`;
            } else if (balance < 0) {
                response += `⚠️ Gastas más de lo que ingresas`;
            } else {
                response += `⚖️ Estás equilibrado`;
            }

            return response;

        } catch (error) {
            console.error('Error:', error);
            return "Error calculando balance.";
        }
    }

    getHelp() {
        return `🤖 Puedo ayudarte con tus datos reales:\n\n📊 "¿Cuánto gasté ayer?" - Gastos de ayer\n📅 "¿Cuánto gasté hoy?" - Gastos de hoy\n📊 "¿Cuánto gasté este mes?" - Gastos mensuales\n💰 "¿Cuáles son mis ingresos?" - Ingresos totales\n⚖️ "¿Cuál es mi balance?" - Estado financiero\n\n🧪 "test" - Verificar conexión\n\n¡Pregúntame sobre tus datos!`;
    }

    getGreeting() {
        const greetings = [
            "¡Hola! 👋 Pregúntame sobre tus gastos reales.",
            "¡Hey! 🤖 ¿Quieres revisar tus finanzas?",
            "¡Buenas! 😊 Estoy conectado a tus datos."
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }

    getConversationalResponse(message) {
        const responses = [
            "¡Todo bien por aquí! 😊 Soy tu asistente financiero. ¿Te ayudo con algo de tus finanzas?",
            "¡Excelente! 🤖 Estoy listo para ayudarte con tus gastos e ingresos. ¿Qué quieres saber?",
            "¡Perfecto! 💰 ¿Quieres que revisemos tus datos financieros?"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    getSmartResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Intentar detectar variaciones de consultas comunes
        if (lowerMessage.includes('cuanto') && (lowerMessage.includes('gaste') || lowerMessage.includes('gasté'))) {
            return "📊 Entiendo que quieres saber sobre tus gastos. Prueba con:\n• '¿cuánto gasté ayer?'\n• '¿cuánto gasté hoy?'\n• '¿cuánto gasté este mes?'";
        }
        
        if (lowerMessage.includes('cuanto') && (lowerMessage.includes('gane') || lowerMessage.includes('gané') || lowerMessage.includes('ingreso'))) {
            return "💰 Veo que preguntas sobre ingresos. Prueba con:\n• '¿cuáles son mis ingresos?'\n• '¿cuánto gané?'";
        }
        
        if (lowerMessage.includes('dinero') || lowerMessage.includes('plata') || lowerMessage.includes('finanzas')) {
            return "💸 Para consultas financieras puedes preguntar:\n• Gastos: '¿cuánto gasté ayer?'\n• Ingresos: '¿cuáles son mis ingresos?'\n• Balance: '¿cuál es mi balance?'";
        }
        
        return "🤔 No estoy seguro de entender. Puedo ayudarte con:\n• 📊 Consultar gastos\n• 💰 Ver ingresos\n• ⚖️ Calcular balance\n\nEscribe 'ayuda' para más opciones.";
    }

    groupByCategory(items) {
        return items.reduce((groups, item) => {
            const categoria = item.categoria || 'Sin categoría';
            if (!groups[categoria]) groups[categoria] = [];
            groups[categoria].push(item);
            return groups;
        }, {});
    }
}

// Instancia global
window.aiChatAssistant = new IAChatAssistant();

// Auto-inicializar con más tiempo para que otros scripts carguen
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.aiChatAssistant) {
            window.aiChatAssistant.init();
            console.log('🚀 IA Chat Assistant con datos reales cargado');
        }
    }, 3000); // Aumenté a 3 segundos
});