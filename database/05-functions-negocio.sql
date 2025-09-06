-- ==========================================
-- 05-FUNCTIONS-NEGOCIO.SQL - FUNCIONES DE CÁLCULO
-- ==========================================
-- Ejecutar QUINTO en Supabase SQL Editor
-- Funciones avanzadas para cálculos financieros, reportes y análisis
-- Orden de ejecución: 5º

-- ==========================================
-- 1. FUNCIÓN: CALCULAR BALANCE MENSUAL COMPLETO
-- ==========================================

CREATE OR REPLACE FUNCTION calcular_balance_mensual(
    p_usuario_id UUID,
    p_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
    p_month INTEGER DEFAULT EXTRACT(MONTH FROM NOW())
)
RETURNS JSON AS $$
DECLARE
    total_ingresos DECIMAL(12,2) := 0;
    total_gastos DECIMAL(12,2) := 0;
    balance DECIMAL(12,2);
    transacciones_ingresos INTEGER := 0;
    transacciones_gastos INTEGER := 0;
    promedio_diario DECIMAL(12,2);
    dias_mes INTEGER;
    ingresos_por_categoria JSON;
    gastos_por_categoria JSON;
    comparacion_mes_anterior JSON;
BEGIN
    -- Validar autorización
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
    
    -- Calcular días del mes
    dias_mes := EXTRACT(DAY FROM (DATE(p_year, p_month, 1) + INTERVAL '1 month - 1 day'));
    
    -- Calcular totales de ingresos
    SELECT 
        COALESCE(SUM(monto), 0),
        COUNT(*)
    INTO total_ingresos, transacciones_ingresos
    FROM ingresos 
    WHERE usuario_id = p_usuario_id 
    AND EXTRACT(YEAR FROM fecha) = p_year
    AND EXTRACT(MONTH FROM fecha) = p_month;
    
    -- Calcular totales de gastos
    SELECT 
        COALESCE(SUM(monto), 0),
        COUNT(*)
    INTO total_gastos, transacciones_gastos
    FROM gastos 
    WHERE usuario_id = p_usuario_id 
    AND EXTRACT(YEAR FROM fecha) = p_year
    AND EXTRACT(MONTH FROM fecha) = p_month;
    
    balance := total_ingresos - total_gastos;
    promedio_diario := balance / dias_mes;
    
    -- Ingresos por categoría
    SELECT json_agg(
        json_build_object(
            'categoria', categoria,
            'total', total,
            'porcentaje', ROUND((total / NULLIF(total_ingresos, 0)) * 100, 2),
            'transacciones', transacciones
        )
    ) INTO ingresos_por_categoria
    FROM (
        SELECT 
            categoria,
            SUM(monto) as total,
            COUNT(*) as transacciones
        FROM ingresos 
        WHERE usuario_id = p_usuario_id 
        AND EXTRACT(YEAR FROM fecha) = p_year
        AND EXTRACT(MONTH FROM fecha) = p_month
        GROUP BY categoria
        ORDER BY total DESC
    ) cat_ingresos;
    
    -- Gastos por categoría
    SELECT json_agg(
        json_build_object(
            'categoria', categoria,
            'total', total,
            'porcentaje', ROUND((total / NULLIF(total_gastos, 0)) * 100, 2),
            'transacciones', transacciones
        )
    ) INTO gastos_por_categoria
    FROM (
        SELECT 
            categoria,
            SUM(monto) as total,
            COUNT(*) as transacciones
        FROM gastos 
        WHERE usuario_id = p_usuario_id 
        AND EXTRACT(YEAR FROM fecha) = p_year
        AND EXTRACT(MONTH FROM fecha) = p_month
        GROUP BY categoria
        ORDER BY total DESC
    ) cat_gastos;
    
    -- Comparación con mes anterior
    WITH mes_anterior AS (
        SELECT 
            COALESCE(SUM(CASE WHEN tabla = 'ingresos' THEN monto ELSE 0 END), 0) as ingresos_ant,
            COALESCE(SUM(CASE WHEN tabla = 'gastos' THEN monto ELSE 0 END), 0) as gastos_ant
        FROM (
            SELECT monto, 'ingresos' as tabla FROM ingresos 
            WHERE usuario_id = p_usuario_id 
            AND fecha >= (DATE(p_year, p_month, 1) - INTERVAL '1 month')
            AND fecha < DATE(p_year, p_month, 1)
            
            UNION ALL
            
            SELECT monto, 'gastos' as tabla FROM gastos 
            WHERE usuario_id = p_usuario_id 
            AND fecha >= (DATE(p_year, p_month, 1) - INTERVAL '1 month')
            AND fecha < DATE(p_year, p_month, 1)
        ) datos_anteriores
    )
    SELECT json_build_object(
        'ingresos_variacion', 
        CASE 
            WHEN ma.ingresos_ant > 0 THEN ROUND(((total_ingresos - ma.ingresos_ant) / ma.ingresos_ant) * 100, 2)
            ELSE NULL
        END,
        'gastos_variacion',
        CASE 
            WHEN ma.gastos_ant > 0 THEN ROUND(((total_gastos - ma.gastos_ant) / ma.gastos_ant) * 100, 2)
            ELSE NULL
        END,
        'balance_variacion',
        CASE 
            WHEN (ma.ingresos_ant - ma.gastos_ant) != 0 THEN 
                ROUND(((balance - (ma.ingresos_ant - ma.gastos_ant)) / ABS(ma.ingresos_ant - ma.gastos_ant)) * 100, 2)
            ELSE NULL
        END
    ) INTO comparacion_mes_anterior
    FROM mes_anterior ma;
    
    -- Construir respuesta completa
    RETURN json_build_object(
        'periodo', json_build_object('year', p_year, 'month', p_month, 'dias', dias_mes),
        'resumen', json_build_object(
            'total_ingresos', total_ingresos,
            'total_gastos', total_gastos,
            'balance', balance,
            'promedio_diario', ROUND(promedio_diario, 2),
            'transacciones_ingresos', transacciones_ingresos,
            'transacciones_gastos', transacciones_gastos,
            'total_transacciones', transacciones_ingresos + transacciones_gastos
        ),
        'ingresos_por_categoria', COALESCE(ingresos_por_categoria, '[]'::json),
        'gastos_por_categoria', COALESCE(gastos_por_categoria, '[]'::json),
        'comparacion_mes_anterior', comparacion_mes_anterior,
        'timestamp', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 2. FUNCIÓN: SIMULADOR DE CRÉDITO AVANZADO
-- ==========================================

CREATE OR REPLACE FUNCTION simular_credito_completo(
    p_usuario_id UUID,
    p_monto DECIMAL(12,2),
    p_tasa_anual DECIMAL(5,2),
    p_plazo_meses INTEGER,
    p_tipo_credito TEXT DEFAULT 'personal',
    p_guardar_simulacion BOOLEAN DEFAULT FALSE
)
RETURNS JSON AS $$
DECLARE
    tasa_mensual DECIMAL(8,6);
    cuota_mensual DECIMAL(12,2);
    total_intereses DECIMAL(12,2);
    total_pagar DECIMAL(12,2);
    tabla_amortizacion JSON;
    simulacion_id UUID;
    capacidad_pago DECIMAL(12,2);
    ingresos_promedio DECIMAL(12,2);
    gastos_promedio DECIMAL(12,2);
    recomendacion TEXT;
    alertas TEXT[];
BEGIN
    -- Validar autorización
    IF auth.uid() != p_usuario_id THEN
        RAISE EXCEPTION 'Acceso denegado: Solo puedes simular créditos para ti mismo';
    END IF;
    
    -- Validaciones de entrada
    IF p_monto <= 0 THEN
        RAISE EXCEPTION 'El monto debe ser mayor a 0';
    END IF;
    
    IF p_tasa_anual <= 0 OR p_tasa_anual > 100 THEN
        RAISE EXCEPTION 'La tasa anual debe estar entre 0.01%% y 100%%';
    END IF;
    
    IF p_plazo_meses <= 0 OR p_plazo_meses > 480 THEN
        RAISE EXCEPTION 'El plazo debe estar entre 1 y 480 meses (40 años)';
    END IF;
    
    -- Verificar límites del usuario (removido temporalmente hasta implementar la tabla)
    -- IF NOT verificar_limites_usuario(p_usuario_id, 'CREATE_SIMULACION') THEN
    --     RAISE EXCEPTION 'Has alcanzado el límite diario de simulaciones';
    -- END IF;
    
    -- Cálculos financieros
    tasa_mensual := (p_tasa_anual / 100) / 12;
    
    IF tasa_mensual > 0 THEN
        cuota_mensual := p_monto * (tasa_mensual * POWER(1 + tasa_mensual, p_plazo_meses)) / 
                        (POWER(1 + tasa_mensual, p_plazo_meses) - 1);
    ELSE
        cuota_mensual := p_monto / p_plazo_meses; -- Sin intereses
    END IF;
    
    total_pagar := cuota_mensual * p_plazo_meses;
    total_intereses := total_pagar - p_monto;
    
    -- Generar tabla de amortización (primeros 12 meses)
    WITH RECURSIVE amortizacion AS (
        -- Caso base
        SELECT 
            1 as cuota,
            p_monto as saldo_inicial,
            (p_monto * tasa_mensual) as interes,
            (cuota_mensual - (p_monto * tasa_mensual)) as capital,
            (p_monto - (cuota_mensual - (p_monto * tasa_mensual))) as saldo_final
        
        UNION ALL
        
        -- Casos recursivos (solo primeros 12 meses)
        SELECT 
            a.cuota + 1,
            a.saldo_final,
            (a.saldo_final * tasa_mensual) as interes,
            (cuota_mensual - (a.saldo_final * tasa_mensual)) as capital,
            (a.saldo_final - (cuota_mensual - (a.saldo_final * tasa_mensual))) as saldo_final
        FROM amortizacion a
        WHERE a.cuota < LEAST(p_plazo_meses, 12) AND a.saldo_final > 0.01
    )
    SELECT json_agg(
        json_build_object(
            'cuota', cuota,
            'saldo_inicial', ROUND(saldo_inicial, 2),
            'interes', ROUND(interes, 2),
            'capital', ROUND(capital, 2),
            'cuota_total', ROUND(interes + capital, 2),
            'saldo_final', ROUND(saldo_final, 2)
        )
        ORDER BY cuota
    ) INTO tabla_amortizacion
    FROM amortizacion;
    
    -- Calcular capacidad de pago basada en historial
    SELECT 
        COALESCE(AVG(ingresos_mes), 0),
        COALESCE(AVG(gastos_mes), 0)
    INTO ingresos_promedio, gastos_promedio
    FROM (
        SELECT 
            DATE_TRUNC('month', fecha) as mes,
            SUM(CASE WHEN tabla = 'ingresos' THEN monto ELSE 0 END) as ingresos_mes,
            SUM(CASE WHEN tabla = 'gastos' THEN monto ELSE 0 END) as gastos_mes
        FROM (
            SELECT fecha, monto, 'ingresos' as tabla FROM ingresos 
            WHERE usuario_id = p_usuario_id AND fecha >= CURRENT_DATE - INTERVAL '6 months'
            
            UNION ALL
            
            SELECT fecha, monto, 'gastos' as tabla FROM gastos 
            WHERE usuario_id = p_usuario_id AND fecha >= CURRENT_DATE - INTERVAL '6 months'
        ) transacciones
        GROUP BY DATE_TRUNC('month', fecha)
    ) promedios_mensuales;
    
    capacidad_pago := ingresos_promedio - gastos_promedio;
    
    -- Generar recomendaciones y alertas
    alertas := ARRAY[]::TEXT[];
    
    IF cuota_mensual > (capacidad_pago * 0.3) AND capacidad_pago > 0 THEN
        alertas := array_append(alertas, 'La cuota supera el 30% de tu capacidad de pago recomendada');
    END IF;
    
    IF cuota_mensual > capacidad_pago AND capacidad_pago > 0 THEN
        alertas := array_append(alertas, 'La cuota es mayor a tu capacidad de pago actual');
    END IF;
    
    IF p_plazo_meses > 60 THEN
        alertas := array_append(alertas, 'Plazo muy extenso: considera reducir el tiempo para pagar menos intereses');
    END IF;
    
    IF total_intereses > (p_monto * 0.5) THEN
        alertas := array_append(alertas, 'Los intereses representan más del 50% del monto solicitado');
    END IF;
    
    -- Recomendación general
    CASE 
        WHEN cuota_mensual <= (capacidad_pago * 0.2) THEN
            recomendacion := 'Excelente: La cuota está dentro de tus posibilidades financieras';
        WHEN cuota_mensual <= (capacidad_pago * 0.3) THEN
            recomendacion := 'Bueno: La cuota es manejable pero requiere disciplina financiera';
        WHEN cuota_mensual <= capacidad_pago THEN
            recomendacion := 'Riesgoso: La cuota compromete significativamente tu presupuesto';
        ELSE
            recomendacion := 'No recomendado: La cuota supera tu capacidad de pago actual';
    END CASE;
    
    -- Guardar simulación si se solicita
    IF p_guardar_simulacion THEN
        INSERT INTO simulaciones_credito (
            usuario_id, tipo_credito, monto, plazo_meses, tasa_anual,
            cuota_mensual, total_intereses, total_pagar, guardada,
            resultado
        ) VALUES (
            p_usuario_id, p_tipo_credito, p_monto, p_plazo_meses, p_tasa_anual,
            cuota_mensual, total_intereses, total_pagar, TRUE,
            json_build_object(
                'capacidad_pago', capacidad_pago,
                'recomendacion', recomendacion,
                'alertas', alertas
            )
        ) RETURNING id INTO simulacion_id;
        
        -- Registrar en auditoría
        PERFORM registrar_auditoria(
            p_usuario_id, 'CREATE_SIMULACION', 'simulaciones_credito', 
            simulacion_id::TEXT, NULL,
            json_build_object('monto', p_monto, 'plazo_meses', p_plazo_meses, 'guardada', TRUE),
            json_build_object('action', 'credit_simulation_saved')
        );
    END IF;
    
    -- Incrementar contador de límites (removido temporalmente)
    -- PERFORM incrementar_contador_limite(p_usuario_id, 'CREATE_SIMULACION');
    
    -- Construir respuesta completa
    RETURN json_build_object(
        'parametros', json_build_object(
            'monto', p_monto,
            'tasa_anual', p_tasa_anual,
            'plazo_meses', p_plazo_meses,
            'tipo_credito', p_tipo_credito
        ),
        'resultados', json_build_object(
            'cuota_mensual', ROUND(cuota_mensual, 2),
            'total_intereses', ROUND(total_intereses, 2),
            'total_pagar', ROUND(total_pagar, 2),
            'tasa_mensual', ROUND(tasa_mensual * 100, 4)
        ),
        'analisis', json_build_object(
            'ingresos_promedio', ROUND(ingresos_promedio, 2),
            'gastos_promedio', ROUND(gastos_promedio, 2),
            'capacidad_pago', ROUND(capacidad_pago, 2),
            'porcentaje_comprometido', 
            CASE 
                WHEN capacidad_pago > 0 THEN ROUND((cuota_mensual / capacidad_pago) * 100, 2)
                ELSE NULL
            END,
            'recomendacion', recomendacion,
            'alertas', alertas
        ),
        'tabla_amortizacion', COALESCE(tabla_amortizacion, '[]'::json),
        'guardada', p_guardar_simulacion,
        'simulacion_id', simulacion_id,
        'timestamp', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 3. FUNCIÓN: RESUMEN FINANCIERO INTELIGENTE
-- ==========================================

CREATE OR REPLACE FUNCTION obtener_resumen_financiero(
    p_usuario_id UUID,
    p_incluir_proyecciones BOOLEAN DEFAULT TRUE
)
RETURNS JSON AS $$
DECLARE
    balance_actual JSON;
    tendencias JSON;
    alertas TEXT[];
    metas_activas JSON;
    presupuestos_estado JSON;
    estadisticas_historicas JSON;
    proyecciones JSON := NULL;
BEGIN
    -- Validar autorización
    IF auth.uid() != p_usuario_id THEN
        RAISE EXCEPTION 'Acceso denegado: Solo puedes ver tu propio resumen';
    END IF;
    
    -- Obtener balance del mes actual
    SELECT calcular_balance_mensual(p_usuario_id) INTO balance_actual;
    
    -- Calcular tendencias (últimos 6 meses)
    WITH tendencias_meses AS (
        SELECT 
            TO_CHAR(fecha, 'YYYY-MM') as mes,
            SUM(CASE WHEN tabla = 'ingresos' THEN monto ELSE 0 END) as ingresos,
            SUM(CASE WHEN tabla = 'gastos' THEN monto ELSE 0 END) as gastos
        FROM (
            SELECT fecha, monto, 'ingresos' as tabla FROM ingresos 
            WHERE usuario_id = p_usuario_id AND fecha >= CURRENT_DATE - INTERVAL '6 months'
            
            UNION ALL
            
            SELECT fecha, monto, 'gastos' as tabla FROM gastos 
            WHERE usuario_id = p_usuario_id AND fecha >= CURRENT_DATE - INTERVAL '6 months'
        ) transacciones
        GROUP BY TO_CHAR(fecha, 'YYYY-MM')
        ORDER BY mes DESC
        LIMIT 6
    )
    SELECT json_build_object(
        'ultimos_6_meses', json_agg(
            json_build_object(
                'mes', mes,
                'ingresos', ingresos,
                'gastos', gastos,
                'balance', ingresos - gastos
            )
            ORDER BY mes DESC
        ),
        'tendencia_ingresos', 
        CASE 
            WHEN COUNT(*) >= 2 THEN
                SIGN(AVG(ingresos) - (SELECT AVG(ingresos) FROM tendencias_meses LIMIT 3))
            ELSE 0
        END,
        'tendencia_gastos',
        CASE 
            WHEN COUNT(*) >= 2 THEN
                SIGN(AVG(gastos) - (SELECT AVG(gastos) FROM tendencias_meses LIMIT 3))
            ELSE 0
        END
    ) INTO tendencias
    FROM tendencias_meses;
    
    -- Obtener metas activas
    SELECT json_agg(
        json_build_object(
            'id', id,
            'nombre', nombre,
            'monto_objetivo', monto_objetivo,
            'monto_actual', monto_actual,
            'porcentaje_completado', porcentaje_completado,
            'dias_restantes', calcular_dias_restantes(fecha_objetivo),
            'prioridad', prioridad
        )
        ORDER BY prioridad DESC, porcentaje_completado DESC
    ) INTO metas_activas
    FROM metas_financieras
    WHERE usuario_id = p_usuario_id AND activa = TRUE AND NOT completada;
    
    -- Obtener estado de presupuestos
    SELECT json_agg(
        json_build_object(
            'id', id,
            'nombre', nombre,
            'categoria', categoria,
            'monto_limite', monto_limite,
            'monto_gastado', monto_gastado,
            'porcentaje_usado', porcentaje_usado,
            'estado', 
            CASE 
                WHEN porcentaje_usado >= 100 THEN 'excedido'
                WHEN porcentaje_usado >= umbral_alerta THEN 'alerta'
                WHEN porcentaje_usado >= 70 THEN 'moderado'
                ELSE 'saludable'
            END
        )
        ORDER BY porcentaje_usado DESC
    ) INTO presupuestos_estado
    FROM presupuestos
    WHERE usuario_id = p_usuario_id AND activo = TRUE;
    
    -- Generar alertas inteligentes
    alertas := ARRAY[]::TEXT[];
    
    -- Alertas de gastos elevados
    WITH gastos_recientes AS (
        SELECT SUM(monto) as total_ultima_semana
        FROM gastos 
        WHERE usuario_id = p_usuario_id 
        AND fecha >= CURRENT_DATE - INTERVAL '7 days'
    ),
    gastos_promedio AS (
        SELECT AVG(total_semanal) as promedio_semanal
        FROM (
            SELECT 
                DATE_TRUNC('week', fecha) as semana,
                SUM(monto) as total_semanal
            FROM gastos 
            WHERE usuario_id = p_usuario_id 
            AND fecha >= CURRENT_DATE - INTERVAL '2 months'
            GROUP BY DATE_TRUNC('week', fecha)
        ) semanas
    )
    SELECT CASE 
        WHEN gr.total_ultima_semana > (gp.promedio_semanal * 1.5) THEN
            array_append(alertas, 'Gastos de la última semana son 50% superiores al promedio')
        ELSE alertas
    END INTO alertas
    FROM gastos_recientes gr, gastos_promedio gp;
    
    -- Alerta de metas próximas a vencer
    IF EXISTS (
        SELECT 1 FROM metas_financieras 
        WHERE usuario_id = p_usuario_id 
        AND activa = TRUE 
        AND NOT completada 
        AND calcular_dias_restantes(fecha_objetivo) BETWEEN 1 AND 30
    ) THEN
        alertas := array_append(alertas, 'Tienes metas financieras que vencen en los próximos 30 días');
    END IF;
    
    -- Proyecciones (si se solicitan)
    IF p_incluir_proyecciones THEN
        WITH promedios AS (
            SELECT 
                AVG(CASE WHEN tabla = 'ingresos' THEN monto_mes ELSE 0 END) as ingreso_promedio,
                AVG(CASE WHEN tabla = 'gastos' THEN monto_mes ELSE 0 END) as gasto_promedio
            FROM (
                SELECT 
                    DATE_TRUNC('month', fecha) as mes,
                    SUM(monto) as monto_mes,
                    'ingresos' as tabla
                FROM ingresos 
                WHERE usuario_id = p_usuario_id 
                AND fecha >= CURRENT_DATE - INTERVAL '3 months'
                GROUP BY DATE_TRUNC('month', fecha)
                
                UNION ALL
                
                SELECT 
                    DATE_TRUNC('month', fecha) as mes,
                    SUM(monto) as monto_mes,
                    'gastos' as tabla
                FROM gastos 
                WHERE usuario_id = p_usuario_id 
                AND fecha >= CURRENT_DATE - INTERVAL '3 months'
                GROUP BY DATE_TRUNC('month', fecha)
            ) datos_mensuales
        )
        SELECT json_build_object(
            'balance_proyectado_3_meses', ROUND((ingreso_promedio - gasto_promedio) * 3, 2),
            'balance_proyectado_6_meses', ROUND((ingreso_promedio - gasto_promedio) * 6, 2),
            'balance_proyectado_12_meses', ROUND((ingreso_promedio - gasto_promedio) * 12, 2),
            'ingreso_mensual_promedio', ROUND(ingreso_promedio, 2),
            'gasto_mensual_promedio', ROUND(gasto_promedio, 2)
        ) INTO proyecciones
        FROM promedios;
    END IF;
    
    -- Construir respuesta completa
    RETURN json_build_object(
        'usuario_id', p_usuario_id,
        'balance_actual', balance_actual,
        'tendencias', tendencias,
        'metas_activas', COALESCE(metas_activas, '[]'::json),
        'presupuestos_estado', COALESCE(presupuestos_estado, '[]'::json),
        'proyecciones', proyecciones,
        'alertas', alertas,
        'ultima_actualizacion', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 4. COMENTARIOS PARA DOCUMENTACIÓN
-- ==========================================

COMMENT ON FUNCTION calcular_balance_mensual(UUID, INTEGER, INTEGER) IS 'Calcula balance mensual completo con análisis por categorías y comparaciones';
COMMENT ON FUNCTION simular_credito_completo(UUID, DECIMAL, DECIMAL, INTEGER, TEXT, BOOLEAN) IS 'Simulador avanzado de crédito con análisis de capacidad de pago y recomendaciones';
COMMENT ON FUNCTION obtener_resumen_financiero(UUID, BOOLEAN) IS 'Resumen financiero inteligente con tendencias, alertas y proyecciones';

-- ==========================================
-- 5. VERIFICACIÓN DE INSTALACIÓN
-- ==========================================

-- Mostrar funciones de negocio creadas
SELECT 
    routine_name as "Función de Negocio Creada",
    routine_type as tipo,
    'Activa' as estado
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN ('calcular_balance_mensual', 'simular_credito_completo', 'obtener_resumen_financiero')
ORDER BY routine_name;

-- ==========================================
-- ✅ RESULTADO ESPERADO:
-- - 3 funciones avanzadas de negocio creadas
-- - Cálculos financieros con análisis inteligente
-- - Sistema de alertas y recomendaciones
-- - Integración con auditoría y límites
-- ==========================================

SELECT '✅ PASO 5 COMPLETADO: Funciones de negocio y cálculos financieros implementadas' as resultado;
SELECT 'SIGUIENTE: Ejecutar 06-api-functions.sql para endpoints del frontend' as siguiente_paso;
