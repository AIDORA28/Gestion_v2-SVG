-- ==========================================
-- 03-TABLAS-OPCIONALES.SQL - FUNCIONES AVANZADAS
-- ==========================================
-- Ejecutar TERCERO en Supabase SQL Editor
-- Crea categorías personalizadas, metas financieras y otras funciones opcionales
-- Orden de ejecución: 3º

-- ==========================================
-- 1. TABLA: CATEGORÍAS PERSONALIZADAS
-- ==========================================

CREATE TABLE IF NOT EXISTS categorias_personalizadas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL CHECK (char_length(nombre) >= 2),
    tipo TEXT NOT NULL CHECK (tipo IN ('ingreso', 'gasto')),
    color TEXT DEFAULT '#6366f1' CHECK (color ~ '^#[0-9a-fA-F]{6}$'),
    icono TEXT DEFAULT '💰',
    descripcion TEXT,
    activa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(usuario_id, nombre, tipo)
);

-- Índices para categorias_personalizadas
CREATE INDEX IF NOT EXISTS idx_categorias_usuario_tipo 
    ON categorias_personalizadas(usuario_id, tipo, activa);

CREATE INDEX IF NOT EXISTS idx_categorias_nombre 
    ON categorias_personalizadas(nombre);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_categorias_personalizadas_updated_at ON categorias_personalizadas;
CREATE TRIGGER update_categorias_personalizadas_updated_at
    BEFORE UPDATE ON categorias_personalizadas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 2. TABLA: METAS FINANCIERAS
-- ==========================================

CREATE TABLE IF NOT EXISTS metas_financieras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL CHECK (char_length(nombre) >= 3),
    descripcion TEXT,
    monto_objetivo DECIMAL(12,2) NOT NULL CHECK (monto_objetivo > 0),
    monto_actual DECIMAL(12,2) DEFAULT 0 CHECK (monto_actual >= 0),
    fecha_inicio DATE DEFAULT CURRENT_DATE,
    fecha_objetivo DATE NOT NULL,
    categoria TEXT DEFAULT 'ahorro' CHECK (categoria IN ('ahorro', 'inversion', 'compra', 'viaje', 'emergencia', 'educacion', 'otros')),
    prioridad TEXT DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta')),
    activa BOOLEAN DEFAULT TRUE,
    completada BOOLEAN DEFAULT FALSE,
    porcentaje_completado DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN monto_objetivo > 0 THEN LEAST(100, (monto_actual / monto_objetivo) * 100)
            ELSE 0
        END
    ) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Validaciones
    CONSTRAINT fecha_objetivo_futura CHECK (fecha_objetivo > fecha_inicio),
    CONSTRAINT monto_actual_no_mayor CHECK (monto_actual <= monto_objetivo * 1.1) -- Permitir 10% extra
);

-- Índices para metas_financieras
CREATE INDEX IF NOT EXISTS idx_metas_usuario_activa 
    ON metas_financieras(usuario_id, activa, fecha_objetivo);

CREATE INDEX IF NOT EXISTS idx_metas_categoria_prioridad 
    ON metas_financieras(categoria, prioridad);

CREATE INDEX IF NOT EXISTS idx_metas_completadas 
    ON metas_financieras(completada, porcentaje_completado);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_metas_financieras_updated_at ON metas_financieras;
CREATE TRIGGER update_metas_financieras_updated_at
    BEFORE UPDATE ON metas_financieras
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 3. TABLA: PRESUPUESTOS
-- ==========================================

