// API Endpoint para manejo avanzado de ingresos
// Incluye validaciones de negocio, rate limiting y auditoría

import { validateAuth } from '../shared/auth.ts'
import { validateIngreso, validateBulkIngresos } from '../shared/validation.ts'
import { 
  createResponse, 
  createErrorResponse, 
  handleCors,
  logAuditoria,
  calculateStatistics,
  groupByCategory,
  checkUsageLimits
} from '../shared/utils.ts'

// Interfaces
interface IngresoCreateRequest {
  descripcion: string
  monto: number
  categoria: string
  fecha?: string
}

interface IngresoBulkRequest {
  ingresos: IngresoCreateRequest[]
}

interface IngresoUpdateRequest extends IngresoCreateRequest {
  id: string
}

declare const Deno: any

Deno.serve(async (req: Request) => {
  // Manejar CORS
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    // Validar autenticación
    const { user, supabase } = await validateAuth(req)

    // Rutear según método HTTP
    switch (req.method) {
      case 'GET':
        return await handleGetIngresos(req, user, supabase)
      case 'POST':
        return await handleCreateIngreso(req, user, supabase)
      case 'PUT':
        return await handleBulkIngresos(req, user, supabase)
      case 'PATCH':
        return await handleUpdateIngreso(req, user, supabase)
      case 'DELETE':
        return await handleDeleteIngreso(req, user, supabase)
      default:
        return createErrorResponse('Método no permitido', 405)
    }

  } catch (error) {
    console.error('Error en api-ingresos:', error)
    return createErrorResponse(
      error.message || 'Error interno del servidor', 
      error.message.includes('Token') ? 401 : 400,
      { timestamp: new Date().toISOString() }
    )
  }
})

async function handleGetIngresos(req: Request, user: any, supabase: any) {
  const url = new URL(req.url)
  
  // Parámetros de consulta
  const categoria = url.searchParams.get('categoria')
  const fechaDesde = url.searchParams.get('fecha_desde')
  const fechaHasta = url.searchParams.get('fecha_hasta')
  const limite = parseInt(url.searchParams.get('limit') || '50')
  const pagina = parseInt(url.searchParams.get('page') || '1')
  const incluirStats = url.searchParams.get('include_stats') === 'true'

  // Verificar límites
  if (limite > 100) {
    return createErrorResponse('Límite máximo es 100 registros')
  }

  // Construir query
  let query = supabase
    .from('ingresos')
    .select('*')
    .eq('usuario_id', user.id)
    .order('fecha', { ascending: false })
    .order('created_at', { ascending: false })
    .range((pagina - 1) * limite, pagina * limite - 1)

  // Aplicar filtros
  if (categoria) {
    query = query.eq('categoria', categoria)
  }
  
  if (fechaDesde) {
    query = query.gte('fecha', fechaDesde)
  }
  
  if (fechaHasta) {
    query = query.lte('fecha', fechaHasta)
  }

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Error al obtener ingresos: ${error.message}`)
  }

  // Calcular estadísticas si se solicitan
  let stats = null
  if (incluirStats && data.length > 0) {
    stats = {
      ...calculateStatistics(data),
      por_categoria: groupByCategory(data)
    }
  }

  return createResponse(data, 'Ingresos obtenidos exitosamente', 200, {
    pagination: {
      page: pagina,
      limit: limite,
      total: count || data.length,
      has_more: data.length === limite
    },
    filters: {
      categoria,
      fecha_desde: fechaDesde,
      fecha_hasta: fechaHasta
    },
    stats
  })
}

async function handleCreateIngreso(req: Request, user: any, supabase: any) {
  // Verificar límites de uso
  await checkUsageLimits(supabase, user.id, 'CREATE_INGRESO')

  const body = await req.json()
  const validatedData = validateIngreso(body)

  // Validaciones de negocio adicionales
  const hoy = new Date().toISOString().split('T')[0]
  if (validatedData.fecha > hoy) {
    throw new Error('No se pueden registrar ingresos futuros')
  }

  // Verificar límite mensual por usuario (máximo 100 ingresos por mes)
  const inicioMes = new Date(validatedData.fecha)
  inicioMes.setDate(1)
  const finMes = new Date(inicioMes)
  finMes.setMonth(finMes.getMonth() + 1)
  finMes.setDate(0)
  
  const { count: ingresosDelMes } = await supabase
    .from('ingresos')
    .select('*', { count: 'exact', head: true })
    .eq('usuario_id', user.id)
    .gte('fecha', inicioMes.toISOString().split('T')[0])
    .lte('fecha', finMes.toISOString().split('T')[0])

  if (ingresosDelMes >= 100) {
    throw new Error('Límite mensual de 100 ingresos alcanzado')
  }

  // Crear el ingreso
  const { data, error } = await supabase
    .from('ingresos')
    .insert({
      ...validatedData,
      usuario_id: user.id
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Error al crear ingreso: ${error.message}`)
  }

  // Registrar auditoría
  await logAuditoria(
    supabase,
    user.id,
    'CREATE_INGRESO',
    'ingresos',
    data.id,
    { 
      monto: data.monto, 
      categoria: data.categoria,
      descripcion: data.descripcion 
    }
  )

  return createResponse(data, 'Ingreso creado exitosamente', 201)
}

