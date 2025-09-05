-- 🧮 MÓDULO 3: FUNCIONES DE NEGOCIO - SCRIPT COMPLETO
-- Ejecutar DESPUÉS de verificar que Módulo 2 funciona correctamente

-- ====================================================================
-- VERIFICACIÓN PREVIA: Confirmar que tablas del Módulo 2 existen
-- ====================================================================

DO $$
DECLARE
    tabla_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO tabla_count
    FROM information_schema.tables
    WHERE table_schema = 'public' 
    AND table_name IN ('perfiles_usuario', 'ingresos', 'gastos', 'simulaciones_credito');
    
    IF tabla_count < 4 THEN
        RAISE EXCEPTION 'MÓDULO 2 INCOMPLETO: Faltan tablas. Ejecutar modulo2-completo.sql primero';
    ELSE
        RAISE NOTICE '✅ MÓDULO 2 VERIFICADO: 4 tablas encontradas';
    END IF;
END
$$;

-- ====================================================================
-- FUNCIÓN 1: CALCULAR BALANCE MENSUAL AVANZADO
-- ====================================================================

CREATE OR REPLACE FUNCTION calcular_balance_mensual(
    p_usuario_id UUID,
    p_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
    p_month INTEGER DEFAULT EXTRACT(MONTH FROM NOW())
)
RETURNS JSON AS $$
DECLARE
    total_ingresos DECIMAL(12,2);
    total_gastos DECIMAL(12,2);
    balance DECIMAL(12,2);
    ingresos_por_categoria JSON;
    gastos_por_categoria JSON;
    transacciones_count INTEGER;
    promedio_diario DECIMAL(12,2);
