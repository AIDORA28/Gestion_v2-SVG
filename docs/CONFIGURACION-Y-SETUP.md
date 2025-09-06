# 🔧 Configuración y Setup - Sistema Financiero v2

## 🎯 **Configuración Supabase Completa**

### **📊 Información del Proyecto**
```bash
Proyecto ID: trlbsfktusefvpheoudn
Región: East US (North Virginia)  
Plan: Free tier (25K MAU)
Estado: ✅ ACTIVO y FUNCIONANDO
```

### **🔗 URLs y Credenciales**
```env
# URLs Principales
SUPABASE_URL=https://trlbsfktusefvpheoudn.supabase.co
DASHBOARD=https://supabase.com/dashboard/project/trlbsfktusefvpheoudn
SQL_EDITOR=https://supabase.com/dashboard/project/trlbsfktusefvpheoudn/sql

# Claves API (uso seguro)
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRybGJzZmt0dXNlZnZwaGVvdWRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMzg5MDMsImV4cCI6MjA3MjYxNDkwM30.Rg045QrnG6R7kIy3k_8zl8JSiMFwWVN5e08LmZCx6Fc

# Usuario de Prueba
TEST_EMAIL=test@ejemplo.com
TEST_PASSWORD=Test123456!
```

## 🏗️ **Instalación de Base de Datos (5 minutos)**

### **Orden de Ejecución SQL:**
```sql
-- Ejecutar en Supabase SQL Editor en este orden:

-- 1. OBLIGATORIO - Base del sistema
01-setup-database.sql        # Tablas principales + índices + triggers
02-policies.sql              # Row Level Security (RLS) 
03-tablas-opcionales.sql     # Metas, categorías, presupuestos
04-audit-logs.sql            # Sistema de auditoría completo
05-functions-negocio.sql     # Funciones de cálculo financiero
06-api-functions.sql         # Endpoints para frontend

-- 2. OPCIONAL - Utilidades adicionales  
07-sql-confirmar-usuario.sql # Debugging y confirmación usuarios
08-agregar-estado-civil.sql  # Campos adicionales de perfil
```

### **Verificación de Instalación:**
```sql
-- Ejecutar para verificar que todo está instalado:
SELECT 'TABLAS' as tipo, COUNT(*) as cantidad 
FROM information_schema.tables 
WHERE table_schema = 'public'
UNION ALL
SELECT 'FUNCIONES', COUNT(*) 
FROM information_schema.routines 
WHERE routine_schema = 'public'
UNION ALL  
SELECT 'POLÍTICAS RLS', COUNT(*)
FROM pg_policies 
WHERE schemaname = 'public';

-- Resultado esperado:
-- TABLAS: 8-10
-- FUNCIONES: 20-25  
-- POLÍTICAS RLS: 35-45
```

## 🔐 **Configuración de Seguridad**

### **Autenticación:**
```bash
# Configurado en Supabase Dashboard > Authentication
✅ Email confirmations: OFF (desarrollo)
✅ Secure passwords: ON (mín 8 caracteres)
✅ Site URL: http://localhost:3000
✅ Redirect URLs: 
   - http://localhost:3000/dashboard
   - https://tu-app.vercel.app
```

### **Row Level Security (RLS):**
```sql
-- Todas las tablas protegidas con RLS
-- Usuarios solo pueden ver/modificar sus propios datos
-- Políticas automáticas creadas por 02-policies.sql

-- Ejemplo de política (automática):
CREATE POLICY "usuarios_solo_sus_datos" ON ingresos
FOR ALL USING (auth.uid() = usuario_id);
```

## 🚀 **Deployment y Git Setup**

### **Configuración GitHub:**
```bash
# 1. Crear repositorio en GitHub
Repository name: gestion-financiera-v2
Description: Sistema de gestión financiera - Supabase + HTML/JS
Visibility: Public/Private (tu elección)

# 2. Conectar repositorio local
git remote add origin https://github.com/TU-USERNAME/gestion-financiera-v2.git
git branch -M main
git push -u origin main
```

### **Deployment en Vercel:**
```bash
# Opción A: Web Dashboard
1. https://vercel.com/new
2. Import Git Repository: gestion-financiera-v2  
3. Framework: Other
4. Build Command: (vacío)
5. Install Command: (vacío)
6. Environment Variables:
   SUPABASE_URL=https://trlbsfktusefvpheoudn.supabase.co
   SUPABASE_ANON_KEY=[tu-anon-key]
7. Deploy

# Opción B: CLI
npm i -g vercel
vercel login
vercel
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY  
vercel --prod
```

### **URLs Post-Deploy:**
```
GitHub: https://github.com/TU-USERNAME/gestion-financiera-v2
Vercel: https://gestion-financiera-v2.vercel.app
Supabase: https://trlbsfktusefvpheoudn.supabase.co
```

