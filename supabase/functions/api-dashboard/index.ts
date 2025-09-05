// API Endpoint para Dashboard completo con métricas avanzadas
// Incluye análisis de tendencias, alertas inteligentes y predicciones

import { validateAuth } from '../shared/auth.ts'
import { 
  createResponse, 
  createErrorResponse, 
  handleCors,
  calculateStatistics,
  groupByCategory,
  calculateReportDates
} from '../shared/utils.ts'

// Interfaces
interface DashboardResponse {
  balance: any
  trends: any
  categories: any
  alerts: Alert[]
  goals: any
  insights: Insight[]
  period: string
  generated_at: string
}

interface Alert {
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message: string
  action?: string
  priority: 'low' | 'medium' | 'high'
  data?: any
}

interface Insight {
  type: string
  message: string
  suggestion: string
  impact?: 'positive' | 'negative' | 'neutral'
}

declare const Deno: any

Deno.serve(async (req: Request) => {
  // Manejar CORS
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    // Validar autenticación
    const { user, supabase } = await validateAuth(req)
    
    switch (req.method) {
      case 'GET':
        return await handleGetDashboard(req, user, supabase)
      case 'POST':
        return await handleSetGoals(req, user, supabase)
      default:
        return createErrorResponse('Método no permitido', 405)
    }

  } catch (error) {
    console.error('Error en api-dashboard:', error)
    return createErrorResponse(
      error.message || 'Error interno del servidor',
      error.message.includes('Token') ? 401 : 400
    )
  }
})

async function handleGetDashboard(req: Request, user: any, supabase: any) {
  const url = new URL(req.url)
  const period = url.searchParams.get('period') || 'month' // month, quarter, year
  const includeHistory = url.searchParams.get('include_history') === 'true'
  
  // Ejecutar todas las consultas en paralelo para optimizar performance
  const [
    balanceData,
    trendsData,
    categoriesData,
    alertsData,
    goalsData,
    insightsData
  ] = await Promise.all([
    getBalanceData(supabase, user.id, period),
    getTrendsData(supabase, user.id, period, includeHistory),
    getCategoriesBreakdown(supabase, user.id, period),
    getSmartAlerts(supabase, user.id),
    getGoalsProgress(supabase, user.id, period),
    generateInsights(supabase, user.id, period)
  ])

  const response: DashboardResponse = {
    balance: balanceData,
    trends: trendsData,
    categories: categoriesData,
    alerts: alertsData,
    goals: goalsData,
    insights: insightsData,
    period,
    generated_at: new Date().toISOString()
  }

  return createResponse(response, 'Dashboard generado exitosamente', 200, {
    cache_duration: 300, // 5 minutos
    data_sources: ['ingresos', 'gastos', 'simulaciones_credito', 'metas_financieras']
  })
}

async function getBalanceData(supabase: any, userId: string, period: string) {
  // Usar la función existente del módulo 3
  const currentDate = new Date()
  const { data: balanceActual, error } = await supabase.rpc('calcular_balance_mensual', {
    p_usuario_id: userId,
    p_year: currentDate.getFullYear(),
    p_month: currentDate.getMonth() + 1
  })

  if (error) {
    throw new Error(`Error al obtener balance: ${error.message}`)
  }

  // Obtener balance del mes anterior para comparación
  const mesAnterior = new Date(currentDate)
  mesAnterior.setMonth(mesAnterior.getMonth() - 1)
  
  const { data: balanceAnterior } = await supabase.rpc('calcular_balance_mensual', {
    p_usuario_id: userId,
    p_year: mesAnterior.getFullYear(),
    p_month: mesAnterior.getMonth() + 1
  })

  // Calcular métricas adicionales
  const savingsRate = balanceActual.balance > 0 && balanceActual.ingresos > 0 
    ? (balanceActual.balance / balanceActual.ingresos * 100).toFixed(2)
    : 0

  const trend = balanceAnterior 
    ? balanceActual.balance - balanceAnterior.balance
    : 0

  return {
    ...balanceActual,
    savings_rate: parseFloat(savingsRate),
    status: balanceActual.balance >= 0 ? 'positive' : 'negative',
    trend: {
      amount: Number(trend.toFixed(2)),
      percentage: balanceAnterior && balanceAnterior.balance !== 0 
        ? Number(((trend / Math.abs(balanceAnterior.balance)) * 100).toFixed(2))
        : 0,
      direction: trend > 0 ? 'up' : trend < 0 ? 'down' : 'stable'
    }
  }
}

