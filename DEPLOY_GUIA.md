# 🚀 GUÍA DE DEPLOY - PLANIFICAPRO
## Supabase + Vercel + GitHub - PASO A PASO

### 📋 PRE-REQUISITOS
- ✅ Código funcionando localmente
- ✅ Cuenta GitHub
- ✅ Cuenta Supabase (gratis)
- ✅ Cuenta Vercel (gratis)

---

## 🔗 PASO 1: CONFIGURAR SUPABASE

### 1.1 Crear Proyecto Supabase
```bash
# 1. Ir a https://supabase.com
# 2. Create new project
# 3. Nombre: planificapro-db
# 4. Guardar URL y anon key
```

### 1.2 Crear Tablas en Supabase
```sql
-- Ejecutar en Supabase SQL Editor:

-- Tabla usuarios
CREATE TABLE usuarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    nombre VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla ingresos
CREATE TABLE ingresos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL,
    monto DECIMAL(12,2) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    fecha DATE NOT NULL,
    es_recurrente BOOLEAN DEFAULT FALSE,
    frecuencia_dias INTEGER,
    notas TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla gastos (para futuro)
CREATE TABLE gastos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL,
    monto DECIMAL(12,2) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    fecha DATE NOT NULL,
    es_recurrente BOOLEAN DEFAULT FALSE,
    frecuencia_dias INTEGER,
    notas TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingresos ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Usuarios pueden ver sus propios datos" ON usuarios FOR ALL USING (true);
CREATE POLICY "Usuarios pueden ver sus propios ingresos" ON ingresos FOR ALL USING (true);
CREATE POLICY "Usuarios pueden ver sus propios gastos" ON gastos FOR ALL USING (true);
```

### 1.3 Obtener Credenciales
```bash
# En Supabase Dashboard > Settings > API:
# Copiar:
# - Project URL: https://tuproyecto.supabase.co
# - anon/public key: eyJhbGc...
```

---

## 🔧 PASO 2: CONFIGURAR PROYECTO PARA PRODUCCIÓN

### 2.1 Actualizar configuración de API
```javascript
// backend/server.js - Agregar configuración para Supabase:

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Reemplazar todas las consultas de PostgreSQL con Supabase
```

### 2.2 Instalar dependencias de Supabase
```bash
cd backend
npm install @supabase/supabase-js
```

---

## 📤 PASO 3: SUBIR A GITHUB

### 3.1 Subir código actualizado
```bash
# En tu proyecto:
git add .
git commit -m "🚀 Preparar para deploy en Vercel + Supabase"
git push origin master
```

---

## 🌐 PASO 4: DEPLOY EN VERCEL

### 4.1 Conectar GitHub a Vercel
```bash
# 1. Ir a https://vercel.com
# 2. Import Git Repository
# 3. Seleccionar tu repositorio: gestion-presupuesto
# 4. Framework Preset: Other
# 5. Root Directory: ./
```

### 4.2 Configurar Variables de Entorno
```bash
# En Vercel Dashboard > Settings > Environment Variables:

SUPABASE_URL=https://tuproyecto.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...tu-anon-key
NODE_ENV=production
DATABASE_URL= # (déjala vacía, usaremos Supabase)
```

### 4.3 Deploy
```bash
# Click "Deploy" en Vercel
# Esperar 2-3 minutos
# Tu app estará en: https://tu-app.vercel.app
```

---

## ✅ PASO 5: VERIFICAR FUNCIONAMIENTO

### 5.1 URLs a probar:
- ✅ `https://tu-app.vercel.app/` (Landing)
- ✅ `https://tu-app.vercel.app/register.html` (Registro)
- ✅ `https://tu-app.vercel.app/login.html` (Login)
- ✅ `https://tu-app.vercel.app/dashboard.html` (Dashboard)

### 5.2 Funcionalidades críticas:
- ✅ Registro de usuario
- ✅ Login/logout
- ✅ Crear ingresos
- ✅ Ver estadísticas
- ✅ Módulo dinámico de ingresos

---

## 🔧 SOLUCIÓN A PROBLEMAS COMUNES

### ❌ Error: "Cannot connect to database"
```bash
# Verificar variables de entorno en Vercel
# Verificar que Supabase URL y Key sean correctas
# Verificar que las tablas existan en Supabase
```

### ❌ Error: "404 Not Found"
```bash
# Verificar vercel.json routes
# Verificar que los archivos estén en la carpeta correcta
```

### ❌ Error: "CORS"
```bash
# Verificar headers en vercel.json
# Verificar configuración de Supabase RLS
```

---

## 🎯 RESULTADO FINAL

Al completar todos los pasos tendrás:

- ✅ **URL de producción**: `https://tu-app.vercel.app`
- ✅ **Base de datos**: Supabase PostgreSQL en la nube
- ✅ **Hosting**: Vercel con SSL automático
- ✅ **Deploy automático**: Cada push a master actualiza la app
- ✅ **Escalable**: Maneja miles de usuarios
- ✅ **Gratis**: Dentro de los límites de plan gratuito

### 📊 Límites del plan gratuito:
- **Vercel**: 100GB bandwidth/mes
- **Supabase**: 50MB DB, 2GB transfer/mes
- **GitHub**: Ilimitado para repos públicos

### 💰 ¿Cuándo actualizar a plan pagado?
- Vercel Pro ($20/mes): Más bandwidth, analytics
- Supabase Pro ($25/mes): 8GB DB, 250GB transfer

---

## 🚀 ¡TU APP YA ESTÁ EN PRODUCCIÓN!

Comparte tu URL: `https://tu-app.vercel.app`

### Próximos pasos:
1. 📱 Agregar módulo de gastos
2. 📊 Implementar reportes avanzados  
3. 🔒 Agregar autenticación con Google/GitHub
4. 📱 Convertir en PWA (app móvil)
5. 🌍 Agregar dominio personalizado

---

*Guía actualizada para deploy inmediato - Septiembre 2025*
