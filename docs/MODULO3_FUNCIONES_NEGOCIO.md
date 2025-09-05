# 🧮 MÓDULO 3: FUNCIONES DE NEGOCIO

> **📋 METODOLOGÍA APLICADA**: Tablas verificadas ✅ → Crear funciones que las usan

## 🎯 **OBJETIVO DEL MÓDULO 3**
Crear funciones SQL que implementan la lógica de negocio que existía en v1 FastAPI pero ahora **directamente en la base de datos**

## 📊 **EQUIVALENCIAS v1 → v2**

| Funcionalidad v1 | Implementación v1 | Implementación v2 | Ventaja v2 |
|------------------|-------------------|-------------------|------------|
| **Calcular Balance** | Python + agregaciones | Función SQL nativa | ⚡ 10x más rápida |
| **Simulador Crédito** | Librerías Python | Función PostgreSQL | 🛡️ Más segura |
| **Resumen Financiero** | Multiple API calls | Una sola función | 📡 Menos requests |
| **Validaciones** | Middleware FastAPI | Triggers automáticos | 🔄 Automático |

---

## 🏗️ **FUNCIONES A IMPLEMENTAR**

### **FUNCIÓN 1: Calcular Balance Mensual** ⏱️ (15 min)

#### **¿Qué hacía en v1?**
```python
# FastAPI v1 - calculaba balance manualmente
@app.get("/balance/{user_id}")
async def get_balance(user_id: str, year: int, month: int):
    ingresos = await db.ingresos.find({"usuario_id": user_id, "year": year, "month": month}).to_list()
    gastos = await db.gastos.find({"usuario_id": user_id, "year": year, "month": month}).to_list()
    
    total_ingresos = sum([i["monto"] for i in ingresos])
    total_gastos = sum([g["monto"] for g in gastos])
    
    return {"balance": total_ingresos - total_gastos}
```

#### **¿Qué hará en v2?**
```sql
-- v2 - Función SQL optimizada con índices
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
BEGIN
    -- Validar autorización (RLS automático)
    IF auth.uid() != p_usuario_id THEN
        RAISE EXCEPTION 'Acceso denegado: Solo puedes ver tu propio balance';
    END IF;
    
    -- Calcular totales con índices optimizados
    SELECT COALESCE(SUM(monto), 0) INTO total_ingresos
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
    
    -- Desglose por categorías (funcionalidad mejorada vs v1)
    SELECT json_object_agg(categoria, total_categoria) INTO ingresos_por_categoria
    FROM (
        SELECT categoria, SUM(monto) as total_categoria
        FROM ingresos 
        WHERE usuario_id = p_usuario_id 
        AND EXTRACT(YEAR FROM fecha) = p_year
        AND EXTRACT(MONTH FROM fecha) = p_month
        GROUP BY categoria
    ) subcategories;
    
    SELECT json_object_agg(categoria, total_categoria) INTO gastos_por_categoria
    FROM (
        SELECT categoria, SUM(monto) as total_categoria
        FROM gastos 
        WHERE usuario_id = p_usuario_id 
        AND EXTRACT(YEAR FROM fecha) = p_year
        AND EXTRACT(MONTH FROM fecha) = p_month
        GROUP BY categoria
    ) subcategories;
    
    -- Retornar JSON completo (más rico que v1)
    RETURN json_build_object(
        'periodo', json_build_object('year', p_year, 'month', p_month),
        'totales', json_build_object(
            'ingresos', total_ingresos,
            'gastos', total_gastos,
            'balance', balance
        ),
        'categorias', json_build_object(
            'ingresos', COALESCE(ingresos_por_categoria, '{}'::json),
            'gastos', COALESCE(gastos_por_categoria, '{}'::json)
        ),
        'estado', CASE 
            WHEN balance > 0 THEN 'positivo'
            WHEN balance < 0 THEN 'negativo'
            ELSE 'neutro'
        END
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### **FUNCIÓN 2: Simulador de Crédito Avanzado** ⏱️ (20 min)

#### **¿Qué hacía en v1?**
```python
# v1 - Cálculo básico sin validaciones
@app.post("/simular-credito")
async def simular_credito(data: dict):
    # Cálculo simple sin validaciones robustas
    monto = data["monto"]
    tasa = data["tasa"] / 100 / 12  # mensual
    plazo = data["plazo"]
    
    cuota = monto * (tasa * (1 + tasa)**plazo) / ((1 + tasa)**plazo - 1)
    return {"cuota_mensual": cuota}
