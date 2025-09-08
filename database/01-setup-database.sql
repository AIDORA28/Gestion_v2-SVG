-- ==========================================
-- 01-SETUP-DATABASE.SQL - SCRIPT MAESTRO
-- ==========================================
-- Ejecutar PRIMERO en Supabase SQL Editor
-- Crea todas las tablas principales, índices y triggers básicos
-- Orden de ejecución: 1º

-- ==========================================
-- 1. VERIFICACIÓN Y LIMPIEZA (OPCIONAL)
-- ==========================================
-- Ejecutar solo si necesitas empezar desde cero

/*
-- DESCOMENTA SOLO SI NECESITAS BORRAR TODO:
DROP TABLE IF EXISTS logs_auditoria CASCADE;
DROP TABLE IF EXISTS user_limits CASCADE;
DROP TABLE IF EXISTS categorias_personalizadas CASCADE;
DROP TABLE IF EXISTS metas_financieras CASCADE;
DROP TABLE IF EXISTS simulaciones_credito CASCADE;
DROP TABLE IF EXISTS gastos CASCADE;
DROP TABLE IF EXISTS ingresos CASCADE;
DROP TABLE IF EXISTS perfiles_usuario CASCADE;
*/

-- ==========================================
-- 2. TABLAS PRINCIPALES
-- ==========================================

