# 🏛️ ARQUITECTURA DEL SISTEMA

## 🎯 **Visión General**

### **🎪 Arquitectura: JAMstack + BaaS**
```
Frontend (HTML/JS/CSS) ←→ Supabase (PostgreSQL + API + Auth)
         ↓
    Vercel/Netlify
```

**Principios Arquitecturales:**
- ✅ **Separación de Responsabilidades**
- ✅ **Stateless Frontend** 
- ✅ **API-First Backend**
- ✅ **Mobile-First Design**
- ✅ **Progressive Enhancement**

## 🌐 **Arquitectura de 3 Capas**

### **🎨 Presentation Layer (Frontend)**
```
┌─────────────────────────────────────┐
│             FRONTEND                │
├─────────────────────────────────────┤
│  HTML5 Semantic Structure          │
│  CSS3 (Grid/Flexbox/Variables)     │
│  Vanilla JavaScript (ES6+)         │
│  Component-Based Architecture      │
│  Responsive Design                 │
│  PWA Capabilities                  │
└─────────────────────────────────────┘
```

### **🔗 API Layer (Supabase)**
```
┌─────────────────────────────────────┐
│             API LAYER               │
├─────────────────────────────────────┤
│  REST API (Auto-generated)         │
│  GraphQL API (Available)           │
│  Realtime WebSockets               │
│  Authentication & Authorization    │
│  Row Level Security (RLS)          │
│  Edge Functions (Serverless)       │
└─────────────────────────────────────┘
```

### **💾 Data Layer (PostgreSQL)**
```
┌─────────────────────────────────────┐
│             DATA LAYER              │
├─────────────────────────────────────┤
│  PostgreSQL 15                     │
│  ACID Transactions                 │
│  JSON/JSONB Support                │
│  Full-Text Search                  │
│  Backup & Point-in-Time Recovery   │
│  Connection Pooling                │
└─────────────────────────────────────┘
```

## 🔄 **Data Flow Architecture**

### **📊 Request Flow**
```
User Action → Frontend Component → Supabase Client → API Gateway → PostgreSQL
     ↓              ↓                     ↓              ↓           ↓
   Event       State Update        Auth Check       Query         Result
     ↑              ↑                     ↑              ↑           ↑
  UI Update ← Component Re-render ← Response ← Processed Data ← Database
```

### **🔐 Authentication Flow**
```
1. User Login → Supabase Auth → JWT Token → Store in localStorage
2. API Request → Include JWT → Verify Token → RLS Check → Query Execute
3. User Logout → Clear Token → Redirect → Public Pages Only
```

### **📱 Component Communication**
```
AppState (Central Store)
    ↓         ↑
Components ← Events
    ↓         ↑  
UI Updates → User Actions
```

## 🏗️ **Frontend Architecture**

### **📦 Component Structure**
```javascript
// Hierarchical Component System
App
├── AuthManager
│   ├── LoginForm
│   ├── RegisterForm
│   └── ForgotPassword
├── Dashboard
│   ├── Header
│   ├── Navigation
│   ├── TabManager
│   │   ├── ResumenTab
│   │   ├── IngresosTab
│   │   ├── GastosTab
│   │   └── SimuladorTab
│   └── Footer
└── Shared Components
    ├── Modal
    ├── Toast
    ├── Loading
    ├── ErrorBoundary
    └── FormComponents
```

### **🔧 Module System**
```javascript
// ES6 Modules Pattern
js/
├── config.js          // Configuration & constants
├── app.js             // Main application & state
├── components/        // Reusable components
│   ├── auth.js        
│   ├── dashboard.js   
│   ├── crud.js        
│   └── ui.js          
├── services/          // API interactions
│   ├── supabase.js    
│   ├── auth.service.js
│   └── data.service.js
└── utils/             // Helper functions
    ├── validators.js  
    ├── formatters.js  
    └── helpers.js     
```

### **💾 State Management**
```javascript
// Centralized State Pattern
class AppState {
    constructor() {
        this.state = {
            user: null,
            loading: false,
            error: null,
            data: {
                ingresos: [],
                gastos: [], 
                balance: null,
                simulaciones: []
            },
            ui: {
                currentTab: 'resumen',
                modals: {},
                notifications: []
            }
        };
        this.subscribers = new Map();
    }
    
    // Observer pattern for reactivity
    subscribe(key, callback) { /* ... */ }
    setState(path, value) { /* ... */ }
    getState(path) { /* ... */ }
}
```

## 🗄️ **Database Architecture**

