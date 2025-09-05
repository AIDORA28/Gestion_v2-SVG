# 🔐 CREDENCIALES Y CONFIGURACIÓN

## 🎯 **Información del Proyecto**
- **Nombre**: Gestión Financiera Personal v2
- **Versión**: 2.0.0
- **Tipo**: Aplicación Web (SPA)
- **Stack**: Supabase + HTML/CSS/JS
- **Fecha Inicio**: [Fecha actual]

## 📱 **Supabase Configuration**

### **🔧 Project Settings**
```
📌 IMPORTANTE: Completar después de crear el proyecto
```

**Proyecto Principal:**
```bash
PROJECT_NAME: gestion-financiera-v2
PROJECT_URL: https://[PROJECT_ID].supabase.co
PROJECT_ID: [Generar en Supabase]
```

**API Credentials:**
```javascript
// Variables de entorno (Frontend)
const SUPABASE_URL = 'https://[PROJECT_ID].supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIs...'  // Public anon key
```

**Database Connection:**
```
Database URL: postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres
Direct URL: postgresql://postgres.[PROJECT_ID]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### **🛡️ Security Settings**
```
RLS Enabled: ✅ Todas las tablas
Auth Providers: Email/Password
Email Templates: Confirmación + Reset
JWT Secret: [Automático]
```

## 🗄️ **Database Schema**

### **📋 Tablas Principales**
```sql
-- 1. usuarios (Automático con Auth)
id: UUID (Primary Key)
email: TEXT (Único)
created_at: TIMESTAMP

