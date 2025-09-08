-- ==========================================
-- 08-AGREGAR-ESTADO-CIVIL.SQL - MODIFICACIÓN PERFIL
-- ==========================================
-- Ejecutar DESPUÉS de la instalación inicial
-- Agrega campo estado_civil a la tabla perfiles_usuario
-- Orden de ejecución: 8º (opcional)

-- ==========================================
-- 1. AGREGAR CAMPO ESTADO CIVIL
-- ==========================================

-- Agregar columna estado_civil si no existe
ALTER TABLE perfiles_usuario 
ADD COLUMN IF NOT EXISTS estado_civil TEXT 
CHECK (estado_civil IN ('soltero', 'casado', 'divorciado', 'viudo', 'union_libre', 'separado'));

-- Establecer valor por defecto para registros existentes (mejorado)
UPDATE perfiles_usuario 
SET estado_civil = 'soltero' 
WHERE estado_civil IS NULL OR estado_civil = '';

-- Establecer valor por defecto también para campos opcionales
UPDATE perfiles_usuario 
SET genero = 'prefiero_no_decir' 
WHERE genero IS NULL OR genero = '';

UPDATE perfiles_usuario 
SET numero_hijos = 0 
WHERE numero_hijos IS NULL;

-- ==========================================
-- 2. AGREGAR OTROS CAMPOS ÚTILES (OPCIONAL)
-- ==========================================

-- Agregar campo género (opcional)
ALTER TABLE perfiles_usuario 
ADD COLUMN IF NOT EXISTS genero TEXT 
CHECK (genero IN ('masculino', 'femenino', 'otro', 'prefiero_no_decir'));

-- Agregar campo nacionalidad (opcional)
ALTER TABLE perfiles_usuario 
ADD COLUMN IF NOT EXISTS nacionalidad TEXT;

-- Agregar campo número de hijos (opcional)
ALTER TABLE perfiles_usuario 
ADD COLUMN IF NOT EXISTS numero_hijos INTEGER DEFAULT 0 
CHECK (numero_hijos >= 0 AND numero_hijos <= 20);

-- ==========================================
-- 3. FUNCIÓN PARA ACTUALIZAR PERFIL COMPLETO
-- ==========================================