async function getTrendsData(supabase: any, userId: string, period: string, includeHistory: boolean) {
  // Determinar número de meses a consultar
  const monthsBack = period === 'year' ? 12 : period === 'quarter' ? 6 : 6

  const { data: historicos, error } = await supabase.rpc('obtener_estadisticas_historicas', {
    p_usuario_id: userId,
    p_meses_historicos: monthsBack
  })

  if (error) {
    throw new Error(`Error al obtener tendencias: ${error.message}`)
  }

  if (!historicos || !historicos.tendencias_mensuales) {
    return {
      historical: [],
      growth_rate: 0,
      volatility: 'low',
      predictions: null
    }
  }

  const tendencias = historicos.tendencias_mensuales

  return {
    historical: includeHistory ? tendencias : tendencias.slice(-3),
    growth_rate: calculateGrowthRate(tendencias),
    volatility: calculateVolatility(tendencias),
    predictions: generatePredictions(tendencias),
    patterns: identifyPatterns(tendencias)
  }
}

async function getCategoriesBreakdown(supabase: any, userId: string, period: string) {
  const dates = calculateReportDates(period === 'month' ? 'monthly' : period)
  
  // Obtener ingresos y gastos por categoría
  const [ingresosData, gastosData] = await Promise.all([
    supabase
      .from('ingresos')
      .select('monto, categoria, fecha')
      .eq('usuario_id', userId)
      .gte('fecha', dates.start)
      .lte('fecha', dates.end),
    supabase
      .from('gastos')
      .select('monto, categoria, fecha')
      .eq('usuario_id', userId)
      .gte('fecha', dates.start)
      .lte('fecha', dates.end)
  ])

  if (ingresosData.error) {
    throw new Error(`Error al obtener ingresos: ${ingresosData.error.message}`)
  }

  if (gastosData.error) {
    throw new Error(`Error al obtener gastos: ${gastosData.error.message}`)
  }

  return {
    ingresos: {
      total: calculateStatistics(ingresosData.data).total,
      por_categoria: groupByCategory(ingresosData.data || [])
    },
    gastos: {
      total: calculateStatistics(gastosData.data).total,
      por_categoria: groupByCategory(gastosData.data || [])
    },
    balance_por_categoria: calculateCategoryBalance(
      ingresosData.data || [], 
      gastosData.data || []
    )
  }
}

