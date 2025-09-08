-- ==========================================
-- 04-AUDIT-LOGS.SQL - AUDITORÍA Y LÍMITES
-- ==========================================
-- Ejecutar CUARTO en Supabase SQL Editor  
-- Crea sistema de auditoría, logs y límites por usuario
-- Orden de ejecución: 4º

-- ==========================================
-- 1. TABLA: LOGS DE AUDITORÍA
-- ==========================================

CREATE TABLE IF NOT EXISTS logs_auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    accion TEXT NOT NULL CHECK (accion IN (
        'CREATE_INGRESO', 'UPDATE_INGRESO', 'DELETE_INGRESO',
        'CREATE_GASTO', 'UPDATE_GASTO', 'DELETE_GASTO', 
        'CREATE_SIMULACION', 'UPDATE_SIMULACION', 'DELETE_SIMULACION',
        'CREATE_META', 'UPDATE_META', 'DELETE_META',
        'CREATE_CATEGORIA', 'UPDATE_CATEGORIA', 'DELETE_CATEGORIA',
        'CREATE_PRESUPUESTO', 'UPDATE_PRESUPUESTO', 'DELETE_PRESUPUESTO',
        'LOGIN', 'LOGOUT', 'REGISTER', 'UPDATE_PROFILE',
        'EXPORT_DATA', 'IMPORT_DATA', 'API_CALL', 'ERROR', 'SYSTEM_INIT'
    )),
    tabla TEXT NOT NULL,
    registro_id TEXT,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    detalles JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    duracion_ms INTEGER,
    
    -- Índice para búsquedas eficientes
    CONSTRAINT valid_tabla CHECK (tabla IN (
        'ingresos', 'gastos', 'simulaciones_credito', 'metas_financieras', 
        'categorias_personalizadas', 'presupuestos', 'perfiles_usuario', 'auth.users'
    ))
);

