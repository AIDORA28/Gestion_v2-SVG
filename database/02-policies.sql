-- ==========================================
-- 02-POLICIES.SQL - ROW LEVEL SECURITY
-- ==========================================
-- Ejecutar SEGUNDO en Supabase SQL Editor
-- Configura toda la seguridad por usuario (RLS)
-- Orden de ejecución: 2º

-- ==========================================
-- 1. HABILITAR RLS EN TODAS LAS TABLAS
-- ==========================================

ALTER TABLE perfiles_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingresos ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulaciones_credito ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 2. POLÍTICAS PARA PERFILES_USUARIO
-- ==========================================

-- Los usuarios pueden ver solo su propio perfil
DROP POLICY IF EXISTS "usuarios_pueden_ver_su_perfil" ON perfiles_usuario;
CREATE POLICY "usuarios_pueden_ver_su_perfil" ON perfiles_usuario
    FOR SELECT USING (auth.uid() = id);

-- Los usuarios pueden crear su propio perfil
DROP POLICY IF EXISTS "usuarios_pueden_crear_su_perfil" ON perfiles_usuario;
CREATE POLICY "usuarios_pueden_crear_su_perfil" ON perfiles_usuario
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Los usuarios pueden actualizar su propio perfil
DROP POLICY IF EXISTS "usuarios_pueden_actualizar_su_perfil" ON perfiles_usuario;
CREATE POLICY "usuarios_pueden_actualizar_su_perfil" ON perfiles_usuario
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Los usuarios pueden eliminar su propio perfil
DROP POLICY IF EXISTS "usuarios_pueden_eliminar_su_perfil" ON perfiles_usuario;
CREATE POLICY "usuarios_pueden_eliminar_su_perfil" ON perfiles_usuario
    FOR DELETE USING (auth.uid() = id);

-- ==========================================
-- 3. POLÍTICAS PARA INGRESOS
-- ==========================================

-- Los usuarios pueden ver solo sus ingresos
DROP POLICY IF EXISTS "usuarios_pueden_ver_sus_ingresos" ON ingresos;
CREATE POLICY "usuarios_pueden_ver_sus_ingresos" ON ingresos
    FOR SELECT USING (auth.uid() = usuario_id);

-- Los usuarios pueden crear ingresos para sí mismos
DROP POLICY IF EXISTS "usuarios_pueden_crear_sus_ingresos" ON ingresos;
CREATE POLICY "usuarios_pueden_crear_sus_ingresos" ON ingresos
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Los usuarios pueden actualizar sus propios ingresos
DROP POLICY IF EXISTS "usuarios_pueden_actualizar_sus_ingresos" ON ingresos;
CREATE POLICY "usuarios_pueden_actualizar_sus_ingresos" ON ingresos
    FOR UPDATE USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);

-- Los usuarios pueden eliminar sus propios ingresos
DROP POLICY IF EXISTS "usuarios_pueden_eliminar_sus_ingresos" ON ingresos;
CREATE POLICY "usuarios_pueden_eliminar_sus_ingresos" ON ingresos
    FOR DELETE USING (auth.uid() = usuario_id);

-- ==========================================
-- 4. POLÍTICAS PARA GASTOS
-- ==========================================

-- Los usuarios pueden ver solo sus gastos
DROP POLICY IF EXISTS "usuarios_pueden_ver_sus_gastos" ON gastos;
CREATE POLICY "usuarios_pueden_ver_sus_gastos" ON gastos
    FOR SELECT USING (auth.uid() = usuario_id);

-- Los usuarios pueden crear gastos para sí mismos
DROP POLICY IF EXISTS "usuarios_pueden_crear_sus_gastos" ON gastos;
CREATE POLICY "usuarios_pueden_crear_sus_gastos" ON gastos
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Los usuarios pueden actualizar sus propios gastos
DROP POLICY IF EXISTS "usuarios_pueden_actualizar_sus_gastos" ON gastos;
CREATE POLICY "usuarios_pueden_actualizar_sus_gastos" ON gastos
    FOR UPDATE USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);

