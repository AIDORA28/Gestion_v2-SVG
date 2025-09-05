// Utility functions for response handling and common operations

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  timestamp: string
  metadata?: Record<string, any>
}

export interface ErrorResponse {
  error: boolean
  message: string
  timestamp: string
  details?: Record<string, any>
}

export function createResponse<T>(
  data?: T, 
  message?: string, 
  status = 200,
  metadata?: Record<string, any>
): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    metadata
  }

  return new Response(JSON.stringify(response), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    }
  })
}

export function createErrorResponse(
  message: string, 
  status = 400, 
  details?: Record<string, any>
): Response {
  const response: ErrorResponse = {
    error: true,
    message,
    timestamp: new Date().toISOString(),
    details
  }

  return new Response(JSON.stringify(response), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    }
  })
}

export function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      }
    })
  }
  return null
}

// Función para logging de auditoria
export async function logAuditoria(
  supabase: any,
  usuario_id: string,
  accion: string,
  tabla: string,
  registro_id?: string,
  detalles?: Record<string, any>
) {
  try {
    await supabase
      .from('logs_auditoria')
      .insert({
        usuario_id,
        accion,
        tabla,
        registro_id,
        detalles: detalles || null,
        timestamp: new Date().toISOString()
      })
  } catch (error) {
    console.error('Error al registrar auditoría:', error)
    // No fallar la operación principal por error de logging
  }
}

// Función para calcular estadísticas rápidas
export function calculateStatistics(data: Array<{ monto: number, categoria?: string }>) {
  if (!data || data.length === 0) {
    return {
      total: 0,
      promedio: 0,
      count: 0,
      maximo: 0,
      minimo: 0
    }
  }

  const montos = data.map(item => Number(item.monto))
  const total = montos.reduce((sum, monto) => sum + monto, 0)
  
  return {
    total: Number(total.toFixed(2)),
    promedio: Number((total / data.length).toFixed(2)),
    count: data.length,
    maximo: Math.max(...montos),
    minimo: Math.min(...montos)
  }
}

// Función para agrupar por categoría
export function groupByCategory(data: Array<{ monto: number, categoria: string }>) {
  const grouped = data.reduce((acc, item) => {
    const categoria = item.categoria
    if (!acc[categoria]) {
      acc[categoria] = {
        categoria,
        total: 0,
        count: 0,
        items: []
      }
    }
    
    acc[categoria].total += Number(item.monto)
    acc[categoria].count += 1
    acc[categoria].items.push(item)
    
    return acc
  }, {} as Record<string, any>)

  // Convertir a array y agregar porcentajes
  const result = Object.values(grouped)
  const totalGeneral = result.reduce((sum, cat: any) => sum + cat.total, 0)
  
  return result.map((cat: any) => ({
    ...cat,
    total: Number(cat.total.toFixed(2)),
    percentage: totalGeneral > 0 ? Number(((cat.total / totalGeneral) * 100).toFixed(1)) : 0
  }))
}

// Función para generar fechas de reporte
export function calculateReportDates(type: string, period?: string) {
  const now = new Date()
  let startDate: Date
  let endDate: Date = new Date(now)

  switch (type) {
    case 'daily':
      startDate = new Date(now)
      break
    case 'weekly':
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 7)
      break
    case 'monthly':
      if (period) {
        // Formato esperado: "2024-01"
        const [year, month] = period.split('-').map(Number)
        startDate = new Date(year, month - 1, 1)
        endDate = new Date(year, month, 0)
      } else {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      }
      break
    case 'quarterly':
      const quarter = Math.floor(now.getMonth() / 3)
      startDate = new Date(now.getFullYear(), quarter * 3, 1)
      endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0)
      break
    case 'yearly':
      if (period) {
        const year = Number(period)
        startDate = new Date(year, 0, 1)
        endDate = new Date(year, 11, 31)
      } else {
        startDate = new Date(now.getFullYear(), 0, 1)
        endDate = new Date(now.getFullYear(), 11, 31)
      }
      break
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
  }

  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0],
    startDate,
    endDate
  }
}

// Función para validar límites de uso
export async function checkUsageLimits(
  supabase: any, 
  userId: string, 
  operation: string
): Promise<void> {
  const today = new Date().toISOString().split('T')[0]
  
  const limits = {
    CREATE_INGRESO: 100,
    CREATE_GASTO: 100,
    GENERATE_REPORT: 20,
    API_CALLS: 1000
  }

  const limit = limits[operation as keyof typeof limits]
  if (!limit) return

  // Contar operaciones del día
  const { count, error } = await supabase
    .from('logs_auditoria')
    .select('*', { count: 'exact', head: true })
    .eq('usuario_id', userId)
    .eq('accion', operation)
    .gte('timestamp', today + 'T00:00:00')
    .lt('timestamp', today + 'T23:59:59')

  if (error) {
    console.error('Error al verificar límites:', error)
    return // No bloquear por error de verificación
  }

  if (count >= limit) {
    throw new Error(`Límite diario de ${limit} operaciones de ${operation} alcanzado`)
  }
}
