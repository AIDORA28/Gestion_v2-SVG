# 🚀 MIGRACIÓN A SUPABASE - GUÍA FUTURA

## 📋 CUANDO MIGRAR
Esta guía se usará cuando el sistema local esté completamente funcional y queramos migrar a producción.

### **Pre-requisitos para Migración**
- [x] Sistema local funcionando al 100%
- [x] PostgreSQL local con datos de prueba
- [x] Frontend completamente desarrollado
- [ ] Cuenta Supabase configurada
- [ ] Proyecto GitHub listo
- [ ] Cuenta Vercel configurada

---

## 🗄️ MIGRACIÓN DE BASE DE DATOS

### **Paso 1: Crear Proyecto Supabase**
```bash
# 1. Ir a https://supabase.com
# 2. Crear nuevo proyecto
# 3. Esperar inicialización (2-3 minutos)
# 4. Obtener URL y API Key
```

### **Paso 2: Migrar Estructura**
```sql
-- En Supabase SQL Editor, ejecutar en orden:
-- 1. database/01-setup-database.sql
-- 2. database/02-policies.sql  
-- 3. database/05-functions-negocio.sql
-- Opcional: 03, 04, 06, 07, 08 según necesidad
```

### **Paso 3: Migrar Datos**
```bash
# Exportar desde PostgreSQL local
pg_dump -U postgres -h localhost -p 5434 -d gestion_presupuesto --data-only --inserts > data_export.sql

# Importar a Supabase (desde dashboard SQL Editor)
# Copiar y pegar el contenido de data_export.sql
```

---

## 🔐 CONFIGURACIÓN DE AUTENTICACIÓN

### **Habilitar Row Level Security**
```sql
-- Ejecutar en Supabase para cada tabla:
ALTER TABLE perfiles_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingresos ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulaciones_credito ENABLE ROW LEVEL SECURITY;
```

### **Configurar Políticas de Seguridad**
El archivo `02-policies.sql` contiene todas las políticas necesarias.

---

## 🌐 CONFIGURACIÓN FRONTEND

### **Actualizar Configuración**
```javascript
// Cambiar en frontend/js/config.js:
const CONFIG = {
    // Cambiar de PostgreSQL local a Supabase
    SUPABASE_URL: 'https://tu-proyecto.supabase.co',
    SUPABASE_ANON_KEY: 'tu-anon-key',
    API_MODE: 'supabase' // cambiar de 'local' a 'supabase'
};
```

### **Instalar Cliente Supabase**
```html
<!-- Agregar a todos los HTML -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

---

## 🚀 DEPLOY EN VERCEL

### **Configurar Repositorio**
```bash
# Subir código a GitHub
git add .
git commit -m "Sistema listo para producción"
git push origin main
```

### **Deploy en Vercel**
```bash
# 1. Ir a https://vercel.com
# 2. Import Git Repository
# 3. Seleccionar repositorio GitHub
# 4. Configure:
#    - Framework Preset: Other
#    - Root Directory: frontend
#    - Build Command: (vacío)
#    - Output Directory: (vacío)
# 5. Deploy
```

---

## 📊 CHECKLIST DE MIGRACIÓN

### **Base de Datos**
- [ ] Proyecto Supabase creado
- [ ] Tablas migradas correctamente
- [ ] Datos de prueba importados
- [ ] RLS habilitado
- [ ] Políticas aplicadas
- [ ] Funciones de negocio funcionando

### **Frontend**
- [ ] Configuración Supabase actualizada
- [ ] Cliente Supabase instalado
- [ ] Autenticación implementada
- [ ] CRUD conectado a Supabase
- [ ] Testing completo

### **Deploy**
- [ ] Código subido a GitHub
- [ ] Vercel conectado al repositorio
- [ ] Deploy exitoso
- [ ] DNS configurado (opcional)
- [ ] SSL verificado

### **Funcionalidad**
- [ ] Registro de usuarios funcional
- [ ] Login/Logout funcional
- [ ] CRUD ingresos/gastos funcional
- [ ] Dashboard con datos reales
- [ ] Simulador crédito funcional
- [ ] Reportes y gráficos funcionando

---

## 🔧 CONFIGURACIONES ADICIONALES

### **Variables de Entorno en Vercel**
```
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key
```

### **Dominio Personalizado (Opcional)**
```bash
# En Vercel Dashboard:
# Settings > Domains > Add Domain
# Configurar DNS según instrucciones
```

---

**🎯 ESTA MIGRACIÓN SE HARÁ SOLO CUANDO EL SISTEMA LOCAL ESTÉ 100% TERMINADO**

Primero completaremos todo el desarrollo local, y luego usaremos esta guía para migrar a producción.

---

*Guía preparada para migración futura | No usar hasta completar desarrollo local*
