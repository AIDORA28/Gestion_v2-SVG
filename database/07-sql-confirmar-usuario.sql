-- =============================================
-- SQL-CONFIRMAR-USUARIO.SQL - UTILIDADES AUTH
-- =============================================
-- Ejecutar cuando necesites configurar usuarios o debugging
-- Orden de ejecución: OPCIONAL (solo para debugging y configuración)

-- =============================================
-- 1. VER USUARIOS NO CONFIRMADOS
-- =============================================

-- Consultar estado de todos los usuarios
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    phone_confirmed_at,
    CASE 
        WHEN email_confirmed_at IS NULL THEN '❌ No confirmado'
        ELSE '✅ Confirmado'
    END as estado_email,
    CASE 
        WHEN phone_confirmed_at IS NULL THEN '❌ No confirmado'
        ELSE '✅ Confirmado'
    END as estado_telefono
FROM auth.users
ORDER BY created_at DESC;

-- =============================================
-- 2. CONFIRMAR USUARIOS MANUALMENTE
-- =============================================

-- Confirmar TODOS los usuarios no confirmados (usar con cuidado)
/*
UPDATE auth.users 
SET 
    email_confirmed_at = NOW(),
    phone_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;
*/

-- Confirmar usuario específico (reemplaza con tu email)
/*
UPDATE auth.users 
SET 
    email_confirmed_at = NOW(),
    phone_confirmed_at = NOW()
WHERE email = 'TU_EMAIL_AQUI@ejemplo.com';
*/

-- =============================================
-- 3. VERIFICAR CAMBIOS APLICADOS
-- =============================================

-- Ver usuarios confirmados recientemente
SELECT 
    email,
    email_confirmed_at,
    'Usuario confirmado exitosamente' as resultado
FROM auth.users
WHERE email_confirmed_at IS NOT NULL
ORDER BY email_confirmed_at DESC
LIMIT 10;

-- =============================================
-- 4. COMANDOS DE VERIFICACIÓN ÚTILES
-- =============================================

-- Ver perfiles de usuario creados automáticamente
SELECT 
    pu.id,
    au.email,
    pu.nombre,
    pu.apellido,
    pu.created_at,
    'Perfil activo' as estado
FROM perfiles_usuario pu
JOIN auth.users au ON pu.id = au.id
ORDER BY pu.created_at DESC 
LIMIT 10;

-- Ver límites de usuario configurados
SELECT 
    ul.usuario_id,
    au.email,
    ul.plan_usuario,
    ul.limite_ingresos_diario,
    ul.limite_gastos_diario,
    ul.activo
FROM user_limits ul
JOIN auth.users au ON ul.usuario_id = au.id
ORDER BY ul.created_at DESC
LIMIT 10;

-- Ver logs de auditoría recientes por usuario
SELECT 
    la.usuario_id,
    au.email,
    la.accion,
    la.tabla,
    la.timestamp,
    la.success
FROM logs_auditoria la
JOIN auth.users au ON la.usuario_id = au.id
ORDER BY la.timestamp DESC
LIMIT 20;

-- =============================================
-- 5. COMANDOS DE LIMPIEZA (USAR CON CUIDADO)
-- =============================================

-- Ver usuarios de prueba (emails con 'test' o 'ejemplo')
SELECT 
    id,
    email,
    created_at,
    'Usuario de prueba detectado' as tipo
FROM auth.users 
WHERE email ILIKE '%test%' 
   OR email ILIKE '%ejemplo%'
   OR email ILIKE '%demo%'
ORDER BY created_at DESC;

-- Eliminar usuario específico de prueba (DESCOMENTA SOLO SI ES NECESARIO)
/*
-- PRECAUCIÓN: Esto eliminará TODOS los datos del usuario
DELETE FROM auth.users 
WHERE email = 'test@ejemplo.com'
   OR email ILIKE '%test%@ejemplo.com';
*/

-- =============================================
-- 6. VERIFICAR INTEGRIDAD DEL SISTEMA
-- =============================================

-- Verificar que los triggers automáticos funcionan
SELECT 
    'Verificando triggers automáticos...' as verificacion;

-- Usuarios con perfil automático creado
SELECT 
    COUNT(au.id) as total_usuarios,
    COUNT(pu.id) as total_perfiles,
    COUNT(ul.id) as total_limites,
    CASE 
        WHEN COUNT(au.id) = COUNT(pu.id) AND COUNT(au.id) = COUNT(ul.id) THEN '✅ Triggers funcionando correctamente'
        ELSE '⚠️ Algunos usuarios no tienen perfil o límites automáticos'
    END as estado_triggers
FROM auth.users au
LEFT JOIN perfiles_usuario pu ON au.id = pu.id
LEFT JOIN user_limits ul ON au.id = ul.usuario_id;

-- Usuarios sin perfil (deberían ser 0 si los triggers funcionan)
SELECT 
    au.id,
    au.email,
    au.created_at,
    '❌ Sin perfil automático' as problema
FROM auth.users au
LEFT JOIN perfiles_usuario pu ON au.id = pu.id
WHERE pu.id IS NULL
ORDER BY au.created_at DESC;

-- =============================================
-- 7. CREAR USUARIO DE PRUEBA (OPCIONAL)
-- =============================================

-- Crear usuario de prueba para testing (solo desarrollo)
/*
-- IMPORTANTE: Solo usar en desarrollo, nunca en producción
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    email_confirmed_at,
    phone_confirmed_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'usuario.prueba@sistema.com',
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Usuario Prueba"}',
    NOW(),
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;
*/

-- =============================================
-- 8. RESUMEN DE VERIFICACIÓN COMPLETA
-- =============================================

-- Estadísticas completas del sistema
WITH estadisticas AS (
    SELECT 
        (SELECT COUNT(*) FROM auth.users) as total_usuarios,
        (SELECT COUNT(*) FROM perfiles_usuario) as total_perfiles,
        (SELECT COUNT(*) FROM user_limits) as total_limites,
        (SELECT COUNT(*) FROM ingresos) as total_ingresos,
        (SELECT COUNT(*) FROM gastos) as total_gastos,
        (SELECT COUNT(*) FROM simulaciones_credito) as total_simulaciones,
        (SELECT COUNT(*) FROM logs_auditoria) as total_logs
)
SELECT 
    'RESUMEN COMPLETO DEL SISTEMA' as seccion,
    json_build_object(
        'usuarios_registrados', total_usuarios,
        'perfiles_creados', total_perfiles,
        'limites_configurados', total_limites,
        'ingresos_registrados', total_ingresos,
        'gastos_registrados', total_gastos,
        'simulaciones_realizadas', total_simulaciones,
        'logs_auditoria', total_logs,
        'sistema_estado', CASE 
            WHEN total_usuarios = total_perfiles AND total_usuarios = total_limites THEN 'SALUDABLE'
            ELSE 'REQUIERE_ATENCION'
        END
    ) as estadisticas_sistema
FROM estadisticas;

-- =============================================
-- ✅ UTILIDADES DE USUARIO Y DEBUGGING LISTAS
-- =============================================

SELECT '✅ HERRAMIENTAS DE CONFIRMACIÓN Y DEBUGGING DISPONIBLES' as resultado;
SELECT 'USO: Ejecuta las secciones según necesites para configurar usuarios o debugging' as instrucciones;