async function getSmartAlerts(supabase: any, userId: string): Promise<Alert[]> {
  const alerts: Alert[] = []
  const now = new Date()

  try {
    // Alert 1: Gastos inusuales (últimos 7 días)
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const { data: recentExpenses } = await supabase
      .from('gastos')
      .select('monto, categoria, fecha, descripcion')
      .eq('usuario_id', userId)
      .gte('fecha', weekAgo.toISOString().split('T')[0])
      .order('fecha', { ascending: false })

    if (recentExpenses && recentExpenses.length > 0) {
      const avgExpense = recentExpenses.reduce((sum, exp) => sum + parseFloat(exp.monto), 0) / recentExpenses.length
      const highExpenses = recentExpenses.filter(exp => parseFloat(exp.monto) > avgExpense * 1.5)
      
      if (highExpenses.length > 0) {
        alerts.push({
          type: 'warning',
          title: 'Gastos Inusuales Detectados',
          message: `${highExpenses.length} gastos por encima del promedio esta semana`,
          action: 'review_expenses',
          priority: 'medium',
          data: { count: highExpenses.length, expenses: highExpenses.slice(0, 3) }
        })
      }
    }

    // Alert 2: Oportunidades de ahorro
    const { data: monthlyBalance } = await supabase.rpc('calcular_balance_mensual', {
      p_usuario_id: userId,
      p_year: now.getFullYear(),
      p_month: now.getMonth() + 1
    })

    if (monthlyBalance && monthlyBalance.ingresos > 0) {
      const savingsRate = (monthlyBalance.balance / monthlyBalance.ingresos) * 100
      
      if (savingsRate >= 30) {
        alerts.push({
          type: 'success',
          title: 'Excelente Control Financiero',
          message: `Has ahorrado ${savingsRate.toFixed(1)}% de tus ingresos este mes`,
          action: 'investment_suggestion',
          priority: 'low',
          data: { savings_rate: savingsRate, amount: monthlyBalance.balance }
        })
      } else if (savingsRate < 5 && monthlyBalance.balance > 0) {
        alerts.push({
          type: 'info',
          title: 'Oportunidad de Mejora',
          message: `Solo has ahorrado ${savingsRate.toFixed(1)}% este mes. Meta recomendada: 20%`,
          action: 'create_savings_goal',
          priority: 'medium'
        })
      } else if (monthlyBalance.balance < 0) {
        alerts.push({
          type: 'error',
          title: 'Balance Negativo',
          message: `Tus gastos superan tus ingresos por $${Math.abs(monthlyBalance.balance).toFixed(2)}`,
          action: 'expense_review',
          priority: 'high',
          data: { deficit: Math.abs(monthlyBalance.balance) }
        })
      }
    }

    // Alert 3: Próximos vencimientos (simulaciones)
    const { data: simulaciones } = await supabase
      .from('simulaciones_credito')
      .select('*')
      .eq('usuario_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)

    if (simulaciones && simulaciones.length > 0) {
      const ultimaSimulacion = simulaciones[0]
      const diasDesdeSimulacion = Math.floor(
        (now.getTime() - new Date(ultimaSimulacion.created_at).getTime()) / (1000 * 60 * 60 * 24)
      )
      
      if (diasDesdeSimulacion > 30) {
        alerts.push({
          type: 'info',
          title: 'Actualiza tu Simulación de Crédito',
          message: 'Tu última simulación tiene más de 30 días. Las tasas pueden haber cambiado.',
          action: 'update_simulation',
          priority: 'low'
        })
      }
    }

  } catch (error) {
    console.error('Error generando alertas:', error)
    // No fallar todo el dashboard por error en alertas
  }

  return alerts
}

async function getGoalsProgress(supabase: any, userId: string, period: string) {
  // Esta función asume que existe una tabla de metas financieras
  // Por ahora retornamos una estructura de ejemplo
  return {
    savings_goal: {
      target: 100000,
      current: 65000,
      progress: 65,
      monthly_target: 20000,
      on_track: true
    },
    expense_limit: {
      target: 50000,
      current: 45000,
      progress: 90,
      remaining: 5000,
      days_left: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate()
    }
  }
}

async function generateInsights(supabase: any, userId: string, period: string): Promise<Insight[]> {
  const insights: Insight[] = []
  
  try {
    const dates = calculateReportDates(period === 'month' ? 'monthly' : period)
    
    // Obtener datos para análisis
    const [ingresos, gastos] = await Promise.all([
      supabase
        .from('ingresos')
        .select('monto, categoria, fecha')
        .eq('usuario_id', userId)
        .gte('fecha', dates.start)
        .lte('fecha', dates.end),
      supabase
        .from('gastos')
        .select('monto, categoria, fecha')
        .eq('usuario_id', userId)
        .gte('fecha', dates.start)
        .lte('fecha', dates.end)
    ])

    if (gastos.data && gastos.data.length > 0) {
      // Insight: Categoría de mayor gasto
      const gastosPorCategoria = groupByCategory(gastos.data)
      const mayorCategoria = gastosPorCategoria
        .sort((a, b) => b.total - a.total)[0]
      
      if (mayorCategoria && mayorCategoria.percentage > 40) {
        insights.push({
          type: 'expense_concentration',
          message: `${mayorCategoria.percentage}% de tus gastos son en ${mayorCategoria.categoria}`,
          suggestion: 'Considera diversificar tus gastos para mejor control financiero',
          impact: 'neutral'
        })
      }
    }

    if (ingresos.data && ingresos.data.length > 0) {
      // Insight: Diversificación de ingresos
      const ingresosPorCategoria = groupByCategory(ingresos.data)
      if (ingresosPorCategoria.length === 1) {
        insights.push({
          type: 'income_diversification',
          message: 'Todos tus ingresos provienen de una sola fuente',
          suggestion: 'Considera desarrollar fuentes adicionales de ingresos para mayor seguridad financiera',
          impact: 'neutral'
        })
      }
    }

  } catch (error) {
    console.error('Error generando insights:', error)
  }

  return insights
}

// Funciones auxiliares
function calculateGrowthRate(trends: any[]): number {
  if (trends.length < 2) return 0
  
  const latest = trends[trends.length - 1]
  const previous = trends[trends.length - 2]
  
  if (previous.balance === 0) return 0
  
  return Number(((latest.balance - previous.balance) / Math.abs(previous.balance) * 100).toFixed(2))
}

function calculateVolatility(trends: any[]): string {
  if (trends.length < 3) return 'insufficient_data'
  
  const balances = trends.map(t => t.balance)
  const mean = balances.reduce((sum, b) => sum + b, 0) / balances.length
  const variance = balances.reduce((sum, b) => sum + Math.pow(b - mean, 2), 0) / balances.length
  const stdDev = Math.sqrt(variance)
  const coefficientOfVariation = Math.abs(mean) > 0 ? stdDev / Math.abs(mean) : 0
  
  if (coefficientOfVariation < 0.1) return 'low'
  if (coefficientOfVariation < 0.3) return 'medium'
  return 'high'
}

function generatePredictions(trends: any[]) {
  if (trends.length < 3) return null
  
  // Regresión lineal simple para predicción del próximo mes
  const n = trends.length
  const x = trends.map((_, i) => i + 1)
  const y = trends.map(t => t.balance)
  
  const sumX = x.reduce((sum, val) => sum + val, 0)
  const sumY = y.reduce((sum, val) => sum + val, 0)
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0)
  const sumXX = x.reduce((sum, val) => sum + val * val, 0)
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n
  
  const nextMonthPrediction = slope * (n + 1) + intercept
  
  const nextMonth = new Date()
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  
  return {
    next_month: {
      date: nextMonth.toISOString().substr(0, 7),
      predicted_balance: Number(nextMonthPrediction.toFixed(2)),
      confidence: n >= 6 ? 'high' : n >= 4 ? 'medium' : 'low',
      trend: slope > 0 ? 'improving' : slope < 0 ? 'declining' : 'stable'
    }
  }
}

