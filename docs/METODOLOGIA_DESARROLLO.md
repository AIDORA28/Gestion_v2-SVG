# 🎯 METODOLOGÍA DE DESARROLLO

## 📋 **Enfoque: Desarrollo Ágil Simplificado**

### **🚀 Principios Fundamentales**
1. **Iterativo e Incremental** - Entregas funcionales cada fase
2. **Prioridad al MVP** - Funcionalidad básica primero
3. **Feedback Continuo** - Validar cada componente
4. **Documentación Viva** - Mantener docs actualizados

## 🏗️ **Metodología de 3 Sprints**

### **📅 SPRINT 1: Foundation (Día 1)**
**⏱️ Duración: 4 horas**
**🎯 Objetivo: Base funcional completa**

#### **Sprint Planning (15 min)**
- [ ] Configurar Supabase
- [ ] Obtener credenciales
- [ ] Definir estructura de archivos

#### **Development (3h 15min)**
- [ ] **Backend Setup (1.5h)**
  - Crear proyecto Supabase
  - Configurar tablas básicas
  - Configurar RLS
  - Probar endpoints automáticos

- [ ] **Frontend Base (1.5h)**
  - Estructura HTML
  - Sistema de componentes
  - Autenticación básica
  - Navegación entre vistas

- [ ] **Integración (15min)**
  - Conectar frontend con Supabase
  - Probar login/register
  - Validar flujo básico

#### **Sprint Review (15min)**
- ✅ Usuario puede registrarse
- ✅ Usuario puede iniciar sesión
- ✅ Dashboard básico funcional

#### **Retrospective (15min)**
- ¿Qué funcionó bien?
- ¿Qué mejorar en Sprint 2?

---

### **📅 SPRINT 2: Core Features (Día 2)**
**⏱️ Duración: 4 horas**
**🎯 Objetivo: Gestión financiera completa**

#### **Sprint Planning (15 min)**
- [ ] Revisar pendientes Sprint 1
- [ ] Priorizar funcionalidades core
- [ ] Definir criterios de aceptación

#### **Development (3h 30min)**
- [ ] **CRUD Ingresos (1h)**
  - Formulario agregar ingresos
  - Lista de ingresos
  - Editar/eliminar ingresos
  - Categorías básicas

- [ ] **CRUD Gastos (1h)**
  - Formulario agregar gastos
  - Lista de gastos
  - Editar/eliminar gastos
  - Categorías básicas

- [ ] **Dashboard Resumen (1h)**
  - Balance actual
  - Totales mensuales
  - Transacciones recientes
  - Indicadores visuales

- [ ] **Simulador Crédito (30min)**
  - Formulario simulación
  - Cálculo automático
  - Tabla de amortización
  - Guardar simulaciones

#### **Sprint Review (15min)**
- ✅ CRUD completo funcional
- ✅ Dashboard con datos reales
- ✅ Simulador operativo

---

### **📅 SPRINT 3: Polish & Deploy (Día 3)**
**⏱️ Duración: 3 horas**
**🎯 Objetivo: Producto terminado y desplegado**

#### **Sprint Planning (15 min)**
- [ ] Lista de bugs pendientes
- [ ] Mejoras UX/UI identificadas
- [ ] Plan de despliegue

#### **Development (2h 15min)**
- [ ] **UI/UX Polish (1h)**
  - Responsive design
  - Animaciones CSS
  - Loading states
  - Error handling

- [ ] **Funcionalidades Extra (45min)**
  - Filtros y búsqueda
  - Exportar datos
  - Notificaciones
  - Validaciones avanzadas

- [ ] **Testing & Debug (30min)**
  - Probar todos los flujos
  - Fix bugs críticos
  - Validar en móvil

#### **Deployment (30min)**
- [ ] Deploy en Vercel/Netlify
- [ ] Configurar dominio
- [ ] Probar en producción
- [ ] Documentar credenciales

---

## 🛠️ **Herramientas de Desarrollo**

### **📝 Planificación**
- **Task Board**: Notion o GitHub Projects
- **Docs**: Markdown files en repo
- **Comunicación**: Comments en código

### **💻 Desarrollo**
- **Editor**: VS Code
- **Version Control**: Git + GitHub
- **Backend**: Supabase Dashboard
- **Frontend**: Live Server extension

### **🧪 Testing**
- **Manual**: Browser DevTools
- **Funcional**: User flows manuales
- **Responsive**: Chrome DevTools Mobile

### **🚀 Deploy**
- **Frontend**: Vercel (recomendado) o Netlify
- **Backend**: Supabase (automático)
- **Domain**: Gratis con Vercel

## 📊 **Definition of Done (DoD)**

### **🔵 Backend Feature**
- [ ] Tabla creada con RLS
- [ ] CRUD endpoints funcionando
- [ ] Políticas de seguridad aplicadas
- [ ] Validado con Postman/curl

