# 🔄 SISTEMA DUAL DE ENTORNOS - PLANIFICAPRO

## 📋 RESUMEN
Sistema que permite trabajar simultáneamente en dos entornos:
- **🏠 LOCAL**: Desarrollo con Laragon + PostgreSQL
- **🌐 PRODUCCIÓN**: Deploy con Supabase + Vercel + GitHub

---

## 🎯 VENTAJAS DEL SISTEMA DUAL

### ✅ **Para Desarrollo Local:**
- Control total del entorno
- Base de datos local (sin límites)
- Debug y desarrollo rápido
- Sin dependencias de internet
- Pruebas sin afectar producción

### ✅ **Para Producción:**
- Escalabilidad automática
- Backup automático (Supabase)
- SSL y seguridad (Vercel)
- Deploy automático (GitHub)
- Costo mínimo/gratuito

---

## 🔧 ESTRUCTURA DE ARCHIVOS

```
📁 config/
├── 🔍 environment-detector.js    # Detecta entorno automáticamente
├── 🏠 config-local.js           # Configuración desarrollo
└── 🌐 config-production.js      # Configuración producción

📁 backend/
├── 🗄️ database-manager.js       # Maneja ambas bases de datos
└── 📦 package.json              # Incluye dependencias duales

📁 archivos de entorno/
├── 📄 .env.local                # Variables desarrollo (NO commitear)
├── 📄 .env.production.example   # Plantilla producción
├── 🚀 start-local.bat          # Iniciar desarrollo
└── 🌐 prepare-production.bat    # Preparar deploy
```

---

## 🚀 CÓMO USAR

### **🏠 DESARROLLO LOCAL:**
```bash
# Opción 1: Script automático
start-local.bat

# Opción 2: Manual
copy .env.local .env
pnpm run dev
```

### **🌐 PREPARAR PRODUCCIÓN:**
```bash
# Opción 1: Script guiado
prepare-production.bat

# Opción 2: Manual
git add .
git commit -m "Nueva funcionalidad"
git push origin master
# Luego deploy en Vercel
```

---

## ⚙️ CONFIGURACIÓN AUTOMÁTICA

### **🔍 Detección de Entorno:**
El sistema detecta automáticamente:
- **Local**: `localhost`, `127.0.0.1`
- **Producción**: `*.vercel.app`, dominios personalizados

### **📁 Archivos Cargados:**
- **Local**: `config/config-local.js`
- **Producción**: `config/config-production.js`

### **🗄️ Base de Datos:**
- **Local**: PostgreSQL en Laragon
- **Producción**: Supabase automáticamente

---

## 🔑 VARIABLES DE ENTORNO

### **🏠 Local (.env.local):**
```env
NODE_ENV=development
DB_HOST=127.0.0.1
DB_PORT=5434
DB_NAME=gestion_presupuesto
DB_USER=postgres
DB_PASSWORD=root
```

### **🌐 Producción (Vercel Dashboard):**
```env
NODE_ENV=production
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

---

## 🔄 FLUJO DE TRABAJO

### **1. Desarrollo Local:**
```bash
# Iniciar entorno local
start-local.bat

# Desarrollar nuevas características
# Probar en http://localhost:3000

# Confirmar que todo funciona
```

### **2. Subir a Producción:**
```bash
# Preparar para producción
prepare-production.bat

# O manualmente:
git add .
git commit -m "Nueva funcionalidad X"
git push origin master

# Vercel detecta el push y deploy automáticamente
```

### **3. Verificar Deploy:**
```bash
# Verificar en tu URL de producción:
https://tu-app.vercel.app

# Probar funcionalidades críticas
# Monitorear logs en Vercel Dashboard
```

---

## 🛠️ MIGRACIÓN DE DATOS

### **De Local a Producción:**
```sql
-- 1. Exportar datos de PostgreSQL local
pg_dump -h 127.0.0.1 -p 5434 -U postgres gestion_presupuesto > backup.sql

-- 2. Importar a Supabase (usando SQL Editor)
-- Copiar y pegar el contenido relevante
```

### **De Producción a Local:**
```bash
# Usar Supabase Dashboard > SQL Editor
# Exportar tablas específicas
# Importar en PostgreSQL local
```

---

## 🧪 TESTING DUAL

### **Testing Local:**
```bash
# Probar todas las funcionalidades
# Verificar base de datos local
# Debug con logs detallados
```

### **Testing Producción:**
```bash
# Smoke testing en URL de producción
# Verificar métricas en Vercel
# Monitorear uso de Supabase
```

---

## 🚨 TROUBLESHOOTING

### **❌ No detecta entorno:**
```javascript
// Forzar entorno manualmente
window.CONFIG = {
    ENV: 'local', // o 'production'
    API_URL: 'http://localhost:5000'
};
```

### **❌ Error de base de datos:**
```bash
# Local: Verificar Laragon iniciado
# Producción: Verificar variables Vercel
```

### **❌ CORS Error:**
```javascript
// Verificar CORS_ORIGIN en variables entorno
// Local: http://localhost:3000
// Producción: https://tu-app.vercel.app
```

---

## 📊 MONITOREO

### **🏠 Local:**
- Logs en consola del servidor
- PostgreSQL logs en Laragon
- Debug detallado habilitado

### **🌐 Producción:**
- Vercel Dashboard (funciones, logs)
- Supabase Dashboard (DB, API calls)
- Analytics automático

---

## 💰 COSTOS

### **🏠 Local:**
- **Costo**: $0
- **Limitaciones**: Solo en tu máquina

### **🌐 Producción (Gratuito):**
- **Vercel**: 100GB bandwidth/mes
- **Supabase**: 50MB DB, 2GB transfer/mes
- **GitHub**: Ilimitado repos públicos

### **🚀 Escalamiento (Pagado):**
- **Vercel Pro**: $20/mes (más bandwidth)
- **Supabase Pro**: $25/mes (8GB DB)

---

## ✅ CHECKLIST IMPLEMENTACIÓN

### **🏠 Entorno Local:**
- [x] PostgreSQL configurado
- [x] Variables .env.local
- [x] Database manager dual
- [x] Scripts de inicio
- [x] Detective de entorno

### **🌐 Entorno Producción:**
- [x] Configuración Vercel
- [x] Adaptador Supabase
- [x] Variables ejemplo
- [x] Scripts preparación
- [x] Documentación deploy

### **🔄 Sistema Dual:**
- [x] Detección automática
- [x] Configuración separada
- [x] Database manager dual
- [x] Scripts diferenciados
- [x] Documentación completa

---

**🎯 ¡Sistema dual implementado exitosamente!**

**Tu flujo de trabajo ahora es:**
1. **Desarrolla** en local con `start-local.bat`
2. **Prueba** todo localmente
3. **Sube** con `prepare-production.bat`
4. **Deploy** automático en Vercel
5. **Verifica** en producción

---

*Documentación del sistema dual - Septiembre 2025*
