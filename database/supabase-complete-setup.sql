-- ===================================================================
-- PLANIFICAPRO - SCRIPT COMPLETO PARA SUPABASE
-- Basado en la estructura extraída de PostgreSQL local
-- ===================================================================

-- 1. Activar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Activar RLS (Row Level Security) para todas las tablas
-- Este será configurado al final

-- ===================================================================
-- TABLA: usuarios (tabla principal)
-- ===================================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre character varying(100) NOT NULL,
    apellido character varying(100) NOT NULL,
    email character varying(255) NOT NULL UNIQUE,
    password_hash character varying(255) NOT NULL,
    dni character varying(20),
    telefono character varying(20),
    direccion text,
    fecha_nacimiento date,
    profesion character varying(100),
    estado_civil character varying(50),
    genero character varying(20),
    nacionalidad character varying(100),
    numero_hijos integer DEFAULT 0,
    email_verified boolean DEFAULT false,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    ingresos_mensuales numeric DEFAULT 0.00,
    gastos_fijos numeric DEFAULT 0.00
);

-- Índices para usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_dni ON usuarios(dni);
CREATE INDEX IF NOT EXISTS idx_usuarios_active ON usuarios(active);
CREATE INDEX IF NOT EXISTS idx_usuarios_created ON usuarios(created_at);

-- ===================================================================
-- TABLA: categorias_personalizadas
-- ===================================================================
CREATE TABLE IF NOT EXISTS categorias_personalizadas (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre character varying(100) NOT NULL,
    tipo text NOT NULL CHECK (tipo IN ('ingreso', 'gasto')),
    color character varying(7) DEFAULT '#6b7280',
    icono character varying(50),
    activa boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(usuario_id, nombre, tipo)
);

-- Índices para categorias_personalizadas
CREATE INDEX IF NOT EXISTS idx_categorias_usuario_tipo ON categorias_personalizadas(usuario_id, tipo);
CREATE INDEX IF NOT EXISTS idx_categorias_activas ON categorias_personalizadas(activa);

