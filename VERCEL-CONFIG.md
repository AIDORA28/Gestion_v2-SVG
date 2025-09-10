# 🚀 GUÍA DE CONFIGURACIÓN VERCEL - PLANIFICAPRO

## 📋 ANTES DEL DEPLOY - CONFIGURAR EN VERCEL:

### 1. 🌍 VARIABLES DE ENTORNO:
```
SUPABASE_URL=https://lobyofpwqwqsszugdwnw.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTU4NDIsImV4cCI6MjA3Mjg5MTg0Mn0.QsZ2dIU1iPffRGtHUREQIhQ5--7_w4ANowG0rJ0AtcI
NODE_ENV=production
```

### 2. ⚙️ BUILD SETTINGS:
- **Framework Preset**: Other
- **Build Command**: `echo "Static files ready"`
- **Output Directory**: `public`
- **Install Command**: `pnpm install`

### 3. 🎯 ROOT DIRECTORY:
- **Root Directory**: `.` (dejar vacío)

### 4. 🚨 TROUBLESHOOTING:
Si sigue "offline":
1. Verifica que las variables de entorno estén configuradas
2. Redeploy manualmente desde Vercel Dashboard
3. Verifica que el dominio personalizado (si tienes) esté configurado
4. Checa los logs de función en Vercel Dashboard

## ✅ ENDPOINTS QUE DEBEN FUNCIONAR:
- `/` → Landing page
- `/login` → Login page
- `/dashboard` → Dashboard
- `/api/health` → Health check (debe retornar 200 OK)
- `/api/login` → POST para autenticación

## 🔍 DEBUGGING:
- URL de health check: https://tu-app.vercel.app/api/health
- Si health check falla, el problema es el backend
- Si health check funciona pero login no, el problema es frontend
