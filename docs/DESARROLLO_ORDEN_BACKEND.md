# 🏗️ DESARROLLO MODULAR BACKEND - SUPABASE

## 📋 **Stack Tecnológico Equivalente a v1**

### **Comparación: FastAPI + MongoDB → Supabase + PostgreSQL**
```
v1 (Complejo):                    v2 (Simplificado):
FastAPI Server         →          Supabase API (Automática)
MongoDB Atlas          →          PostgreSQL (Managed)
Motor (Async Driver)   →          Supabase Client
JWT Auth Manual        →          Supabase Auth (Built-in)
Pydantic Validation    →          PostgreSQL Constraints
CORS Middleware        →          Supabase CORS (Automático)
```

## 🎯 **MÓDULOS DE DESARROLLO BACKEND**

### **MÓDULO 1: CONFIGURACIÓN BASE Y AUTENTICACIÓN** ⏱️ (45 min)

#### **1.1 Crear Proyecto Supabase (10 min)**
```bash
# Pasos:
1. Ir a https://supabase.com
2. Crear cuenta / Login
3. "New Project" 
4. Nombre: "gestion-financiera-v2"
5. Región: "East US" (más cercana)
6. Password: [Generar fuerte]
7. Esperar setup (2-3 min)
```

#### **1.2 Obtener Credenciales (5 min)**
```javascript
// Ubicación: Settings > API
PROJECT_URL: https://[tu-id].supabase.co
ANON_KEY: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
SERVICE_ROLE_KEY: [Solo para admin - NO usar en frontend]
```

#### **1.3 Configurar Autenticación (15 min)**
```sql
-- En Supabase SQL Editor, configurar:
-- Authentication > Settings
1. Enable email confirmations: ✅ ON
2. Enable secure password requirements: ✅ ON  
3. Site URL: http://localhost:3000 (para desarrollo)
4. Redirect URLs: http://localhost:3000/dashboard

-- Providers habilitados:
✅ Email/Password
❌ Google (opcional para después)
```

#### **1.4 Probar Conexión Básica (15 min)**
```javascript
// Test básico en consola del browser:
const { createClient } = supabase
const supabaseClient = createClient(
  'https://tu-proyecto.supabase.co',
  'tu-anon-key'
)

// Probar conexión
const test = await supabaseClient.from('users').select('count')
console.log('✅ Conectado:', test)
```

---

### **MÓDULO 2: BASE DE DATOS Y TABLAS** ⏱️ (60 min)

#### **2.1 Crear Tabla Perfiles Usuario (15 min)**
```sql
-- Ejecutar en Supabase SQL Editor
CREATE TABLE perfiles_usuario (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL CHECK (char_length(nombre) >= 2),
    apellido TEXT NOT NULL CHECK (char_length(apellido) >= 2),
    telefono TEXT,
    dni TEXT UNIQUE,
    edad INTEGER CHECK (edad >= 18 AND edad <= 120),
    ocupacion TEXT,
    estado_civil TEXT CHECK (estado_civil IN ('soltero', 'casado', 'divorciado', 'viudo')),
    dependientes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_perfiles_dni ON perfiles_usuario(dni);
CREATE INDEX idx_perfiles_created ON perfiles_usuario(created_at);
```

#### **2.2 Crear Tabla Ingresos (15 min)**
```sql
CREATE TABLE ingresos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL CHECK (char_length(descripcion) >= 3),
    monto DECIMAL(12,2) NOT NULL CHECK (monto > 0),
    categoria TEXT NOT NULL DEFAULT 'otros' CHECK (
        categoria IN ('salario', 'freelance', 'inversiones', 'negocio', 'otros')
    ),
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_ingresos_usuario_fecha ON ingresos(usuario_id, fecha DESC);
CREATE INDEX idx_ingresos_categoria ON ingresos(categoria);
```

#### **2.3 Crear Tabla Gastos (15 min)**
```sql
CREATE TABLE gastos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL CHECK (char_length(descripcion) >= 3),
    monto DECIMAL(12,2) NOT NULL CHECK (monto > 0),
    categoria TEXT NOT NULL DEFAULT 'otros' CHECK (
        categoria IN ('alimentacion', 'transporte', 'vivienda', 'salud', 'entretenimiento', 'otros')
    ),
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_gastos_usuario_fecha ON gastos(usuario_id, fecha DESC);
CREATE INDEX idx_gastos_categoria ON gastos(categoria);
```