### **📋 Entity Relationship Diagram**
```
┌─────────────────┐    1:N    ┌─────────────────┐
│   auth.users    │◄──────────┤ perfiles_usuario │
│                 │           │                 │
│ • id (PK)       │           │ • id (FK)       │
│ • email         │           │ • nombre        │
│ • created_at    │           │ • apellido      │
└─────────────────┘           │ • telefono      │
         ▲                    │ • dni           │
         │                    │ • edad          │
         │1:N                 │ • ocupacion     │
         │                    └─────────────────┘
┌─────────────────┐                    ▲
│    ingresos     │                    │
│                 │                    │1:N
│ • id (PK)       │                    │
│ • usuario_id(FK)│◄───────────────────┤
│ • descripcion   │                    │
│ • monto         │                    │
│ • categoria     │                    │
│ • fecha         │                    │
│ • es_recurrente │           ┌─────────────────┐
│ • frecuencia    │           │     gastos      │
└─────────────────┘           │                 │
                              │ • id (PK)       │
┌─────────────────┐           │ • usuario_id(FK)│
│simulaciones_    │           │ • descripcion   │
│    credito      │           │ • monto         │
│                 │           │ • categoria     │
│ • id (PK)       │           │ • fecha         │
│ • usuario_id(FK)│◄──────────│ • es_recurrente │
│ • nombre        │           │ • frecuencia    │
│ • monto_prestamo│           └─────────────────┘
│ • tasa_interes  │
│ • plazo_meses   │
│ • cuota_mensual │
│ • total_interes │
│ • total_pagar   │
└─────────────────┘
```

### **🔒 Security Architecture**
```sql
-- Row Level Security Implementation
CREATE POLICY "user_data_isolation" ON [table_name]
    FOR ALL USING (
        auth.uid() = usuario_id AND
        auth.role() = 'authenticated'
    );

-- Security Layers:
1. Network Layer     → HTTPS/TLS encryption
2. API Layer        → JWT token validation  
3. Database Layer   → RLS policies
4. Application Layer → Input validation & sanitization
```

### **📊 Data Modeling Patterns**

#### **🏷️ Soft Delete Pattern**
```sql
-- Instead of hard deletes, use soft deletes
ALTER TABLE ingresos ADD COLUMN deleted_at TIMESTAMP;
CREATE INDEX idx_ingresos_active ON ingresos WHERE deleted_at IS NULL;
```

#### **📝 Audit Trail Pattern**
```sql
-- Track all changes for compliance
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL, -- INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **🔄 Event Sourcing Pattern** (Future)
```sql
-- Store events instead of current state
CREATE TABLE financial_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    event_type TEXT NOT NULL, -- 'income_added', 'expense_added'
    event_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🚀 **Deployment Architecture**

### **🌐 Production Environment**
```
Internet
    ↓
┌─────────────────────────────────────┐
│          CDN (Vercel Edge)          │
│  • Global distribution              │
│  • Static asset caching            │
│  • DDoS protection                 │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│        Frontend (Vercel)           │
│  • HTML/CSS/JS served statically   │
│  • Environment variables           │
│  • Automatic HTTPS                 │
│  • Git-based deployments           │
└─────────────────────────────────────┘
    ↓ (API calls)
┌─────────────────────────────────────┐
│        Supabase Platform           │
│  ┌─────────────────────────────────┐ │
│  │        API Gateway              │ │
│  │  • Rate limiting                │ │
│  │  • Request validation           │ │
│  │  • Load balancing               │ │
│  └─────────────────────────────────┘ │
│  ┌─────────────────────────────────┐ │
│  │      Auth Service               │ │
│  │  • JWT management               │ │
│  │  • OAuth providers              │ │
│  │  • User management              │ │
│  └─────────────────────────────────┘ │
│  ┌─────────────────────────────────┐ │
│  │     Database (PostgreSQL)      │ │
│  │  • Connection pooling           │ │
│  │  • Automatic backups            │ │
│  │  • Read replicas                │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### **🔄 CI/CD Pipeline**
```
Git Push → GitHub → Vercel Build → Deploy → Health Check → Live
   ↓         ↓         ↓            ↓        ↓           ↓
 Code     Webhook    Build         CDN    Smoke Test   Users
Change    Trigger   Process       Update  Validation  Access
```

## 📱 **Mobile-First Architecture**

### **📐 Responsive Breakpoints**
```css
/* Mobile-first approach */
:root {
    /* Mobile (default): 320px - 768px */
    --container-width: 100%;
    --grid-columns: 1;
    --font-size-base: 16px;
}

