# 📋 METODOLOGÍA DE MIGRACIÓN - Gestión Financiera v1→v2

> **DOCUMENTO OBLIGATORIO DE CONSULTA**  
> Leer ANTES de cada implementación de módulo

## 🚨 PRINCIPIOS FUNDAMENTALES PARA MIGRACIÓN

### 1. **NO ASUMIR QUE ALGO FUNCIONA EN v1**
- ❌ **NUNCA** asumir que v1 funcionaba correctamente
- ❌ **NO COPIAR** código de v1 sin verificar funcionalidad
- ✅ **SIEMPRE** verificar qué endpoints realmente funcionan en Railway
- ✅ **SIEMPRE** probar funcionalidades de v1 antes de migrar
- ✅ **RECORDAR**: v1 tenía problemas de conectividad con MongoDB

### 2. **TRABAJAR CON LO QUE EXISTE EN SUPABASE**
- ✅ Usar solo tablas que están creadas en Supabase
- ✅ Usar solo funciones SQL que están implementadas
- ✅ Usar solo endpoints automáticos que Supabase provee
- ✅ Si algo no existe en Supabase, implementarlo PRIMERO

### 3. **MANTENER SIMPLICIDAD vs v1**
- ✅ **HTML + JS** es más simple que **React + CRA**
- ✅ **Supabase** es más confiable que **MongoDB Atlas**
- ✅ **CSS puro** es más directo que **Tailwind + shadcn**
- ✅ **Funcionalidad BÁSICA primero**, mejoras después
- ✅ Recordar: "Si v1 no funcionaba bien, v2 debe ser MÁS SIMPLE"

### 4. **COMPLETAR MIGRACIÓN GRADUAL**
- ✅ Módulo por módulo, NO todo junto
- ✅ Probar cada módulo antes de continuar
- ✅ No agregar funcionalidades que no existían en v1
- ✅ Migrar funcionalidad, no mejorar arquitectura

## 🔍 PROCESO OBLIGATORIO ANTES DE CADA MÓDULO

### PASO 1: Verificación de v1 (¿Qué realmente funcionaba?)
```bash
# Comandos obligatorios para verificar v1:
curl https://gestion-presupuesto-production.up.railway.app/health
curl https://gestion-presupuesto-production.up.railway.app/debug/db
# Ver qué endpoints de v1 están funcionando
```

### PASO 2: Verificación de Supabase v2
```sql
-- En Supabase SQL Editor:
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
SELECT * FROM information_schema.columns WHERE table_name = 'perfiles_usuario';
-- Verificar qué tablas y campos existen
```

### PASO 3: Mapeo de Funcionalidades v1→v2
- [ ] ¿Esta funcionalidad funcionaba en v1? → Probar en Railway
- [ ] ¿Existe la tabla equivalente en Supabase? → Verificar SQL
- [ ] ¿Existe la función/endpoint en Supabase? → Verificar API  
- [ ] ¿Los datos de prueba existen? → Verificar registros

### PASO 4: Implementación Conservadora
- [ ] Usar SOLO lo que está confirmado que existe
- [ ] Hacer placeholders para funcionalidades pendientes
- [ ] Probar cada función antes de continuar
- [ ] Documentar limitaciones encontradas

## ❌ ERRORES CRÍTICOS A EVITAR

### 1. Asumir que v1 Funcionaba Bien
```javascript
// ❌ MALO - Copiar código de v1 React sin verificar
const { data } = await axios.post('/api/ingresos', {
    usuario_id: user.id,
    monto: 50000
});

// ✅ BUENO - Verificar primero que endpoint funciona
// 1. ¿El endpoint /api/ingresos funcionaba en Railway?
// 2. ¿Existe la tabla ingresos en Supabase?
// 3. ¿El usuario puede insertar datos?
const { data, error } = await supabase
    .from('ingresos')
    .insert({ usuario_id: user.id, monto: 50000 });
if (error) console.log('Error verificado:', error);
```

### 2. Usar Endpoints No Confirmados de Supabase
```javascript
// ❌ MALO - Asumir que función existe
const balance = await supabase.rpc('calcular_balance_mensual', {
    p_usuario_id: user.id
});

// ✅ BUENO - Verificar función existe primero
// 1. SELECT * FROM pg_proc WHERE proname = 'calcular_balance_mensual';
// 2. Si no existe, usar consulta básica:
const ingresos = await supabase.from('ingresos').select('monto');
const gastos = await supabase.from('gastos').select('monto');
const balance = ingresos.sum - gastos.sum; // Cálculo manual
```

### 3. Complicar la Migración
```javascript
// ❌ MALO - Implementar funcionalidades complejas de v1 que fallaban
import { Chart.js, D3.js, ComplexLibrary } from 'somewhere'

// ✅ BUENO - Funcionalidad básica primero
// Si v1 tenía gráficos complejos que fallaban, usar:
<div>Balance: $${balance}</div>  // HTML simple que funciona
```