CREATE TABLE IF NOT EXISTS presupuestos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL CHECK (char_length(nombre) >= 3),
    descripcion TEXT,
    categoria TEXT NOT NULL,
    monto_limite DECIMAL(12,2) NOT NULL CHECK (monto_limite > 0),
    monto_gastado DECIMAL(12,2) DEFAULT 0 CHECK (monto_gastado >= 0),
    periodo TEXT DEFAULT 'mensual' CHECK (periodo IN ('semanal', 'mensual', 'trimestral', 'anual')),
    fecha_inicio DATE DEFAULT CURRENT_DATE,
    fecha_fin DATE,
    activo BOOLEAN DEFAULT TRUE,
    porcentaje_usado DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN monto_limite > 0 THEN LEAST(100, (monto_gastado / monto_limite) * 100)
            ELSE 0
        END
    ) STORED,
    alerta_enviada BOOLEAN DEFAULT FALSE,
    umbral_alerta DECIMAL(5,2) DEFAULT 80 CHECK (umbral_alerta BETWEEN 50 AND 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para presupuestos
CREATE INDEX IF NOT EXISTS idx_presupuestos_usuario_periodo 
    ON presupuestos(usuario_id, periodo, activo);

CREATE INDEX IF NOT EXISTS idx_presupuestos_categoria 
    ON presupuestos(categoria);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_presupuestos_updated_at ON presupuestos;
CREATE TRIGGER update_presupuestos_updated_at
    BEFORE UPDATE ON presupuestos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 4. POLÍTICAS RLS PARA TABLAS OPCIONALES
-- ==========================================

-- Habilitar RLS
ALTER TABLE categorias_personalizadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE metas_financieras ENABLE ROW LEVEL SECURITY;
ALTER TABLE presupuestos ENABLE ROW LEVEL SECURITY;

-- Políticas para categorias_personalizadas
DROP POLICY IF EXISTS "usuarios_solo_sus_categorias" ON categorias_personalizadas;
CREATE POLICY "usuarios_solo_sus_categorias" ON categorias_personalizadas
    FOR ALL USING (auth.uid() = usuario_id);

-- Políticas para metas_financieras
DROP POLICY IF EXISTS "usuarios_solo_sus_metas" ON metas_financieras;
CREATE POLICY "usuarios_solo_sus_metas" ON metas_financieras
    FOR ALL USING (auth.uid() = usuario_id);

-- Políticas para presupuestos
DROP POLICY IF EXISTS "usuarios_solo_sus_presupuestos" ON presupuestos;
CREATE POLICY "usuarios_solo_sus_presupuestos" ON presupuestos
    FOR ALL USING (auth.uid() = usuario_id);

-- ==========================================
-- 5. FUNCIONES HELPER PARA TABLAS OPCIONALES
-- ==========================================

-- Función para actualizar automáticamente el estado de completitud de metas
CREATE OR REPLACE FUNCTION actualizar_estado_meta()
RETURNS TRIGGER AS $$
BEGIN
    -- Marcar como completada si se alcanzó el 100%
    IF NEW.monto_actual >= NEW.monto_objetivo THEN
        NEW.completada = TRUE;
    ELSE
        NEW.completada = FALSE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para calcular días restantes (reemplaza al campo generado)
CREATE OR REPLACE FUNCTION calcular_dias_restantes(fecha_objetivo DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN fecha_objetivo - CURRENT_DATE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger para actualizar estado de metas automáticamente
DROP TRIGGER IF EXISTS trigger_actualizar_estado_meta ON metas_financieras;
CREATE TRIGGER trigger_actualizar_estado_meta
    BEFORE INSERT OR UPDATE ON metas_financieras
    FOR EACH ROW EXECUTE FUNCTION actualizar_estado_meta();

-- Función para obtener categorías por defecto si no tiene personalizadas
CREATE OR REPLACE FUNCTION obtener_categorias_usuario(p_usuario_id UUID, p_tipo TEXT)
RETURNS TABLE(
    id UUID,
    nombre TEXT,
    color TEXT,
    icono TEXT,
    es_personalizada BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    -- Primero las categorías personalizadas del usuario
    SELECT 
        cp.id,
        cp.nombre,
        cp.color,
        cp.icono,
        TRUE as es_personalizada
    FROM categorias_personalizadas cp
    WHERE cp.usuario_id = p_usuario_id 
    AND cp.tipo = p_tipo 
    AND cp.activa = TRUE
    
    UNION ALL
    
    -- Luego las categorías por defecto (solo si no tiene personalizadas)
    SELECT 
        gen_random_uuid() as id,
        categoria_nombre as nombre,
        '#6366f1' as color,
        '📁' as icono,
        FALSE as es_personalizada
    FROM (
        VALUES 
            ('salario'), ('freelance'), ('inversiones'), ('negocio'), ('otros')
    ) AS default_ingresos(categoria_nombre)
    WHERE p_tipo = 'ingreso'
    AND NOT EXISTS (
        SELECT 1 FROM categorias_personalizadas 
        WHERE usuario_id = p_usuario_id AND tipo = 'ingreso' AND activa = TRUE
    )
    
    UNION ALL
    
    SELECT 
        gen_random_uuid() as id,
        categoria_nombre as nombre,
        '#dc2626' as color,
        '💳' as icono,
        FALSE as es_personalizada
    FROM (
        VALUES 
            ('alimentacion'), ('transporte'), ('vivienda'), ('salud'), ('entretenimiento'), ('educacion'), ('otros')
    ) AS default_gastos(categoria_nombre)
    WHERE p_tipo = 'gasto'
    AND NOT EXISTS (
        SELECT 1 FROM categorias_personalizadas 
        WHERE usuario_id = p_usuario_id AND tipo = 'gasto' AND activa = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 6. COMENTARIOS PARA DOCUMENTACIÓN
-- ==========================================

COMMENT ON TABLE categorias_personalizadas IS 'Categorías personalizadas por usuario para ingresos y gastos';
COMMENT ON COLUMN categorias_personalizadas.color IS 'Color hexadecimal para la interfaz (#RRGGBB)';
COMMENT ON COLUMN categorias_personalizadas.icono IS 'Emoji o símbolo para representar la categoría';

COMMENT ON TABLE metas_financieras IS 'Objetivos de ahorro e inversión de los usuarios';
COMMENT ON COLUMN metas_financieras.porcentaje_completado IS 'Porcentaje de progreso calculado automáticamente';

COMMENT ON TABLE presupuestos IS 'Presupuestos por categoría con alertas automáticas';
COMMENT ON COLUMN presupuestos.umbral_alerta IS 'Porcentaje del presupuesto que dispara alerta';

COMMENT ON FUNCTION obtener_categorias_usuario(UUID, TEXT) IS 'Obtiene categorías del usuario o las por defecto si no tiene';

-- ==========================================
-- 7. VERIFICACIÓN DE INSTALACIÓN
-- ==========================================

-- Mostrar tablas opcionales creadas
SELECT 
    table_name as "Tabla Opcional Creada",
    'Activa' as estado
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('categorias_personalizadas', 'metas_financieras', 'presupuestos')
ORDER BY table_name;

-- Mostrar políticas para tablas opcionales
SELECT 
    tablename as tabla,
    COUNT(policyname) as "Políticas Creadas"
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('categorias_personalizadas', 'metas_financieras', 'presupuestos')
GROUP BY tablename
ORDER BY tablename;

-- ==========================================
-- ✅ RESULTADO ESPERADO:
-- - 3 tablas opcionales creadas (categorías, metas, presupuestos)
-- - Campos calculados automáticamente (porcentajes, días)
-- - Triggers para actualización automática
-- - Función helper para categorías por defecto
-- ==========================================

SELECT '✅ PASO 3 COMPLETADO: Tablas opcionales y funciones avanzadas creadas' as resultado;
SELECT 'SIGUIENTE: Ejecutar 04-audit-logs.sql para auditoría y límites' as siguiente_paso;
