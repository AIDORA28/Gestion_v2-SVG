// js/config-test.js - Test alternativo con nuevas credenciales

// OPCIÓN 1: Usar credenciales de proyecto demo/público
const DEMO_SUPABASE_CONFIG = {
    url: 'https://zbzphwrplkhdkrxjthlz.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpienBod3JwbGtoZGtyeGp0aGx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODM2MDQyNzYsImV4cCI6MTk5OTE4MDI3Nn0.abc123def456ghi789' // Key demo
};

// OPCIÓN 2: Configurar nuevas credenciales (recomendado)
const NEW_SUPABASE_CONFIG = {
    // 📋 INSTRUCCIONES PARA OBTENER NUEVAS CREDENCIALES:
    // 1. Ve a https://supabase.com
    // 2. Crea cuenta gratuita o inicia sesión
    // 3. Crea nuevo proyecto: "gestion-financiera"
    // 4. Ve a Settings > API
    // 5. Copia URL y anon/public key
    // 6. Reemplaza estos valores:
    
    url: 'TU_URL_AQUI', // Ejemplo: https://xxxxx.supabase.co
    anonKey: 'TU_ANON_KEY_AQUI' // Ejemplo: eyJhbGciOiJIUzI1NiIs...
};

console.log(`
🔧 CÓMO OBTENER CREDENCIALES VÁLIDAS:

1️⃣ Ir a https://supabase.com
2️⃣ Crear cuenta gratuita
3️⃣ Crear nuevo proyecto: "gestion-financiera-v2"
4️⃣ Esperar que se inicialice (~2 minutos)
5️⃣ Ir a Settings > API
6️⃣ Copiar:
   - Project URL
   - anon/public key
7️⃣ Pegar en config.js

📋 SCHEMA NECESARIO:
Después de obtener credenciales, ejecutar en SQL Editor:

-- Tabla perfiles_usuario
CREATE TABLE perfiles_usuario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT,
    apellido TEXT,
    email TEXT UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla ingresos  
CREATE TABLE ingresos (
    id SERIAL PRIMARY KEY,
    usuario_id UUID REFERENCES perfiles_usuario(id),
    descripcion TEXT,
    categoria TEXT,
    monto DECIMAL(10,2),
    fecha DATE,
    es_recurrente BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla gastos
CREATE TABLE gastos (
    id SERIAL PRIMARY KEY, 
    usuario_id UUID REFERENCES perfiles_usuario(id),
    descripcion TEXT,
    categoria TEXT,
    monto DECIMAL(10,2),
    fecha DATE,
    metodo_pago TEXT DEFAULT 'efectivo',
    es_recurrente BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla simulaciones_credito
CREATE TABLE simulaciones_credito (
    id SERIAL PRIMARY KEY,
    usuario_id UUID REFERENCES perfiles_usuario(id), 
    monto DECIMAL(12,2),
    tasa_interes DECIMAL(5,4),
    plazo_meses INTEGER,
    cuota_mensual DECIMAL(12,2),
    tipo_credito TEXT DEFAULT 'personal',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Políticas RLS (Row Level Security)
ALTER TABLE perfiles_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingresos ENABLE ROW LEVEL SECURITY;  
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulaciones_credito ENABLE ROW LEVEL SECURITY;

-- Política: usuarios solo ven sus propios datos
CREATE POLICY "users_own_profile" ON perfiles_usuario FOR ALL USING (auth.uid() = id);
CREATE POLICY "users_own_ingresos" ON ingresos FOR ALL USING (auth.uid() = usuario_id);
CREATE POLICY "users_own_gastos" ON gastos FOR ALL USING (auth.uid() = usuario_id);  
CREATE POLICY "users_own_simulaciones" ON simulaciones_credito FOR ALL USING (auth.uid() = usuario_id);
`);

export { DEMO_SUPABASE_CONFIG, NEW_SUPABASE_CONFIG };