-- 2.1 Perfiles de usuario (extiende auth.users)
CREATE TABLE IF NOT EXISTS perfiles_usuario (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre TEXT,
    apellido TEXT,
    dni TEXT,
    telefono TEXT,
    email TEXT,
    direccion TEXT,
    fecha_nacimiento DATE,
    profesion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.2 Ingresos
CREATE TABLE IF NOT EXISTS ingresos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL CHECK (char_length(descripcion) >= 3),
    monto DECIMAL(12,2) NOT NULL CHECK (monto > 0),
    categoria TEXT DEFAULT 'otros' CHECK (categoria IN ('salario', 'freelance', 'inversiones', 'negocio', 'otros')),
    fecha DATE DEFAULT CURRENT_DATE,
    es_recurrente BOOLEAN DEFAULT FALSE,
    frecuencia_dias INTEGER CHECK (frecuencia_dias > 0),
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.3 Gastos
CREATE TABLE IF NOT EXISTS gastos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL CHECK (char_length(descripcion) >= 3),
    monto DECIMAL(12,2) NOT NULL CHECK (monto > 0),
    categoria TEXT DEFAULT 'otros' CHECK (categoria IN ('alimentacion', 'transporte', 'vivienda', 'salud', 'entretenimiento', 'educacion', 'otros')),
    fecha DATE DEFAULT CURRENT_DATE,
    metodo_pago TEXT DEFAULT 'efectivo' CHECK (metodo_pago IN ('efectivo', 'tarjeta_debito', 'tarjeta_credito', 'transferencia', 'otros')),
    es_recurrente BOOLEAN DEFAULT FALSE,
    frecuencia_dias INTEGER CHECK (frecuencia_dias > 0),
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.4 Simulaciones de crédito
CREATE TABLE IF NOT EXISTS simulaciones_credito (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tipo_credito TEXT DEFAULT 'personal' CHECK (tipo_credito IN ('personal', 'hipotecario', 'vehicular', 'empresarial')),
    monto DECIMAL(12,2) NOT NULL CHECK (monto > 0),
    plazo_meses INTEGER NOT NULL CHECK (plazo_meses > 0 AND plazo_meses <= 480),
    tasa_anual DECIMAL(5,2) NOT NULL CHECK (tasa_anual > 0 AND tasa_anual <= 100),
    cuota_mensual DECIMAL(12,2),
    total_intereses DECIMAL(12,2),
    total_pagar DECIMAL(12,2),
    resultado JSONB,
    guardada BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 3. ÍNDICES PARA PERFORMANCE
-- ==========================================

-- Índices para perfiles_usuario
CREATE INDEX IF NOT EXISTS idx_perfiles_usuario_dni ON perfiles_usuario(dni) WHERE dni IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_perfiles_usuario_email ON perfiles_usuario(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_perfiles_usuario_created ON perfiles_usuario(created_at DESC);

-- Índices para ingresos
CREATE INDEX IF NOT EXISTS idx_ingresos_usuario_fecha ON ingresos(usuario_id, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_ingresos_categoria ON ingresos(categoria);
CREATE INDEX IF NOT EXISTS idx_ingresos_monto ON ingresos(monto DESC);
CREATE INDEX IF NOT EXISTS idx_ingresos_recurrentes ON ingresos(es_recurrente, frecuencia_dias) WHERE es_recurrente = TRUE;
CREATE INDEX IF NOT EXISTS idx_ingresos_created ON ingresos(created_at DESC);

-- Índices para gastos
CREATE INDEX IF NOT EXISTS idx_gastos_usuario_fecha ON gastos(usuario_id, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_gastos_categoria ON gastos(categoria);
CREATE INDEX IF NOT EXISTS idx_gastos_metodo_pago ON gastos(metodo_pago);
CREATE INDEX IF NOT EXISTS idx_gastos_monto ON gastos(monto DESC);
CREATE INDEX IF NOT EXISTS idx_gastos_recurrentes ON gastos(es_recurrente, frecuencia_dias) WHERE es_recurrente = TRUE;
CREATE INDEX IF NOT EXISTS idx_gastos_created ON gastos(created_at DESC);

-- Índices para simulaciones_credito
CREATE INDEX IF NOT EXISTS idx_simulaciones_usuario_fecha ON simulaciones_credito(usuario_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_simulaciones_tipo ON simulaciones_credito(tipo_credito);
CREATE INDEX IF NOT EXISTS idx_simulaciones_guardadas ON simulaciones_credito(guardada) WHERE guardada = TRUE;

-- ==========================================
-- 4. FUNCIÓN Y TRIGGERS PARA updated_at
-- ==========================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS update_perfiles_usuario_updated_at ON perfiles_usuario;
CREATE TRIGGER update_perfiles_usuario_updated_at 
    BEFORE UPDATE ON perfiles_usuario 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ingresos_updated_at ON ingresos;
CREATE TRIGGER update_ingresos_updated_at 
    BEFORE UPDATE ON ingresos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_gastos_updated_at ON gastos;
CREATE TRIGGER update_gastos_updated_at 
    BEFORE UPDATE ON gastos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_simulaciones_updated_at ON simulaciones_credito;
CREATE TRIGGER update_simulaciones_updated_at 
    BEFORE UPDATE ON simulaciones_credito 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 5. COMENTARIOS PARA DOCUMENTACIÓN
-- ==========================================

COMMENT ON TABLE perfiles_usuario IS 'Información adicional de usuarios del sistema financiero';
COMMENT ON COLUMN perfiles_usuario.dni IS 'Documento nacional de identidad';
COMMENT ON COLUMN perfiles_usuario.telefono IS 'Número de teléfono de contacto';

COMMENT ON TABLE ingresos IS 'Registro de ingresos de dinero de los usuarios';
COMMENT ON COLUMN ingresos.es_recurrente IS 'Indica si el ingreso se repite periódicamente';
COMMENT ON COLUMN ingresos.frecuencia_dias IS 'Número de días entre recurrencias (solo si es_recurrente=true)';

COMMENT ON TABLE gastos IS 'Registro de gastos y egresos de los usuarios';
COMMENT ON COLUMN gastos.metodo_pago IS 'Forma de pago utilizada para el gasto';
COMMENT ON COLUMN gastos.es_recurrente IS 'Indica si el gasto se repite periódicamente';

COMMENT ON TABLE simulaciones_credito IS 'Simulaciones de créditos y préstamos realizadas por usuarios';
COMMENT ON COLUMN simulaciones_credito.tasa_anual IS 'Tasa de interés anual en porcentaje';
COMMENT ON COLUMN simulaciones_credito.resultado IS 'Datos detallados del cálculo en formato JSON';

-- ==========================================
-- 6. VERIFICACIÓN DE INSTALACIÓN
-- ==========================================

-- Mostrar tablas creadas
SELECT 
    table_name as "Tabla Creada",
    'Activa' as estado
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('perfiles_usuario', 'ingresos', 'gastos', 'simulaciones_credito')
ORDER BY table_name;

-- Mostrar índices creados
SELECT 
    schemaname,
    tablename,
    indexname as "Índice Creado"
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('perfiles_usuario', 'ingresos', 'gastos', 'simulaciones_credito')
ORDER BY tablename, indexname;

-- Mostrar triggers creados
SELECT 
    event_object_table as "Tabla",
    trigger_name as "Trigger Creado"
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND trigger_name LIKE '%updated_at%'
ORDER BY event_object_table;

-- ==========================================
-- ✅ RESULTADO ESPERADO:
-- - 4 tablas principales creadas
-- - 15+ índices para performance  
-- - 4 triggers para updated_at
-- - Constraints y validaciones aplicadas
-- ==========================================

SELECT '✅ PASO 1 COMPLETADO: Tablas principales y estructura básica creada' as resultado;
SELECT 'SIGUIENTE: Ejecutar 02-policies.sql para habilitar seguridad RLS' as siguiente_paso;
