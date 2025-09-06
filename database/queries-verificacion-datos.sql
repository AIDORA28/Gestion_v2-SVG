-- 🔍 QUERIES PARA VER DATOS EN SUPABASE SQL EDITOR
-- Copia y pega estas consultas en: 
-- https://supabase.com/dashboard/project/trlbsfktusefvpheoudn/sql

-- ====== VERIFICACIÓN GENERAL DEL SISTEMA ======

-- 1. Ver todas las tablas creadas y cantidad de registros
SELECT 
    'perfiles_usuario' as tabla, 
    COUNT(*) as registros,
    'Datos de usuarios' as descripcion
FROM perfiles_usuario
UNION ALL
SELECT 'ingresos', COUNT(*), 'Transacciones de ingresos' FROM ingresos
UNION ALL  
SELECT 'gastos', COUNT(*), 'Transacciones de gastos' FROM gastos
UNION ALL
SELECT 'simulaciones_credito', COUNT(*), 'Simulaciones de crédito' FROM simulaciones_credito
UNION ALL
SELECT 'metas_financieras', COUNT(*), 'Objetivos financieros' FROM metas_financieras
UNION ALL
SELECT 'presupuestos', COUNT(*), 'Presupuestos por categoría' FROM presupuestos
UNION ALL
SELECT 'categorias_personalizadas', COUNT(*), 'Categorías del usuario' FROM categorias_personalizadas
UNION ALL
SELECT 'logs_auditoria', COUNT(*), 'Registro de operaciones' FROM logs_auditoria
ORDER BY tabla;

-- ====== DATOS ESPECÍFICOS POR TABLA ======

-- 2. Ver perfiles de usuario completos
SELECT 
    id,
    nombre,
    apellido,
    email,
    estado_civil,
    genero,
    numero_hijos,
    created_at
FROM perfiles_usuario
ORDER BY created_at DESC;

-- 3. Ver ingresos (últimos 20)
SELECT 
    id,
    descripcion,
    monto,
    categoria,
    fecha,
    es_recurrente,
    created_at
FROM ingresos
ORDER BY fecha DESC, created_at DESC
LIMIT 20;

-- 4. Ver gastos (últimos 20)
SELECT 
    id,
    descripcion,
    monto,
    categoria,
    metodo_pago,
    fecha,
    created_at
FROM gastos
ORDER BY fecha DESC, created_at DESC
LIMIT 20;

-- 5. Ver simulaciones de crédito
SELECT 
    id,
    tipo_credito,
    monto,
    plazo_meses,
    tasa_anual,
    cuota_mensual,
    total_intereses,
    total_pagar,
    guardada,
    created_at
FROM simulaciones_credito
ORDER BY created_at DESC;

-- 6. Ver metas financieras
SELECT 
    id,
    nombre,
    descripcion,
    monto_objetivo,
    monto_actual,
    fecha_inicio,
    fecha_objetivo,
    categoria,
    prioridad,
    activa,
    completada,
    porcentaje_completado,
    created_at
FROM metas_financieras
ORDER BY prioridad DESC, fecha_objetivo ASC;

-- 7. Ver presupuestos
SELECT 
    id,
    nombre,
    categoria,
    monto_limite,
    monto_gastado,
    periodo,
    fecha_inicio,
    fecha_fin,
    activo,
    porcentaje_usado,
    umbral_alerta,
    created_at
FROM presupuestos
ORDER BY porcentaje_usado DESC;

-- 8. Ver categorías personalizadas
SELECT 
    id,
    nombre,
    tipo,
    color,
    icono,
    descripcion,
    activa,
    created_at
FROM categorias_personalizadas
ORDER BY tipo, nombre;

-- 9. Ver logs de auditoría (últimos 50)
SELECT 
    usuario_id,
    accion,
    tabla,
    registro_id,
    datos_anteriores,
    datos_nuevos,
    timestamp,
    success,
    detalles
FROM logs_auditoria
ORDER BY timestamp DESC
LIMIT 50;

-- ====== FUNCIONES PERSONALIZADAS ======

-- 10. Probar función de perfil (si tienes usuario logueado)
-- SELECT obtener_mi_perfil();

-- 11. Probar opciones de estado civil
SELECT obtener_opciones_estado_civil();

-- 12. Ver balance del mes actual (cambiar el UUID por tu usuario)
-- SELECT calcular_balance_mensual('[tu-usuario-uuid]', 2025, 9);

-- 13. Ver resumen financiero completo (cambiar el UUID por tu usuario)
-- SELECT obtener_resumen_financiero('[tu-usuario-uuid]', true);

-- ====== VERIFICACIONES TÉCNICAS ======

-- 14. Ver estructura de columnas de una tabla específica
SELECT 
    column_name as "Campo",
    data_type as "Tipo",
    is_nullable as "Permite NULL",
    column_default as "Valor por Defecto"
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'perfiles_usuario'
ORDER BY ordinal_position;

-- 15. Ver todas las funciones personalizadas creadas
SELECT 
    routine_name as "Función",
    routine_type as "Tipo",
    'Activa' as "Estado"
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name NOT LIKE 'pg_%'
ORDER BY routine_name;

-- 16. Ver políticas RLS activas
SELECT 
    tablename as "Tabla",
    policyname as "Política",
    cmd as "Comando",
    qual as "Condición"
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 17. Verificar usuarios registrados en el sistema auth
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN 'Confirmado'
        ELSE 'Pendiente'
    END as estado
FROM auth.users
ORDER BY created_at DESC;

-- ====== ESTADÍSTICAS RÁPIDAS ======

-- 18. Resumen ejecutivo del sistema
WITH estadisticas AS (
    SELECT 
        (SELECT COUNT(*) FROM auth.users) as usuarios_registrados,
        (SELECT COUNT(*) FROM perfiles_usuario) as perfiles_completados,
        (SELECT COUNT(*) FROM ingresos) as total_ingresos,
        (SELECT COUNT(*) FROM gastos) as total_gastos,
        (SELECT COUNT(*) FROM simulaciones_credito) as simulaciones_realizadas,
        (SELECT COUNT(*) FROM metas_financieras) as metas_creadas,
        (SELECT COUNT(*) FROM logs_auditoria) as operaciones_registradas
)
SELECT 
    '📊 RESUMEN EJECUTIVO DEL SISTEMA' as seccion,
    json_build_object(
        'usuarios_registrados', usuarios_registrados,
        'perfiles_completados', perfiles_completados,
        'transacciones_ingresos', total_ingresos,
        'transacciones_gastos', total_gastos,
        'simulaciones_credito', simulaciones_realizadas,
        'metas_financieras', metas_creadas,
        'operaciones_auditoria', operaciones_registradas,
        'estado_sistema', CASE 
            WHEN usuarios_registrados > 0 AND perfiles_completados = usuarios_registrados 
            THEN 'SALUDABLE ✅'
            ELSE 'REQUIERE_ATENCION ⚠️'
        END
    ) as estadisticas_completas
FROM estadisticas;
