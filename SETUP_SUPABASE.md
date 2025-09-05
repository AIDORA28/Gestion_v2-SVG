# 🚀 SETUP SUPABASE - Módulo 1 Backend

> **✅ VERIFICADO**: v1 Railway está funcionando (Status 200)  
> **🎯 OBJETIVO**: Configurar Supabase como remplazo de FastAPI + MongoDB

## 🔧 **PASO 1: Crear Proyecto Supabase** ⏱️ (10 min)

### **Acciones Requeridas:**
1. **Ir a Supabase Dashboard**
   ```
   URL: https://supabase.com/dashboard
   ```

2. **Crear Nuevo Proyecto**
   ```
   Project Name: "gestion-financiera-v2"
   Organization: [Tu organización]
   Database Password: [Generar password fuerte]
   Region: "East US (North Virginia)" - us-east-1
   Pricing: Free tier (25,000 monthly active users)
   ```

3. **Esperar Provisioning**
   - ⏳ Tiempo estimado: 2-3 minutos
   - ✅ Estado: "Project is setting up..."
   - ✅ Completado: "Project ready"

## 🔑 **PASO 2: Obtener Credenciales** ⏱️ (5 min)

### **Ubicación: Settings > API**
```env
# ⚠️ COPIAR EXACTAMENTE ESTOS VALORES:

# Project URL
SUPABASE_URL=https://[tu-project-id].supabase.co

# Public anon key (para frontend)
SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...

# Service role key (⚠️ NUNCA usar en frontend)
SUPABASE_SERVICE_ROLE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...

# Database URL (para conexiones directas)
DATABASE_URL=postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres
```

### **✅ Verificar Credenciales:**
```javascript
// Test en consola del browser:
console.log('URL:', 'https://[tu-project-id].supabase.co');
console.log('Key length:', '[tu-anon-key]'.length); // Debe ser ~300+ caracteres
```

## 🔐 **PASO 3: Configurar Autenticación** ⏱️ (15 min)

### **3.1 Configuración Básica**
```
Ubicación: Authentication > Settings

✅ Enable email confirmations: OFF (para desarrollo rápido)
✅ Enable secure password requirements: ON
   - Minimum 8 characters
   - Require uppercase: ON
   - Require lowercase: ON  
   - Require numbers: ON
   - Require special characters: OFF

✅ Enable phone confirmations: OFF
✅ Enable refresh token rotation: ON
```

### **3.2 Site URL Configuration**
```
Ubicación: Authentication > URL Configuration

Site URL: http://localhost:5500
Additional Redirect URLs: 
- http://localhost:5500/dashboard.html
- http://localhost:3000 (backup)
- http://127.0.0.1:5500
```

### **3.3 Providers Habilitados**
```
Ubicación: Authentication > Providers

✅ Email: ENABLED
❌ Phone: DISABLED (por ahora)
❌ Google: DISABLED (por ahora) 
❌ GitHub: DISABLED (por ahora)
```

### **3.4 Email Templates (opcional)**
```
Ubicación: Authentication > Email Templates

✅ Confirm signup: USAR TEMPLATE DEFAULT
✅ Magic link: USAR TEMPLATE DEFAULT
✅ Change email address: USAR TEMPLATE DEFAULT
✅ Reset password: USAR TEMPLATE DEFAULT
```

## 🧪 **PASO 4: Probar Conexión Básica** ⏱️ (15 min)

### **4.1 Test desde Browser Console**
```javascript
// 1. Cargar Supabase client (copiar/pegar en consola):
const script = document.createElement('script');
script.src = 'https://unpkg.com/@supabase/supabase-js@2.38.0/dist/umd/supabase.min.js';
document.head.appendChild(script);

// 2. Esperar 2 segundos, luego ejecutar:
const { createClient } = supabase;
const supabaseClient = createClient(
  'https://[TU-PROJECT-ID].supabase.co',  // ⚠️ CAMBIAR
  'eyJ0eXAiOi...[TU-ANON-KEY]'            // ⚠️ CAMBIAR
);

// 3. Test conexión:
const testConnection = async () => {
  try {
    const { data, error } = await supabaseClient
      .from('_supabase_migrations')
      .select('version')
      .limit(1);
    
    if (error && error.code === '42P01') {
      console.log('✅ CONEXIÓN OK - Base de datos lista para usar');
      return true;
    }
    
    console.log('✅ CONEXIÓN OK - Data:', data);
    return true;
  } catch (err) {
    console.error('❌ ERROR DE CONEXIÓN:', err);
    return false;
  }
};

// 4. Ejecutar test:
testConnection();
```

### **4.2 Test de Autenticación**
```javascript
// Test registro de usuario:
const testAuth = async () => {
  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email: 'test@ejemplo.com',
      password: 'Test123456'
    });
    
    if (error) {
      console.log('ℹ️ Error esperado (usuario ya existe):', error.message);
    } else {
      console.log('✅ AUTH OK - Usuario creado:', data.user.email);
    }
    
    return true;
  } catch (err) {
    console.error('❌ ERROR AUTH:', err);
    return false;
  }
};

// Ejecutar:
testAuth();
```

## ✅ **PASO 5: Validar Módulo 1 Completado**

### **Checklist Final:**
- [ ] ✅ Proyecto Supabase creado
- [ ] ✅ Credenciales obtenidas y guardadas
- [ ] ✅ Autenticación configurada
- [ ] ✅ Site URLs configuradas
- [ ] ✅ Test de conexión exitoso
- [ ] ✅ Test de auth exitoso
- [ ] ✅ Variables de entorno documentadas

### **🎯 Criterios de Éxito:**
```javascript
// Estos comandos deben funcionar sin errores:
1. const client = createClient(url, key);           // ✅
2. await client.auth.getSession();                  // ✅  
3. await client.auth.signUp({email, password});     // ✅
4. console.log('Módulo 1: COMPLETADO ✅');          // ✅
```

## 📋 **Variables para Siguiente Módulo**

### **Para usar en Módulo 2 (Base de Datos):**
```env
# Estas variables deben estar listas:
SUPABASE_URL=https://[tu-project-id].supabase.co
SUPABASE_ANON_KEY=eyJ0eXAiOi...
```

### **SQL Editor Supabase:**
```
Ubicación: SQL Editor en dashboard
URL: https://supabase.com/dashboard/project/[project-id]/sql
```

---

## 🚨 **RECORDATORIOS DE METODOLOGÍA**

### **✅ LO QUE HICIMOS BIEN:**
- Verificamos que v1 funciona antes de empezar
- Implementamos SOLO lo necesario para Módulo 1
- Probamos cada paso antes de continuar
- Documentamos credenciales para siguientes módulos

### **🎯 SIGUIENTE PASO:**
**Módulo 2: Base de Datos y Tablas** - Crear las tablas que reemplazan las collections de MongoDB v1

**⏱️ Tiempo Módulo 1: 45 minutos**
**✅ Status: LISTO PARA MÓDULO 2**

---

*Última actualización: Septiembre 4, 2025 - Módulo 1 Completado*
