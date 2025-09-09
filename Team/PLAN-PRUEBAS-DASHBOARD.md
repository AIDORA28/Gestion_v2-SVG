# 📊 PLAN DE PRUEBAS DASHBOARD - PLANIFICAPRO

## 🎯 Objetivo
Probar que todas las estadísticas del dashboard, módulo de ingresos y módulo de gastos funcionen correctamente con datos reales en **Soles Peruanos (S/)**.

## 📋 Datos de Prueba Generados

### 💰 INGRESOS (5 registros)
| Descripción | Monto | Categoría | Fecha | Recurrente | Notas |
|-------------|-------|-----------|-------|------------|-------|
| Salario mensual desarrollador | S/ 450.00 | salario | 2025-09-01 | ✅ (30 días) | Salario fijo mensual |
| Proyecto freelance web | S/ 380.50 | freelance | 2025-09-05 | ❌ | Desarrollo de sitio web |
| Consultoría técnica | S/ 320.00 | freelance | 2025-09-03 | ✅ (30 días) | Consultoría mensual |
| Dividendos inversiones | S/ 480.75 | inversiones | 2025-09-07 | ✅ (30 días) | Dividendos mensuales |
| Venta equipo usado | S/ 350.00 | ventas | 2025-09-09 | ❌ | Venta de laptop |

**Total Ingresos: S/ 1,981.25**  
**Recurrentes: 3/5**

### 💸 GASTOS (4 registros)
| Descripción | Monto | Categoría | Método Pago | Fecha | Recurrente | Notas |
|-------------|-------|-----------|-------------|-------|------------|-------|
| Supermercado semanal | S/ 320.50 | alimentacion | tarjeta_debito | 2025-09-02 | ❌ | Compras de la semana |
| Recibo de luz | S/ 450.25 | servicios | transferencia | 2025-09-01 | ✅ (30 días) | Factura mensual |
| Gasolina vehículo | S/ 380.00 | transporte | efectivo | 2025-09-06 | ❌ | Tanque lleno |
| Cine y restaurante | S/ 420.75 | entretenimiento | tarjeta_credito | 2025-09-08 | ❌ | Salida fin de semana |

**Total Gastos: S/ 1,571.50**  
**Recurrentes: 1/4**

## 📊 Estadísticas Esperadas

### 💼 Resumen Financiero
- **Total Ingresos:** S/ 1,981.25
- **Total Gastos:** S/ 1,571.50
- **Balance:** S/ 409.75 📈 (positivo)
- **Porcentaje Ahorro:** 20.7%

### 📈 Distribución Ingresos
- **Freelance:** S/ 700.50 (35.4%)
- **Inversiones:** S/ 480.75 (24.3%)
- **Salario:** S/ 450.00 (22.7%)
- **Ventas:** S/ 350.00 (17.7%)

### 📉 Distribución Gastos
- **Servicios:** S/ 450.25 (28.7%)
- **Entretenimiento:** S/ 420.75 (26.8%)
- **Transporte:** S/ 380.00 (24.2%)
- **Alimentación:** S/ 320.50 (20.4%)

## 🚀 Métodos de Inserción

### Método 1: SQL Directo (Recomendado)
1. Abrir Supabase Dashboard → SQL Editor
2. Ejecutar los scripts SQL generados en `datos-prueba-dashboard.js`
3. Refrescar PLANIFICAPRO dashboard

### Método 2: Consola del Navegador
1. Abrir dashboard de PLANIFICAPRO
2. Navegar a ingresos y gastos (para inicializar handlers)
3. Abrir DevTools → Console
4. Pegar el script de `datos-prueba-console.js`
5. Ejecutar `datosPrueba.insertarTodosDatos()`

## ✅ Lista de Verificación

### Dashboard Principal
- [ ] Balance total muestra S/ 409.75
- [ ] Ingresos del mes muestra S/ 1,981.25  
- [ ] Gastos del mes muestra S/ 1,571.50
- [ ] Ahorro proyectado calculado correctamente
- [ ] Gráfico ingresos vs gastos con barras visibles
- [ ] Gráfico de categorías tipo pie/dona con 4 sectores
- [ ] Transacciones recientes muestra últimas 10
- [ ] Formato S/ aparece correctamente en todos lados

### Módulo Ingresos
- [ ] Lista muestra 5 ingresos
- [ ] Estadísticas: Total S/ 1,981.25
- [ ] Filtro por categoría funciona (freelance, salario, etc.)
- [ ] Filtro por año/mes funciona
- [ ] Iconos de recurrencia (🔄) en 3 registros
- [ ] Botones editar/eliminar funcionan
- [ ] Modal agregar/editar con campos completos

### Módulo Gastos
- [ ] Lista muestra 4 gastos
- [ ] Estadísticas: Total S/ 1,571.50
- [ ] Filtro por categoría funciona
- [ ] Métodos de pago se muestran correctamente
- [ ] Solo 1 gasto marcado como recurrente
- [ ] Formato S/ en tabla y estadísticas
- [ ] Modal funciona igual que ingresos

### Funcionalidades Generales
- [ ] No se cierra sesión al navegar entre módulos
- [ ] Filtros mantienen estado
- [ ] Iconos de Lucide se cargan correctamente
- [ ] Sidebar móvil funciona
- [ ] Notificaciones (si las hay) funcionan
- [ ] Export/import (si está implementado)

## 🐛 Posibles Problemas

1. **Autenticación**: Si se cierra sesión → Verificar tokens en localStorage
2. **Template no carga**: Verificar moduleLoader y rutas de archivos
3. **Datos no aparecen**: Verificar conexión Supabase y usuario_id
4. **Formato incorrecto**: Verificar configuración locale es-PE
5. **Handlers no inicializan**: Verificar orden de scripts en HTML

## 📁 Archivos Creados

- `Pruebas/datos-prueba-dashboard.js` - Scripts SQL y análisis
- `public/js/datos-prueba-console.js` - Script para consola navegador
- `Pruebas/verificacion-final-gastos.js` - Verificaciones técnicas
- `Pruebas/diagnostico-gastos.js` - Diagnóstico de archivos

## 🎉 Resultado Esperado

Después de insertar los datos, el dashboard debe mostrar:
- Balance positivo saludable (20.7% ahorro)
- Gráficos con datos realistas y balanceados
- Módulos funcionales sin errores de autenticación
- Formato de moneda Peruana consistente
- Filtros y funcionalidades operativas

**¡Sistema PLANIFICAPRO completamente funcional con datos reales!** 🚀
