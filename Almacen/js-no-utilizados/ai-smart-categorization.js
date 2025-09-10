/*
🤖 SMART CATEGORIZATION - IA GEMINI QUISPE
Categorización inteligente de gastos basada en descripción
*/

class SmartCategorization {
    constructor() {
        this.categoryPatterns = {
            'alimentacion': [
                // Comida y bebida
                'restaurante', 'comida', 'almuerzo', 'desayuno', 'cena', 'café', 'pizza', 'hamburguesa',
                'supermercado', 'mercado', 'tienda', 'groceries', 'bebida', 'agua', 'refresco',
                'panadería', 'carnicería', 'verdulería', 'bar', 'pub', 'cocina', 'ingredientes',
                'mcdonalds', 'subway', 'kfc', 'dominos', 'uber eats', 'rappi', 'pedidos ya'
            ],
            'transporte': [
                // Movilidad
                'gasolina', 'combustible', 'uber', 'taxi', 'bus', 'metro', 'tren', 'avion', 'vuelo',
                'peaje', 'parking', 'estacionamiento', 'mantenimiento auto', 'reparación', 'llanta',
                'aceite', 'revision tecnica', 'seguro auto', 'cabify', 'beat', 'colectivo'
            ],
            'vivienda': [
                // Casa y hogar
                'alquiler', 'renta', 'hipoteca', 'condominio', 'administración', 'portería',
                'luz', 'agua', 'gas', 'internet', 'cable', 'telefono', 'limpieza', 'jardinería',
                'reparación casa', 'pintura', 'muebles', 'electrodomésticos', 'decoración'
            ],
            'salud': [
                // Médico y bienestar
                'doctor', 'médico', 'hospital', 'clínica', 'farmacia', 'medicina', 'pastillas',
                'consulta', 'examen', 'análisis', 'dentista', 'oftalmólogo', 'fisioterapia',
                'seguro médico', 'vacuna', 'emergencia', 'cirugía', 'tratamiento'
            ],
            'entretenimiento': [
                // Ocio y diversión
                'cine', 'teatro', 'concierto', 'netflix', 'spotify', 'juegos', 'streaming',
                'parque', 'diversión', 'fiesta', 'bar', 'discoteca', 'viaje', 'turismo',
                'hotel', 'vacation', 'regalo', 'cumpleaños', 'celebración', 'salida'
            ],
            'educacion': [
                // Formación y aprendizaje  
                'universidad', 'colegio', 'curso', 'capacitación', 'libro', 'material escolar',
                'matrícula', 'pensión', 'tutor', 'profesor', 'tesis', 'investigación',
                'conferencia', 'seminario', 'certificación', 'idiomas', 'biblioteca'
            ],
            'tecnologia': [
                // Tecnología y servicios digitales
                'celular', 'móvil', 'computadora', 'laptop', 'tablet', 'software', 'app',
                'suscripción', 'amazon prime', 'google', 'microsoft', 'apple', 'samsung',
                'reparación tech', 'soporte técnico', 'hosting', 'dominio', 'wifi'
            ],
            'ropa': [
                // Vestimenta y accesorios
                'ropa', 'camisa', 'pantalón', 'zapatos', 'vestido', 'abrigo', 'chaqueta',
                'tienda ropa', 'mall', 'centro comercial', 'zapatería', 'accesorios',
                'reloj', 'bolso', 'cartera', 'joyería', 'maquillaje', 'perfume'
            ],
            'servicios': [
                // Servicios profesionales
                'abogado', 'contador', 'notario', 'banco', 'comisión', 'transferencia',
                'peluquería', 'barbería', 'spa', 'masaje', 'limpieza', 'lavandería',
                'cerrajero', 'plomero', 'electricista', 'jardinero', 'pintor'
            ]
        };
        
        console.log('🤖 Smart Categorization inicializado - Gemini Quispe');
    }

