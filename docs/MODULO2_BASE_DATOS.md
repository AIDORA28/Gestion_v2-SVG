# 🗄️ MÓDULO 2: BASE DE DATOS Y TABLAS

> **📋 METODOLOGÍA**: Verificar que NO existe nada en Supabase antes de crear

## 🔍 **PASO 1: Verificación Estado Actual**

### **SQL de Verificación (ejecutar en Supabase SQL Editor):**
```sql
-- ✅ VERIFICAR: ¿Qué tablas existen actualmente?
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- ✅ VERIFICAR: ¿Hay datos en auth.users?
SELECT COUNT(*) as usuarios_registrados 
FROM auth.users;

-- ✅ VERIFICAR: ¿Existen políticas RLS?
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

### **Resultado Esperado ANTES de Módulo 2:**
```
table_name: (vacío o solo tablas del sistema)
usuarios_registrados: 0 o pocos usuarios de prueba
policyname: (vacío - sin políticas)
```

---

## 🏗️ **PASO 2: Crear Tablas Principales**

### **2.1 Tabla: perfiles_usuario** ⏱️ (15 min)
```sql
-- 👤 PERFIL DE USUARIO (reemplaza user collection en MongoDB v1)
CREATE TABLE perfiles_usuario (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL CHECK (char_length(nombre) >= 2),
    apellido TEXT NOT NULL CHECK (char_length(apellido) >= 2),
    telefono TEXT,
    dni TEXT UNIQUE,
    edad INTEGER CHECK (edad >= 18 AND edad <= 120),
    ocupacion TEXT,
    estado_civil TEXT CHECK (estado_civil IN ('soltero', 'casado', 'divorciado', 'viudo')),
    dependientes INTEGER DEFAULT 0 CHECK (dependientes >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 📊 Índices para performance
CREATE INDEX idx_perfiles_dni ON perfiles_usuario(dni) WHERE dni IS NOT NULL;
CREATE INDEX idx_perfiles_created ON perfiles_usuario(created_at DESC);

-- 🧪 VERIFICAR CREACIÓN:
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'perfiles_usuario' 
ORDER BY ordinal_position;
```

### **2.2 Tabla: ingresos** ⏱️ (15 min)
```sql  
-- 💰 INGRESOS (reemplaza ingresos collection en MongoDB v1)
CREATE TABLE ingresos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL CHECK (char_length(descripcion) >= 3),
    monto DECIMAL(12,2) NOT NULL CHECK (monto > 0),
    categoria TEXT NOT NULL DEFAULT 'otros' CHECK (
        categoria IN ('salario', 'freelance', 'inversiones', 'negocio', 'pension', 'otros')
    ),
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    es_recurrente BOOLEAN DEFAULT FALSE,
    frecuencia_dias INTEGER CHECK (frecuencia_dias IS NULL OR frecuencia_dias > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 📊 Índices para queries rápidas
CREATE INDEX idx_ingresos_usuario_fecha ON ingresos(usuario_id, fecha DESC);
CREATE INDEX idx_ingresos_categoria ON ingresos(categoria);
CREATE INDEX idx_ingresos_monto ON ingresos(monto DESC);

-- 🧪 VERIFICAR CREACIÓN:
SELECT COUNT(*) as total_columns 
FROM information_schema.columns 
WHERE table_name = 'ingresos';
-- Debe retornar: 10 columns
```

### **2.3 Tabla: gastos** ⏱️ (15 min)
```sql
-- 💸 GASTOS (reemplaza gastos collection en MongoDB v1)  
CREATE TABLE gastos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL CHECK (char_length(descripcion) >= 3),
    monto DECIMAL(12,2) NOT NULL CHECK (monto > 0),
    categoria TEXT NOT NULL DEFAULT 'otros' CHECK (
        categoria IN ('alimentacion', 'transporte', 'vivienda', 'salud', 'entretenimiento', 'educacion', 'servicios', 'otros')
    ),
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    es_recurrente BOOLEAN DEFAULT FALSE,
    frecuencia_dias INTEGER CHECK (frecuencia_dias IS NULL OR frecuencia_dias > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 📊 Índices (misma estructura que ingresos)
CREATE INDEX idx_gastos_usuario_fecha ON gastos(usuario_id, fecha DESC);
CREATE INDEX idx_gastos_categoria ON gastos(categoria);
CREATE INDEX idx_gastos_monto ON gastos(monto DESC);

-- 🧪 VERIFICAR CREACIÓN:
SELECT table_name, constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'gastos' AND constraint_type = 'CHECK';
-- Debe mostrar varios CHECK constraints
```

### **2.4 Tabla: simulaciones_credito** ⏱️ (15 min)
```sql
-- 🏦 SIMULACIONES DE CRÉDITO (nueva funcionalidad, no existía en v1)
CREATE TABLE simulaciones_credito (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre_simulacion TEXT NOT NULL CHECK (char_length(nombre_simulacion) >= 3),
    monto_prestamo DECIMAL(12,2) NOT NULL CHECK (monto_prestamo > 0),
    tasa_interes DECIMAL(5,2) NOT NULL CHECK (tasa_interes > 0 AND tasa_interes <= 100),
    plazo_meses INTEGER NOT NULL CHECK (plazo_meses > 0 AND plazo_meses <= 600), -- max 50 años
    cuota_mensual DECIMAL(12,2) NOT NULL CHECK (cuota_mensual > 0),
    total_intereses DECIMAL(12,2) NOT NULL CHECK (total_intereses >= 0),
    total_pagar DECIMAL(12,2) NOT NULL CHECK (total_pagar > monto_prestamo),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 📊 Índice para consultas por usuario
CREATE INDEX idx_simulaciones_usuario_fecha ON simulaciones_credito(usuario_id, created_at DESC);

-- 🧪 VERIFICAR CREACIÓN:
SELECT column_name, data_type, numeric_precision, numeric_scale
FROM information_schema.columns 
WHERE table_name = 'simulaciones_credito' AND data_type = 'numeric';
-- Debe mostrar columnas DECIMAL con precisión correcta
```

---

## 🔒 **PASO 3: Configurar Seguridad RLS** ⏱️ (10 min)

### **3.1 Habilitar RLS en todas las tablas:**
```sql
-- 🔐 Activar Row Level Security
ALTER TABLE perfiles_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingresos ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulaciones_credito ENABLE ROW LEVEL SECURITY;

-- 🧪 VERIFICAR RLS HABILITADO:
SELECT schemaname, tablename, rowsecurity, forcerowsecurity
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;
-- Debe mostrar las 4 tablas con rowsecurity = true
```

### **3.2 Crear políticas básicas:**
```sql
-- 👤 Solo el usuario puede ver/editar su perfil
CREATE POLICY "usuarios_solo_su_perfil" ON perfiles_usuario
    FOR ALL USING (auth.uid() = id);

-- 💰 Solo el usuario puede ver/editar sus ingresos
CREATE POLICY "usuarios_solo_sus_ingresos" ON ingresos  
    FOR ALL USING (auth.uid() = usuario_id);

-- 💸 Solo el usuario puede ver/editar sus gastos
CREATE POLICY "usuarios_solo_sus_gastos" ON gastos
    FOR ALL USING (auth.uid() = usuario_id);

-- 🏦 Solo el usuario puede ver/editar sus simulaciones
CREATE POLICY "usuarios_solo_sus_simulaciones" ON simulaciones_credito
    FOR ALL USING (auth.uid() = usuario_id);

-- 🧪 VERIFICAR POLÍTICAS CREADAS:
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public';
-- Debe mostrar 4 políticas
```

---

## 🧪 **PASO 4: Insertar Datos de Prueba** ⏱️ (5 min)

### **4.1 Crear usuario de prueba (si no existe):**
```javascript
// Ejecutar en console del browser con test-modulo1.html:
const testUser = await supabaseClient.auth.signUp({
    email: 'usuario.prueba@ejemplo.com',
    password: 'Test123456!'
});
console.log('Usuario prueba:', testUser.data.user.id);
// Guardar el ID para los siguientes inserts
```

### **4.2 Insertar datos de ejemplo:**
```sql
-- ⚠️ CAMBIAR 'USER-UUID-AQUI' por el UUID real del usuario de prueba

-- 👤 Perfil de usuario
INSERT INTO perfiles_usuario (id, nombre, apellido, edad, ocupacion, dependientes) 
VALUES ('USER-UUID-AQUI', 'Juan', 'Pérez', 28, 'Desarrollador', 0);

-- 💰 Ingresos de ejemplo
INSERT INTO ingresos (usuario_id, descripcion, monto, categoria, fecha) VALUES
('USER-UUID-AQUI', 'Salario Enero', 2500000, 'salario', '2025-01-15'),
('USER-UUID-AQUI', 'Freelance Desarrollo Web', 800000, 'freelance', '2025-01-20'),
('USER-UUID-AQUI', 'Dividendos Acciones', 150000, 'inversiones', '2025-01-25');

-- 💸 Gastos de ejemplo  
INSERT INTO gastos (usuario_id, descripcion, monto, categoria, fecha) VALUES
('USER-UUID-AQUI', 'Supermercado', 120000, 'alimentacion', '2025-01-16'),
('USER-UUID-AQUI', 'Transporte Uber', 45000, 'transporte', '2025-01-17'), 
('USER-UUID-AQUI', 'Arriendo apartamento', 800000, 'vivienda', '2025-01-01');

-- 🏦 Simulación de crédito
INSERT INTO simulaciones_credito (usuario_id, nombre_simulacion, monto_prestamo, tasa_interes, plazo_meses, cuota_mensual, total_intereses, total_pagar) 
VALUES ('USER-UUID-AQUI', 'Crédito Vivienda', 50000000, 8.5, 240, 457000, 59680000, 109680000);
```

---

## ✅ **PASO 5: Verificar Módulo 2 Completado**

### **5.1 Queries de Verificación:**
```sql
-- 📊 Resumen de todas las tablas
SELECT 
    t.table_name,
    COUNT(c.column_name) as columnas,
    CASE WHEN p.tablename IS NOT NULL THEN 'RLS Habilitado' ELSE 'RLS Deshabilitado' END as seguridad
FROM information_schema.tables t
LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
LEFT JOIN pg_tables p ON t.table_name = p.tablename AND p.rowsecurity = true
WHERE t.table_schema = 'public' AND t.table_name NOT LIKE '%migrations%'
GROUP BY t.table_name, p.tablename
ORDER BY t.table_name;

-- 💾 Contar registros en cada tabla
SELECT 'perfiles_usuario' as tabla, COUNT(*) as registros FROM perfiles_usuario
UNION ALL
SELECT 'ingresos' as tabla, COUNT(*) as registros FROM ingresos  
UNION ALL
SELECT 'gastos' as tabla, COUNT(*) as registros FROM gastos
UNION ALL
SELECT 'simulaciones_credito' as tabla, COUNT(*) as registros FROM simulaciones_credito;

-- 🔐 Verificar que las políticas bloquean acceso sin autenticación
-- (Debe dar error de política si no hay usuario logueado)
SELECT COUNT(*) FROM ingresos; -- Debería dar error RLS policy violation
```

### **5.2 Checklist Final:**
- [ ] ✅ 4 tablas principales creadas
- [ ] ✅ Índices de performance creados  
- [ ] ✅ RLS habilitado en todas las tablas
- [ ] ✅ 4 políticas de seguridad activas
- [ ] ✅ Datos de prueba insertados
- [ ] ✅ Queries de verificación ejecutadas sin errores

---

## 📊 **RESUMEN MÓDULO 2**

| Tabla | Columnas | Índices | RLS | Datos Prueba | Equivale a v1 |
|-------|----------|---------|-----|--------------|---------------|
| **perfiles_usuario** | 11 | 2 | ✅ | 1 usuario | users collection |
| **ingresos** | 10 | 3 | ✅ | 3 registros | income collection |
| **gastos** | 10 | 3 | ✅ | 3 registros | expenses collection |  
| **simulaciones_credito** | 9 | 1 | ✅ | 1 registro | ❌ Nueva funcionalidad |

### **🎯 Criterios de Éxito:**
- ✅ Base de datos más robusta que MongoDB v1
- ✅ Seguridad RLS automática (mejor que middleware manual)  
- ✅ Índices de performance (más rápido que v1)
- ✅ Constraints de validación (más seguro que v1)

### **⏱️ Tiempo Total: 60 minutos**
### **🚀 Siguiente: Módulo 3 - Funciones de Negocio**

---

*Ejecutar todos los SQLs en Supabase SQL Editor paso a paso*
