-- MÓDULO 4: API ENDPOINTS COMO FUNCIONES POSTGRESQL
-- Alternativa simplificada usando funciones de base de datos
-- Para ser usadas directamente desde el frontend

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
    
    -- Si hay errores de validación, retornarlos
    IF array_length(validation_errors, 1) > 0 THEN
        RETURN json_build_object(
            'success', false,
            'error', true,
            'message', 'Errores de validación',
            'validation_errors', array_to_json(validation_errors),
            'timestamp', NOW()
        );
    END IF;
    
    -- Verificar límite mensual (máximo 100 ingresos por mes)
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
            'descripcion', p_descripcion,
            'monthly_count', monthly_count + 1
        )
    );
    
    -- Obtener los datos completos del ingreso creado
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
    total_count INTEGER;
BEGIN
    -- Validar autorización
    IF auth.uid() != p_usuario_id THEN
        RAISE EXCEPTION 'Sin autorización para este usuario';
    END IF;
    
    -- Validar límite
    IF p_limite > 100 THEN
        RAISE EXCEPTION 'Límite máximo es 100 registros';
    END IF;
    
    -- Construir query con filtros
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
    SELECT 
        json_agg(
            json_build_object(
                'id', id,
                'descripcion', descripcion,
                'monto', monto,
                'categoria', categoria,
                'fecha', fecha,
                'created_at', created_at
            )
        ),
        COUNT(*)
    INTO ingresos_data, total_count
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
        ),
        category_stats AS (
            SELECT 
                json_agg(
                    json_build_object(
                        'categoria', categoria,
                        'total', total_categoria,
                        'count', count_categoria,
                        'porcentaje', ROUND((total_categoria::DECIMAL / NULLIF(total_general, 0) * 100)::NUMERIC, 2)
                    )
                ) as por_categoria
            FROM (
                SELECT 
                    categoria,
                    SUM(monto) as total_categoria,
                    COUNT(*) as count_categoria,
                    SUM(SUM(monto)) OVER() as total_general
                FROM ingresos
                WHERE usuario_id = p_usuario_id
                AND (p_categoria IS NULL OR categoria = p_categoria)
                AND (p_fecha_desde IS NULL OR fecha >= p_fecha_desde)
                AND (p_fecha_hasta IS NULL OR fecha <= p_fecha_hasta)
                GROUP BY categoria
            ) cat_summary
        )
        SELECT json_build_object(
            'total_registros', sc.total_registros,
            'total_monto', sc.total_monto,
            'promedio_monto', ROUND(sc.promedio_monto::NUMERIC, 2),
            'maximo_monto', sc.maximo_monto,
            'minimo_monto', sc.minimo_monto,
            'por_categoria', cs.por_categoria
        )
        INTO stats_data
        FROM stats_calc sc
        CROSS JOIN category_stats cs;
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

-- Función: API Dashboard completo con métricas avanzadas
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
    insights_data JSON;
    current_year INTEGER := EXTRACT(YEAR FROM CURRENT_DATE);
    current_month INTEGER := EXTRACT(MONTH FROM CURRENT_DATE);
    previous_month INTEGER;
    previous_year INTEGER;
