-- 💳 TABLA SIMULACIONES_CREDITO - Para módulo de Reportes
-- Crear tabla si no existe

CREATE TABLE IF NOT EXISTS simulaciones_credito (
    id SERIAL PRIMARY KEY,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    descripcion VARCHAR(255) NOT NULL,
    monto DECIMAL(12,2) NOT NULL,
    estado VARCHAR(50) DEFAULT 'Activo',
    tasa_interes DECIMAL(5,2),
    plazo_meses INTEGER,
    cuota_mensual DECIMAL(10,2),
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🔒 HABILITAR ROW LEVEL SECURITY
ALTER TABLE simulaciones_credito ENABLE ROW LEVEL SECURITY;

-- 📋 POLÍTICA DE ACCESO - Solo el usuario puede ver sus propios créditos
CREATE POLICY "Los usuarios solo pueden ver sus propios créditos" ON simulaciones_credito
    FOR ALL USING (auth.uid() = usuario_id);

-- 📊 ÍNDICES PARA OPTIMIZAR CONSULTAS
CREATE INDEX IF NOT EXISTS idx_simulaciones_credito_usuario ON simulaciones_credito(usuario_id);
CREATE INDEX IF NOT EXISTS idx_simulaciones_credito_estado ON simulaciones_credito(estado);
CREATE INDEX IF NOT EXISTS idx_simulaciones_credito_fecha ON simulaciones_credito(created_at);

-- ✅ COMENTARIOS PARA DOCUMENTACIÓN
COMMENT ON TABLE simulaciones_credito IS 'Tabla para almacenar información de créditos y préstamos de usuarios';
COMMENT ON COLUMN simulaciones_credito.usuario_id IS 'ID del usuario propietario del crédito';
COMMENT ON COLUMN simulaciones_credito.descripcion IS 'Descripción del crédito o préstamo';
COMMENT ON COLUMN simulaciones_credito.monto IS 'Monto total del crédito';
COMMENT ON COLUMN simulaciones_credito.estado IS 'Estado del crédito: Activo, Pagado, Vencido, etc.';
COMMENT ON COLUMN simulaciones_credito.tasa_interes IS 'Tasa de interés anual del crédito';
COMMENT ON COLUMN simulaciones_credito.plazo_meses IS 'Plazo en meses para el pago';
COMMENT ON COLUMN simulaciones_credito.cuota_mensual IS 'Cuota mensual a pagar';
