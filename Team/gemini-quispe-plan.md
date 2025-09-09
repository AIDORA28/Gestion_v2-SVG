# 🤖 Plan de Acción de IA - Gemini Quispe

**📅 Fecha**: 9 de Septiembre de 2025

Este documento detalla mi plan de acción para implementar las funcionalidades de Inteligencia Artificial en **PLANIFICAPRO**.

---

## 1. Análisis de la Base de Datos

He analizado el archivo `supabase-setup.sql` y el `api-service.js` para entender la estructura de datos actual.

### Tablas Relevantes para la IA:
- **`gastos`**: Es la fuente principal de datos. Las columnas clave son `descripcion` y `categoria`.
- **`ingresos`**: Similar a gastos, útil para análisis de flujo de efectivo.
- **`usuarios`**: Para asociar los datos y modelos a cada usuario.

### Observaciones Clave:
- La columna `categoria` en la tabla `gastos` es un `VARCHAR(100)`. Esto es flexible y nos permite asignar categorías dinámicamente.
- La `descripcion` del gasto es el input principal que usaremos para predecir la categoría.

---

## 2. Plan para "Smart Categorization" (Categorización Inteligente)

Esta es la **prioridad #1**. El objetivo es sugerir automáticamente una categoría cuando un usuario introduce la descripción de un nuevo gasto.

### Fases del Proyecto:

#### Fase 1: Recolección y Preparación de Datos (Dependencia: CRUD de Gastos funcional)
1.  **Consumir Datos**: Utilizaré la función `apiService.getGastos(userId)` para obtener el historial de gastos del usuario.
2.  **Pre-procesamiento de Texto**: Limpiaré y normalizaré el texto de la columna `descripcion` (convertir a minúsculas, eliminar caracteres especiales, etc.).
3.  **Vectorización**: Convertiré las descripciones de texto en vectores numéricos que un modelo de Machine Learning pueda entender (usando técnicas como TF-IDF).

#### Fase 2: Desarrollo del Modelo de Clasificación
1.  **Entrenamiento del Modelo**: Entrenaré un modelo de clasificación simple (como Naive Bayes o una Regresión Logística) usando los datos históricos del propio usuario. El modelo aprenderá a asociar palabras en la `descripcion` con una `categoria`.
2.  **Modelo Personalizado**: Cada usuario tendrá su propio modelo entrenado con sus propios datos. Esto asegura la privacidad y la personalización. Si un usuario es nuevo, usaremos un modelo general pre-entrenado con categorías comunes.
3.  **Predicción**: Crearé una función `predictCategory(description)` que tome la descripción de un nuevo gasto y devuelva la categoría más probable.

#### Fase 3: Integración con el Frontend (Colaboración con Claude)
1.  **Sugerencia en la UI**: Cuando un usuario escriba en el campo de descripción del formulario de gastos, llamaremos a la función `predictCategory()`.
2.  **Autocompletar**: La categoría sugerida aparecerá en el campo `categoria`, pero el usuario siempre tendrá la opción de cambiarla. Esto mejora la experiencia sin quitarle el control.

---

## 3. Plan para "IA Chat Assistant"

Esta es la **prioridad #2**. Será un chatbot para responder preguntas financieras básicas del usuario.

### Fases del Proyecto:

#### Fase 1: Diseño de la Interfaz
1.  **Botón Flotante**: Un botón circular en la esquina inferior derecha del dashboard.
2.  **Ventana de Chat**: Al hacer clic, se abrirá una ventana de chat simple.

#### Fase 2: Lógica del Chatbot
1.  **Procesamiento de Lenguaje Natural (NLP)**: El chatbot entenderá preguntas como:
    - "¿Cuánto gasté en 'comida' este mes?"
    - "¿Cuál fue mi mayor ingreso?"
    - "Muéstrame mis últimos 5 gastos."
2.  **Intenciones y Entidades**: Identificará la *intención* del usuario (ej. "consultar gasto") y las *entidades* (ej. "comida", "este mes").
3.  **Integración con `api-service.js`**: Basado en la intención, el chatbot llamará a las funciones correspondientes del `apiService` (ej. `getGastos` con filtros) para obtener la respuesta.
4.  **Generación de Respuesta**: Formateará los datos obtenidos en una respuesta amigable para el usuario.

---

## 4. Requisitos y Dependencias

### Para "Smart Categorization":
- **Claude**: Necesito que el CRUD del módulo de **Gastos** esté completamente funcional y accesible a través de `api-service.js`.
- **Claude**: La función `apiService.getGastos(userId)` debe devolver todos los gastos históricos de un usuario para poder entrenar el modelo.

### Para "IA Chat Assistant":
- **Claude**: Necesitaré acceso a todas las funciones `get` del `apiService` (`getIngresos`, `getGastos`, `getCreditos`, etc.) con sus filtros, para poder responder a las preguntas del usuario.

---

## 5. Cronograma Estimado

- **Semana 1 (9-13 Sep)**:
    - [x] Análisis y planificación (este documento).
    - [ ] Desarrollo del prototipo del modelo de "Smart Categorization" (en paralelo mientras Claude termina el CRUD).
- **Semana 2 (16-20 Sep)**:
    - [ ] Integración del modelo de "Smart Categorization" con el formulario de gastos.
    - [ ] Inicio del desarrollo del "IA Chat Assistant" (interfaz y lógica básica).
- **Semana 3 (23-27 Sep)**:
    - [ ] Finalización y pruebas del "IA Chat Assistant".
    - [ ] Refinamiento de los modelos de IA.

---

Este es mi plan inicial. Estoy listo para empezar con la Fase 1 de "Smart Categorization" tan pronto como los datos de gastos estén disponibles.

**Gemini Quispe**
*Especialista en IA*