BEGIN
    -- Validar autorización
    IF auth.uid() != p_usuario_id THEN
        RAISE EXCEPTION 'Sin autorización para este usuario';
    END IF;
    
    -- Calcular mes anterior
    IF current_month = 1 THEN
        previous_month := 12;
        previous_year := current_year - 1;
    ELSE
        previous_month := current_month - 1;
        previous_year := current_year;
    END IF;
    
    -- 1. Obtener balance actual usando función existente
    SELECT calcular_balance_mensual(p_usuario_id, current_year, current_month)
    INTO balance_data;
    
    -- 2. Obtener tendencias usando función existente
    SELECT obtener_estadisticas_historicas(p_usuario_id, 6)
    INTO trends_data;
    
    -- 3. Obtener breakdown por categorías del mes actual
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
    ),
    ingresos_totales AS (
        SELECT 
            COALESCE(SUM(total), 0) as total_ingresos,
            json_agg(
                json_build_object('categoria', categoria, 'total', total)
            ) as por_categoria
        FROM ingresos_mes
    ),
    gastos_totales AS (
        SELECT 
            COALESCE(SUM(total), 0) as total_gastos,
            json_agg(
                json_build_object('categoria', categoria, 'total', total)
            ) as por_categoria
        FROM gastos_mes
    )
    SELECT json_build_object(
        'ingresos', json_build_object(
            'total', it.total_ingresos,
            'por_categoria', COALESCE(it.por_categoria, '[]'::json)
        ),
        'gastos', json_build_object(
            'total', gt.total_gastos,
            'por_categoria', COALESCE(gt.por_categoria, '[]'::json)
        )
    )
    INTO categories_data
    FROM ingresos_totales it
    CROSS JOIN gastos_totales gt;
    
    -- 4. Generar alertas inteligentes
    WITH recent_expenses AS (
        SELECT AVG(monto) as avg_expense, COUNT(*) as expense_count
        FROM gastos
        WHERE usuario_id = p_usuario_id
        AND fecha >= CURRENT_DATE - INTERVAL '7 days'
    ),
    balance_info AS (
        SELECT 
            (balance_data->>'balance')::DECIMAL as current_balance,
            (balance_data->>'ingresos')::DECIMAL as current_ingresos
    ),
    alert_calculations AS (
        SELECT
            CASE 
                WHEN bi.current_ingresos > 0 THEN 
                    (bi.current_balance / bi.current_ingresos * 100)
                ELSE 0 
            END as savings_rate,
            re.expense_count,
            bi.current_balance
        FROM balance_info bi
        CROSS JOIN recent_expenses re
    )
    SELECT json_agg(alert) INTO alerts_data
    FROM (
        SELECT json_build_object(
            'type', 
            CASE 
                WHEN ac.current_balance < 0 THEN 'error'
                WHEN ac.savings_rate >= 30 THEN 'success'
                WHEN ac.savings_rate < 5 AND ac.current_balance > 0 THEN 'warning'
                ELSE 'info'
            END,
            'title',
            CASE 
                WHEN ac.current_balance < 0 THEN 'Balance Negativo'
                WHEN ac.savings_rate >= 30 THEN 'Excelente Control Financiero'
                WHEN ac.savings_rate < 5 AND ac.current_balance > 0 THEN 'Oportunidad de Mejora'
                ELSE 'Estado Financiero Normal'
            END,
            'message',
            CASE 
                WHEN ac.current_balance < 0 THEN 'Tus gastos superan tus ingresos este mes'
                WHEN ac.savings_rate >= 30 THEN 'Has ahorrado ' || ROUND(ac.savings_rate::NUMERIC, 1) || '% de tus ingresos'
                WHEN ac.savings_rate < 5 AND ac.current_balance > 0 THEN 'Solo has ahorrado ' || ROUND(ac.savings_rate::NUMERIC, 1) || '% este mes'
                ELSE 'Tu situación financiera es estable'
            END,
            'priority',
            CASE 
                WHEN ac.current_balance < 0 THEN 'high'
                WHEN ac.savings_rate >= 30 THEN 'low'
                WHEN ac.savings_rate < 5 AND ac.current_balance > 0 THEN 'medium'
                ELSE 'low'
            END
        ) as alert
        FROM alert_calculations ac
        WHERE ac.current_balance < 0 OR ac.savings_rate >= 30 OR (ac.savings_rate < 5 AND ac.current_balance > 0)
    ) alerts;
    
    -- 5. Generar insights básicos
    WITH expense_analysis AS (
        SELECT 
            categoria,
            SUM(monto) as total,
            COUNT(*) as count
        FROM gastos
        WHERE usuario_id = p_usuario_id
        AND EXTRACT(YEAR FROM fecha) = current_year
        AND EXTRACT(MONTH FROM fecha) = current_month
        GROUP BY categoria
        ORDER BY total DESC
        LIMIT 1
    )
    SELECT json_agg(insight) INTO insights_data
    FROM (
        SELECT json_build_object(
            'type', 'expense_analysis',
            'message', 'Tu mayor gasto este mes es en ' || ea.categoria || ' ($' || ea.total || ')',
            'suggestion', 'Revisa gastos en esta categoría para oportunidades de ahorro',
            'impact', 'neutral'
        ) as insight
        FROM expense_analysis ea
        WHERE ea.total > 0
    ) insights;
    
    -- Retornar dashboard completo
    RETURN json_build_object(
        'success', true,
        'data', json_build_object(
            'balance', balance_data,
            'trends', trends_data,
            'categories', categories_data,
            'alerts', COALESCE(alerts_data, '[]'::json),
            'insights', COALESCE(insights_data, '[]'::json),
            'period', p_periodo,
            'generated_at', NOW()
        ),
        'message', 'Dashboard generado exitosamente',
        'metadata', json_build_object(
            'user_id', p_usuario_id,
            'period', p_periodo,
            'data_sources', json_build_array('ingresos', 'gastos', 'funciones_negocio')
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
    batch_stats JSON;
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
    
    -- Procesar cada ingreso en el lote
    FOR i IN 0..json_array_length(p_ingresos)-1 LOOP
        ingreso_item := p_ingresos->i;
        
        -- Validaciones básicas para cada item
        IF NOT (ingreso_item ? 'descripcion' AND ingreso_item ? 'monto' AND ingreso_item ? 'categoria') THEN
            validation_errors := array_append(validation_errors, 'Ingreso ' || (i+1) || ': campos requeridos faltantes');
            CONTINUE;
        END IF;
        
        -- Insertar si pasa validaciones
        BEGIN
            INSERT INTO ingresos (usuario_id, descripcion, monto, categoria, fecha)
            VALUES (
                p_usuario_id,
                ingreso_item->>'descripcion',
                (ingreso_item->>'monto')::DECIMAL,
                ingreso_item->>'categoria',
                COALESCE((ingreso_item->>'fecha')::DATE, CURRENT_DATE)
            )
            RETURNING id INTO new_ingresos[array_length(new_ingresos, 1) + 1];
            
            total_inserted := total_inserted + 1;
            
        EXCEPTION
            WHEN OTHERS THEN
                validation_errors := array_append(validation_errors, 'Ingreso ' || (i+1) || ': ' || SQLERRM);
        END;
    END LOOP;
    
    -- Registrar auditoría del lote
    INSERT INTO logs_auditoria (usuario_id, accion, tabla, detalles)
    VALUES (
        p_usuario_id,
        'BULK_CREATE_INGRESOS_API',
        'ingresos',
        json_build_object(
            'total_procesados', json_array_length(p_ingresos),
            'total_insertados', total_inserted,
            'errores', validation_errors
        )
    );
    
    -- Calcular estadísticas del lote
    SELECT json_build_object(
        'total_procesados', json_array_length(p_ingresos),
        'total_exitosos', total_inserted,
        'total_errores', array_length(validation_errors, 1),
        'sum_montos', (
            SELECT SUM(monto)
            FROM ingresos
            WHERE id = ANY(new_ingresos)
        )
    ) INTO batch_stats;
    
    RETURN json_build_object(
        'success', total_inserted > 0,
        'data', json_build_object(
            'inserted_ids', array_to_json(new_ingresos),
            'stats', batch_stats
        ),
        'message', total_inserted || ' ingresos creados exitosamente de ' || json_array_length(p_ingresos) || ' procesados',
        'validation_errors', CASE WHEN array_length(validation_errors, 1) > 0 THEN array_to_json(validation_errors) ELSE NULL END,
        'timestamp', NOW()
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', true,
            'message', 'Error en procesamiento de lote: ' || SQLERRM,
            'timestamp', NOW()
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