-- Índices para logs_auditoria (optimización de consultas)
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_usuario_fecha 
    ON logs_auditoria(usuario_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_logs_auditoria_accion 
    ON logs_auditoria(accion, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_logs_auditoria_tabla 
    ON logs_auditoria(tabla, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_logs_auditoria_success 
    ON logs_auditoria(success, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_logs_auditoria_session 
    ON logs_auditoria(session_id) WHERE session_id IS NOT NULL;

-- ==========================================
-- 2. TABLA: LÍMITES POR USUARIO
-- ==========================================

CREATE TABLE IF NOT EXISTS user_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Límites diarios
    limite_ingresos_diario INTEGER DEFAULT 50 CHECK (limite_ingresos_diario BETWEEN 1 AND 1000),
    limite_gastos_diario INTEGER DEFAULT 100 CHECK (limite_gastos_diario BETWEEN 1 AND 1000),
    limite_simulaciones_diario INTEGER DEFAULT 20 CHECK (limite_simulaciones_diario BETWEEN 1 AND 100),
    limite_metas_activas INTEGER DEFAULT 10 CHECK (limite_metas_activas BETWEEN 1 AND 50),
    limite_categorias_personalizadas INTEGER DEFAULT 20 CHECK (limite_categorias_personalizadas BETWEEN 1 AND 100),
    limite_presupuestos_activos INTEGER DEFAULT 15 CHECK (limite_presupuestos_activos BETWEEN 1 AND 50),
    
    -- Límites de API calls
    limite_api_calls_diario INTEGER DEFAULT 1000 CHECK (limite_api_calls_diario BETWEEN 100 AND 10000),
    limite_api_calls_horario INTEGER DEFAULT 100 CHECK (limite_api_calls_horario BETWEEN 10 AND 1000),
    
    -- Límites de almacenamiento
    limite_exportaciones_diario INTEGER DEFAULT 5 CHECK (limite_exportaciones_diario BETWEEN 1 AND 20),
    
    -- Contadores actuales (se resetean diariamente)
    contador_ingresos_hoy INTEGER DEFAULT 0,
    contador_gastos_hoy INTEGER DEFAULT 0,
    contador_simulaciones_hoy INTEGER DEFAULT 0,
    contador_api_calls_hoy INTEGER DEFAULT 0,
    contador_api_calls_hora INTEGER DEFAULT 0,
    contador_exportaciones_hoy INTEGER DEFAULT 0,
    
    -- Control de tiempo
    ultimo_reset_diario DATE DEFAULT CURRENT_DATE,
    ultimo_reset_horario TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Configuración adicional
    plan_usuario TEXT DEFAULT 'free' CHECK (plan_usuario IN ('free', 'premium', 'enterprise')),
    activo BOOLEAN DEFAULT TRUE,
    notificaciones_habilitadas BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para user_limits
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_limits_usuario 
    ON user_limits(usuario_id);

CREATE INDEX IF NOT EXISTS idx_user_limits_plan 
    ON user_limits(plan_usuario, activo);

-- Trigger para updated_at en user_limits
DROP TRIGGER IF EXISTS update_user_limits_updated_at ON user_limits;
CREATE TRIGGER update_user_limits_updated_at
    BEFORE UPDATE ON user_limits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 3. POLÍTICAS RLS PARA AUDITORÍA
-- ==========================================

-- Habilitar RLS
ALTER TABLE logs_auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_limits ENABLE ROW LEVEL SECURITY;

-- Políticas para logs_auditoria
DROP POLICY IF EXISTS "usuarios_solo_sus_logs" ON logs_auditoria;
CREATE POLICY "usuarios_solo_sus_logs" ON logs_auditoria
    FOR ALL USING (auth.uid() = usuario_id);

-- Políticas para user_limits
DROP POLICY IF EXISTS "usuarios_solo_sus_limites" ON user_limits;
CREATE POLICY "usuarios_solo_sus_limites" ON user_limits
    FOR ALL USING (auth.uid() = usuario_id);

-- ==========================================
-- 4. FUNCIONES PARA AUDITORÍA AUTOMÁTICA
-- ==========================================

-- Función para registrar acciones automáticamente
CREATE OR REPLACE FUNCTION registrar_auditoria(
    p_usuario_id UUID,
    p_accion TEXT,
    p_tabla TEXT,
    p_registro_id TEXT DEFAULT NULL,
    p_datos_anteriores JSONB DEFAULT NULL,
    p_datos_nuevos JSONB DEFAULT NULL,
    p_detalles JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO logs_auditoria (
        usuario_id, accion, tabla, registro_id,
        datos_anteriores, datos_nuevos, detalles
    )
    VALUES (
        p_usuario_id, p_accion, p_tabla, p_registro_id,
        p_datos_anteriores, p_datos_nuevos, p_detalles
    )
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para inicializar límites de usuario nuevo
CREATE OR REPLACE FUNCTION initialize_user_limits()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_limits (usuario_id)
    VALUES (NEW.id)
    ON CONFLICT (usuario_id) DO NOTHING;
    
    -- Registrar en auditoría
    PERFORM registrar_auditoria(
        NEW.id,
        'REGISTER',
        'auth.users',
        NEW.id::TEXT,
        NULL,
        jsonb_build_object('email', NEW.email, 'created_at', NEW.created_at),
        jsonb_build_object('action', 'new_user_registration')
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear límites automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created_limits ON auth.users;
CREATE TRIGGER on_auth_user_created_limits
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION initialize_user_limits();

-- ==========================================
-- 5. FUNCIONES PARA VALIDAR LÍMITES
-- ==========================================

-- Función para verificar límites antes de operaciones
CREATE OR REPLACE FUNCTION verificar_limites_usuario(
    p_usuario_id UUID,
    p_tipo_operacion TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    limites RECORD;
    contador_actual INTEGER;
    limite_max INTEGER;
BEGIN
    -- Obtener límites del usuario
    SELECT * INTO limites FROM user_limits WHERE usuario_id = p_usuario_id;
    
    -- Si no tiene límites configurados, usar valores por defecto
    IF NOT FOUND THEN
        INSERT INTO user_limits (usuario_id) VALUES (p_usuario_id)
        ON CONFLICT DO NOTHING;
        SELECT * INTO limites FROM user_limits WHERE usuario_id = p_usuario_id;
    END IF;
    
    -- Resetear contadores diarios si es necesario
    IF limites.ultimo_reset_diario < CURRENT_DATE THEN
        UPDATE user_limits SET
            contador_ingresos_hoy = 0,
            contador_gastos_hoy = 0,
            contador_simulaciones_hoy = 0,
            contador_api_calls_hoy = 0,
            contador_exportaciones_hoy = 0,
            ultimo_reset_diario = CURRENT_DATE
        WHERE usuario_id = p_usuario_id;
        
        -- Recargar límites actualizados
        SELECT * INTO limites FROM user_limits WHERE usuario_id = p_usuario_id;
    END IF;
    
    -- Verificar límite según el tipo de operación
    CASE p_tipo_operacion
        WHEN 'CREATE_INGRESO' THEN
            RETURN limites.contador_ingresos_hoy < limites.limite_ingresos_diario;
        WHEN 'CREATE_GASTO' THEN
            RETURN limites.contador_gastos_hoy < limites.limite_gastos_diario;
        WHEN 'CREATE_SIMULACION' THEN
            RETURN limites.contador_simulaciones_hoy < limites.limite_simulaciones_diario;
        WHEN 'API_CALL' THEN
            RETURN limites.contador_api_calls_hoy < limites.limite_api_calls_diario;
        WHEN 'EXPORT_DATA' THEN
            RETURN limites.contador_exportaciones_hoy < limites.limite_exportaciones_diario;
        ELSE
            RETURN TRUE; -- Por defecto permitir si no hay límite específico
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para incrementar contadores después de operación exitosa
CREATE OR REPLACE FUNCTION incrementar_contador_limite(
    p_usuario_id UUID,
    p_tipo_operacion TEXT
) RETURNS VOID AS $$
BEGIN
    CASE p_tipo_operacion
        WHEN 'CREATE_INGRESO' THEN
            UPDATE user_limits SET contador_ingresos_hoy = contador_ingresos_hoy + 1
            WHERE usuario_id = p_usuario_id;
        WHEN 'CREATE_GASTO' THEN
            UPDATE user_limits SET contador_gastos_hoy = contador_gastos_hoy + 1
            WHERE usuario_id = p_usuario_id;
        WHEN 'CREATE_SIMULACION' THEN
            UPDATE user_limits SET contador_simulaciones_hoy = contador_simulaciones_hoy + 1
            WHERE usuario_id = p_usuario_id;
        WHEN 'API_CALL' THEN
            UPDATE user_limits SET contador_api_calls_hoy = contador_api_calls_hoy + 1
            WHERE usuario_id = p_usuario_id;
        WHEN 'EXPORT_DATA' THEN
            UPDATE user_limits SET contador_exportaciones_hoy = contador_exportaciones_hoy + 1
            WHERE usuario_id = p_usuario_id;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 6. FUNCIÓN PARA LIMPIAR LOGS ANTIGUOS
-- ==========================================

-- Función para limpiar logs antiguos (mantener solo 90 días)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM logs_auditoria 
    WHERE timestamp < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Registrar la limpieza
    INSERT INTO logs_auditoria (usuario_id, accion, tabla, detalles)
    VALUES (
        NULL,
        'SYSTEM_INIT',
        'logs_auditoria',
        jsonb_build_object('deleted_logs', deleted_count, 'cleanup_date', NOW())
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 7. COMENTARIOS PARA DOCUMENTACIÓN
-- ==========================================

COMMENT ON TABLE logs_auditoria IS 'Registro de todas las operaciones del sistema para auditoría y trazabilidad';
COMMENT ON COLUMN logs_auditoria.accion IS 'Tipo de acción realizada por el usuario';
COMMENT ON COLUMN logs_auditoria.datos_anteriores IS 'Estado previo del registro (para UPDATE/DELETE)';
COMMENT ON COLUMN logs_auditoria.datos_nuevos IS 'Nuevo estado del registro (para CREATE/UPDATE)';
COMMENT ON COLUMN logs_auditoria.duracion_ms IS 'Tiempo de ejecución de la operación en milisegundos';

COMMENT ON TABLE user_limits IS 'Límites de uso por usuario para prevenir abuso del sistema';
COMMENT ON COLUMN user_limits.plan_usuario IS 'Tipo de plan del usuario (free, premium, enterprise)';

COMMENT ON FUNCTION registrar_auditoria(UUID, TEXT, TEXT, TEXT, JSONB, JSONB, JSONB) IS 'Registra una acción en el log de auditoría';
COMMENT ON FUNCTION verificar_limites_usuario(UUID, TEXT) IS 'Verifica si el usuario puede realizar una operación según sus límites';
COMMENT ON FUNCTION cleanup_old_audit_logs() IS 'Limpia logs de auditoría antiguos (>90 días)';

-- ==========================================
-- 8. VERIFICACIÓN DE INSTALACIÓN
-- ==========================================

-- Mostrar tablas de auditoría creadas
SELECT 
    table_name as "Tabla de Auditoría Creada",
    'Activa' as estado
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('logs_auditoria', 'user_limits')
ORDER BY table_name;

-- Mostrar funciones de auditoría creadas
SELECT 
    routine_name as "Función Creada",
    routine_type as tipo
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN ('registrar_auditoria', 'verificar_limites_usuario', 'cleanup_old_audit_logs')
ORDER BY routine_name;

-- ==========================================
-- ✅ RESULTADO ESPERADO:
-- - 2 tablas de auditoría (logs_auditoria, user_limits)
-- - Políticas RLS aplicadas
-- - 4 funciones para manejo de auditoría y límites
-- - Triggers automáticos para nuevos usuarios
-- - Sistema completo de trazabilidad
-- ==========================================

SELECT '✅ PASO 4 COMPLETADO: Sistema de auditoría y límites implementado' as resultado;
SELECT 'SIGUIENTE: Ejecutar 05-functions-negocio.sql para funciones de cálculo' as siguiente_paso;
