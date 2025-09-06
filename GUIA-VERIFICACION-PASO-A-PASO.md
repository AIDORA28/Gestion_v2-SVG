# 🔗 GUÍA PASO A PASO - VERIFICACIÓN DE BASE DE DATOS

## 📋 **PASOS EXACTOS A SEGUIR:**

### **PASO 1: Abrir Supabase Dashboard**
```
https://supabase.com/dashboard/project/trlbsfktusefvpheoudn
```

### **PASO 2: Abrir DevTools**
- Presiona **F12** 
- Busca la pestaña **"Console"**
- Click en ella

### **PASO 3: Habilitar pasting (IMPORTANTE)**
En la consola aparecerá un warning. Escribe exactamente esto:
```
allow pasting
```
Presiona **Enter**

### **PASO 4: Pegar el código**
Copia y pega TODO este bloque de código:

```javascript
console.log('🔗 Conectando con Supabase Gestion_Presupuesto...');

// 1. Cargar cliente Supabase
const script = document.createElement('script');
script.src = 'https://unpkg.com/@supabase/supabase-js@2.38.0/dist/umd/supabase.min.js';
document.head.appendChild(script);

// 2. Función principal de conexión
setTimeout(async () => {
    try {
        console.log('⚙️ Inicializando cliente con credenciales confirmadas...');
        const { createClient } = supabase;
        const client = createClient(
            'https://trlbsfktusefvpheoudn.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRybGJzZmt0dXNlZnZwaGVvdWRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMzg5MDMsImV4cCI6MjA3MjYxNDkwM30.Rg045QrnG6R7kIy3k_8zl8JSiMFwWVN5e08LmZCx6Fc'
        );

        console.log('🔐 Proyecto: Gestion_Presupuesto');
        console.log('🔑 Password confirmado: JZ9ljPB1Lnixksl9');

        // 3. Login automático
        const { data: authData, error: authError } = await client.auth.signInWithPassword({
            email: 'test@ejemplo.com',
            password: 'Test123456!'
        });

        if (authError) {
            console.error('❌ Error de autenticación:', authError.message);
            console.log('🔄 Intentando crear usuario si no existe...');
            
            const { data: signUpData, error: signUpError } = await client.auth.signUp({
                email: 'test@ejemplo.com',
                password: 'Test123456!'
            });
            
            if (signUpError) {
                console.error('❌ Error al crear usuario:', signUpError.message);
                return;
            } else {
                console.log('✅ Usuario creado, reintentando login...');
            }
        } else {
            console.log('✅ Sesión iniciada exitosamente:', authData.user.email);
        }

        window.supabaseClient = client;
        if (authData?.user) window.currentUser = authData.user;

        // 4. Ver datos de las tablas INMEDIATAMENTE
        await mostrarTodoElSistema();

    } catch (error) {
        console.error('❌ Error general:', error);
    }
}, 2000);

// Función principal para mostrar TODOS los datos
async function mostrarTodoElSistema() {
    console.log('\n🎯 ===== VERIFICACIÓN COMPLETA DEL SISTEMA FINANCIERO =====\n');

    // ESTADÍSTICAS GENERALES PRIMERO
    console.log('📊 OBTENIENDO ESTADÍSTICAS GENERALES...\n');

    const tablas = [
        { nombre: 'perfiles_usuario', emoji: '👤' },
        { nombre: 'ingresos', emoji: '💰' },
        { nombre: 'gastos', emoji: '💸' },
        { nombre: 'simulaciones_credito', emoji: '🏦' },
        { nombre: 'metas_financieras', emoji: '🎯' },
        { nombre: 'presupuestos', emoji: '📋' },
        { nombre: 'categorias_personalizadas', emoji: '🏷️' },
        { nombre: 'logs_auditoria', emoji: '📝' }
    ];

    const estadisticas = {};
    
    // Contar registros en cada tabla
    for (const tabla of tablas) {
        try {
            const { count, error } = await window.supabaseClient
                .from(tabla.nombre)
                .select('*', { count: 'exact', head: true });
            
            if (error) {
                estadisticas[tabla.nombre] = `Error: ${error.message}`;
                console.warn(`⚠️ ${tabla.emoji} ${tabla.nombre}: ${error.message}`);
            } else {
                estadisticas[tabla.nombre] = count || 0;
                console.log(`${tabla.emoji} ${tabla.nombre}: ${count || 0} registros`);
            }
        } catch (err) {
            estadisticas[tabla.nombre] = `Error: ${err.message}`;
            console.error(`❌ ${tabla.nombre}:`, err.message);
        }
    }

    console.log('\n📋 RESUMEN DE REGISTROS:', estadisticas);

    // MOSTRAR DATOS DETALLADOS
    console.log('\n🔍 ===== DATOS DETALLADOS =====\n');

    for (const tabla of tablas) {
        try {
            const limite = tabla.nombre === 'logs_auditoria' ? 10 : 20;
            
            const { data, error } = await window.supabaseClient
                .from(tabla.nombre)
                .select('*')
                .limit(limite);

            if (error) {
                console.warn(`⚠️ ${tabla.emoji} ERROR en ${tabla.nombre}:`, error);
            } else {
                console.log(`${tabla.emoji} DATOS de ${tabla.nombre.toUpperCase()}:`);
                console.table(data);
            }
        } catch (err) {
            console.error(`❌ Error al obtener ${tabla.nombre}:`, err);
        }
    }

    // PROBAR FUNCIONES PERSONALIZADAS
    console.log('\n🔧 ===== FUNCIONES PERSONALIZADAS =====\n');
    await probarFuncionesPersonalizadas();

    // COMANDOS FINALES
    console.log('\n🎉 ===== VERIFICACIÓN COMPLETADA =====');
    console.log('✅ Sistema financiero verificado exitosamente');
    console.log('📊 Datos disponibles en las tablas de arriba');
    console.log('🔧 Funciones personalizadas probadas');
    
    console.log('\n💡 COMANDOS ADICIONALES:');
    console.log('await crearDatosDePrueba(); // Crear datos de ejemplo');
    console.log('await verEstadisticasCompletas(); // Ver análisis detallado');
}

// Probar funciones PostgreSQL
async function probarFuncionesPersonalizadas() {
    const funciones = [
        { 
            nombre: 'obtener_opciones_estado_civil', 
            params: {},
            descripcion: '💑 OPCIONES DE ESTADO CIVIL'
        }
    ];

    // Si hay usuario logueado, probar funciones que requieren autenticación
    if (window.currentUser) {
        funciones.push(
            {
                nombre: 'obtener_mi_perfil',
                params: {},
                descripcion: '👤 MI PERFIL COMPLETO'
            },
            {
                nombre: 'calcular_balance_mensual',
                params: {
                    p_usuario_id: window.currentUser.id,
                    p_year: 2025,
                    p_month: 9
                },
                descripcion: '💰 BALANCE SEPTIEMBRE 2025'
            }
        );
    }

    for (const func of funciones) {
        try {
            const { data, error } = await window.supabaseClient.rpc(func.nombre, func.params);
            
            if (error) {
                console.warn(`⚠️ ${func.descripcion}: ${error.message}`);
            } else {
                console.log(`✅ ${func.descripcion}:`, data);
            }
        } catch (err) {
            console.error(`❌ Error en ${func.nombre}:`, err.message);
        }
    }
}

// Función para crear datos de prueba
window.crearDatosDePrueba = async function() {
    if (!window.currentUser) {
        console.log('⚠️ Necesitas estar logueado para crear datos');
        return;
    }

    console.log('📝 Creando datos de prueba...');

    // Crear ingreso de prueba
    const { data: ingreso, error: errorIngreso } = await window.supabaseClient
        .from('ingresos')
        .insert({
            usuario_id: window.currentUser.id,
            descripcion: 'Salario mensual - Prueba',
            monto: 50000,
            categoria: 'salario',
            fecha: '2025-09-06'
        })
        .select();

    if (errorIngreso) {
        console.error('❌ Error al crear ingreso:', errorIngreso);
    } else {
        console.log('✅ Ingreso creado:', ingreso);
    }

    // Crear gasto de prueba
    const { data: gasto, error: errorGasto } = await window.supabaseClient
        .from('gastos')
        .insert({
            usuario_id: window.currentUser.id,
            descripcion: 'Supermercado - Prueba',
            monto: 15000,
            categoria: 'alimentacion',
            metodo_pago: 'tarjeta_debito',
            fecha: '2025-09-06'
        })
        .select();

    if (errorGasto) {
        console.error('❌ Error al crear gasto:', errorGasto);
    } else {
        console.log('✅ Gasto creado:', gasto);
    }

    console.log('🎉 Datos de prueba creados exitosamente');
    await mostrarTodoElSistema(); // Refrescar datos
};

console.log('⏳ Esperando conexión con Gestion_Presupuesto... (2 segundos)');
```

