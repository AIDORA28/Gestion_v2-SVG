-- ==========================================
-- FUNCIONES AVANZADAS Y STORED PROCEDURES
-- ==========================================
-- Ejecutar después de schema.sql y policies.sql
-- Funciones de negocio para cálculos financieros y reportes

-- ==========================================
-- 1. FUNCIÓN: CALCULAR BALANCE MENSUAL
-- ==========================================

CREATE OR REPLACE FUNCTION calcular_balance_mensual(
    p_usuario_id UUID,
    p_year INTEGER,
    p_month INTEGER
)
RETURNS JSON AS $$
DECLARE
    total_ingresos DECIMAL(12,2) := 0;
    total_gastos DECIMAL(12,2) := 0;
    balance DECIMAL(12,2);
    count_ingresos INTEGER := 0;
    count_gastos INTEGER := 0;
BEGIN
    -- Validar que el usuario puede acceder a estos datos
    IF auth.uid() != p_usuario_id THEN
        RAISE EXCEPTION 'Sin autorización para acceder a estos datos';
    END IF;
    
    -- Calcular ingresos del mes
    SELECT COALESCE(SUM(monto), 0), COUNT(*)
    INTO total_ingresos, count_ingresos
    FROM ingresos 
    WHERE usuario_id = p_usuario_id 
    AND EXTRACT(YEAR FROM fecha) = p_year
    AND EXTRACT(MONTH FROM fecha) = p_month;
    
    -- Calcular gastos del mes
    SELECT COALESCE(SUM(monto), 0), COUNT(*)
    INTO total_gastos, count_gastos
    FROM gastos 
    WHERE usuario_id = p_usuario_id 
    AND EXTRACT(YEAR FROM fecha) = p_year
    AND EXTRACT(MONTH FROM fecha) = p_month;
    
    balance := total_ingresos - total_gastos;
    
    RETURN json_build_object(
        'year', p_year,
        'month', p_month,
        'ingresos', json_build_object(
            'total', total_ingresos,
            'count', count_ingresos
        ),
        'gastos', json_build_object(
            'total', total_gastos,
            'count', count_gastos
        ),
        'balance', balance,
        'balance_positivo', balance >= 0
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 2. FUNCIÓN: CALCULAR SIMULACIÓN DE CRÉDITO
-- ==========================================

CREATE OR REPLACE FUNCTION calcular_credito(
    p_monto DECIMAL(12,2),
    p_tasa_anual DECIMAL(5,2),
    p_plazo_meses INTEGER
)
RETURNS JSON AS $$
DECLARE
    tasa_mensual DECIMAL(8,6);
    cuota_mensual DECIMAL(12,2);
    total_pagar DECIMAL(12,2);
    total_intereses DECIMAL(12,2);
BEGIN
    -- Validar parámetros
    IF p_monto <= 0 OR p_tasa_anual <= 0 OR p_plazo_meses <= 0 THEN
        RAISE EXCEPTION 'Parámetros inválidos: monto, tasa y plazo deben ser positivos';
    END IF;
    
    IF p_plazo_meses > 480 THEN -- Max 40 años
        RAISE EXCEPTION 'Plazo máximo: 40 años (480 meses)';
    END IF;
    
    -- Convertir tasa anual a mensual
    tasa_mensual := p_tasa_anual / 100 / 12;
    
    -- Calcular cuota mensual usando fórmula de amortización
    -- PMT = PV * (r * (1 + r)^n) / ((1 + r)^n - 1)
    cuota_mensual := p_monto * (tasa_mensual * POWER(1 + tasa_mensual, p_plazo_meses)) / 
                     (POWER(1 + tasa_mensual, p_plazo_meses) - 1);
    
    total_pagar := cuota_mensual * p_plazo_meses;
    total_intereses := total_pagar - p_monto;
    
    RETURN json_build_object(
        'monto_prestamo', p_monto,
        'tasa_interes_anual', p_tasa_anual,
        'tasa_interes_mensual', ROUND(tasa_mensual * 100, 4),
        'plazo_meses', p_plazo_meses,
        'plazo_years', ROUND(p_plazo_meses::DECIMAL / 12, 1),
        'cuota_mensual', ROUND(cuota_mensual, 2),
        'total_pagar', ROUND(total_pagar, 2),
        'total_intereses', ROUND(total_intereses, 2),
        'porcentaje_intereses', ROUND((total_intereses / p_monto) * 100, 2)
    );
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 3. FUNCIÓN: GENERAR TABLA DE AMORTIZACIÓN
-- ==========================================

CREATE OR REPLACE FUNCTION generar_tabla_amortizacion(
    p_monto DECIMAL(12,2),
    p_tasa_anual DECIMAL(5,2),
    p_plazo_meses INTEGER
)
RETURNS TABLE (
    cuota INTEGER,
    fecha_vencimiento DATE,
    cuota_mensual DECIMAL(12,2),
    interes DECIMAL(12,2),
    capital DECIMAL(12,2),
    saldo_pendiente DECIMAL(12,2)
) AS $$
DECLARE
    tasa_mensual DECIMAL(8,6);
    cuota_fija DECIMAL(12,2);
    saldo DECIMAL(12,2);
    pago_interes DECIMAL(12,2);
    pago_capital DECIMAL(12,2);
    i INTEGER;
BEGIN
    -- Calcular valores base
    tasa_mensual := p_tasa_anual / 100 / 12;
    cuota_fija := p_monto * (tasa_mensual * POWER(1 + tasa_mensual, p_plazo_meses)) / 
                  (POWER(1 + tasa_mensual, p_plazo_meses) - 1);
    saldo := p_monto;
    
    -- Generar tabla mes por mes
    FOR i IN 1..p_plazo_meses LOOP
        pago_interes := saldo * tasa_mensual;
        pago_capital := cuota_fija - pago_interes;
        saldo := saldo - pago_capital;
        
        -- Si es el último pago, ajustar para que el saldo sea exactamente 0
        IF i = p_plazo_meses THEN
            pago_capital := pago_capital + saldo;
            saldo := 0;
        END IF;
        
        cuota := i;
        fecha_vencimiento := CURRENT_DATE + (i * INTERVAL '1 month');
        cuota_mensual := ROUND(cuota_fija, 2);
        interes := ROUND(pago_interes, 2);
        capital := ROUND(pago_capital, 2);
        saldo_pendiente := ROUND(saldo, 2);
        
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 4. FUNCIÓN: OBTENER RESUMEN FINANCIERO COMPLETO
-- ==========================================

CREATE OR REPLACE FUNCTION obtener_resumen_financiero(
    p_usuario_id UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    usuario UUID;
    resumen JSON;
    ingresos_data JSON;
    gastos_data JSON;
    balance_data JSON;
    ultimas_transacciones JSON;
BEGIN
    -- Si no se especifica usuario, usar el actual
    usuario := COALESCE(p_usuario_id, auth.uid());
    
    -- Validar autorización
    IF auth.uid() != usuario THEN
        RAISE EXCEPTION 'Sin autorización para acceder a estos datos';
    END IF;
    
    -- Obtener datos de ingresos
    SELECT json_build_object(
        'total_mes_actual', COALESCE(SUM(CASE WHEN EXTRACT(MONTH FROM fecha) = EXTRACT(MONTH FROM CURRENT_DATE) THEN monto ELSE 0 END), 0),
        'total_year_actual', COALESCE(SUM(CASE WHEN EXTRACT(YEAR FROM fecha) = EXTRACT(YEAR FROM CURRENT_DATE) THEN monto ELSE 0 END), 0),
        'promedio_mensual', ROUND(COALESCE(AVG(monto), 0), 2),
        'count_transacciones', COUNT(*),
        'categoria_principal', (
            SELECT categoria 
            FROM ingresos i2 
            WHERE i2.usuario_id = usuario 
            GROUP BY categoria 
            ORDER BY SUM(monto) DESC 
            LIMIT 1
        )
    ) INTO ingresos_data
    FROM ingresos 
    WHERE usuario_id = usuario;
    
    -- Obtener datos de gastos
    SELECT json_build_object(
        'total_mes_actual', COALESCE(SUM(CASE WHEN EXTRACT(MONTH FROM fecha) = EXTRACT(MONTH FROM CURRENT_DATE) THEN monto ELSE 0 END), 0),
        'total_year_actual', COALESCE(SUM(CASE WHEN EXTRACT(YEAR FROM fecha) = EXTRACT(YEAR FROM CURRENT_DATE) THEN monto ELSE 0 END), 0),
        'promedio_mensual', ROUND(COALESCE(AVG(monto), 0), 2),
        'count_transacciones', COUNT(*),
        'categoria_principal', (
            SELECT categoria 
            FROM gastos g2 
            WHERE g2.usuario_id = usuario 
            GROUP BY categoria 
            ORDER BY SUM(monto) DESC 
            LIMIT 1
        )
    ) INTO gastos_data
    FROM gastos 
    WHERE usuario_id = usuario;
    
    -- Calcular balance
    SELECT json_build_object(
        'balance_mes_actual', (ingresos_data->>'total_mes_actual')::DECIMAL - (gastos_data->>'total_mes_actual')::DECIMAL,
        'balance_year_actual', (ingresos_data->>'total_year_actual')::DECIMAL - (gastos_data->>'total_year_actual')::DECIMAL,
        'porcentaje_ahorro', CASE 
            WHEN (ingresos_data->>'total_mes_actual')::DECIMAL > 0 
            THEN ROUND((((ingresos_data->>'total_mes_actual')::DECIMAL - (gastos_data->>'total_mes_actual')::DECIMAL) / (ingresos_data->>'total_mes_actual')::DECIMAL) * 100, 2)
            ELSE 0 
        END
    ) INTO balance_data;
    
    -- Obtener últimas 10 transacciones
    SELECT json_agg(
        json_build_object(
            'id', id,
            'tipo', tipo,
            'descripcion', descripcion,
            'monto', monto,
            'categoria', categoria,
            'fecha', fecha
        ) ORDER BY fecha DESC, created_at DESC
    ) INTO ultimas_transacciones
    FROM (
        SELECT id, 'ingreso' as tipo, descripcion, monto, categoria, fecha, created_at
        FROM ingresos WHERE usuario_id = usuario
        UNION ALL
        SELECT id, 'gasto' as tipo, descripcion, -monto as monto, categoria, fecha, created_at
        FROM gastos WHERE usuario_id = usuario
        ORDER BY fecha DESC, created_at DESC
        LIMIT 10
    ) t;
    
    -- Construir respuesta final
    resumen := json_build_object(
        'usuario_id', usuario,
        'fecha_consulta', NOW(),
        'ingresos', ingresos_data,
        'gastos', gastos_data,
        'balance', balance_data,
        'ultimas_transacciones', ultimas_transacciones
    );
    
    RETURN resumen;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 5. FUNCIÓN: OBTENER ESTADÍSTICAS POR CATEGORÍA
-- ==========================================

CREATE OR REPLACE FUNCTION obtener_estadisticas_categoria(
    p_usuario_id UUID,
    p_tipo TEXT, -- 'ingreso' o 'gasto'
    p_fecha_inicio DATE DEFAULT NULL,
    p_fecha_fin DATE DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    fecha_inicio DATE;
    fecha_fin DATE;
    estadisticas JSON;
BEGIN
    -- Validar autorización
    IF auth.uid() != p_usuario_id THEN
        RAISE EXCEPTION 'Sin autorización para acceder a estos datos';
    END IF;
    
    -- Establecer fechas por defecto (último año)
    fecha_inicio := COALESCE(p_fecha_inicio, CURRENT_DATE - INTERVAL '1 year');
    fecha_fin := COALESCE(p_fecha_fin, CURRENT_DATE);
    
    IF p_tipo = 'ingreso' THEN
        SELECT json_agg(
            json_build_object(
                'categoria', categoria,
                'total', total,
                'count', count_transacciones,
                'promedio', ROUND(total / count_transacciones, 2),
                'porcentaje', ROUND((total / SUM(total) OVER ()) * 100, 2)
            ) ORDER BY total DESC
        ) INTO estadisticas
        FROM (
            SELECT 
                categoria,
                SUM(monto) as total,
                COUNT(*) as count_transacciones
            FROM ingresos 
            WHERE usuario_id = p_usuario_id
            AND fecha BETWEEN fecha_inicio AND fecha_fin
            GROUP BY categoria
            HAVING SUM(monto) > 0
        ) t;
        
    ELSIF p_tipo = 'gasto' THEN
        SELECT json_agg(
            json_build_object(
                'categoria', categoria,
                'total', total,
                'count', count_transacciones,
                'promedio', ROUND(total / count_transacciones, 2),
                'porcentaje', ROUND((total / SUM(total) OVER ()) * 100, 2)
            ) ORDER BY total DESC
        ) INTO estadisticas
        FROM (
            SELECT 
                categoria,
                SUM(monto) as total,
                COUNT(*) as count_transacciones
            FROM gastos 
            WHERE usuario_id = p_usuario_id
            AND fecha BETWEEN fecha_inicio AND fecha_fin
            GROUP BY categoria
            HAVING SUM(monto) > 0
        ) t;
    ELSE
        RAISE EXCEPTION 'Tipo debe ser "ingreso" o "gasto"';
    END IF;
    
    RETURN COALESCE(estadisticas, '[]'::JSON);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 6. FUNCIÓN: PROCESAR TRANSACCIONES RECURRENTES
-- ==========================================

CREATE OR REPLACE FUNCTION procesar_transacciones_recurrentes()
RETURNS INTEGER AS $$
DECLARE
    transacciones_procesadas INTEGER := 0;
    rec RECORD;
    nueva_fecha DATE;
BEGIN
    -- Procesar ingresos recurrentes
    FOR rec IN 
        SELECT * FROM ingresos 
        WHERE es_recurrente = TRUE 
        AND fecha + INTERVAL '1 day' * frecuencia_dias <= CURRENT_DATE
    LOOP
        nueva_fecha := rec.fecha + INTERVAL '1 day' * rec.frecuencia_dias;
        
        -- Crear nueva transacción
        INSERT INTO ingresos (
            usuario_id, descripcion, monto, categoria, fecha, 
            es_recurrente, frecuencia_dias, notas
        ) VALUES (
            rec.usuario_id, rec.descripcion || ' (Auto)', rec.monto, rec.categoria, nueva_fecha,
            rec.es_recurrente, rec.frecuencia_dias, rec.notas
        );
        
        -- Actualizar fecha de la transacción original
        UPDATE ingresos 
        SET fecha = nueva_fecha,
            updated_at = NOW()
        WHERE id = rec.id;
        
        transacciones_procesadas := transacciones_procesadas + 1;
    END LOOP;
    
    -- Procesar gastos recurrentes
    FOR rec IN 
        SELECT * FROM gastos 
        WHERE es_recurrente = TRUE 
        AND fecha + INTERVAL '1 day' * frecuencia_dias <= CURRENT_DATE
    LOOP
        nueva_fecha := rec.fecha + INTERVAL '1 day' * rec.frecuencia_dias;
        
        -- Crear nueva transacción
        INSERT INTO gastos (
            usuario_id, descripcion, monto, categoria, fecha,
            es_recurrente, frecuencia_dias, notas
        ) VALUES (
            rec.usuario_id, rec.descripcion || ' (Auto)', rec.monto, rec.categoria, nueva_fecha,
            rec.es_recurrente, rec.frecuencia_dias, rec.notas
        );
        
        -- Actualizar fecha de la transacción original
        UPDATE gastos 
        SET fecha = nueva_fecha,
            updated_at = NOW()
        WHERE id = rec.id;
        
        transacciones_procesadas := transacciones_procesadas + 1;
    END LOOP;
    
    RETURN transacciones_procesadas;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 7. FUNCIÓN: VALIDAR CAPACIDAD DE PAGO
-- ==========================================

CREATE OR REPLACE FUNCTION validar_capacidad_pago(
    p_usuario_id UUID,
    p_cuota_propuesta DECIMAL(12,2),
    p_meses_historial INTEGER DEFAULT 6
)
RETURNS JSON AS $$
DECLARE
    ingresos_promedio DECIMAL(12,2);
    gastos_promedio DECIMAL(12,2);
    balance_promedio DECIMAL(12,2);
    ratio_deuda DECIMAL(5,2);
    puede_pagar BOOLEAN;
    recomendacion TEXT;
BEGIN
    -- Validar autorización
    IF auth.uid() != p_usuario_id THEN
        RAISE EXCEPTION 'Sin autorización para acceder a estos datos';
    END IF;
    
    -- Calcular promedios de los últimos meses
    SELECT 
        COALESCE(AVG(total_ingresos), 0),
        COALESCE(AVG(total_gastos), 0)
    INTO ingresos_promedio, gastos_promedio
    FROM (
        SELECT 
            DATE_TRUNC('month', fecha) as mes,
            SUM(monto) as total_ingresos,
            0 as total_gastos
        FROM ingresos 
        WHERE usuario_id = p_usuario_id 
        AND fecha >= CURRENT_DATE - INTERVAL '1 month' * p_meses_historial
        GROUP BY DATE_TRUNC('month', fecha)
        
        UNION ALL
        
        SELECT 
            DATE_TRUNC('month', fecha) as mes,
            0 as total_ingresos,
            SUM(monto) as total_gastos
        FROM gastos 
        WHERE usuario_id = p_usuario_id 
        AND fecha >= CURRENT_DATE - INTERVAL '1 month' * p_meses_historial
        GROUP BY DATE_TRUNC('month', fecha)
    ) t
    GROUP BY mes;
    
    balance_promedio := ingresos_promedio - gastos_promedio;
    ratio_deuda := CASE 
        WHEN ingresos_promedio > 0 THEN (p_cuota_propuesta / ingresos_promedio) * 100
        ELSE 100
    END;
    
    -- Determinar si puede pagar (regla: máximo 30% de ingresos)
    puede_pagar := ratio_deuda <= 30 AND balance_promedio >= p_cuota_propuesta;
    
    -- Generar recomendación
    IF puede_pagar THEN
        recomendacion := 'Capacidad de pago adecuada. El crédito es viable.';
    ELSIF ratio_deuda > 30 THEN
        recomendacion := 'La cuota representa más del 30% de sus ingresos. Se recomienda reducir el monto o extender el plazo.';
    ELSE
        recomendacion := 'El balance promedio es insuficiente para cubrir la cuota. Revise sus gastos o aumente sus ingresos.';
    END IF;
    
    RETURN json_build_object(
        'puede_pagar', puede_pagar,
        'ratio_deuda_porcentaje', ROUND(ratio_deuda, 2),
        'ingresos_promedio', ingresos_promedio,
        'gastos_promedio', gastos_promedio,
        'balance_promedio', balance_promedio,
        'cuota_propuesta', p_cuota_propuesta,
        'recomendacion', recomendacion,
        'meses_analizados', p_meses_historial
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 8. FUNCIÓN: EXPORTAR DATOS FINANCIEROS
-- ==========================================

CREATE OR REPLACE FUNCTION exportar_datos_financieros(
    p_usuario_id UUID,
    p_fecha_inicio DATE DEFAULT NULL,
    p_fecha_fin DATE DEFAULT NULL,
    p_formato TEXT DEFAULT 'json'
)
RETURNS TEXT AS $$
DECLARE
    fecha_inicio DATE;
    fecha_fin DATE;
    datos JSON;
    resultado TEXT;
BEGIN
    -- Validar autorización
    IF auth.uid() != p_usuario_id THEN
        RAISE EXCEPTION 'Sin autorización para exportar estos datos';
    END IF;
    
    fecha_inicio := COALESCE(p_fecha_inicio, CURRENT_DATE - INTERVAL '1 year');
    fecha_fin := COALESCE(p_fecha_fin, CURRENT_DATE);
    
    -- Construir JSON con todos los datos
    SELECT json_build_object(
        'perfil', (
            SELECT row_to_json(p) FROM (
                SELECT nombre, apellido, telefono, ocupacion, estado_civil, dependientes
                FROM perfiles_usuario WHERE id = p_usuario_id
            ) p
        ),
        'ingresos', (
            SELECT COALESCE(json_agg(i ORDER BY fecha DESC), '[]'::json)
            FROM (
                SELECT descripcion, monto, categoria, fecha, es_recurrente, frecuencia_dias, notas
                FROM ingresos 
                WHERE usuario_id = p_usuario_id 
                AND fecha BETWEEN fecha_inicio AND fecha_fin
            ) i
        ),
        'gastos', (
            SELECT COALESCE(json_agg(g ORDER BY fecha DESC), '[]'::json)
            FROM (
                SELECT descripcion, monto, categoria, fecha, es_recurrente, frecuencia_dias, notas
                FROM gastos 
                WHERE usuario_id = p_usuario_id 
                AND fecha BETWEEN fecha_inicio AND fecha_fin
            ) g
        ),
        'simulaciones', (
            SELECT COALESCE(json_agg(s ORDER BY created_at DESC), '[]'::json)
            FROM (
                SELECT nombre_simulacion, monto_prestamo, tasa_interes, plazo_meses, 
                       cuota_mensual, total_intereses, total_pagar, tipo_credito
                FROM simulaciones_credito 
                WHERE usuario_id = p_usuario_id
            ) s
        ),
        'metadatos', json_build_object(
            'fecha_exportacion', NOW(),
            'periodo', json_build_object(
                'inicio', fecha_inicio,
                'fin', fecha_fin
            ),
            'formato', p_formato
        )
    ) INTO datos;
    
    -- Convertir según formato solicitado
    CASE p_formato
        WHEN 'json' THEN
            resultado := datos::TEXT;
        WHEN 'csv' THEN
            -- Implementar conversión a CSV si es necesario
            resultado := 'CSV export no implementado aún. Use formato JSON.';
        ELSE
            resultado := datos::TEXT;
    END CASE;
    
    RETURN resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 9. JOB SCHEDULER PARA TRANSACCIONES RECURRENTES
-- ==========================================

-- Crear extensión pg_cron si está disponible (opcional)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Programar ejecución diaria de transacciones recurrentes
-- SELECT cron.schedule('procesar-recurrentes', '0 2 * * *', 'SELECT procesar_transacciones_recurrentes();');

-- ==========================================
-- 10. COMENTARIOS EN FUNCIONES
-- ==========================================

COMMENT ON FUNCTION calcular_balance_mensual(UUID, INTEGER, INTEGER) IS 
    'Calcula el balance financiero de un usuario para un mes específico';

COMMENT ON FUNCTION calcular_credito(DECIMAL, DECIMAL, INTEGER) IS 
    'Calcula los parámetros de un crédito: cuota mensual, intereses totales, etc.';

COMMENT ON FUNCTION generar_tabla_amortizacion(DECIMAL, DECIMAL, INTEGER) IS 
    'Genera la tabla completa de amortización para un crédito';

COMMENT ON FUNCTION obtener_resumen_financiero(UUID) IS 
    'Obtiene un resumen completo de la situación financiera del usuario';

COMMENT ON FUNCTION procesar_transacciones_recurrentes() IS 
    'Procesa automáticamente las transacciones marcadas como recurrentes';

COMMENT ON FUNCTION validar_capacidad_pago(UUID, DECIMAL, INTEGER) IS 
    'Valida si un usuario tiene capacidad de pago para una cuota específica';

-- ==========================================
-- ✅ FUNCIONES AVANZADAS CONFIGURADAS
-- ==========================================
-- 
-- FUNCIONES IMPLEMENTADAS:
-- 
-- ✅ calcular_balance_mensual - Balance por mes específico
-- ✅ calcular_credito - Cálculos de simulación de crédito
-- ✅ generar_tabla_amortizacion - Tabla de pagos completa
-- ✅ obtener_resumen_financiero - Dashboard completo
-- ✅ obtener_estadisticas_categoria - Análisis por categorías
-- ✅ procesar_transacciones_recurrentes - Automatización
-- ✅ validar_capacidad_pago - Análisis de riesgo crediticio
-- ✅ exportar_datos_financieros - Export de datos del usuario
-- 
-- La base de datos está lista para usar con todas las funciones avanzadas.
