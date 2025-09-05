-- SCRIPT COMPLETO MÓDULO 4: EJECUTAR EN SUPABASE SQL EDITOR
-- Crear todas las tablas y funciones necesarias para API endpoints

-- =============================================================================
-- PASO 1: CREAR TABLAS DE AUDITORÍA Y CONFIGURACIÓN
-- =============================================================================

-- Tabla de auditoría para logging de operaciones
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

-- Índices para logs_auditoria
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_usuario_fecha 
    ON logs_auditoria(usuario_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_accion 
    ON logs_auditoria(accion);
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_tabla 
    ON logs_auditoria(tabla);

-- RLS para logs_auditoria
ALTER TABLE logs_auditoria ENABLE ROW LEVEL SECURITY;

-- Recrear política si ya existe
DROP POLICY IF EXISTS "usuarios_solo_sus_logs" ON logs_auditoria;
CREATE POLICY "usuarios_solo_sus_logs" ON logs_auditoria
    FOR ALL USING (auth.uid() = usuario_id);

-- =============================================================================
-- PASO 2: FUNCIONES API MÓDULO 4
-- =============================================================================

-- Función: API para crear ingresos con validaciones avanzadas
CREATE OR REPLACE FUNCTION api_crear_ingreso_avanzado(
    p_usuario_id UUID,
    p_descripcion TEXT,
    p_monto DECIMAL(12,2),
    p_categoria TEXT,
    p_fecha DATE DEFAULT CURRENT_DATE
)
RETURNS JSON AS $$
DECLARE
    new_ingreso_id UUID;
    validation_errors TEXT[] := ARRAY[]::TEXT[];
    monthly_count INTEGER;
    result_data JSON;
BEGIN
    -- Validar autorización
    IF auth.uid() != p_usuario_id THEN
        RAISE EXCEPTION 'Sin autorización para este usuario';
    END IF;
    
    -- Validaciones de negocio
    IF LENGTH(TRIM(p_descripcion)) < 3 THEN
        validation_errors := array_append(validation_errors, 'Descripción debe tener al menos 3 caracteres');
    END IF;
    
    IF p_monto <= 0 THEN
        validation_errors := array_append(validation_errors, 'Monto debe ser mayor a 0');
    END IF;
    
    IF p_categoria NOT IN ('salario', 'freelance', 'inversiones', 'negocio', 'otros') THEN
        validation_errors := array_append(validation_errors, 'Categoría inválida');
    END IF;
    
    IF p_fecha > CURRENT_DATE THEN
        validation_errors := array_append(validation_errors, 'No se pueden registrar ingresos futuros');
    END IF;
    
    -- Si hay errores, retornarlos
    IF array_length(validation_errors, 1) > 0 THEN
        RETURN json_build_object(
            'success', false,
            'error', true,
            'message', 'Errores de validación',
            'validation_errors', array_to_json(validation_errors),
            'timestamp', NOW()
        );
    END IF;
    
    -- Verificar límite mensual
    SELECT COUNT(*) INTO monthly_count
    FROM ingresos 
    WHERE usuario_id = p_usuario_id 
    AND EXTRACT(YEAR FROM fecha) = EXTRACT(YEAR FROM p_fecha)
    AND EXTRACT(MONTH FROM fecha) = EXTRACT(MONTH FROM p_fecha);
    
    IF monthly_count >= 100 THEN
        RETURN json_build_object(
            'success', false,
            'error', true,
            'message', 'Límite mensual de 100 ingresos alcanzado',
            'current_count', monthly_count,
            'timestamp', NOW()
        );
    END IF;
    
    -- Crear el ingreso
    INSERT INTO ingresos (usuario_id, descripcion, monto, categoria, fecha)
    VALUES (p_usuario_id, TRIM(p_descripcion), p_monto, p_categoria, p_fecha)
    RETURNING id INTO new_ingreso_id;
    
    -- Registrar en auditoría
    INSERT INTO logs_auditoria (usuario_id, accion, tabla, registro_id, detalles)
    VALUES (
        p_usuario_id,
        'CREATE_INGRESO_API',
        'ingresos',
        new_ingreso_id::TEXT,
        json_build_object(
            'monto', p_monto,
            'categoria', p_categoria,
            'descripcion', p_descripcion
        )
    );
    
    -- Obtener datos del ingreso creado
    SELECT json_build_object(
        'id', id,
        'usuario_id', usuario_id,
        'descripcion', descripcion,
        'monto', monto,
        'categoria', categoria,
        'fecha', fecha,
        'created_at', created_at
    ) INTO result_data
    FROM ingresos
    WHERE id = new_ingreso_id;
    
    RETURN json_build_object(
        'success', true,
        'data', result_data,
        'message', 'Ingreso creado exitosamente',
        'metadata', json_build_object(
            'monthly_count', monthly_count + 1,
            'validation_passed', true
        ),
        'timestamp', NOW()
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', true,
            'message', 'Error interno: ' || SQLERRM,
            'timestamp', NOW()
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función: API para obtener ingresos con filtros avanzados
CREATE OR REPLACE FUNCTION api_obtener_ingresos_avanzado(
    p_usuario_id UUID,
    p_categoria TEXT DEFAULT NULL,
    p_fecha_desde DATE DEFAULT NULL,
    p_fecha_hasta DATE DEFAULT NULL,
    p_limite INTEGER DEFAULT 50,
    p_incluir_stats BOOLEAN DEFAULT false
)
RETURNS JSON AS $$
DECLARE
    ingresos_data JSON;
    stats_data JSON := NULL;
BEGIN
    -- Validar autorización
    IF auth.uid() != p_usuario_id THEN
        RAISE EXCEPTION 'Sin autorización para este usuario';
    END IF;
    
    -- Validar límite
    IF p_limite > 100 THEN
        RAISE EXCEPTION 'Límite máximo es 100 registros';
    END IF;
    
    -- Obtener ingresos con filtros
    WITH filtered_ingresos AS (
        SELECT *
        FROM ingresos
        WHERE usuario_id = p_usuario_id
        AND (p_categoria IS NULL OR categoria = p_categoria)
        AND (p_fecha_desde IS NULL OR fecha >= p_fecha_desde)
        AND (p_fecha_hasta IS NULL OR fecha <= p_fecha_hasta)
        ORDER BY fecha DESC, created_at DESC
        LIMIT p_limite
    )
    SELECT json_agg(
        json_build_object(
            'id', id,
            'descripcion', descripcion,
            'monto', monto,
            'categoria', categoria,
            'fecha', fecha,
            'created_at', created_at
        )
    ) INTO ingresos_data
    FROM filtered_ingresos;
    
    -- Generar estadísticas si se solicitan
    IF p_incluir_stats AND ingresos_data IS NOT NULL THEN
        WITH stats_calc AS (
            SELECT 
                COUNT(*) as total_registros,
                COALESCE(SUM(monto), 0) as total_monto,
                COALESCE(AVG(monto), 0) as promedio_monto,
                COALESCE(MAX(monto), 0) as maximo_monto,
                COALESCE(MIN(monto), 0) as minimo_monto
            FROM ingresos
            WHERE usuario_id = p_usuario_id
            AND (p_categoria IS NULL OR categoria = p_categoria)
            AND (p_fecha_desde IS NULL OR fecha >= p_fecha_desde)
            AND (p_fecha_hasta IS NULL OR fecha <= p_fecha_hasta)
        )
        SELECT json_build_object(
            'total_registros', total_registros,
            'total_monto', total_monto,
            'promedio_monto', ROUND(promedio_monto::NUMERIC, 2),
            'maximo_monto', maximo_monto,
            'minimo_monto', minimo_monto
        )
        INTO stats_data
        FROM stats_calc;
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'data', COALESCE(ingresos_data, '[]'::json),
        'message', 'Ingresos obtenidos exitosamente',
        'metadata', json_build_object(
            'total_returned', COALESCE(json_array_length(ingresos_data), 0),
            'filters_applied', json_build_object(
                'categoria', p_categoria,
                'fecha_desde', p_fecha_desde,
                'fecha_hasta', p_fecha_hasta,
                'limite', p_limite
            ),
            'stats', stats_data
        ),
        'timestamp', NOW()
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', true,
            'message', 'Error al obtener ingresos: ' || SQLERRM,
            'timestamp', NOW()
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función: API Dashboard completo
CREATE OR REPLACE FUNCTION api_dashboard_completo(
    p_usuario_id UUID,
    p_periodo TEXT DEFAULT 'month'
)
RETURNS JSON AS $$
DECLARE
    balance_data JSON;
    trends_data JSON;
    categories_data JSON;
    alerts_data JSON;
    current_year INTEGER := EXTRACT(YEAR FROM CURRENT_DATE);
    current_month INTEGER := EXTRACT(MONTH FROM CURRENT_DATE);
BEGIN
    -- Validar autorización
    IF auth.uid() != p_usuario_id THEN
        RAISE EXCEPTION 'Sin autorización para este usuario';
    END IF;
    
    -- Obtener balance actual
    SELECT calcular_balance_mensual(p_usuario_id, current_year, current_month)
    INTO balance_data;
    
    -- Obtener tendencias
    SELECT obtener_estadisticas_historicas(p_usuario_id, 6)
    INTO trends_data;
    
    -- Obtener categorías del mes actual
    WITH ingresos_mes AS (
        SELECT categoria, SUM(monto) as total
        FROM ingresos
        WHERE usuario_id = p_usuario_id
        AND EXTRACT(YEAR FROM fecha) = current_year
        AND EXTRACT(MONTH FROM fecha) = current_month
        GROUP BY categoria
    ),
    gastos_mes AS (
        SELECT categoria, SUM(monto) as total
        FROM gastos
        WHERE usuario_id = p_usuario_id
        AND EXTRACT(YEAR FROM fecha) = current_year
        AND EXTRACT(MONTH FROM fecha) = current_month
        GROUP BY categoria
    )
    SELECT json_build_object(
        'ingresos', json_build_object(
            'total', COALESCE((SELECT SUM(total) FROM ingresos_mes), 0),
            'por_categoria', COALESCE((SELECT json_agg(json_build_object('categoria', categoria, 'total', total)) FROM ingresos_mes), '[]'::json)
        ),
        'gastos', json_build_object(
            'total', COALESCE((SELECT SUM(total) FROM gastos_mes), 0),
            'por_categoria', COALESCE((SELECT json_agg(json_build_object('categoria', categoria, 'total', total)) FROM gastos_mes), '[]'::json)
        )
    ) INTO categories_data;
    
    -- Generar alertas básicas
    WITH balance_info AS (
        SELECT 
            (balance_data->>'balance')::DECIMAL as current_balance,
            (balance_data->>'ingresos')::DECIMAL as current_ingresos
    )
    SELECT json_agg(
        json_build_object(
            'type', 
            CASE 
                WHEN bi.current_balance < 0 THEN 'error'
                WHEN bi.current_ingresos > 0 AND (bi.current_balance / bi.current_ingresos * 100) >= 20 THEN 'success'
                ELSE 'info'
            END,
            'title',
            CASE 
                WHEN bi.current_balance < 0 THEN 'Balance Negativo'
                WHEN bi.current_ingresos > 0 AND (bi.current_balance / bi.current_ingresos * 100) >= 20 THEN 'Buen Ahorro'
                ELSE 'Estado Normal'
            END,
            'message',
            CASE 
                WHEN bi.current_balance < 0 THEN 'Tus gastos superan tus ingresos este mes'
                WHEN bi.current_ingresos > 0 AND (bi.current_balance / bi.current_ingresos * 100) >= 20 THEN 'Has ahorrado ' || ROUND((bi.current_balance / bi.current_ingresos * 100)::NUMERIC, 1) || '% de tus ingresos'
                ELSE 'Tu situación financiera es estable'
            END,
            'priority', 'medium'
        )
    ) INTO alerts_data
    FROM balance_info bi;
    
    -- Retornar dashboard completo
    RETURN json_build_object(
        'success', true,
        'data', json_build_object(
            'balance', balance_data,
            'trends', trends_data,
            'categories', categories_data,
            'alerts', COALESCE(alerts_data, '[]'::json),
            'insights', '[]'::json,
            'period', p_periodo,
            'generated_at', NOW()
        ),
        'message', 'Dashboard generado exitosamente',
        'metadata', json_build_object(
            'user_id', p_usuario_id,
            'period', p_periodo
        ),
        'timestamp', NOW()
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', true,
            'message', 'Error al generar dashboard: ' || SQLERRM,
            'timestamp', NOW()
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función: API para crear múltiples ingresos en lote
CREATE OR REPLACE FUNCTION api_crear_ingresos_lote(
    p_usuario_id UUID,
    p_ingresos JSON
)
RETURNS JSON AS $$
DECLARE
    ingreso_item JSON;
    new_ingresos UUID[] := ARRAY[]::UUID[];
    validation_errors TEXT[] := ARRAY[]::TEXT[];
    total_inserted INTEGER := 0;
    new_id UUID;
BEGIN
    -- Validar autorización
    IF auth.uid() != p_usuario_id THEN
        RAISE EXCEPTION 'Sin autorización para este usuario';
    END IF;
    
    -- Validar que sea un array
    IF json_typeof(p_ingresos) != 'array' THEN
        RETURN json_build_object(
            'success', false,
            'error', true,
            'message', 'Se requiere un array de ingresos',
            'timestamp', NOW()
        );
    END IF;
    
    -- Validar límite de lote
    IF json_array_length(p_ingresos) > 50 THEN
        RETURN json_build_object(
            'success', false,
            'error', true,
            'message', 'Máximo 50 ingresos por lote',
            'timestamp', NOW()
        );
    END IF;
    
    -- Procesar cada ingreso
    FOR i IN 0..json_array_length(p_ingresos)-1 LOOP
        ingreso_item := p_ingresos->i;
        
        -- Validar campos requeridos
        IF NOT (ingreso_item ? 'descripcion' AND ingreso_item ? 'monto' AND ingreso_item ? 'categoria') THEN
            validation_errors := array_append(validation_errors, 'Ingreso ' || (i+1) || ': campos requeridos faltantes');
            CONTINUE;
        END IF;
        
        -- Intentar insertar
        BEGIN
            INSERT INTO ingresos (usuario_id, descripcion, monto, categoria, fecha)
            VALUES (
                p_usuario_id,
                ingreso_item->>'descripcion',
                (ingreso_item->>'monto')::DECIMAL,
                ingreso_item->>'categoria',
                COALESCE((ingreso_item->>'fecha')::DATE, CURRENT_DATE)
            )
            RETURNING id INTO new_id;
            
            new_ingresos := array_append(new_ingresos, new_id);
            total_inserted := total_inserted + 1;
            
        EXCEPTION
            WHEN OTHERS THEN
                validation_errors := array_append(validation_errors, 'Ingreso ' || (i+1) || ': ' || SQLERRM);
        END;
    END LOOP;
    
    -- Registrar auditoría
    INSERT INTO logs_auditoria (usuario_id, accion, tabla, detalles)
    VALUES (
        p_usuario_id,
        'BULK_CREATE_INGRESOS_API',
        'ingresos',
        json_build_object(
            'total_procesados', json_array_length(p_ingresos),
            'total_insertados', total_inserted,
            'errores_count', array_length(validation_errors, 1)
        )
    );
    
    RETURN json_build_object(
        'success', total_inserted > 0,
        'data', json_build_object(
            'inserted_count', total_inserted,
            'processed_count', json_array_length(p_ingresos),
            'error_count', array_length(validation_errors, 1)
        ),
        'message', total_inserted || ' ingresos creados de ' || json_array_length(p_ingresos) || ' procesados',
        'validation_errors', CASE WHEN array_length(validation_errors, 1) > 0 THEN array_to_json(validation_errors) ELSE NULL END,
        'timestamp', NOW()
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', true,
            'message', 'Error en lote: ' || SQLERRM,
            'timestamp', NOW()
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- PASO 3: COMENTARIOS Y DOCUMENTACIÓN
-- =============================================================================

COMMENT ON TABLE logs_auditoria IS 'Tabla de auditoría para tracking de operaciones API';
COMMENT ON FUNCTION api_crear_ingreso_avanzado(UUID, TEXT, DECIMAL, TEXT, DATE) IS 'API: Crear ingreso individual con validaciones completas';
COMMENT ON FUNCTION api_obtener_ingresos_avanzado(UUID, TEXT, DATE, DATE, INTEGER, BOOLEAN) IS 'API: Obtener ingresos con filtros y estadísticas';
COMMENT ON FUNCTION api_dashboard_completo(UUID, TEXT) IS 'API: Dashboard completo con métricas y alertas';
COMMENT ON FUNCTION api_crear_ingresos_lote(UUID, JSON) IS 'API: Crear múltiples ingresos en lote';

-- =============================================================================
-- CONFIRMACIÓN DE INSTALACIÓN
-- =============================================================================

-- Insertar log de instalación
INSERT INTO logs_auditoria (
    usuario_id, 
    accion, 
    tabla, 
    detalles
) 
SELECT 
    id,
    'MODULE_4_INSTALLED',
    'system',
    json_build_object(
        'version', '1.0',
        'functions_created', 4,
        'tables_created', 1,
        'installation_date', NOW()
    )
FROM auth.users 
WHERE email = 'test@ejemplo.com'
LIMIT 1;

-- Mostrar funciones creadas
SELECT 
    'Módulo 4 instalado correctamente' as status,
    'Funciones API disponibles:' as info,
    array_agg(routine_name) as functions_created
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE 'api_%'
GROUP BY status, info;
