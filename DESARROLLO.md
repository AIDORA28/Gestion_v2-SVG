# 🚀 PLANIFICAPRO - Sistema de Gestión Presupuesto

## 📋 Instrucciones de Desarrollo

### 🔧 Instalación Inicial

```bash
# Instalar dependencias de todos los proyectos
cd "D:\VS Code\Gestion_v1-main\Gestion_v2-SVG"
pnpm run install:all
```

### 🚀 Iniciar Servidores de Desarrollo

Tienes **3 opciones** para iniciar el sistema:

#### Opción 1: Script Automático (Recomendado)
```bash
# Ejecuta ambos servidores automáticamente en ventanas separadas
.\iniciar-desarrollo.bat
```

#### Opción 2: Comando Único
```bash
cd "D:\VS Code\Gestion_v1-main\Gestion_v2-SVG"
pnpm run dev
```

#### Opción 3: Manual (Por separado)
```bash
# Terminal 1 - Backend
cd backend
pnpm run dev

# Terminal 2 - Frontend  
cd frontend
pnpm run dev
```

### 🌐 URLs del Sistema

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Backend API** | http://localhost:5000 | API REST con PostgreSQL |
| **Frontend** | http://localhost:3000 | Servidor de archivos estáticos |
| **Landing Page** | http://localhost:3000/landing.html | Página principal con login |
| **Test Login** | http://localhost:3000/login-test.html | Página de pruebas |
| **Health Check** | http://localhost:5000/health | Estado del backend |

### 🗄️ Base de Datos

- **Motor**: PostgreSQL
- **Puerto**: 5434
- **Base**: gestion_presupuesto
- **Host**: 127.0.0.1

### 👤 Credenciales de Prueba

```
Email: test@gmail.com
Password: 123456
```

### 📂 Estructura del Proyecto

```
Gestion_v2-SVG/
├── package.json              # Scripts unificados
├── iniciar-desarrollo.bat    # Script de inicio automático
├── backend/                  # API Node.js + Express
│   ├── server.js            # Servidor principal
│   └── package.json         # Dependencias backend
├── frontend/                 # Interfaz web
│   ├── landing.html         # Página principal
│   ├── login-test.html      # Página de pruebas
│   ├── js/                  # JavaScript modules
│   └── css/                 # Estilos CSS
└── database/                 # Scripts SQL
```

### 🛠️ Scripts Disponibles

```bash
pnpm run dev           # Iniciar backend + frontend
pnpm run dev:backend   # Solo backend
pnpm run dev:frontend  # Solo frontend
pnpm run dev:windows   # Script Windows (.bat)
pnpm run install:all   # Instalar todas las dependencias
```

### 🐛 Solución de Problemas

#### Error: "Failed to fetch"
- Verificar que ambos servidores estén corriendo
- Comprobar que los puertos 3000 y 5000 estén libres
- Verificar conexión a base de datos PostgreSQL

#### Backend no inicia
```bash
netstat -ano | findstr :5000  # Verificar si el puerto está ocupado
```

#### Frontend no carga
```bash
netstat -ano | findstr :3000  # Verificar si el puerto está ocupado
```

### 📝 Notas de Desarrollo

- El backend usa **nodemon** para recarga automática
- CORS configurado para localhost:3000
- Autenticación simplificada sin bcrypt
- Base de datos PostgreSQL local en puerto 5434

### 🔧 Configuración CORS

El backend está configurado para aceptar requests desde:
- http://localhost:3000
- http://localhost:5500
- http://127.0.0.1:3000

---

**¡Listo para desarrollar!** 🎉
