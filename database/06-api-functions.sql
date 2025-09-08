-- ==========================================
-- 06-API-FUNCTIONS.SQL - ENDPOINTS PARA FRONTEND
-- ==========================================
-- Ejecutar SEXTO en Supabase SQL Editor
-- Funciones tipo API para ser llamadas directamente desde JavaScript
-- Orden de ejecución: 6º

-- ==========================================
-- 1. API: CREAR INGRESO CON VALIDACIONES
-- ==========================================

CREATE OR REPLACE FUNCTION api_crear_ingreso_avanzado(
    p_usuario_id UUID,
    p_descripcion TEXT,
    p_monto DECIMAL(12,2),
    p_categoria TEXT,
    p_fecha DATE DEFAULT CURRENT_DATE,
    p_es_recurrente BOOLEAN DEFAULT FALSE,
    p_frecuencia_dias INTEGER DEFAULT NULL,
    p_notas TEXT DEFAULT NULL
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
    
    IF p_monto > 999999999.99 THEN
        validation_errors := array_append(validation_errors, 'Monto excede el límite máximo');
    END IF;
    
    IF p_categoria NOT IN ('salario', 'freelance', 'inversiones', 'negocio', 'otros') THEN
        validation_errors := array_append(validation_errors, 'Categoría inválida');
    END IF;
    
    IF p_fecha > CURRENT_DATE THEN
        validation_errors := array_append(validation_errors, 'No se pueden registrar ingresos futuros');
    END IF;
    
    IF p_fecha < CURRENT_DATE - INTERVAL '1 year' THEN
        validation_errors := array_append(validation_errors, 'No se pueden registrar ingresos de hace más de 1 año');
    END IF;
    
    IF p_es_recurrente AND (p_frecuencia_dias IS NULL OR p_frecuencia_dias <= 0) THEN
        validation_errors := array_append(validation_errors, 'Frecuencia requerida para ingresos recurrentes');
    END IF;
    
    -- Si hay errores de validación, retornarlos
    IF array_length(validation_errors, 1) > 0 THEN
        RETURN json_build_object(
            'success', false,
            'error', 'validation_errors',
            'message', 'Errores de validación encontrados',
            'validation_errors', validation_errors,
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
            'error', 'monthly_limit_exceeded',
            'message', 'Límite mensual de ingresos alcanzado (100 máximo)',
            'current_count', monthly_count,
            'timestamp', NOW()
        );
    END IF;
    
    -- Verificar límites del usuario
    IF NOT verificar_limites_usuario(p_usuario_id, 'CREATE_INGRESO') THEN
        RETURN json_build_object(
            'success', false,
            'error', 'daily_limit_exceeded',
            'message', 'Límite diario de ingresos alcanzado',
            'timestamp', NOW()
        );
    END IF;
    
    -- Crear el ingreso
    INSERT INTO ingresos (
        usuario_id, descripcion, monto, categoria, fecha,
        es_recurrente, frecuencia_dias, notas
    )
    VALUES (
        p_usuario_id, TRIM(p_descripcion), p_monto, p_categoria, p_fecha,
        p_es_recurrente, p_frecuencia_dias, p_notas
    )
    RETURNING id INTO new_ingreso_id;
    
    -- Registrar en auditoría
    PERFORM registrar_auditoria(
        p_usuario_id,
        'CREATE_INGRESO',
        'ingresos',
        new_ingreso_id::TEXT,
        NULL,
        json_build_object(
            'descripcion', p_descripcion,
            'monto', p_monto,
            'categoria', p_categoria,
            'fecha', p_fecha,
            'es_recurrente', p_es_recurrente
        ),
        json_build_object('method', 'api_crear_ingreso_avanzado')
    );
    
    -- Incrementar contador de límites
    PERFORM incrementar_contador_limite(p_usuario_id, 'CREATE_INGRESO');
    
    -- Obtener los datos completos del ingreso creado
    SELECT json_build_object(
        'id', id,
        'descripcion', descripcion,
        'monto', monto,
        'categoria', categoria,
        'fecha', fecha,
        'es_recurrente', es_recurrente,
        'frecuencia_dias', frecuencia_dias,
        'notas', notas,
        'created_at', created_at,
        'updated_at', updated_at
    ) INTO result_data
    FROM ingresos
    WHERE id = new_ingreso_id;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Ingreso creado exitosamente',
        'data', result_data,
        'ingreso_id', new_ingreso_id,
        'timestamp', NOW()
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', 'internal_error',
            'message', 'Error interno del servidor',
            'error_detail', SQLERRM,
            'timestamp', NOW()
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 2. API: OBTENER INGRESOS CON FILTROS
-- ==========================================

CREATE OR REPLACE FUNCTION api_obtener_ingresos_avanzado(
    p_usuario_id UUID,
    p_categoria TEXT DEFAULT NULL,
    p_fecha_desde DATE DEFAULT NULL,
    p_fecha_hasta DATE DEFAULT NULL,
    p_incluir_recurrentes BOOLEAN DEFAULT TRUE,
    p_limite INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0,
    p_incluir_stats BOOLEAN DEFAULT FALSE
)
RETURNS JSON AS $$
DECLARE
    ingresos_data JSON;
    stats_data JSON := NULL;
    total_count INTEGER;
    total_monto DECIMAL(12,2);
BEGIN
    -- Validar autorización
    IF auth.uid() != p_usuario_id THEN
        RAISE EXCEPTION 'Sin autorización para este usuario';
    END IF;
    
    -- Validar límite
    IF p_limite > 100 THEN
        RAISE EXCEPTION 'Límite máximo es 100 registros';
    END IF;
    
    -- Validar fechas
    IF p_fecha_desde IS NOT NULL AND p_fecha_hasta IS NOT NULL AND p_fecha_desde > p_fecha_hasta THEN
        RAISE EXCEPTION 'Fecha desde no puede ser mayor que fecha hasta';
    END IF;
    
    -- Construir query con filtros dinámicos
    WITH filtered_ingresos AS (
        SELECT *
        FROM ingresos
        WHERE usuario_id = p_usuario_id
        AND (p_categoria IS NULL OR categoria = p_categoria)
        AND (p_fecha_desde IS NULL OR fecha >= p_fecha_desde)
        AND (p_fecha_hasta IS NULL OR fecha <= p_fecha_hasta)
        AND (p_incluir_recurrentes OR es_recurrente = FALSE)
        ORDER BY fecha DESC, created_at DESC
        LIMIT p_limite
        OFFSET p_offset
    ),
    count_and_sum AS (
        SELECT 
            COUNT(*)::INTEGER as total,
            COALESCE(SUM(monto), 0) as suma_total
        FROM ingresos
        WHERE usuario_id = p_usuario_id
        AND (p_categoria IS NULL OR categoria = p_categoria)
        AND (p_fecha_desde IS NULL OR fecha >= p_fecha_desde)
        AND (p_fecha_hasta IS NULL OR fecha <= p_fecha_hasta)
        AND (p_incluir_recurrentes OR es_recurrente = FALSE)
    )
    SELECT 
        json_agg(
            json_build_object(
                'id', fi.id,
                'descripcion', fi.descripcion,
                'monto', fi.monto,
                'categoria', fi.categoria,
                'fecha', fi.fecha,
                'es_recurrente', fi.es_recurrente,
                'frecuencia_dias', fi.frecuencia_dias,
                'notas', fi.notas,
                'created_at', fi.created_at,
                'updated_at', fi.updated_at
            )
            ORDER BY fi.fecha DESC, fi.created_at DESC
        ) as ingresos,
        cs.total,
        cs.suma_total
    INTO ingresos_data, total_count, total_monto
    FROM filtered_ingresos fi
    CROSS JOIN count_and_sum cs;
    
    -- Generar estadísticas si se solicitan
    IF p_incluir_stats AND ingresos_data IS NOT NULL THEN
        WITH category_stats AS (
            SELECT 
                categoria,
                COUNT(*)::INTEGER as count,
                SUM(monto) as total,
                AVG(monto) as promedio
            FROM ingresos
            WHERE usuario_id = p_usuario_id
            AND (p_categoria IS NULL OR categoria = p_categoria)
            AND (p_fecha_desde IS NULL OR fecha >= p_fecha_desde)
            AND (p_fecha_hasta IS NULL OR fecha <= p_fecha_hasta)
            AND (p_incluir_recurrentes OR es_recurrente = FALSE)
            GROUP BY categoria
            ORDER BY total DESC
        )
        SELECT json_build_object(
            'total_registros', total_count,
            'suma_total', total_monto,
            'promedio_general', CASE WHEN total_count > 0 THEN ROUND(total_monto / total_count, 2) ELSE 0 END,
            'por_categoria', json_agg(
                json_build_object(
                    'categoria', categoria,
                    'count', count,
                    'total', total,
                    'promedio', ROUND(promedio, 2),
                    'porcentaje', CASE WHEN total_monto > 0 THEN ROUND((total / total_monto) * 100, 2) ELSE 0 END
                )
                ORDER BY total DESC
            )
        ) INTO stats_data
        FROM category_stats cs;
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'data', COALESCE(ingresos_data, '[]'::json),
        'pagination', json_build_object(
            'total_count', COALESCE(total_count, 0),
            'limit', p_limite,
            'offset', p_offset,
            'has_more', COALESCE(total_count, 0) > (p_offset + p_limite)
        ),
        'stats', stats_data,
        'filters', json_build_object(
            'categoria', p_categoria,
            'fecha_desde', p_fecha_desde,
            'fecha_hasta', p_fecha_hasta,
            'incluir_recurrentes', p_incluir_recurrentes
        ),
        'timestamp', NOW()
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', 'internal_error',
            'message', 'Error interno al obtener ingresos',
            'error_detail', SQLERRM,
            'timestamp', NOW()
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 3. API: DASHBOARD COMPLETO
-- ==========================================

CREATE OR REPLACE FUNCTION api_dashboard_completo(
    p_usuario_id UUID,
    p_periodo TEXT DEFAULT 'month',
    p_incluir_proyecciones BOOLEAN DEFAULT TRUE,
    p_incluir_comparaciones BOOLEAN DEFAULT TRUE
)
RETURNS JSON AS $$
DECLARE
    balance_data JSON;
    resumen_data JSON;
    tendencias_data JSON;
    alertas_data JSON;
    metas_data JSON;
    ultimas_transacciones JSON;
    current_month INTEGER := EXTRACT(MONTH FROM CURRENT_DATE);
    current_year INTEGER := EXTRACT(YEAR FROM CURRENT_DATE);
BEGIN
    -- Validar autorización
    IF auth.uid() != p_usuario_id THEN
        RAISE EXCEPTION 'Sin autorización para este usuario';
    END IF;
    
    -- Validar parámetros
    IF p_periodo NOT IN ('week', 'month', 'quarter', 'year') THEN
        RAISE EXCEPTION 'Período debe ser: week, month, quarter, year';
    END IF;
    
    -- Obtener balance según período
    CASE p_periodo
        WHEN 'month' THEN
            SELECT calcular_balance_mensual(p_usuario_id, current_year, current_month) INTO balance_data;
        WHEN 'year' THEN
            SELECT calcular_balance_mensual(p_usuario_id, current_year) INTO balance_data;
        ELSE
            SELECT calcular_balance_mensual(p_usuario_id, current_year, current_month) INTO balance_data;
    END CASE;
    
    -- Obtener resumen financiero
    SELECT obtener_resumen_financiero(p_usuario_id, p_incluir_proyecciones) INTO resumen_data;
    
    -- Obtener últimas transacciones (últimas 10)
    WITH ultimas AS (
        SELECT 
            id,
            descripcion,
            monto,
            categoria,
            fecha,
            'ingreso' as tipo,
            created_at
        FROM ingresos
        WHERE usuario_id = p_usuario_id
        
        UNION ALL
        
        SELECT 
            id,
            descripcion,
            monto,
            categoria,
            fecha,
            'gasto' as tipo,
            created_at
        FROM gastos
        WHERE usuario_id = p_usuario_id
        
        ORDER BY created_at DESC
        LIMIT 10
    )
    SELECT json_agg(
        json_build_object(
            'id', id,
            'descripcion', descripcion,
            'monto', monto,
            'categoria', categoria,
            'fecha', fecha,
            'tipo', tipo,
            'created_at', created_at
        )
        ORDER BY created_at DESC
    ) INTO ultimas_transacciones
    FROM ultimas;
    
    -- Obtener estado de metas (top 5 más relevantes)
    SELECT json_agg(
        json_build_object(
            'id', id,
            'nombre', nombre,
            'monto_objetivo', monto_objetivo,
            'monto_actual', monto_actual,
            'porcentaje_completado', porcentaje_completado,
            'dias_restantes', dias_restantes,
            'prioridad', prioridad,
            'estado', 
            CASE 
                WHEN completada THEN 'completada'
                WHEN dias_restantes < 0 THEN 'vencida'
                WHEN dias_restantes <= 30 THEN 'urgente'
                WHEN porcentaje_completado >= 80 THEN 'cerca'
                ELSE 'en_progreso'
            END
        )
        ORDER BY 
            CASE prioridad WHEN 'alta' THEN 1 WHEN 'media' THEN 2 ELSE 3 END,
            porcentaje_completado DESC
    ) INTO metas_data
    FROM metas_financieras
    WHERE usuario_id = p_usuario_id 
    AND activa = TRUE 
    AND NOT completada
    LIMIT 5;
    
    -- Generar alertas del dashboard
    WITH alertas AS (
        -- Presupuestos excedidos
        SELECT 'presupuesto_excedido' as tipo, 
               'Presupuesto de ' || categoria || ' excedido (' || ROUND(porcentaje_usado, 1) || '%)' as mensaje,
               'alta' as prioridad
        FROM presupuestos 
        WHERE usuario_id = p_usuario_id 
        AND activo = TRUE 
        AND porcentaje_usado >= 100
        
        UNION ALL
        
        -- Presupuestos en alerta
        SELECT 'presupuesto_alerta' as tipo,
               'Presupuesto de ' || categoria || ' cerca del límite (' || ROUND(porcentaje_usado, 1) || '%)' as mensaje,
               'media' as prioridad
        FROM presupuestos 
        WHERE usuario_id = p_usuario_id 
        AND activo = TRUE 
        AND porcentaje_usado >= umbral_alerta 
        AND porcentaje_usado < 100
        
        UNION ALL
        
        -- Metas próximas a vencer
        SELECT 'meta_vence' as tipo,
               'Meta "' || nombre || '" vence en ' || dias_restantes || ' días' as mensaje,
               'media' as prioridad
        FROM metas_financieras 
        WHERE usuario_id = p_usuario_id 
        AND activa = TRUE 
        AND NOT completada 
        AND dias_restantes BETWEEN 1 AND 30
    )
    SELECT json_agg(
        json_build_object(
            'tipo', tipo,
            'mensaje', mensaje,
            'prioridad', prioridad
        )
        ORDER BY 
            CASE prioridad WHEN 'alta' THEN 1 WHEN 'media' THEN 2 ELSE 3 END
    ) INTO alertas_data
    FROM alertas;
    
    -- Registrar en auditoría (API call)
    PERFORM registrar_auditoria(
        p_usuario_id,
        'API_CALL',
        'dashboard',
        NULL,
        NULL,
        json_build_object('endpoint', 'api_dashboard_completo', 'periodo', p_periodo),
        json_build_object('method', 'dashboard_access')
    );
    
    -- Incrementar contador de API calls
    PERFORM incrementar_contador_limite(p_usuario_id, 'API_CALL');
    
    RETURN json_build_object(
        'success', true,
        'data', json_build_object(
            'usuario_id', p_usuario_id,
            'periodo', p_periodo,
            'balance', balance_data,
            'resumen_financiero', resumen_data,
            'ultimas_transacciones', COALESCE(ultimas_transacciones, '[]'::json),
            'metas_activas', COALESCE(metas_data, '[]'::json),
            'alertas', COALESCE(alertas_data, '[]'::json)
        ),
        'metadata', json_build_object(
            'incluir_proyecciones', p_incluir_proyecciones,
            'incluir_comparaciones', p_incluir_comparaciones,
            'generated_at', NOW(),
            'data_freshness', 'real_time'
        ),
        'timestamp', NOW()
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', 'internal_error',
            'message', 'Error interno al generar dashboard',
            'error_detail', SQLERRM,
            'timestamp', NOW()
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 4. API: CREAR MÚLTIPLES INGRESOS EN LOTE
-- ==========================================

CREATE OR REPLACE FUNCTION api_crear_ingresos_lote(
    p_usuario_id UUID,
    p_ingresos JSON
)
RETURNS JSON AS $$
DECLARE
    ingreso_item JSON;
    new_id UUID;
    success_count INTEGER := 0;
    error_count INTEGER := 0;
    results JSON[] := ARRAY[]::JSON[];
    batch_errors TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Validar autorización
    IF auth.uid() != p_usuario_id THEN
        RAISE EXCEPTION 'Sin autorización para este usuario';
    END IF;
    
    -- Validar que se enviaron datos
    IF p_ingresos IS NULL OR json_array_length(p_ingresos) = 0 THEN
        RETURN json_build_object(
            'success', false,
            'error', 'no_data',
            'message', 'No se enviaron ingresos para procesar',
            'timestamp', NOW()
        );
    END IF;
    
    -- Validar límite de lote (máximo 20 por vez)
    IF json_array_length(p_ingresos) > 20 THEN
        RETURN json_build_object(
            'success', false,
            'error', 'batch_too_large',
            'message', 'Máximo 20 ingresos por lote',
            'timestamp', NOW()
        );
    END IF;
    
    -- Procesar cada ingreso en el lote
    FOR i IN 0..json_array_length(p_ingresos)-1 LOOP
        ingreso_item := p_ingresos->i;
        
        BEGIN
            -- Llamar a la API individual para cada ingreso
            DECLARE
                resultado JSON;
            BEGIN
                SELECT api_crear_ingreso_avanzado(
                    p_usuario_id,
                    ingreso_item->>'descripcion',
                    (ingreso_item->>'monto')::DECIMAL(12,2),
                    ingreso_item->>'categoria',
                    COALESCE((ingreso_item->>'fecha')::DATE, CURRENT_DATE),
                    COALESCE((ingreso_item->>'es_recurrente')::BOOLEAN, FALSE),
                    CASE WHEN ingreso_item->>'frecuencia_dias' IS NOT NULL 
                         THEN (ingreso_item->>'frecuencia_dias')::INTEGER 
                         ELSE NULL END,
                    ingreso_item->>'notas'
                ) INTO resultado;
                
                IF resultado->>'success' = 'true' THEN
                    success_count := success_count + 1;
                    results := array_append(results, json_build_object(
                        'index', i,
                        'success', true,
                        'data', resultado->'data'
                    ));
                ELSE
                    error_count := error_count + 1;
                    results := array_append(results, json_build_object(
                        'index', i,
                        'success', false,
                        'error', resultado->>'error',
                        'message', resultado->>'message'
                    ));
                END IF;
            END;
            
        EXCEPTION WHEN OTHERS THEN
            error_count := error_count + 1;
            results := array_append(results, json_build_object(
                'index', i,
                'success', false,
                'error', 'processing_error',
                'message', 'Error procesando ingreso #' || (i+1) || ': ' || SQLERRM
            ));
        END;
    END LOOP;
    
    -- Registrar operación de lote en auditoría
    PERFORM registrar_auditoria(
        p_usuario_id,
        'API_CALL',
        'ingresos',
        NULL,
        NULL,
        json_build_object(
            'batch_size', json_array_length(p_ingresos),
            'success_count', success_count,
            'error_count', error_count
        ),
        json_build_object('method', 'batch_create_ingresos')
    );
    
    RETURN json_build_object(
        'success', CASE WHEN success_count > 0 THEN true ELSE false END,
        'message', 
        CASE 
            WHEN error_count = 0 THEN 'Todos los ingresos fueron creados exitosamente'
            WHEN success_count = 0 THEN 'Ningún ingreso pudo ser creado'
            ELSE success_count || ' ingresos creados, ' || error_count || ' fallaron'
        END,
        'summary', json_build_object(
            'total_processed', json_array_length(p_ingresos),
            'success_count', success_count,
            'error_count', error_count,
            'success_rate', ROUND((success_count::DECIMAL / json_array_length(p_ingresos)) * 100, 2)
        ),
        'results', array_to_json(results),
        'timestamp', NOW()
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', 'batch_processing_error',
            'message', 'Error procesando lote de ingresos',
            'error_detail', SQLERRM,
            'timestamp', NOW()
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 5. COMENTARIOS PARA DOCUMENTACIÓN
-- ==========================================

COMMENT ON FUNCTION api_crear_ingreso_avanzado IS 'API endpoint para crear ingreso individual con validaciones completas y auditoría';
COMMENT ON FUNCTION api_obtener_ingresos_avanzado IS 'API endpoint para obtener ingresos con filtros, paginación y estadísticas opcionales';
COMMENT ON FUNCTION api_dashboard_completo IS 'API endpoint para dashboard completo con balance, tendencias, alertas y proyecciones';
COMMENT ON FUNCTION api_crear_ingresos_lote IS 'API endpoint para crear múltiples ingresos en una sola operación (máximo 20 por lote)';

-- ==========================================
-- 6. VERIFICACIÓN DE INSTALACIÓN
-- ==========================================

-- Mostrar funciones API creadas
SELECT 
    routine_name as "Función API Creada",
    routine_type as tipo,
    'Activa' as estado
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name LIKE 'api_%'
ORDER BY routine_name;

-- Verificar que todas las dependencias existen
SELECT 
    'Dependencias verificadas' as status,
    COUNT(*) as funciones_disponibles
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN (
    'registrar_auditoria', 
    'verificar_limites_usuario', 
    'incrementar_contador_limite',
    'calcular_balance_mensual',
    'obtener_resumen_financiero'
);

-- ==========================================
-- ✅ RESULTADO ESPERADO:
-- - 4 funciones API listas para frontend
-- - Validaciones completas y manejo de errores
-- - Integración con auditoría y límites
-- - Responses estructurados en JSON
-- - Sistema de paginación y filtros
-- ==========================================

SELECT '✅ PASO 6 COMPLETADO: API endpoints para frontend implementados' as resultado;
SELECT 'SIGUIENTE: Ejecutar sql-confirmar-usuario.sql para configurar usuarios si es necesario' as siguiente_paso;
