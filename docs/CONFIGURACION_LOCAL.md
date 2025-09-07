# 🐘 CONFIGURACIÓN POSTGRESQL LOCAL - LARAGON

## 📋 CONFIGURACIÓN ACTUAL CONFIRMADA

### **Datos de Conexión**
```
Host: localhost
Puerto: 5434
Base de Datos: gestion_presupuesto  
Usuario: postgres
Password: sa123
```

---

## 🚀 SETUP INICIAL (15 minutos)

### **Paso 1: Verificar PostgreSQL en Laragon**
```bash
# Abrir terminal en Laragon
# Verificar que PostgreSQL esté corriendo en puerto 5434
netstat -an | findstr :5434

# Debería mostrar:
# TCP    0.0.0.0:5434    0.0.0.0:0    LISTENING
```

### **Paso 2: Conectar a PostgreSQL**
```bash
# Desde terminal de Laragon:
psql -U postgres -h localhost -p 5434

# O especificar la base de datos directamente:
psql -U postgres -h localhost -p 5434 -d gestion_presupuesto
```

### **Paso 3: Crear Base de Datos (si no existe)**
```sql
-- Conectar como postgres first
\c postgres

-- Crear la base de datos
CREATE DATABASE gestion_presupuesto
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Spanish_Peru.1252'
    LC_CTYPE = 'Spanish_Peru.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Conectar a la nueva base de datos
\c gestion_presupuesto;

-- Verificar conexión
SELECT current_database(), current_user, inet_server_addr(), inet_server_port();
```

---

## 🗄️ INSTALACIÓN DE TABLAS

### **Ejecutar Scripts en Orden**
```bash
# 1. Navegar al folder database del proyecto
cd "d:\VS Code\Gestion_v1-main\Gestion_v2-SVG\database"

# 2. Ejecutar script principal
psql -U postgres -h localhost -p 5434 -d gestion_presupuesto -f 01-setup-database.sql

# 3. Verificar que las tablas se crearon correctamente
psql -U postgres -h localhost -p 5434 -d gestion_presupuesto -c "\dt"
```

### **Verificación Manual**
```sql
-- Conectar a la base de datos
\c gestion_presupuesto;

-- Ver todas las tablas
\dt

-- Ver estructura de una tabla
\d perfiles_usuario
\d ingresos  
\d gastos
\d simulaciones_credito

-- Ver índices
\di

-- Probar inserción de datos de prueba
INSERT INTO ingresos (descripcion, monto, categoria, fecha) 
VALUES ('Salario Diciembre', 5000.00, 'salario', '2024-12-01');

INSERT INTO gastos (descripcion, monto, categoria, fecha, metodo_pago)
VALUES ('Supermercado', 250.50, 'alimentacion', '2024-12-02', 'tarjeta_debito');

-- Verificar datos
SELECT * FROM ingresos;
SELECT * FROM gastos;

-- Calcular balance
SELECT 
    (SELECT COALESCE(SUM(monto), 0) FROM ingresos) as total_ingresos,
    (SELECT COALESCE(SUM(monto), 0) FROM gastos) as total_gastos,
    (SELECT COALESCE(SUM(monto), 0) FROM ingresos) - 
    (SELECT COALESCE(SUM(monto), 0) FROM gastos) as balance;
```

---

## 🔧 CONFIGURACIÓN PARA JAVASCRIPT

### **String de Conexión para Node.js**
```javascript
// config/database.js
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'gestion_presupuesto',
    password: 'sa123',
    port: 5434,
    // Configuración adicional
    max: 20, // máximo número de conexiones
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test de conexión
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Error conectando a PostgreSQL:', err);
    } else {
        console.log('✅ Conectado a PostgreSQL:', res.rows[0]);
    }
});

module.exports = pool;
```