#### **2.4 Crear Tabla Simulaciones (15 min)**
```sql
CREATE TABLE simulaciones_credito (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre_simulacion TEXT NOT NULL,
    monto_prestamo DECIMAL(12,2) NOT NULL CHECK (monto_prestamo > 0),
    tasa_interes DECIMAL(5,2) NOT NULL CHECK (tasa_interes > 0),
    plazo_meses INTEGER NOT NULL CHECK (plazo_meses > 0),
    cuota_mensual DECIMAL(12,2) NOT NULL,
    total_intereses DECIMAL(12,2) NOT NULL,
    total_pagar DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice
CREATE INDEX idx_simulaciones_usuario ON simulaciones_credito(usuario_id, created_at DESC);
```

---

### **MÓDULO 3: SEGURIDAD RLS (ROW LEVEL SECURITY)** ⏱️ (30 min)

#### **3.1 Habilitar RLS en Todas las Tablas (5 min)**
```sql
-- Habilitar Row Level Security
ALTER TABLE perfiles_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingresos ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulaciones_credito ENABLE ROW LEVEL SECURITY;
```

#### **3.2 Políticas para Perfiles Usuario (10 min)**
```sql
-- Solo el usuario puede ver/editar su perfil
CREATE POLICY "usuarios_solo_su_perfil" ON perfiles_usuario
    FOR ALL USING (auth.uid() = id);
```

#### **3.3 Políticas para Ingresos y Gastos (10 min)**
```sql
-- Solo el usuario puede ver/editar sus ingresos
CREATE POLICY "usuarios_solo_sus_ingresos" ON ingresos
    FOR ALL USING (auth.uid() = usuario_id);

-- Solo el usuario puede ver/editar sus gastos  
CREATE POLICY "usuarios_solo_sus_gastos" ON gastos
    FOR ALL USING (auth.uid() = usuario_id);
```

#### **3.4 Políticas para Simulaciones (5 min)**
```sql
-- Solo el usuario puede ver/editar sus simulaciones
CREATE POLICY "usuarios_solo_sus_simulaciones" ON simulaciones_credito
    FOR ALL USING (auth.uid() = usuario_id);
```

---

### **MÓDULO 4: FUNCIONES DE NEGOCIO** ⏱️ (45 min)

#### **4.1 Función Calcular Balance (15 min)**
```sql
CREATE OR REPLACE FUNCTION calcular_balance_mensual(
    p_usuario_id UUID,
    p_year INTEGER,
    p_month INTEGER
)
RETURNS JSON AS $$
DECLARE
    total_ingresos DECIMAL(12,2);
    total_gastos DECIMAL(12,2);
BEGIN
    -- Validar autorización
    IF auth.uid() != p_usuario_id THEN
        RAISE EXCEPTION 'Sin autorización';
    END IF;
    
    -- Calcular ingresos del mes
    SELECT COALESCE(SUM(monto), 0) INTO total_ingresos
    FROM ingresos 
    WHERE usuario_id = p_usuario_id 
    AND EXTRACT(YEAR FROM fecha) = p_year
    AND EXTRACT(MONTH FROM fecha) = p_month;
    
    -- Calcular gastos del mes
    SELECT COALESCE(SUM(monto), 0) INTO total_gastos
    FROM gastos 
    WHERE usuario_id = p_usuario_id 
    AND EXTRACT(YEAR FROM fecha) = p_year
    AND EXTRACT(MONTH FROM fecha) = p_month;
    
    RETURN json_build_object(
        'ingresos', total_ingresos,
        'gastos', total_gastos,
        'balance', total_ingresos - total_gastos
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### **4.2 Función Simulador de Crédito (20 min)**
```sql
CREATE OR REPLACE FUNCTION calcular_credito(
    p_monto DECIMAL(12,2),
    p_tasa_anual DECIMAL(5,2),
    p_plazo_meses INTEGER
)
RETURNS JSON AS $$
DECLARE
    tasa_mensual DECIMAL(8,6);
    cuota_mensual DECIMAL(12,2);
    total_pagar DECIMAL(12,2);
    total_intereses DECIMAL(12,2);
