# 🎯 GESTIÓN FINANCIERA PERSONAL v2

## 📋 **Descripción del Proyecto**

Sistema de gestión financiera personal desarrollado con **Supabase + HTML/CSS/JavaScript** para simplificar el control de ingresos, gastos y simulación de créditos.

### **🚀 Características Principales**
- ✅ **Autenticación segura** con Supabase Auth
- ✅ **Gestión de ingresos y gastos** con categorización
- ✅ **Dashboard en tiempo real** con balance actualizado
- ✅ **Simulador de crédito** con tabla de amortización
- ✅ **Diseño responsive** para móvil y desktop
- ✅ **PWA ready** para instalación como app nativa

## 🏗️ **Arquitectura del Proyecto**

### **Stack Tecnológico**
```
Frontend: HTML5 + CSS3 + Vanilla JavaScript
Backend:  Supabase (PostgreSQL + API REST + Auth)
Deploy:   Vercel + Supabase Platform
```

### **Estructura del Proyecto**
```
Gestion_v2-SVG/
├── 📄 README.md                          # Este archivo
├── 📋 DESARROLLO_ORDEN_BACKEND.md        # Guía desarrollo backend
├── 🎨 DESARROLLO_ORDEN_FRONTEND.md       # Guía desarrollo frontend  
├── 🎯 METODOLOGIA_DESARROLLO.md          # Metodología ágil
├── 🔐 CREDENCIALES.md                    # Configuración y credenciales
├── 🏛️ ARQUITECTURA.md                   # Documentación arquitectura
├── 📁 frontend/                          # [Por crear]
│   ├── index.html
│   ├── dashboard.html
│   ├── css/
│   ├── js/
│   └── assets/
└── 📁 database/                          # [Por crear]
    ├── schema.sql
    ├── policies.sql
    └── functions.sql
```

## 🚀 **Quick Start**