### **API Endpoints Básicos (Express)**
```javascript
// server.js (mínimo para desarrollo)
const express = require('express');
const cors = require('cors');
const pool = require('./config/database');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Endpoint de prueba
app.get('/api/test', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW() as current_time');
        res.json({ 
            status: 'success',
            message: 'Conectado a PostgreSQL',
            data: result.rows[0] 
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            message: error.message 
        });
    }
});

// Ingresos endpoints
app.get('/api/ingresos', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, descripcion, monto, categoria, fecha, es_recurrente, notas, created_at
            FROM ingresos 
            ORDER BY fecha DESC, created_at DESC
            LIMIT 50
        `);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/ingresos', async (req, res) => {
    try {
        const { descripcion, monto, categoria = 'otros', fecha, es_recurrente = false, frecuencia_dias, notas } = req.body;
        
        const result = await pool.query(`
            INSERT INTO ingresos (descripcion, monto, categoria, fecha, es_recurrente, frecuencia_dias, notas)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [descripcion, monto, categoria, fecha, es_recurrente, frecuencia_dias, notas]);
        
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Gastos endpoints
app.get('/api/gastos', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, descripcion, monto, categoria, fecha, metodo_pago, es_recurrente, notas, created_at
            FROM gastos 
            ORDER BY fecha DESC, created_at DESC
            LIMIT 50
        `);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/gastos', async (req, res) => {
    try {
        const { descripcion, monto, categoria = 'otros', fecha, metodo_pago = 'efectivo', es_recurrente = false, frecuencia_dias, notas } = req.body;
        
        const result = await pool.query(`
            INSERT INTO gastos (descripcion, monto, categoria, fecha, metodo_pago, es_recurrente, frecuencia_dias, notas)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `, [descripcion, monto, categoria, fecha, metodo_pago, es_recurrente, frecuencia_dias, notas]);
        
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Balance endpoint
app.get('/api/balance', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                (SELECT COALESCE(SUM(monto), 0) FROM ingresos) as total_ingresos,
                (SELECT COALESCE(SUM(monto), 0) FROM gastos) as total_gastos,
                (SELECT COALESCE(SUM(monto), 0) FROM ingresos) - 
                (SELECT COALESCE(SUM(monto), 0) FROM gastos) as balance_actual,
                (SELECT COUNT(*) FROM ingresos) as count_ingresos,
                (SELECT COUNT(*) FROM gastos) as count_gastos
        `);
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📊 API disponible en http://localhost:${PORT}/api/`);
    console.log(`🧪 Test: http://localhost:${PORT}/api/test`);
});
```

---

## 📦 DEPENDENCIAS MÍNIMAS (package.json)

```json
{
    "name": "gestion-presupuesto-api",
    "version": "1.0.0",
    "description": "API minimalista para gestión financiera",
    "main": "server.js",
    "scripts": {
        "start": "node server.js",
        "dev": "nodemon server.js",
        "test": "node test-connection.js"
    },
    "dependencies": {
        "express": "^4.18.2",
        "cors": "^2.8.5", 
        "pg": "^8.11.3"
    },
    "devDependencies": {
        "nodemon": "^3.0.2"
    }
}
```

### **Instalación**
```bash
# En el folder del proyecto
npm init -y
npm install express cors pg
npm install --save-dev nodemon

# Crear server.js con el código de arriba
# Ejecutar
npm run dev
```

---

## 🧪 TESTING Y VERIFICACIÓN

### **Test de Conexión (test-connection.js)**
```javascript
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'gestion_presupuesto', 
    password: 'sa123',
    port: 5434,
});