BEGIN
    -- Convertir tasa anual a mensual
    tasa_mensual := p_tasa_anual / 100 / 12;
    
    -- Calcular cuota mensual (fórmula de amortización)
    cuota_mensual := p_monto * (tasa_mensual * POWER(1 + tasa_mensual, p_plazo_meses)) / 
                     (POWER(1 + tasa_mensual, p_plazo_meses) - 1);
    
    total_pagar := cuota_mensual * p_plazo_meses;
    total_intereses := total_pagar - p_monto;
    
    RETURN json_build_object(
        'cuota_mensual', ROUND(cuota_mensual, 2),
        'total_pagar', ROUND(total_pagar, 2),
        'total_intereses', ROUND(total_intereses, 2)
    );
END;
$$ LANGUAGE plpgsql;
```

#### **4.3 Función Resumen Financiero (10 min)**
```sql
CREATE OR REPLACE FUNCTION obtener_resumen_usuario(p_usuario_id UUID)
RETURNS JSON AS $$
DECLARE
    resumen JSON;
BEGIN
    IF auth.uid() != p_usuario_id THEN
        RAISE EXCEPTION 'Sin autorización';
    END IF;
    
    SELECT json_build_object(
        'balance_mes_actual', (
            SELECT COALESCE(SUM(i.monto), 0) - COALESCE(SUM(g.monto), 0)
            FROM ingresos i
            FULL OUTER JOIN gastos g ON DATE_TRUNC('month', i.fecha) = DATE_TRUNC('month', g.fecha)
            WHERE (i.usuario_id = p_usuario_id OR g.usuario_id = p_usuario_id)
            AND (DATE_TRUNC('month', i.fecha) = DATE_TRUNC('month', CURRENT_DATE)
                 OR DATE_TRUNC('month', g.fecha) = DATE_TRUNC('month', CURRENT_DATE))
        ),
        'total_ingresos', (SELECT COALESCE(SUM(monto), 0) FROM ingresos WHERE usuario_id = p_usuario_id),
        'total_gastos', (SELECT COALESCE(SUM(monto), 0) FROM gastos WHERE usuario_id = p_usuario_id)
    ) INTO resumen;
    
    RETURN resumen;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### **MÓDULO 5: TESTING Y VALIDACIÓN** ⏱️ (30 min)

#### **5.1 Crear Usuario de Prueba (10 min)**
```javascript
// En consola del browser:
const { data, error } = await supabaseClient.auth.signUp({
    email: 'test@ejemplo.com',
    password: 'Test123456!'
});

console.log('Usuario creado:', data);
```

#### **5.2 Probar CRUD de Perfiles (10 min)**
```javascript
// Crear perfil
const { data: perfil, error } = await supabaseClient
    .from('perfiles_usuario')
    .insert({
        id: data.user.id,
        nombre: 'Juan',
        apellido: 'Pérez',
        dni: '12345678',
        edad: 30
    });

console.log('Perfil creado:', perfil);
```

#### **5.3 Probar CRUD de Ingresos/Gastos (10 min)**
```javascript
// Agregar ingreso
const { data: ingreso } = await supabaseClient
    .from('ingresos')
    .insert({
        usuario_id: data.user.id,
        descripcion: 'Salario Enero',
        monto: 50000,
        categoria: 'salario'
    });

// Agregar gasto
const { data: gasto } = await supabaseClient
    .from('gastos')
    .insert({
        usuario_id: data.user.id,
        descripcion: 'Supermercado',
        monto: 15000,
        categoria: 'alimentacion'
    });

console.log('Transacciones:', { ingreso, gasto });
```

---

### **MÓDULO 6: ENDPOINTS AUTOMÁTICOS DISPONIBLES** ⏱️ (15 min)

#### **6.1 Endpoints de Autenticación**
```javascript
// Base URL: https://tu-proyecto.supabase.co/auth/v1

// Registro
POST /signup
Body: { email, password }

// Login  
POST /token?grant_type=password
Body: { email, password }

// Logout
POST /logout
Headers: { Authorization: "Bearer jwt-token" }

// Usuario actual
GET /user
Headers: { Authorization: "Bearer jwt-token" }
```