BEGIN
    -- Validar autorización (RLS automático + validación explícita)
    IF auth.uid() != p_usuario_id THEN
        RAISE EXCEPTION 'Acceso denegado: Solo puedes ver tu propio balance';
    END IF;
    
    -- Validar parámetros
    IF p_year < 2020 OR p_year > 2030 THEN
        RAISE EXCEPTION 'Año debe estar entre 2020 y 2030';
    END IF;
    
    IF p_month < 1 OR p_month > 12 THEN
        RAISE EXCEPTION 'Mes debe estar entre 1 y 12';
    END IF;
    
    -- Calcular totales con índices optimizados
    SELECT COALESCE(SUM(monto), 0), COUNT(*) 
    INTO total_ingresos, transacciones_count
    FROM ingresos 
    WHERE usuario_id = p_usuario_id 
    AND EXTRACT(YEAR FROM fecha) = p_year
    AND EXTRACT(MONTH FROM fecha) = p_month;
    
    SELECT COALESCE(SUM(monto), 0) INTO total_gastos
    FROM gastos 
    WHERE usuario_id = p_usuario_id 
    AND EXTRACT(YEAR FROM fecha) = p_year
    AND EXTRACT(MONTH FROM fecha) = p_month;
    
    balance := total_ingresos - total_gastos;
    
    -- Promedio diario (considerando días del mes)
    promedio_diario := balance / EXTRACT(DAY FROM (MAKE_DATE(p_year, p_month, 1) + INTERVAL '1 month - 1 day'));
    
    -- Desglose por categorías para ingresos
    SELECT json_object_agg(categoria, json_build_object(
        'total', total_categoria,
        'porcentaje', CASE WHEN total_ingresos > 0 
            THEN ROUND((total_categoria * 100 / total_ingresos), 2) 
            ELSE 0 END,
        'transacciones', count_categoria
    )) INTO ingresos_por_categoria
    FROM (
        SELECT 
            categoria, 
            SUM(monto) as total_categoria,
            COUNT(*) as count_categoria
        FROM ingresos 
        WHERE usuario_id = p_usuario_id 
        AND EXTRACT(YEAR FROM fecha) = p_year
        AND EXTRACT(MONTH FROM fecha) = p_month
        GROUP BY categoria
    ) subcategories;
    
    -- Desglose por categorías para gastos
    SELECT json_object_agg(categoria, json_build_object(
        'total', total_categoria,
        'porcentaje', CASE WHEN total_gastos > 0 
            THEN ROUND((total_categoria * 100 / total_gastos), 2) 
            ELSE 0 END,
        'transacciones', count_categoria
    )) INTO gastos_por_categoria
    FROM (
        SELECT 
            categoria, 
            SUM(monto) as total_categoria,
            COUNT(*) as count_categoria
        FROM gastos 
        WHERE usuario_id = p_usuario_id 
        AND EXTRACT(YEAR FROM fecha) = p_year
        AND EXTRACT(MONTH FROM fecha) = p_month
        GROUP BY categoria
    ) subcategories;
    
    -- Retornar JSON completo
    RETURN json_build_object(
        'metadata', json_build_object(
            'usuario_id', p_usuario_id,
            'periodo', json_build_object('year', p_year, 'month', p_month),
            'fecha_calculo', NOW(),
            'total_transacciones', transacciones_count
        ),
        'totales', json_build_object(
            'ingresos', total_ingresos,
            'gastos', total_gastos,
            'balance', balance,
            'promedio_diario', ROUND(promedio_diario, 2)
        ),
        'categorias', json_build_object(
            'ingresos', COALESCE(ingresos_por_categoria, '{}'::json),
            'gastos', COALESCE(gastos_por_categoria, '{}'::json)
        ),
        'estado', json_build_object(
            'balance_estado', CASE 
                WHEN balance > 0 THEN 'positivo'
                WHEN balance < 0 THEN 'negativo'
                ELSE 'neutro'
            END,
            'nivel_gastos', CASE 
                WHEN total_ingresos = 0 THEN 'sin_ingresos'
                WHEN total_gastos > total_ingresos THEN 'excesivo'
                WHEN total_gastos > total_ingresos * 0.8 THEN 'alto'
                WHEN total_gastos > total_ingresos * 0.6 THEN 'moderado'
                ELSE 'bajo'
            END
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================
-- FUNCIÓN 2: SIMULADOR DE CRÉDITO COMPLETO CON AMORTIZACIÓN
-- ====================================================================

CREATE OR REPLACE FUNCTION simular_credito_completo(
    p_usuario_id UUID,
    p_monto_prestamo DECIMAL(12,2),
    p_tasa_anual DECIMAL(5,2),
    p_plazo_meses INTEGER,
    p_nombre_simulacion TEXT DEFAULT NULL,
    p_guardar_simulacion BOOLEAN DEFAULT FALSE
)
RETURNS JSON AS $$
DECLARE
    tasa_mensual DECIMAL(10,8);
    cuota_mensual DECIMAL(12,2);
    total_pagar DECIMAL(12,2);
    total_intereses DECIMAL(12,2);
    tabla_amortizacion JSON[];
    mes INTEGER;
    saldo_actual DECIMAL(12,2);
    interes_mes DECIMAL(12,2);
    capital_mes DECIMAL(12,2);
    simulacion_id UUID;
    ingreso_promedio DECIMAL(12,2);
    capacidad_pago DECIMAL(5,2);
BEGIN
    -- Validaciones de entrada estrictas
    IF p_monto_prestamo <= 0 OR p_monto_prestamo > 999999999 THEN
        RAISE EXCEPTION 'El monto del préstamo debe estar entre $1 y $999,999,999';
    END IF;
    
    IF p_tasa_anual <= 0 OR p_tasa_anual > 100 THEN
        RAISE EXCEPTION 'La tasa de interés debe estar entre 0.01%% y 100%%';
    END IF;
    
    IF p_plazo_meses <= 0 OR p_plazo_meses > 600 THEN
        RAISE EXCEPTION 'El plazo debe estar entre 1 y 600 meses (50 años)';
    END IF;
    
    -- Calcular capacidad de pago basada en ingresos históricos
    SELECT COALESCE(AVG(total_mensual), 0) INTO ingreso_promedio
    FROM (
        SELECT 
            EXTRACT(YEAR FROM fecha) as año,
            EXTRACT(MONTH FROM fecha) as mes,
            SUM(monto) as total_mensual
        FROM ingresos 
        WHERE usuario_id = p_usuario_id 
        AND fecha >= NOW() - INTERVAL '6 months'
        GROUP BY EXTRACT(YEAR FROM fecha), EXTRACT(MONTH FROM fecha)
    ) promedios;
    
    -- Cálculos financieros
    tasa_mensual := p_tasa_anual / 100 / 12;
    
    -- Fórmula de cuota fija (sistema francés)
    IF tasa_mensual = 0 THEN
        cuota_mensual := p_monto_prestamo / p_plazo_meses;
    ELSE
        cuota_mensual := p_monto_prestamo * 
            (tasa_mensual * POWER(1 + tasa_mensual, p_plazo_meses)) / 
            (POWER(1 + tasa_mensual, p_plazo_meses) - 1);
    END IF;
    
    total_pagar := cuota_mensual * p_plazo_meses;
    total_intereses := total_pagar - p_monto_prestamo;
    
    -- Calcular capacidad de pago como porcentaje de ingresos
    IF ingreso_promedio > 0 THEN
        capacidad_pago := (cuota_mensual * 100) / ingreso_promedio;
    ELSE
        capacidad_pago := 999; -- Sin historial de ingresos
    END IF;
    
    -- Generar tabla de amortización completa
    saldo_actual := p_monto_prestamo;
    tabla_amortizacion := ARRAY[]::JSON[];
    
    FOR mes IN 1..LEAST(p_plazo_meses, 360) LOOP -- Limitar tabla a 30 años para performance
        IF tasa_mensual = 0 THEN
            interes_mes := 0;
            capital_mes := cuota_mensual;
        ELSE
            interes_mes := saldo_actual * tasa_mensual;
            capital_mes := cuota_mensual - interes_mes;
        END IF;
        
        -- Prevenir saldo negativo por redondeo
        IF capital_mes > saldo_actual THEN
            capital_mes := saldo_actual;
            cuota_mensual := capital_mes + interes_mes;
        END IF;
        
        saldo_actual := saldo_actual - capital_mes;
        
        tabla_amortizacion := tabla_amortizacion || json_build_object(
            'mes', mes,
            'fecha', (MAKE_DATE(EXTRACT(YEAR FROM NOW())::INTEGER, EXTRACT(MONTH FROM NOW())::INTEGER, 1) + 
                     (mes - 1 || ' months')::INTERVAL),
            'cuota', ROUND(cuota_mensual, 2),
            'interes', ROUND(interes_mes, 2),
            'capital', ROUND(capital_mes, 2),
            'saldo', ROUND(GREATEST(saldo_actual, 0), 2),
            'interes_acumulado', ROUND((mes * interes_mes), 2)
        )::JSON;
        
        -- Salir si el saldo llega a cero
        IF saldo_actual <= 0.01 THEN
            EXIT;
        END IF;
    END LOOP;
    
    -- Guardar simulación si se solicita
    IF p_guardar_simulacion THEN
        IF p_nombre_simulacion IS NULL OR LENGTH(TRIM(p_nombre_simulacion)) = 0 THEN
            p_nombre_simulacion := 'Simulación ' || TO_CHAR(NOW(), 'DD/MM/YYYY HH24:MI');
        END IF;
        
        INSERT INTO simulaciones_credito (
            usuario_id, nombre_simulacion, monto_prestamo, 
            tasa_interes, plazo_meses, cuota_mensual, 
            total_intereses, total_pagar
        ) VALUES (
            p_usuario_id, TRIM(p_nombre_simulacion), p_monto_prestamo,
            p_tasa_anual, p_plazo_meses, ROUND(cuota_mensual, 2),
            ROUND(total_intereses, 2), ROUND(total_pagar, 2)
        ) RETURNING id INTO simulacion_id;
    END IF;
    
    -- Retornar resultado completo
    RETURN json_build_object(
        'resumen', json_build_object(
            'monto_prestamo', p_monto_prestamo,
            'tasa_anual', p_tasa_anual,
            'tasa_mensual', ROUND(tasa_mensual * 100, 4),
            'plazo_meses', p_plazo_meses,
            'plazo_años', ROUND(p_plazo_meses::DECIMAL / 12, 1),
            'cuota_mensual', ROUND(cuota_mensual, 2),
            'total_pagar', ROUND(total_pagar, 2),
            'total_intereses', ROUND(total_intereses, 2),
            'costo_total_porcentaje', ROUND((total_intereses * 100) / p_monto_prestamo, 2)
        ),
        'analisis', json_build_object(
            'ingreso_promedio_mensual', ROUND(ingreso_promedio, 2),
            'capacidad_pago_porcentaje', ROUND(capacidad_pago, 2),
            'recomendacion', CASE 
                WHEN capacidad_pago <= 30 THEN 'excelente'
                WHEN capacidad_pago <= 40 THEN 'bueno'
                WHEN capacidad_pago <= 50 THEN 'aceptable'
                WHEN capacidad_pago <= 70 THEN 'riesgoso'
                ELSE 'no_recomendado'
            END,
            'cuota_vs_ingresos', CASE 
                WHEN ingreso_promedio = 0 THEN 'sin_datos'
                WHEN capacidad_pago <= 30 THEN 'optima'
                WHEN capacidad_pago <= 50 THEN 'manejable'
                ELSE 'excesiva'
            END
        ),
        'tabla_amortizacion', array_to_json(tabla_amortizacion),
        'simulacion', json_build_object(
            'id', simulacion_id,
            'guardado', p_guardar_simulacion AND simulacion_id IS NOT NULL,
            'nombre', p_nombre_simulacion,
            'fecha_creacion', NOW()
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================
-- FUNCIÓN 3: RESUMEN FINANCIERO COMPLETO CON ALERTAS INTELIGENTES
-- ====================================================================

CREATE OR REPLACE FUNCTION obtener_resumen_financiero(
    p_usuario_id UUID
)
RETURNS JSON AS $$
DECLARE
    resumen_actual JSON;
    resumen_anterior JSON;
    resumen_hace_6_meses JSON;
    tendencias JSON;
    alertas JSON[];
    simulaciones_recientes JSON;
    estadisticas JSON;
BEGIN
    -- Validar autorización
    IF auth.uid() != p_usuario_id THEN
        RAISE EXCEPTION 'Acceso denegado: Solo puedes ver tu propio resumen';
    END IF;
    
    -- Mes actual
    SELECT calcular_balance_mensual(
        p_usuario_id, 
        EXTRACT(YEAR FROM NOW())::INTEGER,
        EXTRACT(MONTH FROM NOW())::INTEGER
    ) INTO resumen_actual;
    
    -- Mes anterior para comparación
    SELECT calcular_balance_mensual(
        p_usuario_id,
        EXTRACT(YEAR FROM (NOW() - INTERVAL '1 month'))::INTEGER,
        EXTRACT(MONTH FROM (NOW() - INTERVAL '1 month'))::INTEGER
    ) INTO resumen_anterior;
    
    -- Hace 6 meses para tendencia a largo plazo
    SELECT calcular_balance_mensual(
        p_usuario_id,
        EXTRACT(YEAR FROM (NOW() - INTERVAL '6 months'))::INTEGER,
        EXTRACT(MONTH FROM (NOW() - INTERVAL '6 months'))::INTEGER
    ) INTO resumen_hace_6_meses;
    
    -- Calcular tendencias detalladas
    SELECT json_build_object(
        'ingresos', json_build_object(
            'cambio_mensual', CASE 
                WHEN (resumen_anterior->'totales'->>'ingresos')::DECIMAL > 0 THEN
                    ROUND(((resumen_actual->'totales'->>'ingresos')::DECIMAL - 
                           (resumen_anterior->'totales'->>'ingresos')::DECIMAL) * 100 / 
                           (resumen_anterior->'totales'->>'ingresos')::DECIMAL, 2)
                ELSE NULL
            END,
            'cambio_semestral', CASE 
                WHEN (resumen_hace_6_meses->'totales'->>'ingresos')::DECIMAL > 0 THEN
                    ROUND(((resumen_actual->'totales'->>'ingresos')::DECIMAL - 
                           (resumen_hace_6_meses->'totales'->>'ingresos')::DECIMAL) * 100 / 
                           (resumen_hace_6_meses->'totales'->>'ingresos')::DECIMAL, 2)
                ELSE NULL
            END
        ),
        'gastos', json_build_object(
            'cambio_mensual', CASE 
                WHEN (resumen_anterior->'totales'->>'gastos')::DECIMAL > 0 THEN
                    ROUND(((resumen_actual->'totales'->>'gastos')::DECIMAL - 
                           (resumen_anterior->'totales'->>'gastos')::DECIMAL) * 100 / 
                           (resumen_anterior->'totales'->>'gastos')::DECIMAL, 2)
                ELSE NULL
            END,
            'cambio_semestral', CASE 
                WHEN (resumen_hace_6_meses->'totales'->>'gastos')::DECIMAL > 0 THEN
                    ROUND(((resumen_actual->'totales'->>'gastos')::DECIMAL - 
                           (resumen_hace_6_meses->'totales'->>'gastos')::DECIMAL) * 100 / 
                           (resumen_hace_6_meses->'totales'->>'gastos')::DECIMAL, 2)
                ELSE NULL
            END
        )
    ) INTO tendencias;
    
    -- Generar alertas inteligentes
    alertas := ARRAY[]::JSON[];
    
    -- Alerta: Balance negativo
    IF (resumen_actual->'totales'->>'balance')::DECIMAL < 0 THEN
        alertas := alertas || json_build_object(
            'tipo', 'balance_negativo',
            'nivel', 'critico',
            'titulo', 'Balance Negativo',
            'mensaje', 'Tus gastos superan tus ingresos este mes',
            'valor', (resumen_actual->'totales'->>'balance')::DECIMAL,
            'recomendacion', 'Revisa tus gastos y reduce los no esenciales'
        )::JSON;
    END IF;
    
    -- Alerta: Gastos excesivos
    IF (resumen_actual->'totales'->>'gastos')::DECIMAL > (resumen_actual->'totales'->>'ingresos')::DECIMAL * 0.8 THEN
        alertas := alertas || json_build_object(
            'tipo', 'gastos_altos',
            'nivel', 'advertencia',
            'titulo', 'Gastos Elevados',
            'mensaje', 'Tus gastos representan más del 80% de tus ingresos',
            'porcentaje', ROUND((resumen_actual->'totales'->>'gastos')::DECIMAL * 100 / 
                              NULLIF((resumen_actual->'totales'->>'ingresos')::DECIMAL, 0), 2),
            'recomendacion', 'Intenta mantener los gastos por debajo del 70% de ingresos'
        )::JSON;
    END IF;
    
    -- Alerta: Tendencia negativa en ingresos
    IF (tendencias->'ingresos'->>'cambio_mensual')::DECIMAL < -10 THEN
        alertas := alertas || json_build_object(
            'tipo', 'ingresos_bajando',
            'nivel', 'info',
            'titulo', 'Ingresos en Descenso',
            'mensaje', 'Tus ingresos han disminuido significativamente',
            'cambio', (tendencias->'ingresos'->>'cambio_mensual')::DECIMAL,
            'recomendacion', 'Considera nuevas fuentes de ingreso o revisa tu situación laboral'
        )::JSON;
    END IF;
    
    -- Obtener simulaciones recientes
    SELECT json_agg(json_build_object(
        'id', id,
        'nombre', nombre_simulacion,
        'monto_prestamo', monto_prestamo,
        'cuota_mensual', cuota_mensual,
        'tasa_interes', tasa_interes,
        'plazo_meses', plazo_meses,
        'created_at', created_at,
        'capacidad_pago', CASE 
            WHEN (resumen_actual->'totales'->>'ingresos')::DECIMAL > 0 THEN
                ROUND((cuota_mensual * 100) / (resumen_actual->'totales'->>'ingresos')::DECIMAL, 2)
            ELSE NULL
        END
    ) ORDER BY created_at DESC)
    INTO simulaciones_recientes
    FROM simulaciones_credito 
    WHERE usuario_id = p_usuario_id 
    AND created_at >= NOW() - INTERVAL '30 days'
    LIMIT 5;
    
    -- Estadísticas generales
    SELECT json_build_object(
        'total_transacciones_mes', (
            (SELECT COUNT(*) FROM ingresos WHERE usuario_id = p_usuario_id 
             AND fecha >= DATE_TRUNC('month', NOW())) +
            (SELECT COUNT(*) FROM gastos WHERE usuario_id = p_usuario_id 
             AND fecha >= DATE_TRUNC('month', NOW()))
        ),
        'categoria_gasto_mayor', (
            SELECT categoria
            FROM gastos 
            WHERE usuario_id = p_usuario_id 
            AND fecha >= DATE_TRUNC('month', NOW())
            GROUP BY categoria
            ORDER BY SUM(monto) DESC
            LIMIT 1
        ),
        'total_simulaciones', (
            SELECT COUNT(*) FROM simulaciones_credito 
            WHERE usuario_id = p_usuario_id
        )
    ) INTO estadisticas;
    
    -- Retornar resumen completo
    RETURN json_build_object(
        'metadata', json_build_object(
            'usuario_id', p_usuario_id,
            'fecha_generacion', NOW(),
            'version', 'v2.0'
        ),
        'periodo_actual', resumen_actual,
        'periodo_anterior', resumen_anterior,
        'tendencias', tendencias,
        'alertas', array_to_json(alertas),
        'simulaciones_recientes', COALESCE(simulaciones_recientes, '[]'::json),
        'estadisticas', estadisticas
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================
-- FUNCIÓN 4: FUNCIÓN AUXILIAR - OBTENER ESTADÍSTICAS HISTÓRICAS
-- ====================================================================

CREATE OR REPLACE FUNCTION obtener_estadisticas_historicas(
    p_usuario_id UUID,
    p_meses_atras INTEGER DEFAULT 12
)
RETURNS JSON AS $$
DECLARE
    estadisticas JSON;
BEGIN
    -- Validar parámetros
    IF p_meses_atras < 1 OR p_meses_atras > 60 THEN
        RAISE EXCEPTION 'Los meses atrás deben estar entre 1 y 60';
    END IF;
    
    SELECT json_build_object(
        'resumen_por_mes', (
            SELECT json_agg(json_build_object(
                'año', año,
                'mes', mes,
                'ingresos', total_ingresos,
                'gastos', total_gastos,
                'balance', total_ingresos - total_gastos,
                'transacciones', total_transacciones
            ) ORDER BY año DESC, mes DESC)
            FROM (
                SELECT 
                    EXTRACT(YEAR FROM fecha)::INTEGER as año,
                    EXTRACT(MONTH FROM fecha)::INTEGER as mes,
                    COALESCE(SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END), 0) as total_ingresos,
                    COALESCE(SUM(CASE WHEN tipo = 'gasto' THEN monto ELSE 0 END), 0) as total_gastos,
                    COUNT(*) as total_transacciones
                FROM (
                    SELECT fecha, monto, 'ingreso' as tipo FROM ingresos WHERE usuario_id = p_usuario_id
                    UNION ALL
                    SELECT fecha, monto, 'gasto' as tipo FROM gastos WHERE usuario_id = p_usuario_id
                ) todas_transacciones
                WHERE fecha >= DATE_TRUNC('month', NOW()) - (p_meses_atras || ' months')::INTERVAL
                GROUP BY EXTRACT(YEAR FROM fecha), EXTRACT(MONTH FROM fecha)
            ) mensuales
        ),
        'promedios', json_build_object(
            'ingreso_mensual_promedio', (
                SELECT ROUND(AVG(monto_mensual), 2)
                FROM (
                    SELECT SUM(monto) as monto_mensual
                    FROM ingresos
                    WHERE usuario_id = p_usuario_id
                    AND fecha >= NOW() - (p_meses_atras || ' months')::INTERVAL
                    GROUP BY EXTRACT(YEAR FROM fecha), EXTRACT(MONTH FROM fecha)
                ) promedios_ingresos
            ),
            'gasto_mensual_promedio', (
                SELECT ROUND(AVG(monto_mensual), 2)
                FROM (
                    SELECT SUM(monto) as monto_mensual
                    FROM gastos
                    WHERE usuario_id = p_usuario_id
                    AND fecha >= NOW() - (p_meses_atras || ' months')::INTERVAL
                    GROUP BY EXTRACT(YEAR FROM fecha), EXTRACT(MONTH FROM fecha)
                ) promedios_gastos
            )
        ),
        'categorias_populares', json_build_object(
            'ingresos', (
                SELECT json_agg(json_build_object('categoria', categoria, 'total', total, 'transacciones', count))
                FROM (
                    SELECT categoria, SUM(monto) as total, COUNT(*) as count
                    FROM ingresos
                    WHERE usuario_id = p_usuario_id
                    AND fecha >= NOW() - (p_meses_atras || ' months')::INTERVAL
                    GROUP BY categoria
                    ORDER BY SUM(monto) DESC
                    LIMIT 5
                ) top_ingresos
            ),
            'gastos', (
                SELECT json_agg(json_build_object('categoria', categoria, 'total', total, 'transacciones', count))
                FROM (
                    SELECT categoria, SUM(monto) as total, COUNT(*) as count
                    FROM gastos
                    WHERE usuario_id = p_usuario_id
                    AND fecha >= NOW() - (p_meses_atras || ' months')::INTERVAL
                    GROUP BY categoria
                    ORDER BY SUM(monto) DESC
                    LIMIT 5
                ) top_gastos
            )
        )
    ) INTO estadisticas;
    
    RETURN estadisticas;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================
-- VERIFICACIÓN FINAL: CONFIRMAR QUE TODAS LAS FUNCIONES SE CREARON
-- ====================================================================

DO $$
DECLARE
    funcion_count INTEGER;
    funciones_esperadas TEXT[] := ARRAY[
        'calcular_balance_mensual',
        'simular_credito_completo', 
        'obtener_resumen_financiero',
        'obtener_estadisticas_historicas'
    ];
    funcion_nombre TEXT;
BEGIN
    -- Verificar que todas las funciones existen
    SELECT COUNT(*) INTO funcion_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname = ANY(funciones_esperadas);
    
    IF funcion_count = array_length(funciones_esperadas, 1) THEN
        RAISE NOTICE '✅ MÓDULO 3 COMPLETADO: % funciones creadas exitosamente', funcion_count;
        
        -- Mostrar detalles de cada función
        FOR funcion_nombre IN SELECT unnest(funciones_esperadas) LOOP
            RAISE NOTICE '  ✅ %', funcion_nombre;
        END LOOP;
        
    ELSE
        RAISE EXCEPTION '❌ MÓDULO 3 INCOMPLETO: Solo % de % funciones creadas', 
            funcion_count, array_length(funciones_esperadas, 1);
    END IF;
END
$$;

-- ====================================================================
-- RESULTADO ESPERADO:
-- ✅ MÓDULO 3 COMPLETADO: 4 funciones creadas exitosamente
--   ✅ calcular_balance_mensual
--   ✅ simular_credito_completo
--   ✅ obtener_resumen_financiero
--   ✅ obtener_estadisticas_historicas
-- ====================================================================

-- 🎯 MÓDULO 3 COMPLETADO ✅
-- Siguiente: Probar las funciones con datos reales
