# 🚀 INSTRUCCIONES GIT + VERCEL SETUP

## 📝 **PASO 1: Crear Repositorio en GitHub**

### **Opción A: Desde GitHub Web**
```
1. Ir a: https://github.com/new
2. Repository name: "gestion-financiera-v2"
3. Description: "Sistema de gestión financiera personal - Supabase + HTML/JS"
4. ✅ Public (o Private si prefieres)
5. ❌ NO agregar README.md (ya lo tenemos)
6. ❌ NO agregar .gitignore (ya lo tenemos)
7. Click "Create repository"
```

### **Opción B: Desde CLI (si tienes gh CLI)**
```bash
# Instalar GitHub CLI si no lo tienes
# https://cli.github.com/

gh repo create gestion-financiera-v2 --public --source=. --remote=origin --push
```

## 🔗 **PASO 2: Conectar Repositorio Local**

### **Comandos para ejecutar:**
```bash
# Agregar remote origin (CAMBIAR por tu username)
git remote add origin https://github.com/TU-USERNAME/gestion-financiera-v2.git

# Verificar remote
git remote -v

# Push inicial  
git branch -M main
git push -u origin main
```

### **⚠️ IMPORTANTE: Cambiar TU-USERNAME**
Reemplaza `TU-USERNAME` con tu nombre de usuario de GitHub.

## 🌐 **PASO 3: Configurar Vercel**

### **Opción A: Desde Vercel Web (Recomendado)**
```
1. Ir a: https://vercel.com/new
2. Connect Git provider: "Continue with GitHub"  
3. Import Git Repository: "gestion-financiera-v2"
4. Configure Project:
   - Project Name: "gestion-financiera-v2"
   - Framework Preset: "Other" 
   - Root Directory: "./" (default)
   - Build Command: (dejar vacío)
   - Output Directory: (dejar vacío)
   - Install Command: (dejar vacío)
5. Environment Variables:
   - SUPABASE_URL: https://tu-proyecto.supabase.co
   - SUPABASE_ANON_KEY: tu-anon-key
6. Click "Deploy"
```

### **Opción B: Desde Vercel CLI**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Configurar variables de entorno
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY

# Redeploy con variables
vercel --prod
```

## ✅ **VERIFICAR DEPLOYMENT**

### **Checklist Post-Deploy:**
- [ ] ✅ Repositorio creado en GitHub
- [ ] ✅ Código pusheado correctamente  
- [ ] ✅ Vercel conectado al repositorio
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ Deploy exitoso (URL funcionando)
- [ ] ✅ test-modulo1.html carga correctamente

### **URLs Importantes:**
```
GitHub Repo: https://github.com/TU-USERNAME/gestion-financiera-v2
Vercel App: https://gestion-financiera-v2.vercel.app
Supabase: https://tu-proyecto.supabase.co
```

## 🔧 **Comandos de Desarrollo**

### **Workflow típico:**
```bash
# Hacer cambios en archivos
git add .
git commit -m "feat: descripcion del cambio"
git push origin main

# Vercel auto-deploys en push a main
```

### **Variables de entorno en Vercel:**
```
Dashboard → Project → Settings → Environment Variables
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=eyJ0eXAiOi...
```

---

## 🎯 **RESULTADO ESPERADO**

Al completar estos pasos tendrás:
- ✅ Repositorio Git con historial
- ✅ GitHub repo público/privado  
- ✅ Auto-deploy desde GitHub a Vercel
- ✅ Variables de entorno configuradas
- ✅ URL pública funcionando

**🚀 ¡Listo para continuar con Módulo 2!**