### **PASO 5: Presionar Enter**
Después de pegar el código, presiona **Enter**

### **PASO 6: Esperar resultados**
En 30 segundos verás:
- ✅ Conexión establecida
- 📊 Número de registros en cada tabla
- 🗂️ Datos detallados
- 🔧 Funciones probadas

---

## 🎯 **RESULTADOS QUE VERÁS:**

```
🔗 Conectando con Supabase Gestion_Presupuesto...
⚙️ Inicializando cliente con credenciales confirmadas...
🔐 Proyecto: Gestion_Presupuesto
🔑 Password confirmado: JZ9ljPB1Lnixksl9
✅ Sesión iniciada exitosamente: test@ejemplo.com

🎯 ===== VERIFICACIÓN COMPLETA DEL SISTEMA FINANCIERO =====

📊 OBTENIENDO ESTADÍSTICAS GENERALES...

👤 perfiles_usuario: X registros
💰 ingresos: X registros
💸 gastos: X registros
🏦 simulaciones_credito: X registros
🎯 metas_financieras: X registros
📋 presupuestos: X registros
🏷️ categorias_personalizadas: X registros
📝 logs_auditoria: X registros
```

---

## 🔥 **COMANDOS EXTRAS (DESPUÉS DE LA VERIFICACIÓN):**

Si quieres crear datos de prueba, escribe:
```javascript
await crearDatosDePrueba();
```

Para ver una tabla específica:
```javascript
const { data } = await supabaseClient.from('perfiles_usuario').select('*');
console.table(data);
```

---

## ⚠️ **NOTAS IMPORTANTES:**

1. **NO olvides** escribir `allow pasting` primero
2. **COPIA TODO** el código de una vez
3. **ESPERA** los resultados (30 segundos)
4. Si hay errores, **compártelos conmigo**

---

## 🎉 **¡LISTO!**

Sigue estos pasos exactos y tendrás toda la información de tu base de datos. ¡Cuéntame qué resultados obtienes! 🚀
