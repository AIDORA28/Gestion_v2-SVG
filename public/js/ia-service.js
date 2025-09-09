// ================================================
// 🧠 IA SERVICE - Gemini Quispe
// Servicio de Inteligencia Artificial para PLANIFICAPRO
// ================================================

class SmartCategorizer {
    constructor() {
        // Vocabulario base para dar al modelo un conocimiento inicial
        this.baseVocabulary = {
            'Alimentación': ['restaurante', 'comida', 'supermercado', 'mercado', 'café', 'pollo', 'carne', 'frutas', 'verduras', 'panadería', 'almuerzo', 'cena', 'desayuno'],
            'Servicios': ['factura', 'recibo', 'luz', 'agua', 'internet', 'cable', 'celular', 'plan', 'suscripción', 'teléfono', 'gas'],
            'Ocio': ['cine', 'entradas', 'concierto', 'netflix', 'spotify', 'juegos', 'bar', 'hobby', 'libro'],
            'Transporte': ['gasolina', 'combustible', 'metro', 'bus', 'taxi', 'uber', 'coche', 'auto', 'mantenimiento', 'reparación', 'ticket', 'peaje'],
            'Vivienda': ['arriendo', 'alquiler', 'hipoteca', 'mantenimiento', 'reparación', 'comunidad'],
            'Salud': ['farmacia', 'médico', 'consulta', 'medicamentos', 'seguro'],
            'Educación': ['curso', 'libros', 'matrícula', 'universidad', 'colegio'],
            'Ropa': ['zapatos', 'camisa', 'pantalón', 'vestido', 'tienda'],
            'Otros': ['regalo', 'donación', 'impuestos']
        };

        // Lematización simple para agrupar palabras similares
        this.lemmaMap = {
            'coche': 'auto',
            'carro': 'auto',
            'reparación': 'mantenimiento',
            'factura': 'recibo',
            'cafetería': 'café',
            'cel': 'celular'
        };

        this.categoryKeywords = {};
        this.categoryCounts = {};
        this.isTrained = false;
        this.stopWords = new Set(['de', 'la', 'el', 'en', 'y', 'a', 'los', 'las', 'un', 'una', 'con', 'para', 'mi', 'su', 'este', 'esta']);
        
        this._initializeVocabulary();
        console.log('🧠 IA Service (SmartCategorizer) inicializado.');
    }

    _initializeVocabulary() {
        this.categoryKeywords = JSON.parse(JSON.stringify(this.baseVocabulary));
        for (const category in this.categoryKeywords) {
            const keywords = {};
            this.categoryKeywords[category].forEach(k => keywords[k] = 1);
            this.categoryKeywords[category] = keywords;
            this.categoryCounts[category] = 1;
        }
    }

    _tokenize(description) {
        if (!description) return [];
        return description
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .map(word => this.lemmaMap[word] || word)
            .filter(word => word.length > 2 && !this.stopWords.has(word));
    }

    /**
     * Entrena el modelo con los gastos históricos del usuario.
     * @param {object[]} expenses - Array de objetos de gastos desde la API.
     */
    async trainWithUserExpenses(userId) {
        console.log(`📚 Entrenando modelo para el usuario: ${userId}`);
        try {
            const apiService = window.getAPIService();
            if (!apiService) {
                console.error('Error: APIService no está disponible.');
                return;
            }

            const { success, data: expenses, error } = await apiService.getGastos(userId);

            if (!success) {
                console.error('Error al obtener los gastos para el entrenamiento:', error);
                return;
            }

            if (expenses.length === 0) {
                console.warn('⚠️ No hay gastos históricos para entrenar. Usando solo vocabulario base.');
                this.isTrained = true;
                return;
            }

            expenses.forEach(expense => {
                const { descripcion, categoria } = expense;
                if (!descripcion || !categoria) return;

                if (!this.categoryKeywords[categoria]) {
                    this.categoryKeywords[categoria] = {};
                    this.categoryCounts[categoria] = 0;
                }

                this.categoryCounts[categoria]++;
                const tokens = this._tokenize(descripcion);

                tokens.forEach(token => {
                    if (!this.categoryKeywords[categoria][token]) {
                        this.categoryKeywords[categoria][token] = 0;
                    }
                    this.categoryKeywords[categoria][token]++;
                });
            });

            this.isTrained = true;
            console.log(`✅ Entrenamiento completado con ${expenses.length} registros. Modelo listo para predecir.`);

        } catch (e) {
            console.error('Ocurrió un error durante el entrenamiento:', e);
        }
    }

    /**
     * Predice la categoría de una nueva descripción de gasto.
     * @param {string} description - La descripción del nuevo gasto.
     * @returns {string|null} - La categoría predicha o null.
     */
    predict(description) {
        if (!this.isTrained) {
            console.warn('El modelo no ha sido entrenado todavía. La predicción puede no ser precisa.');
        }
        if (!description) return null;

        const tokens = this._tokenize(description);
        let bestCategory = null;
        let maxScore = -1;

        if (tokens.length === 0) return null;

        for (const category in this.categoryKeywords) {
            let score = 0;
            tokens.forEach(token => {
                if (this.categoryKeywords[category][token]) {
                    score += this.categoryKeywords[category][token];
                }
            });

            const normalizedScore = score / (Object.keys(this.categoryKeywords[category]).length || 1);

            if (normalizedScore > maxScore) {
                maxScore = normalizedScore;
                bestCategory = category;
            }
        }

        if (maxScore > 0) {
            console.log(`🔮 Predicción para "${description}": ${bestCategory} (Puntuación: ${maxScore.toFixed(2)})`);
            return bestCategory;
        }
        
        return null;
    }
}

// ================================
// 🚀 INSTANCIA GLOBAL
// ================================
window.iaService = null;

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.getAPIService) {
            window.iaService = new SmartCategorizer();
            console.log('✅ IA Service global creado.');
            // Podríamos iniciar el entrenamiento aquí si el usuario ya está logueado
            // const currentUser = window.getAPIService().getCurrentUser();
            // if (currentUser) {
            //     window.iaService.trainWithUserExpenses(currentUser.id);
            // }
        } else {
            console.warn('⚠️ APIService no está disponible. IA Service no se pudo crear.');
        }
    }, 200); // Esperar un poco más para asegurar que todo esté cargado
});

window.getIAService = function() {
    if (!window.iaService) {
        console.error('❌ No se puede obtener IA Service: no está inicializado.');
        return null;
    }
    return window.iaService;
};

console.log('📦 IA Service cargado - Smart Categorizer disponible.');