## 🧪 **Testing y Validación**

### **Test de Conexión (Browser Console):**
```javascript
// 1. Cargar Supabase client
const script = document.createElement('script');
script.src = 'https://unpkg.com/@supabase/supabase-js@2.38.0/dist/umd/supabase.min.js';
document.head.appendChild(script);

// 2. Después de 2 segundos:
const { createClient } = supabase;
const supabaseClient = createClient(
  'https://trlbsfktusefvpheoudn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' // tu anon key
);

// 3. Test básico:
const test = async () => {
  const { data, error } = await supabaseClient
    .from('perfiles_usuario')
    .select('count');
  console.log('✅ Conexión:', data ? 'OK' : 'Error', error);
};
test();
```

### **Test de Autenticación:**
```javascript
// Test login con usuario de prueba:
const testAuth = async () => {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: 'test@ejemplo.com',
    password: 'Test123456!'
  });
  
  if (data.user) {
    console.log('✅ Login exitoso:', data.user.email);
    
    // Test función personalizada:
    const { data: perfil } = await supabaseClient.rpc('obtener_mi_perfil');
    console.log('✅ Perfil obtenido:', perfil);
  } else {
    console.error('❌ Error login:', error);
  }
};
testAuth();
```

### **Test de Funciones API:**
```javascript
// Test función de balance
const testBalance = async () => {
  const { data, error } = await supabaseClient.rpc('calcular_balance_mensual', {
    p_usuario_id: supabaseClient.auth.user().id,
    p_year: 2025,
    p_month: 9
  });
  
  console.log('Balance:', data);
};

// Test función de resumen
const testResumen = async () => {
  const { data } = await supabaseClient.rpc('obtener_resumen_financiero', {
    p_usuario_id: supabaseClient.auth.user().id
  });
  
  console.log('Resumen financiero:', data);
};
```

## 🔧 **Configuración de Desarrollo**

### **Variables de Entorno:**
```javascript
// js/config.js
const SUPABASE_CONFIG = {
    url: 'https://trlbsfktusefvpheoudn.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
};

// Cliente global
const supabase = window.supabase.createClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.anonKey
);
```

### **CORS y Headers:**
```javascript
// Headers automáticos en requests:
const headers = {
    'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
    'apikey': SUPABASE_CONFIG.anonKey,
    'Content-Type': 'application/json'
};
```

### **Live Server Configuration:**
```json
// .vscode/settings.json
{
    "liveServer.settings.port": 3000,
    "liveServer.settings.host": "localhost",
    "liveServer.settings.CustomBrowser": "chrome",
    "liveServer.settings.cors": true
}
```

## 📊 **Monitoreo y Mantenimiento**

### **Dashboard Supabase:**
- **API Usage**: Monitor requests y límites
- **Auth Users**: Usuarios registrados y activos
- **Database**: Tamaño de BD y rendimiento de queries
- **Logs**: Errores y eventos del sistema

### **Comandos de Mantenimiento:**
```sql
-- Limpiar logs antiguos (ejecutar mensualmente):
DELETE FROM logs_auditoria 
WHERE timestamp < NOW() - INTERVAL '90 days';

-- Ver estadísticas de uso:
SELECT 
    'Usuarios' as tabla, COUNT(*) as registros FROM auth.users
UNION ALL
SELECT 'Perfiles', COUNT(*) FROM perfiles_usuario  
UNION ALL
SELECT 'Ingresos', COUNT(*) FROM ingresos
UNION ALL
SELECT 'Gastos', COUNT(*) FROM gastos
UNION ALL
SELECT 'Logs Auditoría', COUNT(*) FROM logs_auditoria;
```

### **Backups Automáticos:**
```bash
# Supabase realiza backups automáticos diarios
# Para backup manual:
pg_dump postgresql://postgres:[password]@db.trlbsfktusefvpheoudn.supabase.co:5432/postgres > backup.sql
```

## ✅ **Checklist de Configuración Completa**

### **Setup Inicial:**
- [ ] ✅ Proyecto Supabase creado y activo
- [ ] ✅ URLs y credenciales documentadas
- [ ] ✅ Usuario de prueba configurado
- [ ] ✅ Base de datos instalada (8 scripts SQL)
- [ ] ✅ RLS y políticas de seguridad activas

### **Desarrollo:**
- [ ] ✅ Repositorio Git configurado
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ Tests de conexión exitosos
- [ ] ✅ Tests de autenticación exitosos
- [ ] ✅ APIs funcionando correctamente

### **Deployment:**
- [ ] 🔄 Vercel configurado (opcional)
- [ ] 🔄 Dominio personalizado (opcional)
- [ ] 🔄 Variables de entorno en producción
- [ ] 🔄 Testing en ambiente de producción

---

> **🎯 Configuración Lista para Desarrollo**  
> *Todo configurado y funcionando - Listo para implementar frontend*