async function handleBulkIngresos(req: Request, user: any, supabase: any) {
  const body = await req.json() as IngresoBulkRequest
  
  if (!body.ingresos) {
    throw new Error('Se requiere el campo "ingresos"')
  }

  const validatedIngresos = validateBulkIngresos(body.ingresos)

  // Verificar límites de creación en lote
  if (validatedIngresos.length > 50) {
    throw new Error('Máximo 50 ingresos por lote')
  }

  // Preparar datos para inserción
  const ingresosParaInsertar = validatedIngresos.map(ingreso => ({
    ...ingreso,
    usuario_id: user.id
  }))

  // Realizar inserción en lote
  const { data, error } = await supabase
    .from('ingresos')
    .insert(ingresosParaInsertar)
    .select()

  if (error) {
    throw new Error(`Error al crear ingresos en lote: ${error.message}`)
  }

  // Registrar auditoría para el lote
  await logAuditoria(
    supabase,
    user.id,
    'BULK_CREATE_INGRESOS',
    'ingresos',
    null,
    { 
      count: data.length,
      total_monto: data.reduce((sum, ing) => sum + parseFloat(ing.monto), 0),
      categorias: [...new Set(data.map(ing => ing.categoria))]
    }
  )

  const stats = calculateStatistics(data)

  return createResponse(data, `${data.length} ingresos creados exitosamente`, 201, {
    batch_stats: {
      ...stats,
      por_categoria: groupByCategory(data)
    }
  })
}

async function handleUpdateIngreso(req: Request, user: any, supabase: any) {
  const body = await req.json() as IngresoUpdateRequest
  
  if (!body.id) {
    throw new Error('ID del ingreso es requerido')
  }

  const validatedData = validateIngreso(body)

  // Verificar que el ingreso existe y pertenece al usuario
  const { data: existingIngreso, error: fetchError } = await supabase
    .from('ingresos')
    .select('*')
    .eq('id', body.id)
    .eq('usuario_id', user.id)
    .single()

  if (fetchError || !existingIngreso) {
    throw new Error('Ingreso no encontrado')
  }

  // Actualizar el ingreso
  const { data, error } = await supabase
    .from('ingresos')
    .update({
      descripcion: validatedData.descripcion,
      monto: validatedData.monto,
      categoria: validatedData.categoria,
      fecha: validatedData.fecha,
      updated_at: new Date().toISOString()
    })
    .eq('id', body.id)
    .eq('usuario_id', user.id)
    .select()
    .single()

  if (error) {
    throw new Error(`Error al actualizar ingreso: ${error.message}`)
  }

  // Registrar auditoría
  await logAuditoria(
    supabase,
    user.id,
    'UPDATE_INGRESO',
    'ingresos',
    data.id,
    { 
      cambios: {
        antes: { 
          monto: existingIngreso.monto, 
          categoria: existingIngreso.categoria 
        },
        despues: { 
          monto: data.monto, 
          categoria: data.categoria 
        }
      }
    }
  )

  return createResponse(data, 'Ingreso actualizado exitosamente')
}

async function handleDeleteIngreso(req: Request, user: any, supabase: any) {
  const url = new URL(req.url)
  const ingresoId = url.searchParams.get('id')
  
  if (!ingresoId) {
    throw new Error('ID del ingreso es requerido')
  }

  // Verificar que existe y pertenece al usuario
  const { data: existingIngreso, error: fetchError } = await supabase
    .from('ingresos')
    .select('*')
    .eq('id', ingresoId)
    .eq('usuario_id', user.id)
    .single()

  if (fetchError || !existingIngreso) {
    throw new Error('Ingreso no encontrado')
  }

  // Eliminar el ingreso
  const { error } = await supabase
    .from('ingresos')
    .delete()
    .eq('id', ingresoId)
    .eq('usuario_id', user.id)

  if (error) {
    throw new Error(`Error al eliminar ingreso: ${error.message}`)
  }

  // Registrar auditoría
  await logAuditoria(
    supabase,
    user.id,
    'DELETE_INGRESO',
    'ingresos',
    ingresoId,
    { 
      ingreso_eliminado: {
        monto: existingIngreso.monto,
        categoria: existingIngreso.categoria,
        descripcion: existingIngreso.descripcion
      }
    }
  )

  return createResponse(null, 'Ingreso eliminado exitosamente')
}