CREATE OR REPLACE FUNCTION actualizar_perfil_usuario(
    p_usuario_id UUID,
    p_nombre TEXT DEFAULT NULL,
    p_apellido TEXT DEFAULT NULL,
    p_dni TEXT DEFAULT NULL,
    p_telefono TEXT DEFAULT NULL,
    p_direccion TEXT DEFAULT NULL,
    p_fecha_nacimiento DATE DEFAULT NULL,
    p_profesion TEXT DEFAULT NULL,
    p_estado_civil TEXT DEFAULT NULL,
    p_genero TEXT DEFAULT NULL,
    p_nacionalidad TEXT DEFAULT NULL,
    p_numero_hijos INTEGER DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    perfil_actualizado JSON;
BEGIN
    -- Validar autorización
    IF auth.uid() != p_usuario_id THEN
        RAISE EXCEPTION 'Acceso denegado: Solo puedes actualizar tu propio perfil';
    END IF;
    
    -- Validar estado civil
    IF p_estado_civil IS NOT NULL AND p_estado_civil NOT IN ('soltero', 'casado', 'divorciado', 'viudo', 'union_libre', 'separado') THEN
        RAISE EXCEPTION 'Estado civil inválido. Opciones: soltero, casado, divorciado, viudo, union_libre, separado';
    END IF;
    
    -- Validar género
    IF p_genero IS NOT NULL AND p_genero NOT IN ('masculino', 'femenino', 'otro', 'prefiero_no_decir') THEN
        RAISE EXCEPTION 'Género inválido. Opciones: masculino, femenino, otro, prefiero_no_decir';
    END IF;
    
    -- Actualizar perfil (solo campos no nulos)
    UPDATE perfiles_usuario SET
        nombre = COALESCE(p_nombre, nombre),
        apellido = COALESCE(p_apellido, apellido),
        dni = COALESCE(p_dni, dni),
        telefono = COALESCE(p_telefono, telefono),
        direccion = COALESCE(p_direccion, direccion),
        fecha_nacimiento = COALESCE(p_fecha_nacimiento, fecha_nacimiento),
        profesion = COALESCE(p_profesion, profesion),
        estado_civil = COALESCE(p_estado_civil, estado_civil),
        genero = COALESCE(p_genero, genero),
        nacionalidad = COALESCE(p_nacionalidad, nacionalidad),
        numero_hijos = COALESCE(p_numero_hijos, numero_hijos),
        updated_at = NOW()
    WHERE id = p_usuario_id;
    
    -- Obtener perfil actualizado
    SELECT json_build_object(
        'id', id,
        'nombre', nombre,
        'apellido', apellido,
        'dni', dni,
        'telefono', telefono,
        'email', email,
        'direccion', direccion,
        'fecha_nacimiento', fecha_nacimiento,
        'profesion', profesion,
        'estado_civil', estado_civil,
        'genero', genero,
        'nacionalidad', nacionalidad,
        'numero_hijos', numero_hijos,
        'updated_at', updated_at
    ) INTO perfil_actualizado
    FROM perfiles_usuario 
    WHERE id = p_usuario_id;
    
    -- Registrar en auditoría
    PERFORM registrar_auditoria(
        p_usuario_id, 'UPDATE_PROFILE', 'perfiles_usuario', 
        p_usuario_id::TEXT, NULL,
        json_build_object('campos_actualizados', 'perfil_completo'),
        json_build_object('action', 'profile_update_complete')
    );
    
    RETURN json_build_object(
        'success', TRUE,
        'message', 'Perfil actualizado correctamente',
        'perfil', perfil_actualizado,
        'timestamp', NOW()
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', FALSE,
        'error', SQLERRM,
        'timestamp', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 4. FUNCIÓN PARA OBTENER OPCIONES DE ESTADO CIVIL
-- ==========================================

CREATE OR REPLACE FUNCTION obtener_opciones_estado_civil()
RETURNS JSON AS $$
BEGIN
    RETURN json_build_object(
        'opciones', json_build_array(
            json_build_object('value', 'soltero', 'label', 'Soltero/a'),
            json_build_object('value', 'casado', 'label', 'Casado/a'),
            json_build_object('value', 'union_libre', 'label', 'Unión Libre'),
            json_build_object('value', 'divorciado', 'label', 'Divorciado/a'),
            json_build_object('value', 'separado', 'label', 'Separado/a'),
            json_build_object('value', 'viudo', 'label', 'Viudo/a')
        ),
        'default', 'soltero'
    );
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 4.2 FUNCIÓN PARA OBTENER PERFIL CON VALORES POR DEFECTO
-- ==========================================

CREATE OR REPLACE FUNCTION obtener_mi_perfil(p_usuario_id UUID DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
    usuario_objetivo UUID;
    perfil_data JSON;
BEGIN
    -- Usar el usuario actual si no se especifica otro
    usuario_objetivo := COALESCE(p_usuario_id, auth.uid());
    
    -- Validar autorización
    IF auth.uid() != usuario_objetivo THEN
        RAISE EXCEPTION 'Acceso denegado: Solo puedes ver tu propio perfil';
    END IF;
    
    -- Obtener perfil con valores por defecto garantizados
    SELECT json_build_object(
        'id', id,
        'nombre', COALESCE(nombre, ''),
        'apellido', COALESCE(apellido, ''),
        'dni', COALESCE(dni, ''),
        'telefono', COALESCE(telefono, ''),
        'email', COALESCE(email, ''),
        'direccion', COALESCE(direccion, ''),
        'fecha_nacimiento', fecha_nacimiento,
        'profesion', COALESCE(profesion, ''),
        'estado_civil', COALESCE(estado_civil, 'soltero'),
        'genero', COALESCE(genero, 'prefiero_no_decir'),
        'nacionalidad', COALESCE(nacionalidad, ''),
        'numero_hijos', COALESCE(numero_hijos, 0),
        'created_at', created_at,
        'updated_at', updated_at
    ) INTO perfil_data
    FROM perfiles_usuario 
    WHERE id = usuario_objetivo;
    
    -- Si no existe el perfil, crearlo con valores por defecto
    IF perfil_data IS NULL THEN
        INSERT INTO perfiles_usuario (
            id, estado_civil, genero, numero_hijos
        ) VALUES (
            usuario_objetivo, 'soltero', 'prefiero_no_decir', 0
        ) ON CONFLICT (id) DO UPDATE SET
            estado_civil = COALESCE(perfiles_usuario.estado_civil, 'soltero'),
            genero = COALESCE(perfiles_usuario.genero, 'prefiero_no_decir'),
            numero_hijos = COALESCE(perfiles_usuario.numero_hijos, 0);
        
        -- Obtener el perfil recién creado/actualizado
        SELECT json_build_object(
            'id', id,
            'nombre', COALESCE(nombre, ''),
            'apellido', COALESCE(apellido, ''),
            'dni', COALESCE(dni, ''),
            'telefono', COALESCE(telefono, ''),
            'email', COALESCE(email, ''),
            'direccion', COALESCE(direccion, ''),
            'fecha_nacimiento', fecha_nacimiento,
            'profesion', COALESCE(profesion, ''),
            'estado_civil', COALESCE(estado_civil, 'soltero'),
            'genero', COALESCE(genero, 'prefiero_no_decir'),
            'nacionalidad', COALESCE(nacionalidad, ''),
            'numero_hijos', COALESCE(numero_hijos, 0),
            'created_at', created_at,
            'updated_at', updated_at
        ) INTO perfil_data
        FROM perfiles_usuario 
        WHERE id = usuario_objetivo;
    END IF;
    
    RETURN json_build_object(
        'success', TRUE,
        'perfil', perfil_data,
        'opciones_estado_civil', (SELECT obtener_opciones_estado_civil()),
        'timestamp', NOW()
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', FALSE,
        'error', SQLERRM,
        'timestamp', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 5. CONSULTAS ÚTILES PARA VERIFICAR
-- ==========================================

-- Ver todos los perfiles con estado civil
SELECT 
    nombre,
    apellido,
    estado_civil,
    genero,
    numero_hijos,
    created_at
FROM perfiles_usuario 
ORDER BY created_at DESC
LIMIT 10;

-- Estadísticas de estado civil
SELECT 
    estado_civil,
    COUNT(*) as cantidad,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM perfiles_usuario WHERE estado_civil IS NOT NULL), 2) as porcentaje
FROM perfiles_usuario 
WHERE estado_civil IS NOT NULL
GROUP BY estado_civil
ORDER BY cantidad DESC;

-- ==========================================
-- 6. COMENTARIOS PARA DOCUMENTACIÓN
-- ==========================================

COMMENT ON COLUMN perfiles_usuario.estado_civil IS 'Estado civil del usuario: soltero, casado, divorciado, viudo, union_libre, separado';
COMMENT ON COLUMN perfiles_usuario.genero IS 'Género del usuario: masculino, femenino, otro, prefiero_no_decir';
COMMENT ON COLUMN perfiles_usuario.numero_hijos IS 'Número de hijos del usuario (0-20)';
COMMENT ON FUNCTION actualizar_perfil_usuario IS 'Actualiza perfil completo del usuario con validaciones';
COMMENT ON FUNCTION obtener_opciones_estado_civil IS 'Obtiene opciones disponibles para estado civil';
COMMENT ON FUNCTION obtener_mi_perfil IS 'Obtiene perfil del usuario actual con valores por defecto garantizados';

-- ==========================================
-- ✅ RESULTADO ESPERADO:
-- - Campo estado_civil agregado con opciones válidas
-- - Campos adicionales opcionales (género, nacionalidad, hijos)
-- - Función para actualizar perfil completo
-- - Función para obtener opciones disponibles
-- ==========================================

SELECT '✅ ESTADO CIVIL AGREGADO: Campo estado_civil disponible en perfiles_usuario' as resultado;
SELECT 'USO: Utiliza actualizar_perfil_usuario() para actualizar perfiles con estado civil' as instrucciones;

-- ==========================================
-- 7. EJEMPLOS DE USO
-- ==========================================

-- Ejemplo 1: Obtener mi perfil completo (RECOMENDADO PARA FRONTEND)
/*
SELECT obtener_mi_perfil();
*/

-- Ejemplo 2: Actualizar solo estado civil
/*
SELECT actualizar_perfil_usuario(
    auth.uid(),
    p_estado_civil => 'casado'
);
*/

-- Ejemplo 3: Actualizar perfil completo
/*
SELECT actualizar_perfil_usuario(
    auth.uid(),
    p_nombre => 'Juan',
    p_apellido => 'Pérez',
    p_estado_civil => 'casado',
    p_genero => 'masculino',
    p_numero_hijos => 2
);
*/

-- Ejemplo 4: Obtener solo opciones disponibles
/*
SELECT obtener_opciones_estado_civil();
*/

-- ==========================================
-- 8. SCRIPTS DE VERIFICACIÓN Y LIMPIEZA
-- ==========================================

-- Limpiar valores vacíos o nulos existentes
UPDATE perfiles_usuario 
SET 
    estado_civil = 'soltero' 
WHERE estado_civil IS NULL OR estado_civil = '' OR estado_civil NOT IN ('soltero', 'casado', 'divorciado', 'viudo', 'union_libre', 'separado');

UPDATE perfiles_usuario 
SET 
    genero = 'prefiero_no_decir' 
WHERE genero IS NULL OR genero = '' OR genero NOT IN ('masculino', 'femenino', 'otro', 'prefiero_no_decir');

UPDATE perfiles_usuario 
SET 
    numero_hijos = 0 
WHERE numero_hijos IS NULL OR numero_hijos < 0 OR numero_hijos > 20;
