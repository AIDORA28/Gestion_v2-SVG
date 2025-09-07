# 🌐 DEPLOY EN VERCEL - GUÍA FUTURA

## 📋 CUANDO USAR ESTA GUÍA
Esta guía se usará al final del desarrollo, cuando el sistema esté completamente funcional localmente y migrado a Supabase.

---

## 🚀 PREPARACIÓN PARA DEPLOY

### **Pre-requisitos**
- [x] Sistema local funcionando 100%
- [x] Migración a Supabase completada  
- [x] Testing completo realizado
- [ ] Repositorio GitHub configurado
- [ ] Cuenta Vercel creada

---

## 📁 ESTRUCTURA PARA DEPLOY

### **Organización Final del Proyecto**
```
gestion-presupuesto/
├── 📄 README.md                      # Documentación principal
├── 📄 vercel.json                    # Configuración Vercel
├── 📄 package.json                   # Dependencias (opcional)
│
├── 📁 frontend/                      # Archivos estáticos
│   ├── index.html                   # Página principal
│   ├── dashboard.html               # Dashboard
│   ├── ingresos.html               # Gestión ingresos  
│   ├── gastos.html                 # Gestión gastos
│   ├── credito.html                # Simulador crédito
│   ├── reportes.html               # Reportes
│   │
│   ├── 📁 css/
│   │   ├── main.css               # Estilos principales
│   │   └── components.css         # Componentes
│   │
│   └── 📁 js/
│       ├── config.js             # Config Supabase
│       ├── auth.js               # Autenticación
│       ├── dashboard.js          # Dashboard
│       ├── ingresos.js          # Lógica ingresos
│       ├── gastos.js            # Lógica gastos
│       └── utils.js             # Utilidades
│
└── 📁 api/                         # Edge Functions (opcional)
    └── hello.js                    # Ejemplo
```

---

## ⚙️ CONFIGURACIÓN VERCEL

### **vercel.json**
```json
{
  "version": 2,
  "name": "gestion-presupuesto",
  "builds": [
    {
      "src": "frontend/**/*",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    },
    {
      "src": "/",
      "dest": "/frontend/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options", 
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### **package.json (Opcional)**
```json
{
  "name": "gestion-presupuesto",
  "version": "1.0.0",
  "description": "Sistema de gestión financiera profesional",
  "scripts": {
    "dev": "vercel dev",
    "build": "echo 'No build process needed'",
    "deploy": "vercel --prod"
  },
  "keywords": ["finanzas", "presupuesto", "supabase", "javascript"],
  "author": "Tu Nombre",
  "license": "MIT"
}
```

---

## 🔧 PROCESO DE DEPLOY

### **Paso 1: Preparar Repositorio GitHub**
```bash
# Inicializar Git (si no está iniciado)
git init

# Agregar .gitignore
echo "node_modules/
.env
.env.local
.env.real
*.log
.DS_Store
Thumbs.db" > .gitignore

# Commit inicial
git add .
git commit -m "Sistema de gestión financiera - Listo para deploy"

# Conectar a GitHub
git remote add origin https://github.com/tu-usuario/gestion-presupuesto.git
git branch -M main
git push -u origin main
```

### **Paso 2: Conectar Vercel**
```bash
# Opción 1: Vercel CLI
npm i -g vercel
vercel login
vercel

# Opción 2: Vercel Dashboard
# 1. Ir a https://vercel.com
# 2. "Import Git Repository"
# 3. Seleccionar tu repositorio
# 4. Configure como "Other" framework
# 5. Deploy
```

### **Paso 3: Configurar Variables de Entorno**
```bash
# En Vercel Dashboard > Settings > Environment Variables:
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key-publica
NODE_ENV=production
```

---

## 🌍 CONFIGURACIÓN DE DOMINIO

### **Dominio Personalizado (Opcional)**
```bash
# En Vercel Dashboard:
# Settings > Domains > Add Domain

# Ejemplos:
mi-gestion-financiera.com
finanzas.midominio.com
presupuesto-personal.vercel.app (gratis)
```

### **Configuración DNS**
```
# Para dominio personalizado, configurar en tu proveedor DNS:
Tipo: CNAME
Nombre: www (o subdominio deseado)
Valor: cname.vercel-dns.com