async function testConnection() {
    try {
        console.log('🔄 Probando conexión a PostgreSQL...');
        
        // Test básico
        const timeResult = await pool.query('SELECT NOW() as current_time');
        console.log('✅ Conexión exitosa:', timeResult.rows[0].current_time);
        
        // Test tablas
        const tablesResult = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        console.log('📋 Tablas encontradas:', tablesResult.rows.map(r => r.table_name));
        
        // Test datos de prueba
        const ingresosCount = await pool.query('SELECT COUNT(*) FROM ingresos');
        const gastosCount = await pool.query('SELECT COUNT(*) FROM gastos');
        
        console.log(`💰 Ingresos registrados: ${ingresosCount.rows[0].count}`);
        console.log(`💸 Gastos registrados: ${gastosCount.rows[0].count}`);
        
        // Test balance
        const balance = await pool.query(`
            SELECT 
                (SELECT COALESCE(SUM(monto), 0) FROM ingresos) as ingresos,
                (SELECT COALESCE(SUM(monto), 0) FROM gastos) as gastos,
                (SELECT COALESCE(SUM(monto), 0) FROM ingresos) - 
                (SELECT COALESCE(SUM(monto), 0) FROM gastos) as balance
        `);
        console.log('💰 Balance actual:', balance.rows[0]);
        
        console.log('✅ Todos los tests pasaron correctamente');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('🔍 Detalles:', error);
    } finally {
        await pool.end();
    }
}

testConnection();
```

### **Ejecutar Tests**
```bash
# Test de conexión
node test-connection.js

# Debería mostrar:
# ✅ Conexión exitosa: 2024-12-06 10:30:45...
# 📋 Tablas encontradas: ['gastos', 'ingresos', 'perfiles_usuario', 'simulaciones_credito']
# 💰 Ingresos registrados: 1
# 💸 Gastos registrados: 1  
# 💰 Balance actual: { ingresos: '5000.00', gastos: '250.50', balance: '4749.50' }
# ✅ Todos los tests pasaron correctamente
```

---

## 🚨 TROUBLESHOOTING

### **Error: "password authentication failed"**
```bash
# Verificar password en psql
psql -U postgres -h localhost -p 5434
# Si pide password diferente, actualizar en config

# O resetear password en Laragon:
# Laragon > PostgreSQL > Change Password > sa123
```

### **Error: "database does not exist"**
```bash
# Crear la base de datos manualmente
psql -U postgres -h localhost -p 5434 -c "CREATE DATABASE gestion_presupuesto;"
```

### **Error: "connection refused"**
```bash
# Verificar que PostgreSQL esté corriendo
# Laragon > Start All
# O específicamente PostgreSQL > Start

# Verificar puerto
netstat -an | findstr :5434
```

### **Error: "relation does not exist"**
```bash
# Ejecutar el script de creación de tablas
psql -U postgres -h localhost -p 5434 -d gestion_presupuesto -f database/01-setup-database.sql
```

---

## ✅ CHECKLIST DE VERIFICACIÓN

### **Base de Datos**
- [ ] ✅ PostgreSQL corriendo en puerto 5434
- [ ] ✅ Base de datos 'gestion_presupuesto' existe
- [ ] ✅ Conexión con usuario postgres/sa123 funciona
- [ ] ✅ 4 tablas principales creadas
- [ ] ✅ Índices aplicados correctamente
- [ ] ✅ Datos de prueba insertados

### **API (Opcional para desarrollo)**
- [ ] ⏳ Node.js y dependencias instaladas
- [ ] ⏳ Server.js configurado y corriendo
- [ ] ⏳ Endpoints de prueba respondiendo
- [ ] ⏳ CRUD básico funcional
- [ ] ⏳ Manejo de errores implementado

### **Conexión Frontend**
- [ ] ⏳ JavaScript puede conectar a API
- [ ] ⏳ CORS configurado correctamente
- [ ] ⏳ Manejo de respuestas async/await
- [ ] ⏳ Validación de datos cliente/servidor

---

**🎯 PostgreSQL LOCAL CONFIGURADO CORRECTAMENTE**

Con esta configuración tienes todo lo necesario para desarrollar localmente antes de migrar a Supabase.

**Próximo paso**: Configurar la estructura HTML y JavaScript para conectar con esta base de datos.

---

*Configuración validada para Windows + Laragon + PostgreSQL 13+*