@media (min-width: 768px) {
    /* Tablet: 768px - 1024px */
    :root {
        --container-width: 720px;
        --grid-columns: 2;
        --font-size-base: 18px;
    }
}

@media (min-width: 1024px) {
    /* Desktop: 1024px+ */
    :root {
        --container-width: 960px;
        --grid-columns: 3;
        --font-size-base: 16px;
    }
}
```

### **📲 PWA Architecture**
```javascript
// Service Worker Registration
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
}

// App Shell Pattern
const CACHE_NAME = 'gestion-v2-shell-v1';
const SHELL_FILES = [
    '/',
    '/css/main.css',
    '/js/app.js',
    '/manifest.json'
];

// Cache-First Strategy for Shell
// Network-First Strategy for Data
```

## ⚡ **Performance Architecture**

### **🚀 Loading Strategy**
```javascript
// Critical Path Optimization
1. HTML structure (first paint)
2. Critical CSS (above fold)
3. JavaScript (deferred)
4. Non-critical CSS (async)
5. Images (lazy loading)
6. Third-party scripts (defer)
```

### **💾 Caching Strategy**
```javascript
// Multi-level caching
1. Browser Cache (static assets)
2. Service Worker Cache (app shell)
3. Memory Cache (app state)
4. Supabase Cache (query results)
5. CDN Cache (global distribution)
```

### **🔄 State Optimization**
```javascript
// Optimistic UI Updates
class OptimisticUpdater {
    async addIngreso(data) {
        // 1. Update UI immediately
        this.updateUIOptimistically(data);
        
        try {
            // 2. Send to server
            const result = await api.addIngreso(data);
            // 3. Confirm update
            this.confirmUpdate(result);
        } catch (error) {
            // 4. Rollback on error
            this.rollbackUpdate(data);
        }
    }
}
```

## 🛡️ **Security Architecture**

### **🔐 Defense in Depth**
```
┌─────────────────────────────────────┐
│           User Interface            │ ← Input validation
├─────────────────────────────────────┤
│          Network Layer              │ ← HTTPS, CORS
├─────────────────────────────────────┤
│         API Gateway                 │ ← Rate limiting, JWT
├─────────────────────────────────────┤
│        Application Layer            │ ← Business logic validation
├─────────────────────────────────────┤
│         Database Layer              │ ← RLS, SQL injection prevention
└─────────────────────────────────────┘
```

### **🔑 Authentication & Authorization**
```javascript
// JWT Token Structure
{
    "header": {
        "alg": "HS256",
        "typ": "JWT"
    },
    "payload": {
        "sub": "user-uuid",
        "email": "user@example.com", 
        "role": "authenticated",
        "exp": 1643723400,
        "iat": 1643637000
    }
}

// RLS Policy Example
CREATE POLICY "users_can_only_see_their_data" ON ingresos
    FOR ALL USING (
        auth.uid() = usuario_id AND
        auth.jwt() ->> 'role' = 'authenticated'
    );
```

## 📈 **Scalability Architecture**

### **🎯 Horizontal Scaling**
```
Load Balancer
    ↓
Multiple Frontend Instances (Vercel Edge)
    ↓
Supabase (Auto-scaling)
    ├── API Gateway (Load balanced)
    ├── Auth Service (Distributed)
    └── Database (Connection pooling + Read replicas)
```

### **📊 Performance Monitoring**
```javascript
// Web Vitals Tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
    // Send to monitoring service
    fetch('/analytics', {
        method: 'POST',
        body: JSON.stringify(metric)
    });
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

## 🔮 **Future Architecture Considerations**

### **📱 Native Mobile Apps**
```
React Native / Flutter
    ↓
Same Supabase Backend
    ↓
Shared Business Logic
```

### **🤖 AI Integration**
```
Frontend
    ↓
Supabase Edge Functions
    ↓
OpenAI API / Local AI Models
    ↓
Enhanced Financial Insights
```

### **📊 Analytics & BI**
```
Transactional Data (PostgreSQL)
    ↓
ETL Process
    ↓
Data Warehouse (Supabase Analytics / External)
    ↓
Business Intelligence Dashboard
```

---

**💡 Esta arquitectura está diseñada para:**
- ✅ **Simplicidad** - Fácil de entender y mantener
- ✅ **Escalabilidad** - Crece con las necesidades
- ✅ **Seguridad** - Protección en múltiples capas
- ✅ **Performance** - Rápida respuesta y carga
- ✅ **Flexibilidad** - Fácil de extender y modificar
