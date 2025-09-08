# Resolver OIDC desde Integración Supabase-Vercel Marketplace

## El problema: Integración automática de Supabase
El OIDC aparece porque tienes instalada la **integración oficial de Supabase desde el Marketplace de Vercel**, que automáticamente:
- Configura OIDC para sincronización de roles
- Activa autenticación automática
- Bloquea endpoints públicos

## Solución 1: Reconfigurar la integración existente

### Paso 1: Acceder al Marketplace
1. Ve a tu dashboard de Vercel
2. Selecciona tu proyecto `planificapro-v2`
3. Ve a **Settings > Integrations**
4. Busca la integración de **Supabase**

### Paso 2: Reconfigurar la integración
1. Haz clic en **Configure** en la integración de Supabase
2. En configuración avanzada, busca **Authentication Settings**
3. **Desactiva**: "Require authentication for all endpoints"
4. **Activa**: "Allow public endpoints"
5. Guarda los cambios

### Paso 3: Variables de entorno limpias
Solo mantener estas variables:
```
NODE_ENV=production
SUPABASE_URL=https://[tu-project].supabase.co
SUPABASE_ANON_KEY=[tu-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[tu-service-role-key]
```

## Solución 2: Desinstalar y reinstalar integración

### Paso 1: Desinstalar integración actual
1. Settings > Integrations
2. Encuentra Supabase integration
3. Click **Remove** o **Uninstall**
4. Confirma la desinstalación

### Paso 2: Configuración manual (sin integración)
- **NO** reinstales la integración del Marketplace
- Configura manualmente solo las variables de entorno
- Usa conexión directa con @supabase/supabase-js

## Solución 3: Crear proyecto completamente limpio

### Configuración recomendada para nuevo proyecto:
- **Framework**: Other (no Next.js)
- **Node.js Version**: 20.x
- **NO** usar integración Supabase del Marketplace
- Conexión manual a Supabase
