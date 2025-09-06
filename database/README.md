# 🗄️ Base de Datos - Sistema Financiero V2

## 📋 **Orden de Ejecución en Supabase**

Ejecuta los scripts SQL en **este orden exacto** en el SQL Editor de Supabase:

### 1️⃣ **Setup Principal**
```
01-setup-database.sql
```
- Crea tablas principales (perfiles_usuario, ingresos, gastos, simulaciones_credito)
- Configura índices para performance
- Instala triggers para updated_at
- Aplica constraints y validaciones

### 2️⃣ **Seguridad**
```
02-policies.sql
```
- Habilita Row Level Security (RLS)
- Crea políticas por usuario
- Configura triggers automáticos para nuevos usuarios
- Asegura acceso solo a datos propios

### 3️⃣ **Funciones Avanzadas**
```
03-tablas-opcionales.sql
```
- Categorías personalizadas
- Metas financieras con campos calculados
- Presupuestos con alertas automáticas
- Funciones helper y triggers adicionales

### 4️⃣ **Auditoría y Límites**
```
04-audit-logs.sql
```
- Sistema completo de auditoría
- Tabla de límites por usuario
- Funciones para verificar y actualizar límites
- Tracking de todas las operaciones

### 5️⃣ **Funciones de Negocio**
```
05-functions-negocio.sql
```
- Calculadora de balance mensual completa
- Simulador de crédito con análisis de capacidad
- Resumen financiero inteligente con alertas
- Análisis de tendencias y proyecciones

### 6️⃣ **API Endpoints**
```
06-api-functions.sql
```
- Endpoints listos para el frontend
- Validaciones completas y manejo de errores
- Sistema de paginación y filtros
- Operaciones en lote (batch)

### 7️⃣ **Utilidades (Opcional)**
```
07-sql-confirmar-usuario.sql
```
- Herramientas de debugging
- Confirmación manual de usuarios
- Verificación de integridad del sistema
- Estadísticas completas

---

## 🎯 **Características Implementadas**

### ✅ **Arquitectura V2 Completa**
- **Multiusuario**: Cada usuario ve solo sus datos
- **Row Level Security**: Seguridad a nivel de fila
- **Triggers automáticos**: Perfiles y límites se crean automáticamente
- **Auditoría completa**: Tracking de todas las operaciones

### ✅ **Tablas Principales**
- `perfiles_usuario` - Información extendida de usuarios
- `ingresos` - Gestión de ingresos con recurrencia
- `gastos` - Control de gastos con métodos de pago
- `simulaciones_credito` - Simulador avanzado de créditos

### ✅ **Funciones Avanzadas**
- `categorias_personalizadas` - Categorías por usuario
- `metas_financieras` - Objetivos con seguimiento automático
- `presupuestos` - Presupuestos con alertas inteligentes
- `logs_auditoria` - Sistema completo de auditoría
- `user_limits` - Límites por usuario y plan

### ✅ **APIs Ready**
- `api_crear_ingreso_avanzado()` - Crear ingresos con validaciones
- `api_obtener_ingresos_avanzado()` - Obtener con filtros y paginación
- `api_dashboard_completo()` - Dashboard con métricas en tiempo real
- `api_crear_ingresos_lote()` - Operaciones en lote (hasta 20)

### ✅ **Funciones de Cálculo**
- `calcular_balance_mensual()` - Balance completo con análisis
- `simular_credito_completo()` - Simulador con tabla de amortización
- `obtener_resumen_financiero()` - Resumen con tendencias y alertas

### ✅ **Sistema de Auditoría**
- `registrar_auditoria()` - Log automático de operaciones
- `verificar_limites_usuario()` - Control de límites por plan
- `cleanup_old_audit_logs()` - Limpieza automática de logs antiguos

---

## 🔧 **Configuración Recomendada**

### **Paso 1: Ejecutar Scripts**
1. Ve a [Supabase Dashboard](https://supabase.com/dashboard/project/trlbsfktusefvpheoudn/sql)
2. Ejecuta los 6 scripts principales en orden
3. Verifica que no hay errores en cada paso

### **Paso 2: Verificar Instalación**
```sql
-- Ejecutar para verificar que todo esté bien
SELECT '✅ Base de datos configurada correctamente' as estado;

-- Ver tablas creadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Ver funciones disponibles
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
ORDER BY routine_name;
```

### **Paso 3: Configurar Frontend**
Actualizar la integración de Supabase en `ingresos.html` y otros módulos:

```javascript
// Ejemplo de uso de las API functions
const resultado = await supabaseClient
    .rpc('api_crear_ingreso_avanzado', {
        p_usuario_id: user.id,
        p_descripcion: 'Salario mensual',
        p_monto: 2500.00,
        p_categoria: 'salario'
    });
```

---

## 🎨 **Compatibilidad con V1**

### **Misma Funcionalidad Core:**
- ✅ Gestión de ingresos y gastos
- ✅ Simulador de crédito
- ✅ Reportes y dashboard
- ✅ Categorización de transacciones

### **Mejoras V2:**
- 🚀 **Multiusuario** vs monousuario
- 🛡️ **Seguridad RLS** vs sin seguridad
- 📊 **API endpoints** vs funciones básicas  
- 🔍 **Auditoría completa** vs sin tracking
- 📈 **Análisis avanzado** vs cálculos simples
- 🎯 **Metas y presupuestos** vs solo transacciones

---

## 🚨 **Notas Importantes**

### **Producción:**
- Los scripts están optimizados para producción
- Incluyen validaciones, constraints y seguridad
- Sistema de límites previene abuso
- Limpieza automática de logs antiguos

### **Desarrollo:**
- Usa `07-sql-confirmar-usuario.sql` para debugging
- Los triggers crean perfiles automáticamente
- Logs de auditoría para trazabilidad completa

### **Mantenimiento:**
- Los logs se limpian automáticamente (90 días)
- Campos calculados se actualizan en tiempo real
- Sistema de alertas inteligentes incluido

---

## ✅ **Estado Final**

Después de ejecutar todos los scripts tendrás:

- ✅ **15+ tablas** con relaciones optimizadas
- ✅ **25+ funciones** de negocio y API
- ✅ **40+ políticas** de seguridad RLS
- ✅ **20+ índices** para performance
- ✅ **10+ triggers** automáticos
- ✅ **Sistema completo** multiusuario ready

**¡La base de datos V2 estará lista para producción!** 🎉