-- ===================================================================
-- TABLA: ingresos
-- ===================================================================
CREATE TABLE IF NOT EXISTS ingresos (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    descripcion text NOT NULL,
    monto numeric NOT NULL CHECK (monto >= 0),
    categoria text DEFAULT 'otros',
    fecha date DEFAULT CURRENT_DATE,
    es_recurrente boolean DEFAULT false,
    frecuencia_dias integer CHECK (frecuencia_dias > 0),
    notas text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Índices para ingresos
CREATE INDEX IF NOT EXISTS idx_ingresos_usuario_fecha ON ingresos(usuario_id, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_ingresos_categoria ON ingresos(categoria);
CREATE INDEX IF NOT EXISTS idx_ingresos_monto ON ingresos(monto);
CREATE INDEX IF NOT EXISTS idx_ingresos_recurrentes ON ingresos(es_recurrente) WHERE es_recurrente = true;
CREATE INDEX IF NOT EXISTS idx_ingresos_created ON ingresos(created_at);
CREATE INDEX IF NOT EXISTS idx_ingresos_usuario_fecha_year_month ON ingresos(usuario_id, EXTRACT(YEAR FROM fecha), EXTRACT(MONTH FROM fecha));

-- ===================================================================
-- TABLA: gastos
-- ===================================================================
CREATE TABLE IF NOT EXISTS gastos (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    descripcion text NOT NULL,
    monto numeric NOT NULL CHECK (monto >= 0),
    categoria text DEFAULT 'otros',
    fecha date DEFAULT CURRENT_DATE,
    metodo_pago text DEFAULT 'efectivo',
    es_recurrente boolean DEFAULT false,
    frecuencia_dias integer CHECK (frecuencia_dias > 0),
    notas text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Índices para gastos
CREATE INDEX IF NOT EXISTS idx_gastos_usuario_fecha ON gastos(usuario_id, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_gastos_categoria ON gastos(categoria);
CREATE INDEX IF NOT EXISTS idx_gastos_metodo_pago ON gastos(metodo_pago);
CREATE INDEX IF NOT EXISTS idx_gastos_monto ON gastos(monto);
CREATE INDEX IF NOT EXISTS idx_gastos_recurrentes ON gastos(es_recurrente) WHERE es_recurrente = true;
CREATE INDEX IF NOT EXISTS idx_gastos_created ON gastos(created_at);
CREATE INDEX IF NOT EXISTS idx_gastos_usuario_fecha_year_month ON gastos(usuario_id, EXTRACT(YEAR FROM fecha), EXTRACT(MONTH FROM fecha));

-- ===================================================================
-- TABLA: metas_financieras
-- ===================================================================
CREATE TABLE IF NOT EXISTS metas_financieras (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo character varying(200) NOT NULL,
    descripcion text,
    monto_objetivo numeric NOT NULL CHECK (monto_objetivo > 0),
    monto_actual numeric DEFAULT 0 CHECK (monto_actual >= 0),
    fecha_limite date,
    categoria text DEFAULT 'ahorro',
    activa boolean DEFAULT true,
    completada boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Índices para metas_financieras
CREATE INDEX IF NOT EXISTS idx_metas_usuario ON metas_financieras(usuario_id);
CREATE INDEX IF NOT EXISTS idx_metas_activas ON metas_financieras(activa) WHERE activa = true;
CREATE INDEX IF NOT EXISTS idx_metas_categoria ON metas_financieras(categoria);

-- ===================================================================
-- TABLA: simulaciones_credito
-- ===================================================================
CREATE TABLE IF NOT EXISTS simulaciones_credito (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo_credito text DEFAULT 'personal',
    monto numeric NOT NULL CHECK (monto > 0),
    plazo_meses integer NOT NULL CHECK (plazo_meses > 0),
    tasa_anual numeric NOT NULL CHECK (tasa_anual >= 0),
    cuota_mensual numeric,
    total_intereses numeric,
    total_pagar numeric,
    resultado jsonb,
    guardada boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Índices para simulaciones_credito
CREATE INDEX IF NOT EXISTS idx_simulaciones_usuario_fecha ON simulaciones_credito(usuario_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_simulaciones_tipo ON simulaciones_credito(tipo_credito);
CREATE INDEX IF NOT EXISTS idx_simulaciones_guardadas ON simulaciones_credito(guardada) WHERE guardada = true;

-- ===================================================================
-- TABLA: sesiones (para autenticación)
-- ===================================================================
CREATE TABLE IF NOT EXISTS sesiones (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token_hash character varying(255) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    ip_address inet,
    user_agent text,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

-- Índices para sesiones
CREATE INDEX IF NOT EXISTS idx_sesiones_usuario ON sesiones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_sesiones_token ON sesiones(token_hash);
CREATE INDEX IF NOT EXISTS idx_sesiones_expires ON sesiones(expires_at);
CREATE INDEX IF NOT EXISTS idx_sesiones_active ON sesiones(active) WHERE active = true;

-- ===================================================================
-- TABLA: logs_auditoria (para auditoría del sistema)
-- ===================================================================
CREATE TABLE IF NOT EXISTS logs_auditoria (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id uuid REFERENCES usuarios(id) ON DELETE SET NULL,
    accion character varying(100) NOT NULL,
    tabla_afectada character varying(100),
    registro_id uuid,
    datos_anteriores jsonb,
    datos_nuevos jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT now()
);

-- Índices para logs_auditoria
CREATE INDEX IF NOT EXISTS idx_logs_usuario ON logs_auditoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_logs_accion ON logs_auditoria(accion);
CREATE INDEX IF NOT EXISTS idx_logs_tabla ON logs_auditoria(tabla_afectada);
CREATE INDEX IF NOT EXISTS idx_logs_created ON logs_auditoria(created_at);

-- ===================================================================
-- TRIGGERS PARA UPDATED_AT AUTOMÁTICO
-- ===================================================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para cada tabla que tiene updated_at
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON categorias_personalizadas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ingresos_updated_at BEFORE UPDATE ON ingresos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gastos_updated_at BEFORE UPDATE ON gastos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_metas_updated_at BEFORE UPDATE ON metas_financieras FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_simulaciones_updated_at BEFORE UPDATE ON simulaciones_credito FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- ROW LEVEL SECURITY (RLS) - POLÍTICAS DE SEGURIDAD
-- ===================================================================

-- Activar RLS en todas las tablas principales
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_personalizadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingresos ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE metas_financieras ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulaciones_credito ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs_auditoria ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios (solo pueden ver/editar su propio perfil)
CREATE POLICY "usuarios_policy" ON usuarios
    FOR ALL USING (auth.uid() = id);

-- Políticas para categorias_personalizadas
CREATE POLICY "categorias_policy" ON categorias_personalizadas
    FOR ALL USING (auth.uid() = usuario_id);

-- Políticas para ingresos
CREATE POLICY "ingresos_policy" ON ingresos
    FOR ALL USING (auth.uid() = usuario_id);

-- Políticas para gastos
CREATE POLICY "gastos_policy" ON gastos
    FOR ALL USING (auth.uid() = usuario_id);

-- Políticas para metas_financieras
CREATE POLICY "metas_policy" ON metas_financieras
    FOR ALL USING (auth.uid() = usuario_id);

-- Políticas para simulaciones_credito
CREATE POLICY "simulaciones_policy" ON simulaciones_credito
    FOR ALL USING (auth.uid() = usuario_id);

-- Políticas para sesiones
CREATE POLICY "sesiones_policy" ON sesiones
    FOR ALL USING (auth.uid() = usuario_id);

-- Políticas para logs_auditoria (solo lectura para el propietario)
CREATE POLICY "logs_policy" ON logs_auditoria
    FOR SELECT USING (auth.uid() = usuario_id);

-- ===================================================================
-- FUNCIONES DE NEGOCIO
-- ===================================================================

-- Función para obtener resumen financiero mensual
CREATE OR REPLACE FUNCTION get_resumen_financiero_mensual(
    p_usuario_id uuid,
    p_year integer DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    p_month integer DEFAULT EXTRACT(MONTH FROM CURRENT_DATE)
)
RETURNS jsonb AS $$
DECLARE
    resultado jsonb;
    total_ingresos numeric := 0;
    total_gastos numeric := 0;
    balance numeric := 0;
BEGIN
    -- Calcular total de ingresos del mes
    SELECT COALESCE(SUM(monto), 0) INTO total_ingresos
    FROM ingresos 
    WHERE usuario_id = p_usuario_id 
    AND EXTRACT(YEAR FROM fecha) = p_year 
    AND EXTRACT(MONTH FROM fecha) = p_month;
    
    -- Calcular total de gastos del mes
    SELECT COALESCE(SUM(monto), 0) INTO total_gastos
    FROM gastos 
    WHERE usuario_id = p_usuario_id 
    AND EXTRACT(YEAR FROM fecha) = p_year 
    AND EXTRACT(MONTH FROM fecha) = p_month;
    
    -- Calcular balance
    balance := total_ingresos - total_gastos;
    
    -- Construir resultado
    resultado := jsonb_build_object(
        'year', p_year,
        'month', p_month,
        'total_ingresos', total_ingresos,
        'total_gastos', total_gastos,
        'balance', balance,
        'fecha_calculo', now()
    );
    
    RETURN resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener gastos por categoría
CREATE OR REPLACE FUNCTION get_gastos_por_categoria(
    p_usuario_id uuid,
    p_year integer DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    p_month integer DEFAULT EXTRACT(MONTH FROM CURRENT_DATE)
)
RETURNS TABLE(categoria text, total_monto numeric, cantidad_gastos bigint) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        g.categoria,
        SUM(g.monto) as total_monto,
        COUNT(*) as cantidad_gastos
    FROM gastos g
    WHERE g.usuario_id = p_usuario_id
    AND EXTRACT(YEAR FROM g.fecha) = p_year
    AND EXTRACT(MONTH FROM g.fecha) = p_month
    GROUP BY g.categoria
    ORDER BY total_monto DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener ingresos por categoría
CREATE OR REPLACE FUNCTION get_ingresos_por_categoria(
    p_usuario_id uuid,
    p_year integer DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    p_month integer DEFAULT EXTRACT(MONTH FROM CURRENT_DATE)
)
RETURNS TABLE(categoria text, total_monto numeric, cantidad_ingresos bigint) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.categoria,
        SUM(i.monto) as total_monto,
        COUNT(*) as cantidad_ingresos
    FROM ingresos i
    WHERE i.usuario_id = p_usuario_id
    AND EXTRACT(YEAR FROM i.fecha) = p_year
    AND EXTRACT(MONTH FROM i.fecha) = p_month
    GROUP BY i.categoria
    ORDER BY total_monto DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================================================
-- DATOS INICIALES (OPCIONAL)
-- ===================================================================

-- Las categorías por defecto se insertarán automáticamente cuando cada usuario se registre
-- en la aplicación, por lo que no necesitamos datos iniciales aquí.

-- ===================================================================
-- COMENTARIOS EN TABLAS Y COLUMNAS
-- ===================================================================

COMMENT ON TABLE usuarios IS 'Tabla principal de usuarios del sistema PLANIFICAPRO';
COMMENT ON TABLE categorias_personalizadas IS 'Categorías personalizadas por usuario para clasificar ingresos y gastos';
COMMENT ON TABLE ingresos IS 'Registro de todos los ingresos de los usuarios';
COMMENT ON TABLE gastos IS 'Registro de todos los gastos de los usuarios';
COMMENT ON TABLE metas_financieras IS 'Metas y objetivos financieros de los usuarios';
COMMENT ON TABLE simulaciones_credito IS 'Simulaciones de créditos realizadas por los usuarios';
COMMENT ON TABLE sesiones IS 'Control de sesiones activas de usuarios';
COMMENT ON TABLE logs_auditoria IS 'Registro de auditoría de todas las acciones del sistema';

-- ===================================================================
-- VERIFICACIÓN FINAL
-- ===================================================================

-- Verificar que todas las tablas se crearon correctamente
DO $$
DECLARE
    tabla_count integer;
BEGIN
    SELECT COUNT(*) INTO tabla_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('usuarios', 'categorias_personalizadas', 'ingresos', 'gastos', 
                       'metas_financieras', 'simulaciones_credito', 'sesiones', 'logs_auditoria');
    
    RAISE NOTICE 'Tablas creadas correctamente: %', tabla_count;
    
    IF tabla_count = 8 THEN
        RAISE NOTICE '✅ BASE DE DATOS PLANIFICAPRO CONFIGURADA EXITOSAMENTE';
        RAISE NOTICE '📊 8 tablas principales creadas';
        RAISE NOTICE '🔒 RLS activado y políticas configuradas';
        RAISE NOTICE '⚡ Índices optimizados para rendimiento';
        RAISE NOTICE '🔧 Funciones de negocio implementadas';
    ELSE
        RAISE WARNING '⚠️  Solo se crearon % de 8 tablas esperadas', tabla_count;
    END IF;
END $$;