### **🟢 Frontend Component**
- [ ] Interfaz responsive
- [ ] Estados de loading/error
- [ ] Validación de formularios
- [ ] Integración con backend

### **🟡 Full Feature**
- [ ] Backend + Frontend funcionando
- [ ] User flow completo
- [ ] Error handling apropiado
- [ ] Documentado en README

## 📈 **Métricas de Progreso**

### **⚡ Velocidad de Desarrollo**
- **Sprint 1**: 4 endpoints + Auth = **Baseline**
- **Sprint 2**: 8 endpoints + UI = **2x baseline**
- **Sprint 3**: Polish + Deploy = **Quality focus**

### **✅ Quality Gates**
- **Sprint 1**: Auth funcional al 100%
- **Sprint 2**: CRUD sin bugs críticos
- **Sprint 3**: App desplegada y accesible

### **🎯 Success Criteria**
- [ ] Usuario registra cuenta nueva
- [ ] Agrega ingresos y gastos
- [ ] Ve balance actualizado
- [ ] Simula un crédito
- [ ] App accesible online

## 🔄 **Daily Workflow**

### **🌅 Start of Day (10 min)**
1. Review yesterday's progress
2. Check current sprint goals
3. Update task board
4. Set today's priorities

### **💻 Development Session**
1. **Pomodoro 1 (25min)**: Code/implement
2. **Break (5min)**: Stretch, hydrate
3. **Pomodoro 2 (25min)**: Test/debug
4. **Break (5min)**: Quick review
5. **Pomodoro 3 (25min)**: Document/commit
6. **Long Break (15min)**: Evaluate progress

### **🌆 End of Day (10 min)**
1. Commit final changes
2. Update documentation
3. Plan tomorrow's tasks
4. Update task board

## 🎨 **Code Quality Standards**

### **📝 Naming Conventions**
```javascript
// Variables: camelCase
const userName = 'john';
const currentBalance = 1500;

// Functions: camelCase + verb
function calculateBalance() {}
function renderDashboard() {}

// Classes: PascalCase + noun
class DataManager {}
class ComponentRenderer {}

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRIES = 3;

// CSS Classes: kebab-case
.dashboard-header {}
.balance-card {}
```

### **🏗️ File Structure Rules**
```
✅ DO: Separate concerns
js/
├── app.js          # Main config only
├── auth.js         # Auth logic only
├── dashboard.js    # Dashboard logic only
└── utils.js        # Helper functions only

❌ DON'T: Mix concerns
js/
├── everything.js   # 1000+ lines, all mixed
```

### **💬 Comment Standards**
```javascript
// ✅ Good: Explain WHY, not WHAT
// Using exponential backoff to handle rate limits
const delay = Math.pow(2, retryCount) * 1000;

// ❌ Bad: Explaining obvious code
// Set delay to 2 to the power of retry count times 1000
const delay = Math.pow(2, retryCount) * 1000;
```

## 🚨 **Risk Management**

### **⚠️ Identified Risks**
1. **Supabase Free Tier Limits**
   - **Mitigation**: Monitor usage, plan upgrade
   - **Contingency**: Switch to PlanetScale

2. **Browser Compatibility**
   - **Mitigation**: Test on Chrome, Firefox, Safari
   - **Contingency**: Add polyfills

3. **Mobile Responsiveness**
   - **Mitigation**: Mobile-first CSS
   - **Contingency**: Simplified mobile UI

### **🔧 Contingency Plans**
- **Backend Issues**: Fallback to local JSON storage
- **Deploy Issues**: Use GitHub Pages as backup
- **Time Overrun**: MVP with basic CRUD only

## 📚 **Learning Resources**

### **🎓 Supabase**
- [Official Docs](https://supabase.com/docs)
- [JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

### **🎨 Frontend**
- [MDN CSS Grid](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)
- [Flexbox Guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
- [Modern JavaScript](https://javascript.info/)

### **🚀 Deployment**
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com/)

## 📋 **Sprint Templates**

### **Daily Standup Template**
```markdown
## Daily Standup - [Date]

### ✅ Yesterday I completed:
- [ ] Task 1
- [ ] Task 2

### 🎯 Today I will work on:
- [ ] Task 3
- [ ] Task 4

### 🚧 Blockers/Issues:
- Issue 1: Description and help needed
- Issue 2: Waiting for X

### 📊 Sprint Progress:
- [x] Goal 1 (100%)
- [ ] Goal 2 (60%)
- [ ] Goal 3 (0%)
```

### **Sprint Retrospective Template**
```markdown
## Sprint [N] Retrospective

### 😊 What went well:
- Point 1
- Point 2

### 😞 What could be improved:
- Point 1
- Point 2

### 💡 Action items for next sprint:
- [ ] Action 1
- [ ] Action 2

### 📈 Metrics:
- Features completed: X/Y
- Bugs found: X
- Time spent: X hours
```

---

**🎯 Siguiente:** Ver `CREDENCIALES.md`
