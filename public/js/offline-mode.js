/**
 * 🔄 MODO OFFLINE/DEMO para cuando Supabase no está accesible
 * Simula datos para permitir desarrollo sin conexión
 */

// Datos de demo para pruebas offline
const DEMO_USERS = [
    {
        id: '1',
        nombre: 'Usuario Demo',
        email: 'demo@planificapro.com',
        telefono: '123456789',
        estado_civil: 'soltero',
        created_at: '2024-01-01T00:00:00.000Z'
    },
    {
        id: '2', 
        nombre: 'María García',
        email: 'maria@ejemplo.com',
        telefono: '987654321',
        estado_civil: 'casado',
        created_at: '2024-01-02T00:00:00.000Z'
    }
];

const DEMO_INGRESOS = [
    {
        id: '1',
        usuario_id: '1',
        descripcion: 'Salario Enero',
        monto: 3500.00,
        fecha: '2024-01-01',
        categoria: 'salario',
        tipo: 'mensual'
    },
    {
        id: '2',
        usuario_id: '1', 
        descripcion: 'Freelance Diseño',
        monto: 800.00,
        fecha: '2024-01-15',
        categoria: 'freelance',
        tipo: 'único'
    }
];

const DEMO_GASTOS = [
    {
        id: '1',
        usuario_id: '1',
        descripcion: 'Supermercado',
        monto: 250.00,
        fecha: '2024-01-02',
        categoria: 'alimentacion',
        tipo: 'único'
    },
    {
        id: '2',
        usuario_id: '1',
        descripcion: 'Gasolina',
        monto: 120.00,
        fecha: '2024-01-03',
        categoria: 'transporte', 
        tipo: 'único'
    }
];

// Configuración para modo offline
window.OFFLINE_MODE = {
    enabled: true,
    message: '🔄 MODO DEMO - Datos simulados (Red no disponible)',
    users: DEMO_USERS,
    ingresos: DEMO_INGRESOS,
    gastos: DEMO_GASTOS
};

// Sobrescribir funciones de autenticación para modo offline
if (window.OFFLINE_MODE.enabled) {
    
    // Sobrescribir configuración API
    window.API_BASE_URL = 'offline://demo';
    
    // Mock de fetch para simular API calls
    const originalFetch = window.fetch;
    window.fetch = async function(url, options = {}) {
        
        console.log('🔄 OFFLINE MODE - Simulando:', url, options.method || 'GET');
        
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (url.includes('/api/login')) {
            const body = JSON.parse(options.body || '{}');
            const user = DEMO_USERS.find(u => u.email === body.email);
            
            if (user) {
                return new Response(JSON.stringify({
                    success: true,
                    message: `¡Bienvenido ${user.nombre}! (Modo Demo)`,
                    data: { user }
                }), { status: 200 });
            } else {
                return new Response(JSON.stringify({
                    success: false,
                    message: 'Usuario no encontrado (Modo Demo)'
                }), { status: 401 });
            }
        }
        
        if (url.includes('/api/usuarios')) {
            return new Response(JSON.stringify({
                success: true,
                data: DEMO_USERS
            }), { status: 200 });
        }
        
        if (url.includes('/api/ingresos')) {
            if (options.method === 'POST') {
                const newIngreso = {
                    id: Date.now().toString(),
                    ...JSON.parse(options.body),
                    usuario_id: '1'
                };
                DEMO_INGRESOS.push(newIngreso);
                
                return new Response(JSON.stringify({
                    success: true,
                    message: 'Ingreso creado (Demo)',
                    data: newIngreso
                }), { status: 201 });
            }
            
            return new Response(JSON.stringify({
                success: true,
                data: DEMO_INGRESOS
            }), { status: 200 });
        }
        
        if (url.includes('/api/gastos')) {
            if (options.method === 'POST') {
                const newGasto = {
                    id: Date.now().toString(),
                    ...JSON.parse(options.body),
                    usuario_id: '1'
                };
                DEMO_GASTOS.push(newGasto);
                
                return new Response(JSON.stringify({
                    success: true,
                    message: 'Gasto creado (Demo)',
                    data: newGasto
                }), { status: 201 });
            }
            
            return new Response(JSON.stringify({
                success: true,
                data: DEMO_GASTOS
            }), { status: 200 });
        }
        
        if (url.includes('/api/dashboard/')) {
            const totalIngresos = DEMO_INGRESOS.reduce((sum, item) => sum + item.monto, 0);
            const totalGastos = DEMO_GASTOS.reduce((sum, item) => sum + item.monto, 0);
            
            return new Response(JSON.stringify({
                success: true,
                data: {
                    usuario: DEMO_USERS[0],
                    resumen: {
                        totalIngresos,
                        totalGastos,
                        balance: totalIngresos - totalGastos,
                        totalIngresosDelMes: totalIngresos,
                        totalGastosDelMes: totalGastos,
                        balanceDelMes: totalIngresos - totalGastos
                    },
                    ingresos: DEMO_INGRESOS,
                    gastos: DEMO_GASTOS,
                    transaccionesRecientes: [
                        ...DEMO_INGRESOS.map(i => ({...i, tipo: 'ingreso'})),
                        ...DEMO_GASTOS.map(g => ({...g, tipo: 'gasto'}))
                    ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 10)
                }
            }), { status: 200 });
        }
        
        // Para cualquier otra URL, intentar fetch original
        try {
            return await originalFetch(url, options);
        } catch (error) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Servicio no disponible en modo offline',
                error: error.message
            }), { status: 503 });
        }
    };
    
    console.log('🔄 MODO OFFLINE ACTIVADO');
    console.log('📊 Datos demo cargados');
    console.log('🔐 Login demo: demo@planificapro.com / cualquier_password');
    
    // Mostrar banner de modo offline
    setTimeout(() => {
        const banner = document.createElement('div');
        banner.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                color: white;
                padding: 10px;
                text-align: center;
                font-size: 14px;
                font-weight: bold;
                z-index: 9999;
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            ">
                🔄 MODO DEMO OFFLINE - Datos simulados | Login: demo@planificapro.com
            </div>
        `;
        document.body.appendChild(banner);
        document.body.style.marginTop = '45px';
    }, 1000);
}
