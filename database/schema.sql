-- ==========================================
-- SCHEMA PRINCIPAL - GESTIÓN FINANCIERA v2
-- ==========================================
-- Ejecutar en Supabase SQL Editor
-- Orden: 1. Este archivo 2. policies.sql 3. functions.sql

-- ==========================================
-- 1. TABLA PERFILES USUARIO
-- ==========================================
-- Extiende la tabla auth.users de Supabase con datos adicionales

CREATE TABLE perfiles_usuario (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL CHECK (char_length(nombre) >= 2),
    apellido TEXT NOT NULL CHECK (char_length(apellido) >= 2),
    telefono TEXT CHECK (telefono ~ '^[0-9+\-\s()]+$'),
    dni TEXT UNIQUE CHECK (char_length(dni) >= 8),
    edad INTEGER CHECK (edad >= 18 AND edad <= 120),
    ocupacion TEXT,
    estado_civil TEXT CHECK (estado_civil IN ('soltero', 'casado', 'divorciado', 'viudo', 'union_libre')),
    dependientes INTEGER DEFAULT 0 CHECK (dependientes >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar performance
CREATE INDEX idx_perfiles_usuario_dni ON perfiles_usuario(dni);
CREATE INDEX idx_perfiles_usuario_created ON perfiles_usuario(created_at);

-- ==========================================
-- 2. TABLA INGRESOS
-- ==========================================

CREATE TABLE ingresos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL CHECK (char_length(descripcion) >= 3),
    monto DECIMAL(12,2) NOT NULL CHECK (monto > 0),
    categoria TEXT NOT NULL DEFAULT 'otros' CHECK (
        categoria IN (
            'salario', 'freelance', 'inversiones', 'negocio', 
            'alquiler', 'pension', 'bono', 'comision', 
            'regalo', 'prestamo_recibido', 'venta', 'otros'
        )
    ),
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    es_recurrente BOOLEAN DEFAULT FALSE,
    frecuencia_dias INTEGER DEFAULT 0 CHECK (
        (es_recurrente = FALSE AND frecuencia_dias = 0) OR
        (es_recurrente = TRUE AND frecuencia_dias > 0)
    ),
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para queries comunes
CREATE INDEX idx_ingresos_usuario_fecha ON ingresos(usuario_id, fecha DESC);
CREATE INDEX idx_ingresos_categoria ON ingresos(categoria);
CREATE INDEX idx_ingresos_recurrentes ON ingresos(es_recurrente, frecuencia_dias) WHERE es_recurrente = TRUE;

-- ==========================================
-- 3. TABLA GASTOS
-- ==========================================

CREATE TABLE gastos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL CHECK (char_length(descripcion) >= 3),
    monto DECIMAL(12,2) NOT NULL CHECK (monto > 0),
    categoria TEXT NOT NULL DEFAULT 'otros' CHECK (
        categoria IN (
            'alimentacion', 'transporte', 'vivienda', 'salud', 
            'educacion', 'entretenimiento', 'ropa', 'tecnologia',
            'servicios', 'impuestos', 'seguros', 'deudas',
            'ahorro', 'inversion', 'regalo', 'viaje', 'otros'
        )
    ),
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    es_recurrente BOOLEAN DEFAULT FALSE,
    frecuencia_dias INTEGER DEFAULT 0 CHECK (
        (es_recurrente = FALSE AND frecuencia_dias = 0) OR
        (es_recurrente = TRUE AND frecuencia_dias > 0)
    ),
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para queries comunes
CREATE INDEX idx_gastos_usuario_fecha ON gastos(usuario_id, fecha DESC);
CREATE INDEX idx_gastos_categoria ON gastos(categoria);
CREATE INDEX idx_gastos_recurrentes ON gastos(es_recurrente, frecuencia_dias) WHERE es_recurrente = TRUE;

-- ==========================================
-- 4. TABLA SIMULACIONES CRÉDITO
-- ==========================================

CREATE TABLE simulaciones_credito (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre_simulacion TEXT NOT NULL CHECK (char_length(nombre_simulacion) >= 3),
    monto_prestamo DECIMAL(12,2) NOT NULL CHECK (monto_prestamo > 0),
    tasa_interes DECIMAL(5,2) NOT NULL CHECK (tasa_interes > 0 AND tasa_interes <= 100),
    plazo_meses INTEGER NOT NULL CHECK (plazo_meses > 0 AND plazo_meses <= 480), -- Max 40 años
    cuota_mensual DECIMAL(12,2) NOT NULL,
    total_intereses DECIMAL(12,2) NOT NULL,
    total_pagar DECIMAL(12,2) NOT NULL,
    tipo_credito TEXT DEFAULT 'personal' CHECK (
        tipo_credito IN ('personal', 'hipotecario', 'vehicular', 'empresarial', 'tarjeta_credito')
    ),
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_simulaciones_usuario ON simulaciones_credito(usuario_id, created_at DESC);
CREATE INDEX idx_simulaciones_tipo ON simulaciones_credito(tipo_credito);

-- ==========================================
-- 5. TABLA CATEGORÍAS PERSONALIZADAS (Opcional)
-- ==========================================

CREATE TABLE categorias_personalizadas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL CHECK (char_length(nombre) >= 2),
    tipo TEXT NOT NULL CHECK (tipo IN ('ingreso', 'gasto')),
    color TEXT DEFAULT '#6b7280', -- Color hex para UI
    icono TEXT DEFAULT 'circle', -- Nombre del icono
    activa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(usuario_id, nombre, tipo)
);

CREATE INDEX idx_categorias_usuario_tipo ON categorias_personalizadas(usuario_id, tipo);

-- ==========================================
-- 6. TABLA METAS FINANCIERAS (Funcionalidad extra)
-- ==========================================

CREATE TABLE metas_financieras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL CHECK (char_length(nombre) >= 3),
    descripcion TEXT,
    monto_objetivo DECIMAL(12,2) NOT NULL CHECK (monto_objetivo > 0),
    monto_actual DECIMAL(12,2) DEFAULT 0 CHECK (monto_actual >= 0),
    fecha_objetivo DATE NOT NULL,
    categoria TEXT DEFAULT 'ahorro',
    activa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_metas_usuario ON metas_financieras(usuario_id, activa, fecha_objetivo);

-- ==========================================
-- 7. TRIGGERS PARA UPDATED_AT
-- ==========================================

-- Función genérica para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas que tienen updated_at
CREATE TRIGGER update_perfiles_usuario_updated_at
    BEFORE UPDATE ON perfiles_usuario
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ingresos_updated_at
    BEFORE UPDATE ON ingresos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gastos_updated_at
    BEFORE UPDATE ON gastos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_simulaciones_updated_at
    BEFORE UPDATE ON simulaciones_credito
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_metas_updated_at
    BEFORE UPDATE ON metas_financieras
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 8. VISTAS ÚTILES
-- ==========================================

-- Vista: Resumen financiero por usuario
CREATE VIEW resumen_financiero AS
SELECT 
    u.id as usuario_id,
    u.email,
    p.nombre,
    p.apellido,
    COALESCE(SUM(i.monto), 0) as total_ingresos,
    COALESCE(SUM(g.monto), 0) as total_gastos,
    COALESCE(SUM(i.monto), 0) - COALESCE(SUM(g.monto), 0) as balance_total,
    COUNT(DISTINCT i.id) as total_transacciones_ingreso,
    COUNT(DISTINCT g.id) as total_transacciones_gasto
FROM auth.users u
LEFT JOIN perfiles_usuario p ON u.id = p.id
LEFT JOIN ingresos i ON u.id = i.usuario_id
LEFT JOIN gastos g ON u.id = g.usuario_id
GROUP BY u.id, u.email, p.nombre, p.apellido;

-- Vista: Transacciones recientes (últimos 30 días)
CREATE VIEW transacciones_recientes AS
(
    SELECT 
        id,
        usuario_id,
        'ingreso' as tipo,
        descripcion,
        monto,
        categoria,
        fecha,
        created_at,
        notas
    FROM ingresos 
    WHERE fecha >= CURRENT_DATE - INTERVAL '30 days'
)
UNION ALL
(
    SELECT 
        id,
        usuario_id,
        'gasto' as tipo,
        descripcion,
        -monto as monto, -- Negativo para gastos
        categoria,
        fecha,
        created_at,
        notas
    FROM gastos 
    WHERE fecha >= CURRENT_DATE - INTERVAL '30 days'
)
ORDER BY fecha DESC, created_at DESC;

-- ==========================================
-- 9. DATOS INICIALES (Opcional)
-- ==========================================

-- Insertar categorías predeterminadas como referencia
-- (Los usuarios pueden crear sus propias categorías personalizadas)

-- ==========================================
-- 10. COMENTARIOS EN TABLAS
-- ==========================================

COMMENT ON TABLE perfiles_usuario IS 'Información adicional de usuarios registrados';
COMMENT ON TABLE ingresos IS 'Registro de ingresos de los usuarios';
COMMENT ON TABLE gastos IS 'Registro de gastos de los usuarios';
COMMENT ON TABLE simulaciones_credito IS 'Simulaciones de crédito guardadas';
COMMENT ON TABLE categorias_personalizadas IS 'Categorías personalizadas por usuario';
COMMENT ON TABLE metas_financieras IS 'Metas de ahorro y financieras';

COMMENT ON COLUMN perfiles_usuario.dni IS 'Documento de identidad único';
COMMENT ON COLUMN ingresos.frecuencia_dias IS 'Días entre recurrencias (solo si es_recurrente=true)';
COMMENT ON COLUMN gastos.frecuencia_dias IS 'Días entre recurrencias (solo si es_recurrente=true)';
COMMENT ON COLUMN simulaciones_credito.tasa_interes IS 'Tasa de interés anual en porcentaje';

-- ==========================================
-- ✅ SCHEMA CREADO EXITOSAMENTE
-- ==========================================
-- Siguiente paso: Ejecutar policies.sql para configurar seguridad RLS