    /**
     * Predice la categoría basada en la descripción del gasto
     * @param {string} descripcion - Descripción del gasto
     * @returns {string} - Categoría sugerida
     */
    predictCategory(descripcion) {
        if (!descripcion || descripcion.trim() === '') {
            return 'otros';
        }

        const texto = descripcion.toLowerCase().trim();
        let scores = {};
        
        // Inicializar scores
        for (let categoria of Object.keys(this.categoryPatterns)) {
            scores[categoria] = 0;
        }

        // Calcular scores por categoría
        for (let [categoria, keywords] of Object.entries(this.categoryPatterns)) {
            for (let keyword of keywords) {
                if (texto.includes(keyword.toLowerCase())) {
                    // Score base por match exacto
                    scores[categoria] += 1;
                    
                    // Score extra si el keyword está al principio o es palabra completa
                    if (texto.startsWith(keyword.toLowerCase()) || 
                        texto.includes(` ${keyword.toLowerCase()} `) ||
                        texto.endsWith(` ${keyword.toLowerCase()}`)) {
                        scores[categoria] += 0.5;
                    }
                }
            }
        }

        // Encontrar la categoría con mayor score
        let maxScore = 0;
        let bestCategory = 'otros';
        
        for (let [categoria, score] of Object.entries(scores)) {
            if (score > maxScore) {
                maxScore = score;
                bestCategory = categoria;
            }
        }

        // Si no hay match suficiente, devolver 'otros'
        if (maxScore < 0.5) {
            bestCategory = 'otros';
        }

        console.log(`🤖 Categorización: "${descripcion}" → "${bestCategory}" (score: ${maxScore})`);
        return bestCategory;
    }

    /**
     * Obtiene una sugerencia con confianza
     * @param {string} descripcion - Descripción del gasto
     * @returns {Object} - {categoria, confidence, reason}
     */
    getSuggestionWithConfidence(descripcion) {
        const categoria = this.predictCategory(descripcion);
        
        // Calcular confianza basada en matches
        let matches = 0;
        let totalKeywords = 0;
        
        if (this.categoryPatterns[categoria]) {
            totalKeywords = this.categoryPatterns[categoria].length;
            const texto = descripcion.toLowerCase();
            
            for (let keyword of this.categoryPatterns[categoria]) {
                if (texto.includes(keyword.toLowerCase())) {
                    matches++;
                }
            }
        }
        
        const confidence = totalKeywords > 0 ? (matches / totalKeywords) * 100 : 0;
        const reason = matches > 0 ? `Detecté ${matches} palabra(s) relacionada(s) con ${categoria}` : 'Clasificación por defecto';
        
        return {
            categoria,
            confidence: Math.min(confidence * 10, 95), // Escalar y cap a 95%
            reason,
            matches
        };
    }

    /**
     * Aprende de una nueva categorización manual del usuario
     * @param {string} descripcion - Descripción del gasto
     * @param {string} categoria - Categoría elegida por el usuario
     */
    learnFromUser(descripcion, categoria) {
        // Extraer palabras clave de la descripción
        const palabras = descripcion.toLowerCase()
            .split(/\s+/)
            .filter(palabra => palabra.length > 3); // Solo palabras de más de 3 caracteres
        
        // Si la categoría existe, agregar las nuevas palabras
        if (this.categoryPatterns[categoria]) {
            for (let palabra of palabras) {
                if (!this.categoryPatterns[categoria].includes(palabra)) {
                    this.categoryPatterns[categoria].push(palabra);
                    console.log(`🧠 Aprendizaje: Agregué "${palabra}" a categoria "${categoria}"`);
                }
            }
        }
        
        // Guardar en localStorage para persistencia
        this.saveUserPatterns();
    }

    /**
     * Guarda patrones personalizados en localStorage
     */
    saveUserPatterns() {
        try {
            const userId = localStorage.getItem('user_id');
            if (userId) {
                const key = `ai_patterns_${userId}`;
                localStorage.setItem(key, JSON.stringify(this.categoryPatterns));
                console.log('🧠 Patrones de IA guardados para usuario:', userId);
            }
        } catch (error) {
            console.warn('⚠️ Error guardando patrones de IA:', error);
        }
    }

    /**
     * Carga patrones personalizados desde localStorage
     */
    loadUserPatterns() {
        try {
            const userId = localStorage.getItem('user_id');
            if (userId) {
                const key = `ai_patterns_${userId}`;
                const saved = localStorage.getItem(key);
                if (saved) {
                    const userPatterns = JSON.parse(saved);
                    // Combinar con patrones base
                    for (let [categoria, keywords] of Object.entries(userPatterns)) {
                        if (this.categoryPatterns[categoria]) {
                            // Merge keeping unique values
                            this.categoryPatterns[categoria] = [...new Set([
                                ...this.categoryPatterns[categoria],
                                ...keywords
                            ])];
                        }
                    }
                    console.log('🧠 Patrones de IA cargados para usuario:', userId);
                }
            }
        } catch (error) {
            console.warn('⚠️ Error cargando patrones de IA:', error);
        }
    }

    /**
     * Inicializa el modelo para un usuario específico
     */
    initForUser() {
        this.loadUserPatterns();
        console.log('🤖 Smart Categorization listo para usuario');
    }
}

// Instancia global
window.smartCategorization = new SmartCategorization();

// Auto-inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    if (window.smartCategorization) {
        window.smartCategorization.initForUser();
    }
});