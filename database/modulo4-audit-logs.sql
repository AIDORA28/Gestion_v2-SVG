-- Tabla de auditoría para logging de operaciones
-- Módulo 4: API Endpoints - Sistema de logging y trazabilidad

CREATE TABLE IF NOT EXISTS logs_auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    accion TEXT NOT NULL,
    tabla TEXT NOT NULL,
    registro_id TEXT,
    detalles JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT TRUE
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_usuario_fecha 
    ON logs_auditoria(usuario_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_logs_auditoria_accion 
    ON logs_auditoria(accion);

CREATE INDEX IF NOT EXISTS idx_logs_auditoria_tabla 
    ON logs_auditoria(tabla);

CREATE INDEX IF NOT EXISTS idx_logs_auditoria_timestamp 
    ON logs_auditoria(timestamp DESC);

-- Habilitar RLS
ALTER TABLE logs_auditoria ENABLE ROW LEVEL SECURITY;

-- Política RLS: Solo el usuario puede ver sus propios logs
CREATE POLICY "usuarios_solo_sus_logs" ON logs_auditoria
    FOR ALL USING (auth.uid() = usuario_id);

-- Tabla de configuración de límites por usuario (opcional)
CREATE TABLE IF NOT EXISTS user_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    limite_ingresos_diario INTEGER DEFAULT 100,
    limite_gastos_diario INTEGER DEFAULT 100,
    limite_reportes_diario INTEGER DEFAULT 20,
    limite_api_calls_diario INTEGER DEFAULT 1000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para user_limits
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_limits_usuario 
    ON user_limits(usuario_id);

-- RLS para user_limits
ALTER TABLE user_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuarios_solo_sus_limites" ON user_limits
    FOR ALL USING (auth.uid() = usuario_id);

-- Función para inicializar límites de usuario nuevo
CREATE OR REPLACE FUNCTION initialize_user_limits()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_limits (usuario_id)
    VALUES (NEW.id)
    ON CONFLICT (usuario_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear límites automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created_limits ON auth.users;
CREATE TRIGGER on_auth_user_created_limits
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION initialize_user_limits();

-- Función para limpiar logs antiguos (mantener solo 90 días)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM logs_auditoria 
    WHERE timestamp < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentarios para documentación
COMMENT ON TABLE logs_auditoria IS 'Tabla de auditoría para tracking de todas las operaciones del sistema';
COMMENT ON COLUMN logs_auditoria.accion IS 'Tipo de acción realizada (CREATE_INGRESO, DELETE_GASTO, etc.)';
COMMENT ON COLUMN logs_auditoria.tabla IS 'Tabla afectada por la operación';
COMMENT ON COLUMN logs_auditoria.registro_id IS 'ID del registro específico afectado';
COMMENT ON COLUMN logs_auditoria.detalles IS 'Información adicional en formato JSON';

COMMENT ON TABLE user_limits IS 'Configuración de límites de uso por usuario';
COMMENT ON FUNCTION cleanup_old_audit_logs() IS 'Función para limpieza automática de logs antiguos';

-- Insertar logs de ejemplo para testing (opcional)
INSERT INTO logs_auditoria (usuario_id, accion, tabla, detalles) 
SELECT 
    id,
    'SYSTEM_INIT',
    'logs_auditoria',
    '{"message": "Sistema de auditoría inicializado"}'::jsonb
FROM auth.users 
LIMIT 1
ON CONFLICT DO NOTHING;
