-- ==========================================
-- ROW LEVEL SECURITY POLICIES
-- ==========================================
-- Ejecutar después de schema.sql
-- Configuración de seguridad para proteger datos de usuarios

-- ==========================================
-- 1. HABILITAR RLS EN TODAS LAS TABLAS
-- ==========================================

ALTER TABLE perfiles_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingresos ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulaciones_credito ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_personalizadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE metas_financieras ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 2. POLÍTICAS PARA PERFILES_USUARIO
-- ==========================================

-- Los usuarios pueden ver solo su propio perfil
CREATE POLICY "usuarios_pueden_ver_su_perfil" ON perfiles_usuario
    FOR SELECT USING (auth.uid() = id);

-- Los usuarios pueden crear su propio perfil
CREATE POLICY "usuarios_pueden_crear_su_perfil" ON perfiles_usuario
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "usuarios_pueden_actualizar_su_perfil" ON perfiles_usuario
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Los usuarios pueden eliminar su propio perfil
CREATE POLICY "usuarios_pueden_eliminar_su_perfil" ON perfiles_usuario
    FOR DELETE USING (auth.uid() = id);

-- ==========================================
-- 3. POLÍTICAS PARA INGRESOS
-- ==========================================

-- Los usuarios pueden ver solo sus ingresos
CREATE POLICY "usuarios_pueden_ver_sus_ingresos" ON ingresos
    FOR SELECT USING (auth.uid() = usuario_id);

-- Los usuarios pueden crear ingresos para sí mismos
CREATE POLICY "usuarios_pueden_crear_sus_ingresos" ON ingresos
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Los usuarios pueden actualizar sus propios ingresos
CREATE POLICY "usuarios_pueden_actualizar_sus_ingresos" ON ingresos
    FOR UPDATE USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);

-- Los usuarios pueden eliminar sus propios ingresos
CREATE POLICY "usuarios_pueden_eliminar_sus_ingresos" ON ingresos
    FOR DELETE USING (auth.uid() = usuario_id);

-- ==========================================
-- 4. POLÍTICAS PARA GASTOS
-- ==========================================

-- Los usuarios pueden ver solo sus gastos
CREATE POLICY "usuarios_pueden_ver_sus_gastos" ON gastos
    FOR SELECT USING (auth.uid() = usuario_id);

-- Los usuarios pueden crear gastos para sí mismos
CREATE POLICY "usuarios_pueden_crear_sus_gastos" ON gastos
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Los usuarios pueden actualizar sus propios gastos
CREATE POLICY "usuarios_pueden_actualizar_sus_gastos" ON gastos
    FOR UPDATE USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);

-- Los usuarios pueden eliminar sus propios gastos
CREATE POLICY "usuarios_pueden_eliminar_sus_gastos" ON gastos
    FOR DELETE USING (auth.uid() = usuario_id);

-- ==========================================
-- 5. POLÍTICAS PARA SIMULACIONES_CREDITO
-- ==========================================

-- Los usuarios pueden ver solo sus simulaciones
CREATE POLICY "usuarios_pueden_ver_sus_simulaciones" ON simulaciones_credito
    FOR SELECT USING (auth.uid() = usuario_id);

-- Los usuarios pueden crear simulaciones para sí mismos
CREATE POLICY "usuarios_pueden_crear_sus_simulaciones" ON simulaciones_credito
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Los usuarios pueden actualizar sus propias simulaciones
CREATE POLICY "usuarios_pueden_actualizar_sus_simulaciones" ON simulaciones_credito
    FOR UPDATE USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);

-- Los usuarios pueden eliminar sus propias simulaciones
CREATE POLICY "usuarios_pueden_eliminar_sus_simulaciones" ON simulaciones_credito
    FOR DELETE USING (auth.uid() = usuario_id);

-- ==========================================
-- 6. POLÍTICAS PARA CATEGORIAS_PERSONALIZADAS
-- ==========================================

-- Los usuarios pueden ver solo sus categorías personalizadas
CREATE POLICY "usuarios_pueden_ver_sus_categorias" ON categorias_personalizadas
    FOR SELECT USING (auth.uid() = usuario_id);

-- Los usuarios pueden crear categorías para sí mismos
CREATE POLICY "usuarios_pueden_crear_sus_categorias" ON categorias_personalizadas
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Los usuarios pueden actualizar sus propias categorías
CREATE POLICY "usuarios_pueden_actualizar_sus_categorias" ON categorias_personalizadas
    FOR UPDATE USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);

-- Los usuarios pueden eliminar sus propias categorías
CREATE POLICY "usuarios_pueden_eliminar_sus_categorias" ON categorias_personalizadas
    FOR DELETE USING (auth.uid() = usuario_id);

-- ==========================================
-- 7. POLÍTICAS PARA METAS_FINANCIERAS
-- ==========================================

-- Los usuarios pueden ver solo sus metas
CREATE POLICY "usuarios_pueden_ver_sus_metas" ON metas_financieras
    FOR SELECT USING (auth.uid() = usuario_id);

-- Los usuarios pueden crear metas para sí mismos
CREATE POLICY "usuarios_pueden_crear_sus_metas" ON metas_financieras
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Los usuarios pueden actualizar sus propias metas
CREATE POLICY "usuarios_pueden_actualizar_sus_metas" ON metas_financieras
    FOR UPDATE USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);

-- Los usuarios pueden eliminar sus propias metas
CREATE POLICY "usuarios_pueden_eliminar_sus_metas" ON metas_financieras
    FOR DELETE USING (auth.uid() = usuario_id);