-- 2. perfiles_usuario (Personalizada)
CREATE TABLE perfiles_usuario (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    telefono TEXT,
    dni TEXT UNIQUE,
    edad INTEGER,
    ocupacion TEXT,
    estado_civil TEXT,
    dependientes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ingresos
CREATE TABLE ingresos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL,
    monto DECIMAL(12,2) NOT NULL,
    categoria TEXT NOT NULL DEFAULT 'otros',
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    es_recurrente BOOLEAN DEFAULT FALSE,
    frecuencia_dias INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. gastos
CREATE TABLE gastos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL,
    monto DECIMAL(12,2) NOT NULL,
    categoria TEXT NOT NULL DEFAULT 'otros',
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    es_recurrente BOOLEAN DEFAULT FALSE,
    frecuencia_dias INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. simulaciones_credito
CREATE TABLE simulaciones_credito (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre_simulacion TEXT NOT NULL,
    monto_prestamo DECIMAL(12,2) NOT NULL,
    tasa_interes DECIMAL(5,2) NOT NULL,
    plazo_meses INTEGER NOT NULL,
    cuota_mensual DECIMAL(12,2) NOT NULL,
    total_intereses DECIMAL(12,2) NOT NULL,
    total_pagar DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **🔒 Row Level Security (RLS) Policies**
```sql
-- Habilitar RLS
ALTER TABLE perfiles_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingresos ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulaciones_credito ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso (Solo el usuario propietario)
-- Perfiles
CREATE POLICY "perfil_usuario_policy" ON perfiles_usuario
    FOR ALL USING (auth.uid() = id);

-- Ingresos
CREATE POLICY "ingresos_policy" ON ingresos
    FOR ALL USING (auth.uid() = usuario_id);

-- Gastos  
CREATE POLICY "gastos_policy" ON gastos
    FOR ALL USING (auth.uid() = usuario_id);

-- Simulaciones
CREATE POLICY "simulaciones_policy" ON simulaciones_credito
    FOR ALL USING (auth.uid() = usuario_id);
```

## 🔗 **API Endpoints Automáticos**

### **🔐 Authentication**
```
Base URL: https://[PROJECT_ID].supabase.co/auth/v1

POST /signup
POST /token?grant_type=password  
POST /logout
POST /recover
POST /user (GET para obtener usuario actual)
```

### **📊 Data API (REST)**
```
Base URL: https://[PROJECT_ID].supabase.co/rest/v1

// Perfiles
GET    /perfiles_usuario?id=eq.[USER_ID]
POST   /perfiles_usuario
PATCH  /perfiles_usuario?id=eq.[USER_ID]

// Ingresos
GET    /ingresos?usuario_id=eq.[USER_ID]
POST   /ingresos
PATCH  /ingresos?id=eq.[RECORD_ID]&usuario_id=eq.[USER_ID]
DELETE /ingresos?id=eq.[RECORD_ID]&usuario_id=eq.[USER_ID]

// Gastos
GET    /gastos?usuario_id=eq.[USER_ID]
POST   /gastos
PATCH  /gastos?id=eq.[RECORD_ID]&usuario_id=eq.[USER_ID]
DELETE /gastos?id=eq.[RECORD_ID]&usuario_id=eq.[USER_ID]

// Simulaciones
GET    /simulaciones_credito?usuario_id=eq.[USER_ID]
POST   /simulaciones_credito
PATCH  /simulaciones_credito?id=eq.[RECORD_ID]&usuario_id=eq.[USER_ID]
DELETE /simulaciones_credito?id=eq.[RECORD_ID]&usuario_id=eq.[USER_ID]
```

### **📡 Realtime API**
```
Base URL: wss://[PROJECT_ID].supabase.co/realtime/v1

// Suscripciones automáticas disponibles:
- Cambios en ingresos del usuario
- Cambios en gastos del usuario  
- Nuevas simulaciones
```

## 🚀 **Deployment Configuration**

### **📦 Frontend Hosting**

#### **Vercel (Recomendado)**
```bash
# Instalación
npm i -g vercel

# Deploy
vercel

# Variables de entorno en Vercel Dashboard:
SUPABASE_URL=https://[PROJECT_ID].supabase.co
SUPABASE_ANON_KEY=[ANON_KEY]
```

#### **Netlify (Alternativa)**
```bash
# Build settings
Build command: (ninguno - static site)
Publish directory: /

# Environment variables:
SUPABASE_URL=https://[PROJECT_ID].supabase.co
SUPABASE_ANON_KEY=[ANON_KEY]
```

### **🌐 Domain Setup**
```
Production URL: https://gestion-financiera-v2.vercel.app
Custom Domain: [Opcional] tu-dominio.com
SSL: ✅ Automático (Vercel/Netlify)
```

## 👥 **User Credentials**

### **👤 Usuarios de Prueba**
```javascript
// Usuario Admin (para testing)
{
    email: "admin@test.com",
    password: "Test123456!",
    perfil: {
        nombre: "Admin",
        apellido: "Test",
        dni: "12345678",
        edad: 30,
        ocupacion: "Desarrollador"
    }
}

// Usuario Normal (para demo)
{
    email: "usuario@test.com", 
    password: "Demo123456!",
    perfil: {
        nombre: "Juan",
        apellido: "Pérez",
        dni: "87654321",
        edad: 25,
        ocupacion: "Contador"
    }
}
```

## 📂 **Project Structure**

### **🗂️ Estructura de Archivos**
```
gestion-financiera-v2/
├── index.html                 # Página principal
├── dashboard.html             # Dashboard (opcional SPA)
├── README.md                  # Documentación principal
├── .env.example              # Variables de entorno ejemplo
├── vercel.json               # Configuración Vercel
├── css/
│   ├── main.css              # Estilos principales  
│   ├── components.css        # Componentes UI
│   ├── responsive.css        # Media queries
│   └── themes.css            # Temas (opcional)
├── js/
│   ├── config.js             # Configuración Supabase
│   ├── app.js                # App principal
│   ├── auth.js               # Gestión autenticación
│   ├── dashboard.js          # Lógica dashboard
│   ├── components.js         # Componentes reutilizables
│   ├── utils.js              # Utilidades
│   └── crud.js               # Operaciones CRUD
├── assets/
│   ├── icons/                # Iconos SVG
│   ├── images/               # Imágenes
│   └── fonts/                # Fuentes (opcional)
└── docs/
    ├── DESARROLLO_ORDEN_BACKEND.md
    ├── DESARROLLO_ORDEN_FRONTEND.md
    ├── METODOLOGIA_DESARROLLO.md
    ├── ARQUITECTURA.md
    └── CREDENCIALES.md
```

## 🔐 **Environment Variables**

### **📋 .env.example**
```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# Optional: For development
NODE_ENV=development
DEBUG=true

# Optional: Custom API endpoints  
API_VERSION=v1
APP_NAME="Gestión Financiera v2"
```

### **🚀 Production Environment**
```env
# Vercel/Netlify
SUPABASE_URL=https://[PROJECT_ID].supabase.co
SUPABASE_ANON_KEY=[PRODUCTION_ANON_KEY]
NODE_ENV=production
```

## 🔧 **Development Tools**

### **💻 Recommended VS Code Extensions**
```json
{
    "recommendations": [
        "bradlc.vscode-tailwindcss",
        "ms-vscode.vscode-json", 
        "esbenp.prettier-vscode",
        "formulahendry.auto-rename-tag",
        "ms-vscode.live-server"
    ]
}
```

### **🎨 Chrome Extensions**
- Supabase Debugger
- JSON Viewer
- React Developer Tools (si migras)

### **📱 Testing Tools**
- Chrome DevTools (Mobile simulation)
- Firefox Responsive Design Mode
- BrowserStack (cross-browser testing)

## 📚 **Documentation Links**

### **📖 Official Documentation**
- [Supabase Docs](https://supabase.com/docs)
- [JavaScript Client](https://supabase.com/docs/reference/javascript)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

### **🎓 Learning Resources**
- [Supabase YouTube](https://youtube.com/@supabase)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
- [MDN Web Docs](https://developer.mozilla.org/)

## 📞 **Support & Community**

### **🤝 Community Support**
- [Supabase Discord](https://discord.supabase.com/)
- [Supabase GitHub](https://github.com/supabase/supabase)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/supabase)

### **🆘 Emergency Contacts**
```
Supabase Support: support@supabase.io
Documentation Issues: docs@supabase.io
```

## ⚡ **Quick Start Checklist**

### **✅ Setup Checklist**
- [ ] Crear cuenta Supabase
- [ ] Crear nuevo proyecto
- [ ] Copiar URL y API Key
- [ ] Ejecutar SQL para crear tablas
- [ ] Configurar RLS policies
- [ ] Crear usuarios de prueba
- [ ] Clonar estructura de archivos
- [ ] Configurar variables de entorno
- [ ] Probar conexión local
- [ ] Deploy a Vercel/Netlify

### **🧪 Testing Checklist**
- [ ] Registro de usuario funcional
- [ ] Login funcional  
- [ ] Dashboard carga correctamente
- [ ] CRUD ingresos funcional
- [ ] CRUD gastos funcional
- [ ] Simulador crédito funcional
- [ ] Responsive design OK
- [ ] App desplegada accesible

---

**📌 NOTA**: Actualizar este archivo con las credenciales reales después de crear el proyecto en Supabase.

**🎯 Siguiente:** Ver `ARQUITECTURA.md`
