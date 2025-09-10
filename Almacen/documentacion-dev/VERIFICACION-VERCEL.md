# ✅ Verificación Post-Deployment Vercel

## 1. URLs de Acceso
- **Landing**: `https://tu-proyecto.vercel.app/`
- **Login**: `https://tu-proyecto.vercel.app/login`
- **Registro**: `https://tu-proyecto.vercel.app/register`
- **Dashboard**: `https://tu-proyecto.vercel.app/dashboard`

## 2. Variables de Entorno Requeridas
Verifica en Vercel Dashboard > Settings > Environment Variables:
```
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_KEY=tu_service_key
```

## 3. Pruebas Funcionales

### ✅ Registro
1. Ir a `/register`
2. Registrar usuario: `test-vercel@gmail.com` / `123456`
3. Debe mostrar "Registro exitoso" y redirigir a dashboard

### ✅ Login
1. Ir a `/login`
2. Ingresar credenciales del usuario registrado
3. Debe obtener JWT y redirigir a dashboard

### ✅ Dashboard
1. Verificar que muestra módulos: Ingresos, Gastos, Presupuesto
2. Probar agregar un ingreso de prueba
3. Verificar que se guarda en Supabase

## 4. Debugging
Si algo falla, abrir DevTools (F12) y revisar:
- **Console**: Errores de JavaScript
- **Network**: Llamadas a API fallando
- **Application > LocalStorage**: Token JWT guardado

## 5. API Endpoints
- `GET /api/ping` - Health check
- `POST /api/login` - Autenticación
- `POST /api/register` - Registro
- `GET/POST /api/ingresos` - CRUD ingresos
- `GET/POST /api/gastos` - CRUD gastos

## 🎯 Todo debería funcionar igual que en local