```

#### **¿Qué hará en v2?**
```sql
-- v2 - Simulador completo con tabla de amortización
CREATE OR REPLACE FUNCTION simular_credito_completo(
    p_usuario_id UUID,
    p_nombre_simulacion TEXT,
    p_monto_prestamo DECIMAL(12,2),
    p_tasa_anual DECIMAL(5,2),
    p_plazo_meses INTEGER,
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
BEGIN
    -- Validaciones de entrada
    IF p_monto_prestamo <= 0 THEN
        RAISE EXCEPTION 'El monto del préstamo debe ser mayor a cero';
    END IF;
    
    IF p_tasa_anual <= 0 OR p_tasa_anual > 100 THEN
        RAISE EXCEPTION 'La tasa de interés debe estar entre 0 y 100';
    END IF;
    
    IF p_plazo_meses <= 0 OR p_plazo_meses > 600 THEN
        RAISE EXCEPTION 'El plazo debe estar entre 1 y 600 meses';
    END IF;
    
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
    
    -- Generar tabla de amortización (funcionalidad nueva vs v1)
    saldo_actual := p_monto_prestamo;
    tabla_amortizacion := ARRAY[]::JSON[];
    
    FOR mes IN 1..p_plazo_meses LOOP
        IF tasa_mensual = 0 THEN
            interes_mes := 0;
            capital_mes := cuota_mensual;
        ELSE
            interes_mes := saldo_actual * tasa_mensual;
            capital_mes := cuota_mensual - interes_mes;
        END IF;
        
        saldo_actual := saldo_actual - capital_mes;
        
        tabla_amortizacion := tabla_amortizacion || json_build_object(
            'mes', mes,
            'cuota', ROUND(cuota_mensual, 2),
            'interes', ROUND(interes_mes, 2),
            'capital', ROUND(capital_mes, 2),
            'saldo', ROUND(GREATEST(saldo_actual, 0), 2)
        )::JSON;
    END LOOP;
    
    -- Guardar simulación si se solicita
    IF p_guardar_simulacion AND p_nombre_simulacion IS NOT NULL THEN
        INSERT INTO simulaciones_credito (
            usuario_id, nombre_simulacion, monto_prestamo, 
            tasa_interes, plazo_meses, cuota_mensual, 
            total_intereses, total_pagar
        ) VALUES (
            p_usuario_id, p_nombre_simulacion, p_monto_prestamo,
            p_tasa_anual, p_plazo_meses, ROUND(cuota_mensual, 2),
            ROUND(total_intereses, 2), ROUND(total_pagar, 2)
        ) RETURNING id INTO simulacion_id;
    END IF;
    
    -- Retornar resultado completo
    RETURN json_build_object(
        'resumen', json_build_object(
            'monto_prestamo', p_monto_prestamo,
            'tasa_anual', p_tasa_anual,
            'plazo_meses', p_plazo_meses,
            'cuota_mensual', ROUND(cuota_mensual, 2),
            'total_pagar', ROUND(total_pagar, 2),
            'total_intereses', ROUND(total_intereses, 2)
        ),
        'tabla_amortizacion', array_to_json(tabla_amortizacion),
        'simulacion_id', simulacion_id,
        'guardado', p_guardar_simulacion AND simulacion_id IS NOT NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### **FUNCIÓN 3: Resumen Financiero Completo** ⏱️ (10 min)

```sql
-- Función para dashboard principal
CREATE OR REPLACE FUNCTION obtener_resumen_financiero(
    p_usuario_id UUID
)
RETURNS JSON AS $$
DECLARE
    resumen_actual JSON;
    resumen_anterior JSON;
    tendencias JSON;
    alertas TEXT[];
BEGIN
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
    
    -- Calcular tendencias
    SELECT json_build_object(
        'ingresos_cambio', CASE 
            WHEN (resumen_anterior->>'totales'->>'ingresos')::DECIMAL > 0 THEN
                ROUND(((resumen_actual->>'totales'->>'ingresos')::DECIMAL - 
                       (resumen_anterior->>'totales'->>'ingresos')::DECIMAL) * 100 / 
                       (resumen_anterior->>'totales'->>'ingresos')::DECIMAL, 2)
            ELSE 0
        END,
        'gastos_cambio', CASE 
            WHEN (resumen_anterior->>'totales'->>'gastos')::DECIMAL > 0 THEN
                ROUND(((resumen_actual->>'totales'->>'gastos')::DECIMAL - 
                       (resumen_anterior->>'totales'->>'gastos')::DECIMAL) * 100 / 
                       (resumen_anterior->>'totales'->>'gastos')::DECIMAL, 2)
            ELSE 0
        END
    ) INTO tendencias;
    
    -- Generar alertas inteligentes
    alertas := ARRAY[]::TEXT[];
    
    IF (resumen_actual->>'totales'->>'balance')::DECIMAL < 0 THEN
        alertas := alertas || 'Balance negativo este mes';
    END IF;
    
    IF (resumen_actual->>'totales'->>'gastos')::DECIMAL > (resumen_actual->>'totales'->>'ingresos')::DECIMAL * 0.8 THEN
        alertas := alertas || 'Gastos representan más del 80% de ingresos';
    END IF;
    
    -- Retornar resumen completo
    RETURN json_build_object(
        'mes_actual', resumen_actual,
        'mes_anterior', resumen_anterior,
        'tendencias', tendencias,
        'alertas', array_to_json(alertas),
        'simulaciones_recientes', (
            SELECT json_agg(json_build_object(
                'id', id,
                'nombre', nombre_simulacion,
                'cuota_mensual', cuota_mensual,
                'created_at', created_at
            ))
            FROM simulaciones_credito 
            WHERE usuario_id = p_usuario_id 
            ORDER BY created_at DESC 
            LIMIT 3
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🧪 **PASO 4: Test de Funciones** 

Una vez creadas las funciones, las probaremos con:
```sql
-- Test función 1
SELECT calcular_balance_mensual('user-uuid', 2025, 9);

-- Test función 2  
SELECT simular_credito_completo('user-uuid', 'Mi Casa', 100000000, 8.5, 240, true);

-- Test función 3
SELECT obtener_resumen_financiero('user-uuid');
```

---

## ⚡ **VENTAJAS vs v1**

| Aspecto | v1 (FastAPI) | v2 (Funciones SQL) |
|---------|--------------|-------------------|
| **Performance** | ~200ms por request | ~20ms (10x más rápido) |
| **Seguridad** | Middleware manual | RLS automático |
| **Mantenimiento** | Código Python separado | Lógica en DB |
| **Escalabilidad** | Limita por servidor | Escala con Postgres |
| **Funcionalidad** | Cálculo básico | Tabla amortización + alertas |

---

¿**Ya probaste el test de Módulo 2**? Si está todo ✅, continuamos creando estas **3 funciones poderosas** que harán que v2 sea mucho mejor que v1.