### 4. No Verificar Datos de Prueba
```javascript
// ❌ MALO - Asumir que hay datos
const user = await getUser(); // ¿Existe usuario?
const ingresos = user.ingresos; // ¿Tiene ingresos?

// ✅ BUENO - Verificar datos existen
const user = await getUser();
if (!user) return 'Usuario no encontrado';
const ingresos = user.ingresos || []; // Fallback
if (ingresos.length === 0) return 'No hay ingresos registrados';
```

## ✅ FLUJO DE MIGRACIÓN CORRECTO

### Para Cada Módulo de v1→v2:

1. **📋 Leer este documento**
2. **🔍 Verificar funcionalidad en v1** (Railway)
3. **🗄️ Verificar recursos en Supabase** (tablas/funciones)
4. **📝 Mapear equivalencias v1→v2**
5. **🛠️ Implementar versión SIMPLE en v2**
6. **🧪 Probar con datos reales**
7. **📚 Documentar limitaciones/pendientes**

### Preguntas Obligatorias v1→v2:
- ¿Esta función funcionaba en v1? → Probar en Railway
- ¿Esta tabla existe en Supabase? → SELECT table_name...
- ¿Esta política RLS está activa? → Verificar policies
- ¿Este usuario puede hacer esta operación? → Probar auth

## 🎯 MÓDULOS DE MIGRACIÓN v1→v2

| Módulo v1 | Estado v1 | Migración v2 | Tiempo |
|-----------|-----------|--------------|--------|
| **Auth (FastAPI)** | ⚠️ Problemas JWT | ✅ Supabase Auth | 45 min |
| **Dashboard (React)** | ⚠️ Conectividad | 🔄 HTML + JS | 90 min |
| **CRUD Ingresos** | ❌ DB Errors | 🔄 Supabase API | 60 min |
| **CRUD Gastos** | ❌ DB Errors | 🔄 Supabase API | 60 min |
| **Simulador** | ✅ Funcionaba | 🔄 Función SQL | 45 min |
| **Reportes** | ❌ No funcionaba | 🔄 Queries SQL | 30 min |

## 🚨 RECORDATORIOS ESPECÍFICOS

### Backend (Supabase):
- ✅ Las tablas deben crearse ANTES de usarlas
- ✅ Las políticas RLS deben configurarse ANTES de insertar
- ✅ Las funciones SQL deben probarse ANTES de llamarlas
- ✅ La autenticación debe verificarse en CADA operación

### Frontend (HTML+JS):
- ✅ Los scripts deben cargarse ANTES de usarlos
- ✅ Las variables deben definirse ANTES de referenciarlas  
- ✅ Los elementos DOM deben existir ANTES de manipularlos
- ✅ Los eventos deben attacharse DESPUÉS de crear elementos

### Migración v1→v2:
- ✅ La funcionalidad v1 debe PROBARSE antes de migrar
- ✅ La equivalencia v2 debe EXISTIR antes de implementar
- ✅ Los datos de prueba deben CREARSE antes de probar
- ✅ La funcionalidad debe SER MÁS SIMPLE que v1

## 🔧 COMANDOS DE VERIFICACIÓN

### Verificar v1 (Railway):
```bash
# Backend funcionando?
curl -I https://gestion-presupuesto-production.up.railway.app/

# Database conectada?
curl https://gestion-presupuesto-production.up.railway.app/debug/db

# Endpoints específicos?
curl -X POST https://gestion-presupuesto-production.up.railway.app/auth/login
```

### Verificar v2 (Supabase):
```sql
-- Tablas creadas?
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Políticas activas?
SELECT * FROM pg_policies;

-- Funciones disponibles?
SELECT proname FROM pg_proc WHERE pronamespace = 'public'::regnamespace;
```

### Verificar Frontend:
```javascript
// Supabase conectado?
console.log('Supabase client:', window.supabase);

// Usuario autenticado?
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);

// Datos disponibles?
const { data } = await supabase.from('ingresos').select('count');
console.log('Data count:', data);
```

## 🚨 RECORDATORIO FINAL DE MIGRACIÓN

**ANTES DE MIGRAR CUALQUIER FUNCIONALIDAD:**
1. ✅ ¿He verificado que funcionaba en v1?
2. ✅ ¿He confirmado que existe el equivalente en v2?
3. ✅ ¿He leído este documento de metodología?
4. ✅ ¿Estoy manteniendo la versión MÁS SIMPLE posible?
5. ✅ ¿He probado con datos reales?

---

**Regla de Oro: Si v1 no funcionaba bien, v2 debe ser MÁS SIMPLE, no más complejo.**

**Si tienes dudas sobre v1, prueba primero. Si no existe en v2, créalo primero. Si no funciona, simplifica.**

*Última actualización: Septiembre 4, 2025 - Migración v1→v2*