function identifyPatterns(trends: any[]) {
  if (trends.length < 4) return []
  
  const patterns = []
  
  // Patrón de crecimiento consistente
  const growthRates = []
  for (let i = 1; i < trends.length; i++) {
    const rate = trends[i].balance - trends[i-1].balance
    growthRates.push(rate)
  }
  
  const avgGrowth = growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length
  const isConsistentGrowth = growthRates.every(rate => rate > 0)
  const isConsistentDecline = growthRates.every(rate => rate < 0)
  
  if (isConsistentGrowth) {
    patterns.push({
      type: 'consistent_growth',
      description: `Crecimiento consistente promedio de $${avgGrowth.toFixed(2)} por mes`
    })
  } else if (isConsistentDecline) {
    patterns.push({
      type: 'consistent_decline',
      description: `Declive consistente promedio de $${Math.abs(avgGrowth).toFixed(2)} por mes`
    })
  }
  
  return patterns
}

function calculateCategoryBalance(ingresos: any[], gastos: any[]) {
  const allCategories = new Set([
    ...ingresos.map(i => i.categoria),
    ...gastos.map(g => g.categoria)
  ])
  
  return Array.from(allCategories).map(categoria => {
    const ingresosCategoria = ingresos
      .filter(i => i.categoria === categoria)
      .reduce((sum, i) => sum + parseFloat(i.monto), 0)
    
    const gastosCategoria = gastos
      .filter(g => g.categoria === categoria)
      .reduce((sum, g) => sum + parseFloat(g.monto), 0)
    
    return {
      categoria,
      ingresos: Number(ingresosCategoria.toFixed(2)),
      gastos: Number(gastosCategoria.toFixed(2)),
      balance: Number((ingresosCategoria - gastosCategoria).toFixed(2))
    }
  })
}

async function handleSetGoals(req: Request, user: any, supabase: any) {
  // Implementación futura para establecer metas financieras
  return createResponse(
    { message: 'Funcionalidad de metas en desarrollo' },
    'Funcionalidad próximamente disponible'
  )
}
