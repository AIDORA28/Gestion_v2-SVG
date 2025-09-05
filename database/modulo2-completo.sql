-- 🗄️ MÓDULO 2: SCRIPT COMPLETO BASE DE DATOS
-- Ejecutar en Supabase SQL Editor paso a paso

-- ====================================================================
-- PASO 1: VERIFICAR ESTADO ACTUAL
-- ====================================================================

-- Verificar tablas existentes
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- ====================================================================
-- PASO 2: CREAR TABLAS PRINCIPALES  
-- ====================================================================

-- 👤 TABLA: perfiles_usuario
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

-- Índices para perfiles_usuario
CREATE INDEX idx_perfiles_dni ON perfiles_usuario(dni) WHERE dni IS NOT NULL;
CREATE INDEX idx_perfiles_created ON perfiles_usuario(created_at DESC);

-- 💰 TABLA: ingresos
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

-- Índices para ingresos
CREATE INDEX idx_ingresos_usuario_fecha ON ingresos(usuario_id, fecha DESC);
CREATE INDEX idx_ingresos_categoria ON ingresos(categoria);
CREATE INDEX idx_ingresos_monto ON ingresos(monto DESC);

-- 💸 TABLA: gastos
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

-- Índices para gastos
CREATE INDEX idx_gastos_usuario_fecha ON gastos(usuario_id, fecha DESC);
CREATE INDEX idx_gastos_categoria ON gastos(categoria);
CREATE INDEX idx_gastos_monto ON gastos(monto DESC);

-- 🏦 TABLA: simulaciones_credito
CREATE TABLE simulaciones_credito (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre_simulacion TEXT NOT NULL CHECK (char_length(nombre_simulacion) >= 3),
    monto_prestamo DECIMAL(12,2) NOT NULL CHECK (monto_prestamo > 0),
    tasa_interes DECIMAL(5,2) NOT NULL CHECK (tasa_interes > 0 AND tasa_interes <= 100),
    plazo_meses INTEGER NOT NULL CHECK (plazo_meses > 0 AND plazo_meses <= 600),
    cuota_mensual DECIMAL(12,2) NOT NULL CHECK (cuota_mensual > 0),
    total_intereses DECIMAL(12,2) NOT NULL CHECK (total_intereses >= 0),
    total_pagar DECIMAL(12,2) NOT NULL CHECK (total_pagar > monto_prestamo),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para simulaciones
CREATE INDEX idx_simulaciones_usuario_fecha ON simulaciones_credito(usuario_id, created_at DESC);

-- ====================================================================
-- PASO 3: CONFIGURAR SEGURIDAD RLS
-- ====================================================================

-- Habilitar Row Level Security
ALTER TABLE perfiles_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingresos ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulaciones_credito ENABLE ROW LEVEL SECURITY;

-- Crear políticas de seguridad
CREATE POLICY "usuarios_solo_su_perfil" ON perfiles_usuario
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "usuarios_solo_sus_ingresos" ON ingresos  
    FOR ALL USING (auth.uid() = usuario_id);

CREATE POLICY "usuarios_solo_sus_gastos" ON gastos
    FOR ALL USING (auth.uid() = usuario_id);

CREATE POLICY "usuarios_solo_sus_simulaciones" ON simulaciones_credito
    FOR ALL USING (auth.uid() = usuario_id);

-- ====================================================================
-- PASO 4: FUNCIONES DE TRIGGER PARA updated_at
-- ====================================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_perfiles_usuario_updated_at 
    BEFORE UPDATE ON perfiles_usuario 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_ingresos_updated_at 
    BEFORE UPDATE ON ingresos 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_gastos_updated_at 
    BEFORE UPDATE ON gastos 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ====================================================================
-- PASO 5: VERIFICACIÓN FINAL
-- ====================================================================

-- Resumen de tablas creadas
SELECT 
    t.table_name,
    COUNT(c.column_name) as columnas,
    CASE WHEN p.tablename IS NOT NULL THEN 'RLS Habilitado' ELSE 'RLS Deshabilitado' END as seguridad
FROM information_schema.tables t
LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
LEFT JOIN pg_tables p ON t.table_name = p.tablename AND p.rowsecurity = true
WHERE t.table_schema = 'public' 
  AND t.table_name IN ('perfiles_usuario', 'ingresos', 'gastos', 'simulaciones_credito')
GROUP BY t.table_name, p.tablename
ORDER BY t.table_name;

-- Verificar políticas creadas
SELECT schemaname, tablename, policyname
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Verificar índices creados
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('perfiles_usuario', 'ingresos', 'gastos', 'simulaciones_credito')
ORDER BY tablename, indexname;

-- ====================================================================
-- RESULTADO ESPERADO:
-- - 4 tablas con RLS habilitado
-- - 4 políticas de seguridad
-- - 9 índices totales (2+3+3+1)
-- - 3 triggers para updated_at
-- ====================================================================

-- 🎯 MÓDULO 2 COMPLETADO ✅
-- Siguiente: Ejecutar datos de prueba con usuario real