# O para dominio raíz:
Tipo: A
Nombre: @
Valor: 76.76.19.61 (IP de Vercel)
```

---

## 📊 OPTIMIZACIONES PARA PRODUCCIÓN

### **Compresión y Performance**
```html
<!-- En todos los HTML, agregar meta tags de performance -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#3B82F6">
<link rel="preload" href="css/main.css" as="style">
<link rel="preload" href="js/config.js" as="script">

<!-- Lazy loading para imágenes -->
<img src="..." loading="lazy" alt="...">
```

### **PWA Configuration (Opcional)**
```json
// public/manifest.json
{
  "name": "Gestión Financiera",
  "short_name": "GestFinan",
  "description": "Sistema de gestión financiera personal",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3B82F6",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192", 
      "type": "image/png"
    }
  ]
}
```

---

## 🧪 TESTING EN PRODUCCIÓN

### **Checklist Post-Deploy**
```bash
# URLs a probar:
✅ https://tu-dominio.vercel.app/
✅ https://tu-dominio.vercel.app/dashboard.html
✅ https://tu-dominio.vercel.app/ingresos.html
✅ https://tu-dominio.vercel.app/gastos.html
✅ https://tu-dominio.vercel.app/credito.html
✅ https://tu-dominio.vercel.app/reportes.html

# Funcionalidades críticas:
✅ Registro de usuario
✅ Login/Logout
✅ CRUD ingresos
✅ CRUD gastos  
✅ Cálculo balance
✅ Simulador crédito
✅ Gráficos y reportes
✅ Responsive design
```

### **Herramientas de Monitoreo**
```javascript
// Google Analytics (opcional)
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>

// Vercel Analytics (incluido gratis)
// Se habilita automáticamente en el dashboard
```

---

## 🔒 SEGURIDAD EN PRODUCCIÓN

### **Headers de Seguridad**
Ya incluidos en `vercel.json`:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY` 
- `X-XSS-Protection: 1; mode=block`

### **HTTPS y SSL**
- ✅ Vercel proporciona SSL automáticamente
- ✅ Redirección HTTP → HTTPS automática
- ✅ Certificados renovados automáticamente

### **Variables Sensibles**
```javascript
// ❌ NUNCA hacer esto:
const SUPABASE_SERVICE_KEY = "eyJ..."; // Clave secreta expuesta

// ✅ Siempre usar:
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY; // Clave pública
```

---

## 🚨 TROUBLESHOOTING

### **Error: "Build Failed"**
```bash
# Verificar que no haya errores de sintaxis
# Verificar que todas las rutas sean relativas
# Verificar vercel.json válido
```

### **Error: "Function Timeout"**
```bash
# Las Edge Functions tienen límite de 10s
# Optimizar consultas a Supabase
# Implementar caché cuando sea posible
```

### **Error: "Domain Not Found"**
```bash
# Verificar configuración DNS
# Esperar propagación DNS (hasta 24h)
# Verificar que el dominio esté activo
```

---

## 📈 MÉTRICAS Y ANALYTICS

### **Vercel Analytics (Gratis)**
- Page views y unique visitors
- Performance metrics (Core Web Vitals)
- Geographic distribution
- Top pages y referrers

### **Supabase Analytics**
- Database usage
- API calls
- Authentication events
- Real-time connections

---

## ✅ CHECKLIST FINAL DE DEPLOY

### **Pre-Deploy**
- [ ] Sistema local 100% funcional
- [ ] Migración a Supabase exitosa
- [ ] Testing completo local
- [ ] Repositorio GitHub actualizado
- [ ] Documentación completa

### **Deploy Process**
- [ ] vercel.json configurado
- [ ] Variables de entorno configuradas
- [ ] Deploy exitoso en Vercel
- [ ] URLs funcionando correctamente
- [ ] SSL verificado

### **Post-Deploy**
- [ ] Testing funcional completo
- [ ] Performance verificada
- [ ] SEO básico implementado
- [ ] Analytics configurado
- [ ] Backup y monitoring activo

### **Opcional**
- [ ] Dominio personalizado configurado
- [ ] PWA habilitada
- [ ] Google Analytics configurado
- [ ] Sitemap.xml creado

---

**🎯 ESTA GUÍA SE USARÁ AL FINAL DEL PROYECTO**

Primero completaremos todo el desarrollo local → migración Supabase → deploy Vercel.

---

*Guía preparada para deploy futuro | Usar solo cuando todo esté listo*
