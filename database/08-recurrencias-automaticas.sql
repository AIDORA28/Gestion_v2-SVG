-- ===================================================================
-- 🔄 SISTEMA DE RECURRENCIAS AUTOMÁTICAS PARA SUPABASE
-- ===================================================================
-- Descripción: Procesa automáticamente ingresos y gastos recurrentes
-- Autor: Sistema PlanificaPro
-- Fecha: 2025-09-10
-- ===================================================================

-- ==========================================
-- 1. FUNCIÓN PARA PROCESAR INGRESOS RECURRENTES
-- ==========================================

CREATE OR REPLACE FUNCTION procesar_ingresos_recurrentes()
RETURNS json AS $$
DECLARE
    ingreso_record RECORD;
    nuevos_ingresos INTEGER := 0;
    errores INTEGER := 0;
    resultado json;
BEGIN
    -- Buscar ingresos recurrentes que necesitan procesarse
    FOR ingreso_record IN
        SELECT 
            i.*,
            (i.fecha + INTERVAL '1 day' * i.frecuencia_dias) as proxima_fecha
        FROM ingresos i
        WHERE i.es_recurrente = TRUE
          AND i.frecuencia_dias IS NOT NULL
          AND i.frecuencia_dias > 0
          -- Solo procesar si la próxima fecha ya llegó
          AND (i.fecha + INTERVAL '1 day' * i.frecuencia_dias) <= CURRENT_DATE
          -- Evitar procesar el mismo día múltiples veces
          AND NOT EXISTS (
              SELECT 1 FROM ingresos i2 
              WHERE i2.usuario_id = i.usuario_id 
                AND i2.descripcion = i.descripcion 
                AND i2.monto = i.monto 
                AND i2.categoria = i.categoria
                AND i2.fecha = (i.fecha + INTERVAL '1 day' * i.frecuencia_dias)::date
          )
    LOOP
        BEGIN
            -- Crear nuevo ingreso recurrente
            INSERT INTO ingresos (
                usuario_id,
                descripcion,
                monto,
                categoria,
                fecha,
                es_recurrente,
                frecuencia_dias,
                notas,
                created_at
            )
            VALUES (
                ingreso_record.usuario_id,
                ingreso_record.descripcion || ' (Recurrente)',
                ingreso_record.monto,
                ingreso_record.categoria,
                ingreso_record.proxima_fecha::date,
                TRUE, -- Mantener como recurrente
                ingreso_record.frecuencia_dias,
                COALESCE(ingreso_record.notas, '') || ' - Generado automáticamente el ' || CURRENT_DATE,
                NOW()
            );
            
            -- Actualizar la fecha del ingreso original para la próxima iteración
            UPDATE ingresos 
            SET fecha = ingreso_record.proxima_fecha::date,
                updated_at = NOW()
            WHERE id = ingreso_record.id;
            
            nuevos_ingresos := nuevos_ingresos + 1;
            
        EXCEPTION WHEN OTHERS THEN
            errores := errores + 1;
            -- Log del error simplificado (sin tabla audit_logs)
            -- Solo incrementamos contador de errores
        END;
    END LOOP;
    
    -- Construir resultado
    resultado := json_build_object(
        'success', true,
        'procesados', nuevos_ingresos,
        'errores', errores,
        'timestamp', NOW(),
        'tipo', 'ingresos_recurrentes'
    );
    
    RETURN resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 2. FUNCIÓN PARA PROCESAR GASTOS RECURRENTES
-- ==========================================

CREATE OR REPLACE FUNCTION procesar_gastos_recurrentes()
RETURNS json AS $$
DECLARE
    gasto_record RECORD;
    nuevos_gastos INTEGER := 0;
    errores INTEGER := 0;
    resultado json;
BEGIN
    -- Buscar gastos recurrentes que necesitan procesarse
    FOR gasto_record IN
        SELECT 
            g.*,
            (g.fecha + INTERVAL '1 day' * g.frecuencia_dias) as proxima_fecha
        FROM gastos g
        WHERE g.es_recurrente = TRUE
          AND g.frecuencia_dias IS NOT NULL
          AND g.frecuencia_dias > 0
          -- Solo procesar si la próxima fecha ya llegó
          AND (g.fecha + INTERVAL '1 day' * g.frecuencia_dias) <= CURRENT_DATE
          -- Evitar duplicados del mismo día
          AND NOT EXISTS (
              SELECT 1 FROM gastos g2 
              WHERE g2.usuario_id = g.usuario_id 
                AND g2.descripcion = g.descripcion 
                AND g2.monto = g.monto 
                AND g2.categoria = g.categoria
                AND g2.fecha = (g.fecha + INTERVAL '1 day' * g.frecuencia_dias)::date
          )
    LOOP
        BEGIN
            -- Crear nuevo gasto recurrente
            INSERT INTO gastos (
                usuario_id,
                descripcion,
                monto,
                categoria,
                metodo_pago,
                fecha,
                es_recurrente,
                frecuencia_dias,
                notas,
                created_at
            )
            VALUES (
                gasto_record.usuario_id,
                gasto_record.descripcion || ' (Recurrente)',
                gasto_record.monto,
                gasto_record.categoria,
                gasto_record.metodo_pago,
                gasto_record.proxima_fecha::date,
                TRUE, -- Mantener como recurrente
                gasto_record.frecuencia_dias,
                COALESCE(gasto_record.notas, '') || ' - Generado automáticamente el ' || CURRENT_DATE,
                NOW()
            );
            
            -- Actualizar la fecha del gasto original para la próxima iteración
            UPDATE gastos 
            SET fecha = gasto_record.proxima_fecha::date,
                updated_at = NOW()
            WHERE id = gasto_record.id;
            
            nuevos_gastos := nuevos_gastos + 1;
            
        EXCEPTION WHEN OTHERS THEN
            errores := errores + 1;
            -- Log del error simplificado (sin tabla audit_logs)
            -- Solo incrementamos contador de errores
        END;
    END LOOP;
    
    -- Construir resultado
    resultado := json_build_object(
        'success', true,
        'procesados', nuevos_gastos,
        'errores', errores,
        'timestamp', NOW(),
        'tipo', 'gastos_recurrentes'
    );
    
    RETURN resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 3. FUNCIÓN MAESTRA PARA PROCESAR TODAS LAS RECURRENCIAS
