# 🚀 SETUP LOCAL CON LARAGON + POSTGRESQL

## 📋 **Pre-requisitos**
- ✅ Laragon instalado
- ✅ PostgreSQL habilitado en Laragon  
- ✅ VS Code con extensión Live Server

## ⚙️ **Configuración Laragon**

### **1. Activar PostgreSQL en Laragon**
```
1. Abrir Laragon
2. Menu → PostgreSQL → Start
3. Verificar que aparezca "PostgreSQL: 13.x"
```

### **2. Crear Base de Datos Local**
```sql
-- Conectar a PostgreSQL desde Laragon
-- Menu → PostgreSQL → Quick Admin (pgAdmin)

-- Crear database
CREATE DATABASE gestion_financiera;

-- Usar la database
\c gestion_financiera;

-- Crear tablas (ejecutar schema.sql)
```

### **3. Configurar Conexión Local**
```javascript
// js/config-local.js
const CONFIG = {
    // Desarrollo local
    LOCAL: {
        DB_HOST: 'localhost',
        DB_PORT: 5432,
        DB_NAME: 'gestion_financiera',
        DB_USER: 'postgres',
        DB_PASSWORD: '', // Laragon por defecto no tiene password
    },
    
    // Producción Supabase (para más tarde)
    PRODUCTION: {
        SUPABASE_URL: 'https://tu-proyecto.supabase.co',
        SUPABASE_ANON_KEY: 'tu-key-aqui'
    }
};
```

## 🔄 **Workflow Desarrollo**

### **Día a día:**
```bash
1. Iniciar Laragon → Start All
2. VS Code → Open Folder → tu-proyecto
3. Live Server → Go Live (localhost:5500)
4. Desarrollar normalmente
5. Git commit → Push to GitHub
6. Deploy a Vercel cuando esté listo
```

### **Base de datos local:**
```sql
-- Acceso rápido desde Laragon
-- Menu → Database → PostgreSQL → Quick Admin
-- URL: http://localhost/pgAdmin4
```

## 🎯 **Ventajas de este Setup**

### **✅ Desarrollo Local:**
- Rápido (sin latencia de internet)
- Offline (trabajas sin conexión) 
- Control total (database local)
- Debug fácil (logs locales)

### **✅ Deploy Futuro:**
- Exportar schema SQL → Supabase
- Cambiar config.js → URLs de producción
- Push to GitHub → Auto deploy Vercel
- Cero fricción en la migración

## 📊 **Estructura Híbrida Recomendada**

```
Desarrollo:    Laragon + PostgreSQL local
Staging:       Supabase + Vercel preview  
Producción:    Supabase + Vercel + dominio custom
```

Esto te da lo mejor de ambos mundos: velocidad local + power de Supabase en producción.