#### **6.2 Endpoints CRUD Automáticos**
```javascript
// Base URL: https://tu-proyecto.supabase.co/rest/v1

// PERFILES
GET    /perfiles_usuario?id=eq.{user_id}
POST   /perfiles_usuario
PATCH  /perfiles_usuario?id=eq.{user_id}
DELETE /perfiles_usuario?id=eq.{user_id}

// INGRESOS
GET    /ingresos?usuario_id=eq.{user_id}
GET    /ingresos?usuario_id=eq.{user_id}&categoria=eq.salario
POST   /ingresos
PATCH  /ingresos?id=eq.{record_id}&usuario_id=eq.{user_id}
DELETE /ingresos?id=eq.{record_id}&usuario_id=eq.{user_id}

// GASTOS (igual estructura que ingresos)
GET    /gastos?usuario_id=eq.{user_id}
POST   /gastos
PATCH  /gastos?id=eq.{record_id}&usuario_id=eq.{user_id}
DELETE /gastos?id=eq.{record_id}&usuario_id=eq.{user_id}

// SIMULACIONES
GET    /simulaciones_credito?usuario_id=eq.{user_id}
POST   /simulaciones_credito
PATCH  /simulaciones_credito?id=eq.{record_id}&usuario_id=eq.{user_id}
DELETE /simulaciones_credito?id=eq.{record_id}&usuario_id=eq.{user_id}
```

#### **6.3 Llamar Funciones Personalizadas**
```javascript
// Calcular balance mensual
const { data } = await supabaseClient.rpc('calcular_balance_mensual', {
    p_usuario_id: user.id,
    p_year: 2025,
    p_month: 9
});

// Simular crédito
const { data } = await supabaseClient.rpc('calcular_credito', {
    p_monto: 100000,
    p_tasa_anual: 12,
    p_plazo_meses: 24
});

// Obtener resumen
const { data } = await supabaseClient.rpc('obtener_resumen_usuario', {
    p_usuario_id: user.id
});
```

---

## 📊 **RESUMEN DE MÓDULOS BACKEND**

| Módulo | Funcionalidad | Tiempo | Equivalencia v1 |
|--------|---------------|--------|-----------------|
| **1** | Setup + Auth | 45 min | FastAPI setup + JWT auth |
| **2** | Tablas DB | 60 min | MongoDB collections + models |
| **3** | Seguridad RLS | 30 min | Middleware auth + validation |
| **4** | Funciones | 45 min | Endpoints personalizados |
| **5** | Testing | 30 min | API testing |
| **6** | Docs API | 15 min | FastAPI auto-docs |

### **⏱️ TIEMPO TOTAL: 3 horas y 45 minutos**

---

## 🚀 **Ventajas vs v1 MongoDB + FastAPI**

### **✅ Supabase (v2) Ventajas:**
- 🟢 **Setup automático**: 45 min vs 4+ horas
- 🟢 **API automática**: Sin código vs 20+ endpoints manuales
- 🟢 **Auth incluida**: JWT automático vs implementación manual
- 🟢 **RLS automática**: Seguridad vs middleware complejo
- 🟢 **Dashboard admin**: UI incluida vs construcción manual
- 🟢 **Backups automáticos**: Incluidos vs configuración manual
- 🟢 **Escalabilidad**: Automática vs configuración manual

### **❌ v1 (MongoDB + FastAPI) Problemas:**
- 🔴 SSL/TLS handshake errors constantes
- 🔴 Configuración compleja de Atlas
- 🔴 Múltiples servicios para mantener
- 🔴 Debugging complejo en producción
- 🔴 Costos ocultos de infraestructura

---

## 🎯 **Siguiente Paso:**
Revisar **DESARROLLO_ORDEN_FRONTEND.md** para implementar la interfaz que consumirá estos endpoints automáticos.

### **Fase 2: Diseño de Esquema (45 min)**

#### **Tabla: usuarios**
```sql
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
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
```

#### **Tabla: ingresos**
```sql
CREATE TABLE ingresos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL,
    monto DECIMAL(12,2) NOT NULL,
    categoria TEXT NOT NULL,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    es_recurrente BOOLEAN DEFAULT FALSE,
    frecuencia_dias INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **Tabla: gastos**
```sql
CREATE TABLE gastos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL,
    monto DECIMAL(12,2) NOT NULL,
    categoria TEXT NOT NULL,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    es_recurrente BOOLEAN DEFAULT FALSE,
    frecuencia_dias INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **Tabla: simulaciones_credito**