### **📋 Pre-requisitos**
- [ ] Cuenta en [Supabase](https://supabase.com)
- [ ] Cuenta en [Vercel](https://vercel.com) (opcional)
- [ ] Editor de código (VS Code recomendado)
- [ ] Navegador moderno (Chrome, Firefox, Safari)

### **⚡ Setup Rápido (15 minutos)**

#### **1. Backend Setup (Supabase)**
```bash
# 1. Ir a supabase.com y crear nuevo proyecto
# 2. Obtener URL y API Key del proyecto
# 3. Ejecutar el SQL del archivo database/schema.sql
# 4. Configurar políticas RLS desde database/policies.sql
```

#### **2. Frontend Setup (Local)**
```bash
# Clonar/crear estructura
mkdir gestion-financiera-v2
cd gestion-financiera-v2

# Copiar archivos frontend desde este proyecto
# Configurar variables en js/config.js:
const SUPABASE_URL = 'https://tu-proyecto.supabase.co'
const SUPABASE_ANON_KEY = 'tu-api-key'

# Abrir con Live Server o similar
# Ir a http://localhost:3000
```

#### **3. Deploy (Opcional)**
```bash
# Vercel
npm i -g vercel
vercel

# Netlify
npm i -g netlify-cli
netlify deploy
```

## 📊 **Funcionalidades**

### **🔐 Autenticación**
- [x] Registro de usuarios con email/contraseña
- [x] Login seguro con JWT tokens
- [x] Recuperación de contraseña
- [x] Perfiles de usuario personalizados

### **💰 Gestión Financiera**
- [x] **Ingresos**: Agregar, editar, eliminar, categorizar
- [x] **Gastos**: Agregar, editar, eliminar, categorizar  
- [x] **Balance**: Cálculo automático en tiempo real
- [x] **Categorías**: Predefinidas y personalizables
- [x] **Filtros**: Por fecha, categoría, monto

### **📈 Dashboard & Reportes**
- [x] Resumen financiero mensual
- [x] Gráficos de ingresos vs gastos
- [x] Transacciones recientes
- [x] Indicadores de tendencias
- [x] Exportación de datos

### **🏦 Simulador de Crédito**
- [x] Cálculo de cuotas mensuales
- [x] Tabla de amortización completa
- [x] Diferentes tipos de interés
- [x] Guardar simulaciones
- [x] Comparar opciones

## 🎯 **Plan de Desarrollo**

### **📅 Cronograma (3 días)**
```
DÍA 1 (4h): Foundation
├── Backend: Supabase setup + Database
├── Frontend: Auth + Navigation
└── ✅ MVP: Login funcional

DÍA 2 (4h): Core Features  
├── CRUD: Ingresos & Gastos
├── Dashboard: Balance & Resumen
└── ✅ App: Gestión financiera completa

DÍA 3 (3h): Polish & Deploy
├── UI/UX: Responsive + Animations
├── Testing: Bugs + Validation
└── ✅ Production: App desplegada
```

### **🔄 Metodología**
- **Sprints de 1 día** con objetivos claros
- **MVP-first** approach para entregas rápidas
- **Testing continuo** en cada funcionalidad
- **Deploy early** para feedback temprano

## 🛠️ **Tecnologías Utilizadas**

### **Frontend**
- **HTML5**: Estructura semántica y accesible
- **CSS3**: Flexbox, Grid, Variables CSS, Animations
- **JavaScript ES6+**: Async/await, Modules, Classes
- **PWA**: Service Workers, Web App Manifest

### **Backend (Supabase)**
- **PostgreSQL**: Base de datos relacional
- **Row Level Security**: Seguridad a nivel de fila
- **API REST**: Endpoints automáticos
- **Auth**: JWT + OAuth providers
- **Realtime**: WebSockets para updates en vivo

### **Deployment**
- **Vercel**: Frontend hosting con CI/CD
- **Supabase**: Backend managed completamente
- **CDN**: Distribución global automática
- **SSL**: HTTPS automático

## 📚 **Documentación Detallada**

### **📖 Guías de Desarrollo**
1. **[DESARROLLO_ORDEN_BACKEND.md](DESARROLLO_ORDEN_BACKEND.md)** - Setup completo del backend con Supabase
2. **[DESARROLLO_ORDEN_FRONTEND.md](DESARROLLO_ORDEN_FRONTEND.md)** - Desarrollo frontend paso a paso
3. **[METODOLOGIA_DESARROLLO.md](METODOLOGIA_DESARROLLO.md)** - Metodología ágil y mejores prácticas
4. **[CREDENCIALES.md](CREDENCIALES.md)** - Configuración, variables de entorno y credenciales
5. **[ARQUITECTURA.md](ARQUITECTURA.md)** - Arquitectura detallada del sistema

### **🎯 Orden de Lectura Recomendado**
```
1. README.md (este archivo)           ← Visión general
2. ARQUITECTURA.md                    ← Entender la arquitectura
3. DESARROLLO_ORDEN_BACKEND.md        ← Configurar backend
4. DESARROLLO_ORDEN_FRONTEND.md       ← Desarrollar frontend
5. METODOLOGIA_DESARROLLO.md          ← Metodología y workflow
6. CREDENCIALES.md                    ← Configuración final
```

## 🚨 **Importante: Diferencias con v1**

### **❌ Problemas de v1 (MongoDB + FastAPI)**
- 🔴 Configuración compleja de MongoDB Atlas
- 🔴 Problemas de conectividad SSL/TLS
- 🔴 Múltiples servicios para mantener
- 🔴 Costos de infraestructura
- 🔴 Debugging complejo en producción

### **✅ Ventajas de v2 (Supabase + HTML)**
- 🟢 **Setup en minutos**, no horas
- 🟢 **Una sola plataforma** para todo
- 🟢 **Free tier generoso** (50,000 usuarios)
- 🟢 **API automática** sin código backend
- 🟢 **Dashboard admin** incluido
- 🟢 **Autenticación completa** out-of-the-box
- 🟢 **Tiempo real** sin configuración
- 🟢 **Deploy automático** con git push

## 🎨 **UI/UX Preview**

### **🔐 Pantalla de Login**
```
┌─────────────────────────────────────┐
│            📱 Login                 │
├─────────────────────────────────────┤
│  Email: [________________]          │
│  Password: [________________]       │
│                                     │
│         [🔐 Iniciar Sesión]         │
│                                     │
│    ¿No tienes cuenta? Regístrate    │
└─────────────────────────────────────┘
```

### **📊 Dashboard Principal**
```
┌─────────────────────────────────────┐
│  Mi Dashboard Financiero    [Logout]│
├─────────────────────────────────────┤
│ [Resumen] [Ingresos] [Gastos] [Sim] │
├─────────────────────────────────────┤
│                                     │
│  💰 Balance Actual: $15,750         │
│  📈 Ingresos mes: $25,000           │
│  📉 Gastos mes: $9,250              │
│                                     │
│  📋 Transacciones Recientes:        │
│  • Salario Enero - $20,000          │
│  • Supermercado - $850              │
│  • Internet - $45                   │
│                                     │
└─────────────────────────────────────┘
```

## 🔧 **Comandos Útiles**

### **🚀 Desarrollo Local**
```bash
# Instalar Live Server (VS Code)
# Extensions → Live Server → Install

# Abrir proyecto
# Click derecho en index.html → "Open with Live Server"

# Alternativamente con Python
python -m http.server 8000

# O con Node.js
npx serve .
```

### **📦 Deploy con Vercel**
```bash
# Instalar CLI
npm i -g vercel

# Deploy
vercel

# Deploy con dominio custom
vercel --prod --name mi-app-financiera
```

### **🔍 Debug Supabase**
```javascript
// Ver logs en consola del browser
supabase.from('ingresos').select('*').then(console.log);

// Ver usuario actual  
supabase.auth.getUser().then(console.log);

// Ver estado de autenticación
console.log(supabase.auth.session());
```

## 🆘 **Troubleshooting**

### **❓ Problemas Comunes**

#### **🔴 "Cannot connect to Supabase"**
```javascript
// Verificar configuración
console.log('URL:', SUPABASE_URL);
console.log('Key:', SUPABASE_ANON_KEY.substring(0, 10) + '...');

// Probar conexión
supabase.from('usuarios').select('count').then(
    data => console.log('✅ Connected:', data),
    error => console.log('❌ Error:', error)
);
```

#### **🔴 "User not authenticated"**
```javascript
// Verificar sesión
const session = supabase.auth.session();
if (!session) {
    console.log('❌ No hay sesión activa');
    // Redirigir a login
} else {
    console.log('✅ Usuario:', session.user.email);
}
```

#### **🔴 "RLS policy violation"**
```sql
-- Verificar políticas en Supabase Dashboard
-- Authentication > Policies
-- Asegurar que existen políticas para todas las tablas
```

## � **Estado del Proyecto**

### **✅ MÓDULO 1 COMPLETADO: Configuración Supabase** 
- [x] **Documentación**: `SETUP_SUPABASE.md` - Guía paso a paso
- [x] **Credenciales**: `.env.example` - Template de configuración  
- [x] **Testing**: `test-modulo1.html` - Validación automática
- [x] **Automatización**: `setup-modulo1-simple.ps1` - Script de verificación
- [x] **Metodología**: Verificamos v1 antes de migrar ✅
- 🎯 **Resultado**: Base de Supabase lista para crear tablas

### **✅ MÓDULO 2 COMPLETADO: Base de Datos y Tablas**
- [x] **Documentación**: `MODULO2_BASE_DATOS.md` - Guía detallada
- [x] **Script SQL**: `database/modulo2-completo.sql` - Implementación completa
- [x] **Testing**: `test-modulo2.html` - Validación CRUD y RLS
- [x] **4 Tablas creadas**: perfiles_usuario, ingresos, gastos, simulaciones_credito
- [x] **Seguridad RLS**: Políticas activas en todas las tablas
- [x] **Índices**: 9 índices de performance configurados
- 🎯 **Resultado**: Base de datos robusta lista para funciones de negocio

### **🔄 SIGUIENTE: MÓDULO 3 BACKEND**
- [ ] **Funciones de Negocio** (45 min estimado)
  - Función calcular balance mensual
  - Función simulador de crédito  
  - Función resumen financiero
  - Triggers y validaciones

### **⏳ MÓDULOS PENDIENTES**
| Módulo | Descripción | Tiempo | Estado |
|--------|-------------|--------|--------|  
| **Backend 3** | Funciones de Negocio | 45 min | 🔄 Siguiente |
| **Backend 4** | Funciones de Negocio | 45 min | ⏳ Pendiente |
| **Backend 5** | Testing y Validación | 30 min | ⏳ Pendiente |
| **Backend 6** | Endpoints Automáticos | 15 min | ⏳ Pendiente |
| **Frontend 1-7** | Interfaz completa | 6 horas | ⏳ Pendiente |

### **🎯 Progreso Total: 2/13 módulos (15%)**
**⏱️ Tiempo invertido: 105 min / 11 horas totales**

---

## �📞 **Soporte y Comunidad**

### **🤝 Contribuir**
1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

### **🐛 Reportar Bugs**
- Usar GitHub Issues
- Incluir pasos para reproducir
- Especificar browser y versión
- Screenshots si es necesario

### **💬 Obtener Ayuda**
- **Discord Supabase**: [discord.supabase.com](https://discord.supabase.com)
- **Stack Overflow**: Tag `supabase`
- **GitHub Discussions**: Para preguntas generales

## 📄 **Licencia**

MIT License - Ver archivo `LICENSE` para detalles.

## 🙏 **Agradecimientos**

- **Supabase Team** por la increíble plataforma
- **Vercel** por el hosting gratuito
- **Comunidad Open Source** por las herramientas y recursos

---

**🎯 ¡Listo para empezar! Sigue la documentación en orden y tendrás tu app funcionando en menos de 4 horas.**

**📞 ¿Necesitas ayuda? Revisa los archivos de documentación detallada o contacta al equipo.**
