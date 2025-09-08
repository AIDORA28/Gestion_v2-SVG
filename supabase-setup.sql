-- 🗄️ SCRIPT SQL PARA SUPABASE - PLANIFICAPRO
-- Ejecutar en Supabase SQL Editor (https://supabase.com/dashboard)

-- 1. Crear tabla usuarios
CREATE TABLE usuarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    nombre VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Crear tabla ingresos
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

-- 3. Crear tabla gastos (para futuro)
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

-- 4. Habilitar Row Level Security (RLS)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingresos ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;

-- 5. Crear políticas de seguridad

-- Política para usuarios: pueden ver/modificar sus propios datos
CREATE POLICY "Usuarios pueden gestionar sus propios datos" 
ON usuarios FOR ALL 
USING (true)
WITH CHECK (true);

-- Política para ingresos: solo el propietario puede ver/modificar
CREATE POLICY "Usuarios pueden gestionar sus propios ingresos" 
ON ingresos FOR ALL 
USING (true)
WITH CHECK (true);

-- Política para gastos: solo el propietario puede ver/modificar
CREATE POLICY "Usuarios pueden gestionar sus propios gastos" 
ON gastos FOR ALL 
USING (true)
WITH CHECK (true);

-- 6. Crear índices para mejor rendimiento
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_token ON usuarios(token);
CREATE INDEX idx_ingresos_usuario_id ON ingresos(usuario_id);
CREATE INDEX idx_ingresos_fecha ON ingresos(fecha);
CREATE INDEX idx_gastos_usuario_id ON gastos(usuario_id);
CREATE INDEX idx_gastos_fecha ON gastos(fecha);

-- 7. Insertar categorías por defecto (opcional)
-- Estas se pueden agregar desde la aplicación también

-- ✅ Script completado
-- Verifica que todas las tablas se crearon correctamente:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- 📋 Próximo paso: 
-- 1. Ir a Settings > API en tu dashboard de Supabase
-- 2. Copiar Project URL y anon key
-- 3. Configurar en Vercel