-- ==========================================
-- 8. POLÍTICAS ESPECIALES PARA ADMINISTRADORES
-- ==========================================

-- Función helper para verificar si el usuario es administrador
-- (Opcional: Para uso futuro si necesitas funcionalidad de admin)
CREATE OR REPLACE FUNCTION es_administrador()
RETURNS boolean AS $$
BEGIN
    -- Verificar si el usuario tiene rol de administrador
    -- Esto se puede configurar en auth.users metadata o en una tabla separada
    RETURN (
        SELECT raw_user_meta_data->>'role' = 'admin'
        FROM auth.users 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Política para permitir a administradores ver todos los datos
-- (Opcional: Descomenta si necesitas funcionalidad de admin)

/*
CREATE POLICY "administradores_pueden_ver_todo" ON perfiles_usuario
    FOR SELECT USING (es_administrador());

CREATE POLICY "administradores_pueden_ver_todos_ingresos" ON ingresos
    FOR SELECT USING (es_administrador());

CREATE POLICY "administradores_pueden_ver_todos_gastos" ON gastos
    FOR SELECT USING (es_administrador());

CREATE POLICY "administradores_pueden_ver_todas_simulaciones" ON simulaciones_credito
    FOR SELECT USING (es_administrador());
*/

-- ==========================================
-- 9. POLÍTICAS PARA VISTAS
-- ==========================================

-- Las vistas heredan automáticamente las políticas de las tablas base
-- Sin embargo, podemos crear políticas específicas si es necesario

-- Política para resumen_financiero (opcional, ya hereda de las tablas base)
/*
CREATE POLICY "usuarios_pueden_ver_su_resumen" ON resumen_financiero
    FOR SELECT USING (auth.uid() = usuario_id);
*/

-- ==========================================
-- 10. FUNCIÓN DE VALIDACIÓN ADICIONAL
-- ==========================================

-- Función para validar que un usuario puede acceder a un registro
CREATE OR REPLACE FUNCTION puede_acceder_registro(tabla_usuario_id UUID)
RETURNS boolean AS $$
BEGIN
    -- Verificar que el usuario esté autenticado y sea propietario del registro
    RETURN (
        auth.uid() IS NOT NULL AND 
        auth.uid() = tabla_usuario_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 11. POLÍTICA DE BACKUP PARA USUARIOS ANÓNIMOS
-- ==========================================

-- Asegurar que usuarios no autenticados no puedan acceder a nada
-- (Esta es una medida de seguridad adicional)

CREATE POLICY "denegar_acceso_anonimo_perfiles" ON perfiles_usuario
    AS RESTRICTIVE FOR ALL
    TO PUBLIC
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "denegar_acceso_anonimo_ingresos" ON ingresos
    AS RESTRICTIVE FOR ALL
    TO PUBLIC
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "denegar_acceso_anonimo_gastos" ON gastos
    AS RESTRICTIVE FOR ALL
    TO PUBLIC
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "denegar_acceso_anonimo_simulaciones" ON simulaciones_credito
    AS RESTRICTIVE FOR ALL
    TO PUBLIC
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "denegar_acceso_anonimo_categorias" ON categorias_personalizadas
    AS RESTRICTIVE FOR ALL
    TO PUBLIC
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "denegar_acceso_anonimo_metas" ON metas_financieras
    AS RESTRICTIVE FOR ALL
    TO PUBLIC
    USING (auth.uid() IS NOT NULL);

-- ==========================================
-- 12. TESTING DE POLÍTICAS
-- ==========================================

-- Función para probar las políticas RLS (solo para desarrollo)
-- Ejecutar como usuario autenticado para verificar que funcionen

/*
-- Ejemplo de test (ejecutar después de crear un usuario)
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- Insertar perfil de prueba
    INSERT INTO perfiles_usuario (id, nombre, apellido)
    VALUES (auth.uid(), 'Test', 'User');
    
    -- Insertar ingreso de prueba
    INSERT INTO ingresos (usuario_id, descripcion, monto, categoria)
    VALUES (auth.uid(), 'Ingreso de prueba', 1000, 'salario');
    
    RAISE NOTICE 'Políticas RLS funcionando correctamente';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error en políticas RLS: %', SQLERRM;
END;
$$;
*/

-- ==========================================
-- 13. COMENTARIOS EN POLÍTICAS
-- ==========================================

COMMENT ON POLICY "usuarios_pueden_ver_su_perfil" ON perfiles_usuario IS 
    'Permite a los usuarios ver únicamente su propio perfil';

COMMENT ON POLICY "usuarios_pueden_ver_sus_ingresos" ON ingresos IS 
    'Permite a los usuarios ver únicamente sus propios ingresos';

COMMENT ON POLICY "usuarios_pueden_ver_sus_gastos" ON gastos IS 
    'Permite a los usuarios ver únicamente sus propios gastos';

COMMENT ON POLICY "denegar_acceso_anonimo_perfiles" ON perfiles_usuario IS 
    'Política restrictiva que niega acceso a usuarios no autenticados';

-- ==========================================
-- ✅ POLÍTICAS RLS CONFIGURADAS
-- ==========================================
-- 
-- RESUMEN DE SEGURIDAD IMPLEMENTADA:
-- 
-- ✅ Row Level Security habilitado en todas las tablas
-- ✅ Usuarios solo pueden acceder a sus propios datos
-- ✅ Operaciones CRUD completamente protegidas
-- ✅ Validación de autenticación obligatoria
-- ✅ Políticas restrictivas para usuarios anónimos
-- ✅ Función helper para administradores (preparada)
-- 
-- Siguiente paso: Ejecutar functions.sql para funciones avanzadas