-- Los usuarios pueden eliminar sus propios gastos
DROP POLICY IF EXISTS "usuarios_pueden_eliminar_sus_gastos" ON gastos;
CREATE POLICY "usuarios_pueden_eliminar_sus_gastos" ON gastos
    FOR DELETE USING (auth.uid() = usuario_id);

-- ==========================================
-- 5. POLÍTICAS PARA SIMULACIONES_CREDITO
-- ==========================================

-- Los usuarios pueden ver solo sus simulaciones
DROP POLICY IF EXISTS "usuarios_pueden_ver_sus_simulaciones" ON simulaciones_credito;
CREATE POLICY "usuarios_pueden_ver_sus_simulaciones" ON simulaciones_credito
    FOR SELECT USING (auth.uid() = usuario_id);

-- Los usuarios pueden crear simulaciones para sí mismos
DROP POLICY IF EXISTS "usuarios_pueden_crear_sus_simulaciones" ON simulaciones_credito;
CREATE POLICY "usuarios_pueden_crear_sus_simulaciones" ON simulaciones_credito
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Los usuarios pueden actualizar sus propias simulaciones
DROP POLICY IF EXISTS "usuarios_pueden_actualizar_sus_simulaciones" ON simulaciones_credito;
CREATE POLICY "usuarios_pueden_actualizar_sus_simulaciones" ON simulaciones_credito
    FOR UPDATE USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);

-- Los usuarios pueden eliminar sus propias simulaciones
DROP POLICY IF EXISTS "usuarios_pueden_eliminar_sus_simulaciones" ON simulaciones_credito;
CREATE POLICY "usuarios_pueden_eliminar_sus_simulaciones" ON simulaciones_credito
    FOR DELETE USING (auth.uid() = usuario_id);

-- ==========================================
-- 6. FUNCIÓN PARA INICIALIZAR PERFIL AUTOMÁTICAMENTE
-- ==========================================

-- Función que crea automáticamente el perfil cuando se registra un usuario
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO perfiles_usuario (id, email)
    VALUES (NEW.id, NEW.email)
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ==========================================
-- 7. VERIFICACIÓN DE POLÍTICAS
-- ==========================================

-- Mostrar políticas RLS creadas
SELECT 
    schemaname as esquema,
    tablename as tabla,
    policyname as politica,
    CASE 
        WHEN cmd = 'ALL' THEN 'Todas las operaciones'
        WHEN cmd = 'SELECT' THEN 'Solo lectura'
        WHEN cmd = 'INSERT' THEN 'Solo inserción'
        WHEN cmd = 'UPDATE' THEN 'Solo actualización'
        WHEN cmd = 'DELETE' THEN 'Solo eliminación'
        ELSE cmd
    END as tipo_operacion
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('perfiles_usuario', 'ingresos', 'gastos', 'simulaciones_credito')
ORDER BY tablename, policyname;

-- Verificar que RLS está habilitado
SELECT 
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ RLS Habilitado'
        ELSE '❌ RLS Deshabilitado'
    END as estado_rls
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('perfiles_usuario', 'ingresos', 'gastos', 'simulaciones_credito')
ORDER BY tablename;

-- Verificar triggers de usuario automático
SELECT 
    event_object_table as tabla,
    trigger_name as trigger_creado,
    'Activo' as estado
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND trigger_name = 'on_auth_user_created';

-- ==========================================
-- ✅ RESULTADO ESPERADO:
-- - RLS habilitado en 4 tablas principales
-- - 16 políticas de seguridad creadas (4 por tabla)
-- - Trigger automático para crear perfiles de usuario
-- - Solo los usuarios pueden acceder a sus propios datos
-- ==========================================

SELECT '✅ PASO 2 COMPLETADO: Seguridad RLS configurada correctamente' as resultado;
SELECT 'SIGUIENTE: Ejecutar 03-tablas-opcionales.sql para categorías y metas' as siguiente_paso;