-- ==========================================

CREATE OR REPLACE FUNCTION procesar_todas_recurrencias()
RETURNS json AS $$
DECLARE
    resultado_ingresos json;
    resultado_gastos json;
    resultado_final json;
BEGIN
    -- Procesar ingresos recurrentes
    SELECT procesar_ingresos_recurrentes() INTO resultado_ingresos;
    
    -- Procesar gastos recurrentes
    SELECT procesar_gastos_recurrentes() INTO resultado_gastos;
    
    -- Combinar resultados
    resultado_final := json_build_object(
        'success', true,
        'timestamp', NOW(),
        'ingresos', resultado_ingresos,
        'gastos', resultado_gastos,
        'total_procesados', 
            COALESCE((resultado_ingresos->>'procesados')::integer, 0) + 
            COALESCE((resultado_gastos->>'procesados')::integer, 0),
        'total_errores',
            COALESCE((resultado_ingresos->>'errores')::integer, 0) + 
            COALESCE((resultado_gastos->>'errores')::integer, 0)
    );
    
    -- Log de la ejecución (sin tabla audit_logs)
    -- El resultado se devuelve directamente
    
    RETURN resultado_final;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 4. AUTOMATIZACIÓN (pg_cron no disponible en plan gratuito)
-- ==========================================

-- NOTA: pg_cron no está disponible en plan gratuito de Supabase
-- En su lugar, usaremos GitHub Actions para automatización

-- La automatización se hará con GitHub Actions:
-- .github/workflows/recurrencias-automaticas.yml

-- ==========================================
-- 5. FUNCIÓN PARA TESTING MANUAL
-- ==========================================

CREATE OR REPLACE FUNCTION test_recurrencias()
RETURNS json AS $$
BEGIN
    -- Esta función se puede llamar manualmente para probar
    RETURN procesar_todas_recurrencias();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 6. VISTA PARA MONITOREAR RECURRENCIAS
-- ==========================================

CREATE OR REPLACE VIEW vista_recurrencias_pendientes AS
SELECT 
    'ingresos' as tipo,
    i.id,
    i.usuario_id,
    i.descripcion,
    i.monto,
    i.categoria,
    i.fecha as fecha_actual,
    (i.fecha + INTERVAL '1 day' * i.frecuencia_dias) as proxima_fecha,
    i.frecuencia_dias,
    CASE 
        WHEN (i.fecha + INTERVAL '1 day' * i.frecuencia_dias) <= CURRENT_DATE 
        THEN 'PENDIENTE'
        ELSE 'PROGRAMADO'
    END as estado
FROM ingresos i
WHERE i.es_recurrente = TRUE
  AND i.frecuencia_dias IS NOT NULL
  AND i.frecuencia_dias > 0

UNION ALL

SELECT 
    'gastos' as tipo,
    g.id,
    g.usuario_id,
    g.descripcion,
    g.monto,
    g.categoria,
    g.fecha as fecha_actual,
    (g.fecha + INTERVAL '1 day' * g.frecuencia_dias) as proxima_fecha,
    g.frecuencia_dias,
    CASE 
        WHEN (g.fecha + INTERVAL '1 day' * g.frecuencia_dias) <= CURRENT_DATE 
        THEN 'PENDIENTE'
        ELSE 'PROGRAMADO'
    END as estado
FROM gastos g
WHERE g.es_recurrente = TRUE
  AND g.frecuencia_dias IS NOT NULL
  AND g.frecuencia_dias > 0

ORDER BY proxima_fecha DESC;

-- ==========================================
-- 7. PERMISOS Y POLÍTICAS RLS
-- ==========================================

-- NOTA: Las políticas RLS se aplican automáticamente a través de las tablas
-- ingresos y gastos que ya tienen sus políticas configuradas.
-- La vista vista_recurrencias_pendientes heredará estos permisos.

-- ==========================================
-- 8. COMENTARIOS PARA DOCUMENTACIÓN
-- ==========================================

COMMENT ON FUNCTION procesar_ingresos_recurrentes() IS 'Procesa automáticamente ingresos recurrentes basados en frecuencia_dias';
COMMENT ON FUNCTION procesar_gastos_recurrentes() IS 'Procesa automáticamente gastos recurrentes basados en frecuencia_dias';
COMMENT ON FUNCTION procesar_todas_recurrencias() IS 'Función maestra que procesa todas las recurrencias (ingresos y gastos)';
COMMENT ON FUNCTION test_recurrencias() IS 'Función para probar el sistema de recurrencias manualmente';
COMMENT ON VIEW vista_recurrencias_pendientes IS 'Vista que muestra todas las transacciones recurrentes y su estado';

-- ==========================================
-- 9. EJEMPLO DE USO MANUAL
-- ==========================================

-- Para probar manualmente:
-- SELECT test_recurrencias();

-- Para ver recurrencias pendientes:
-- SELECT * FROM vista_recurrencias_pendientes WHERE estado = 'PENDIENTE';

-- Para ver el historial de procesamiento:
-- Los resultados se muestran directamente en la respuesta JSON de las funciones