```sql
CREATE TABLE simulaciones_credito (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    monto_prestamo DECIMAL(12,2) NOT NULL,
    tasa_interes DECIMAL(5,2) NOT NULL,
    plazo_meses INTEGER NOT NULL,
    cuota_mensual DECIMAL(12,2) NOT NULL,
    total_intereses DECIMAL(12,2) NOT NULL,
    total_pagar DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Fase 3: Configuración RLS (30 min)**

#### **Políticas de Seguridad**
```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingresos ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulaciones_credito ENABLE ROW LEVEL SECURITY;

-- Política para usuarios (solo pueden ver/editar sus propios datos)
CREATE POLICY "usuarios_policy" ON usuarios
    FOR ALL USING (auth.uid() = id);

-- Política para ingresos
CREATE POLICY "ingresos_policy" ON ingresos
    FOR ALL USING (auth.uid() = usuario_id);

-- Política para gastos
CREATE POLICY "gastos_policy" ON gastos
    FOR ALL USING (auth.uid() = usuario_id);

-- Política para simulaciones
CREATE POLICY "simulaciones_policy" ON simulaciones_credito
    FOR ALL USING (auth.uid() = usuario_id);
```

### **Fase 4: Funciones Personalizadas (45 min)**

#### **Función: Calcular balance mensual**
```sql
CREATE OR REPLACE FUNCTION calcular_balance_mensual(
    p_usuario_id UUID,
    p_year INTEGER,
    p_month INTEGER
)
RETURNS JSON AS $$
DECLARE
    total_ingresos DECIMAL(12,2);
    total_gastos DECIMAL(12,2);
    balance DECIMAL(12,2);
BEGIN
    -- Calcular ingresos del mes
    SELECT COALESCE(SUM(monto), 0) INTO total_ingresos
    FROM ingresos 
    WHERE usuario_id = p_usuario_id 
    AND EXTRACT(YEAR FROM fecha) = p_year
    AND EXTRACT(MONTH FROM fecha) = p_month;
    
    -- Calcular gastos del mes
    SELECT COALESCE(SUM(monto), 0) INTO total_gastos
    FROM gastos 
    WHERE usuario_id = p_usuario_id 
    AND EXTRACT(YEAR FROM fecha) = p_year
    AND EXTRACT(MONTH FROM fecha) = p_month;
    
    balance := total_ingresos - total_gastos;
    
    RETURN json_build_object(
        'ingresos', total_ingresos,
        'gastos', total_gastos,
        'balance', balance,
        'year', p_year,
        'month', p_month
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### **Fase 5: Configuración de Autenticación (20 min)**
1. **Habilitar providers de autenticación**
   - Email/Password
   - Google OAuth (opcional)
   
2. **Configurar templates de email**
   - Confirmación de cuenta
   - Recuperación de contraseña

### **Fase 6: Testing y Validación (30 min)**
1. **Probar endpoints automáticos**
2. **Validar políticas RLS**
3. **Probar autenticación**
4. **Verificar funciones personalizadas**

## ⚙️ **Variables de Entorno**

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

## 🔗 **Endpoints Automáticos Disponibles**

### **Autenticación**
- `POST /auth/v1/signup` - Registro
- `POST /auth/v1/token?grant_type=password` - Login
- `POST /auth/v1/logout` - Logout

### **CRUD Automático**
- `GET /rest/v1/usuarios` - Listar usuarios
- `POST /rest/v1/usuarios` - Crear usuario
- `PATCH /rest/v1/usuarios?id=eq.{id}` - Actualizar usuario
- `DELETE /rest/v1/usuarios?id=eq.{id}` - Eliminar usuario

### **Lo mismo para todas las tablas:** ingresos, gastos, simulaciones_credito

## 🚀 **Ventajas de esta Arquitectura**

1. **Sin código backend** - Todo automático
2. **Escalable** - Supabase maneja millones de usuarios
3. **Seguro** - RLS protege los datos
4. **Tiempo real** - Cambios instantáneos
5. **Mantenimiento cero** - Supabase se encarga de todo

## 📊 **Tiempo Total Estimado: 3 horas**

---

**🎯 Siguiente:** Ver `DESARROLLO_ORDEN_FRONTEND.md`
