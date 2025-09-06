# CONFIGURACIÓN SUPABASE - PROYECTO GESTION_PRESUPUESTO
# =====================================================
# Guardar estas credenciales de forma segura
# Fecha: 5 de Septiembre 2025

## 📊 INFORMACIÓN DEL PROYECTO
- **Nombre del Proyecto:** Gestion_Presupuesto
- **URL:** https://trlbsfktusefvpheoudn.supabase.co
- **Región:** Auto-detectada
- **Plan:** Free Tier

## 🔑 CREDENCIALES DE ACCESO

### API Keys
```
URL: https://trlbsfktusefvpheoudn.supabase.co
ANON PUBLIC KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRybGJzZmt0dXNlZnZwaGVvdWRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMzg5MDMsImV4cCI6MjA3MjYxNDkwM30.Rg045QrnG6R7kIy3k_8zl8JSiMFwWVN5e08LmZCx6Fc
```

### Conexión Directa PostgreSQL
```
URL: postgresql://postgres:[PASSWORD]@db.trlbsfktusefvpheoudn.supabase.co:5432/postgres
PASSWORD: JZ9ljPB1Lnixksl9
```

### Conexión Completa PostgreSQL
```
Host: db.trlbsfktusefvpheoudn.supabase.co
Port: 5432
Database: postgres
Username: postgres
Password: JZ9ljPB1Lnixksl9
```

## 💻 CÓDIGO DE CONEXIÓN

### JavaScript (Frontend - CDN)
```javascript
// Cargar desde CDN
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/dist/umd/supabase.min.js"></script>

// Configurar cliente
const supabaseUrl = 'https://trlbsfktusefvpheoudn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRybGJzZmt0dXNlZnZwaGVvdWRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMzg5MDMsImV4cCI6MjA3MjYxNDkwM30.Rg045QrnG6R7kIy3k_8zl8JSiMFwWVN5e08LmZCx6Fc'
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey)
```

### JavaScript (Node.js - NPM)
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://trlbsfktusefvpheoudn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRybGJzZmt0dXNlZnZwaGVvdWRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMzg5MDMsImV4cCI6MjA3MjYxNDkwM30.Rg045QrnG6R7kIy3k_8zl8JSiMFwWVN5e08LmZCx6Fc'
const supabase = createClient(supabaseUrl, supabaseKey)
```

## 🗄️ ESTRUCTURA DE BASE DE DATOS

### Tablas Principales
- ✅ `perfiles_usuario` - Información de usuarios
- ✅ `ingresos` - Registro de ingresos
- ✅ `gastos` - Registro de gastos  
- ✅ `simulaciones_credito` - Simulaciones de crédito
- ✅ `categorias_personalizadas` - Categorías custom
- ✅ `metas_financieras` - Metas de ahorro
- ✅ `logs_auditoria` - Auditoría del sistema
- ✅ `user_limits` - Límites por usuario

### Configuración de Seguridad
- ✅ RLS (Row Level Security) activado
- ✅ Políticas de acceso por usuario
- ✅ Autenticación requerida

## 🔄 COMANDOS ÚTILES

### Verificar Conexión
```bash
# Por consola (si tienes psql)
psql postgresql://postgres:JZ9ljPB1Lnixksl9@db.trlbsfktusefvpheoudn.supabase.co:5432/postgres

# Por JavaScript (navegador)
supabase.from('perfiles_usuario').select('count')
```

### Reset de Contraseña
```sql
-- En Supabase SQL Editor
SELECT auth.uid(); -- Ver tu ID de usuario
```

## 📝 NOTAS IMPORTANTES

1. **Seguridad:** La ANON KEY es pública, pero RLS protege los datos
2. **Límites:** Free tier tiene límites de requests/mes
3. **Backup:** Configurar backups automáticos recomendado
4. **Monitoreo:** Revisar logs en dashboard regularmente

## 🚀 ESTADO ACTUAL

- **Proyecto:** Activo y funcionando
- **Conexión:** Verificada el 5 Sep 2025
- **Coherencia:** Frontend-Backend 100% alineado
- **Tablas:** 8/8 identificadas en esquema

---
**Última actualización:** 5 de Septiembre 2025
**Responsable:** AIDORA28
**Proyecto:** Gestion_v2-SVG
