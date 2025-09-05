// Validation utilities for API endpoints
export interface IngresoInput {
  descripcion: string
  monto: number
  categoria: string
  fecha?: string
}

export interface GastoInput {
  descripcion: string
  monto: number
  categoria: string
  fecha?: string
}

export interface SimulacionInput {
  nombre_simulacion: string
  monto_prestamo: number
  tasa_interes: number
  plazo_meses: number
}

// Categorías válidas
export const CATEGORIAS_INGRESO = ['salario', 'freelance', 'inversiones', 'negocio', 'otros']
export const CATEGORIAS_GASTO = ['alimentacion', 'transporte', 'vivienda', 'salud', 'entretenimiento', 'otros']
export const ESTADOS_CIVIL = ['soltero', 'casado', 'divorciado', 'viudo']

export function validateIngreso(data: any): IngresoInput {
  const errors: string[] = []

  // Validar descripción
  if (!data.descripcion || typeof data.descripcion !== 'string') {
    errors.push('Descripción es requerida')
  } else if (data.descripcion.length < 3) {
    errors.push('Descripción debe tener al menos 3 caracteres')
  } else if (data.descripcion.length > 100) {
    errors.push('Descripción debe tener máximo 100 caracteres')
  }

  // Validar monto
  if (!data.monto || isNaN(Number(data.monto))) {
    errors.push('Monto es requerido y debe ser numérico')
  } else if (Number(data.monto) <= 0) {
    errors.push('Monto debe ser mayor a 0')
  } else if (Number(data.monto) > 999999999.99) {
    errors.push('Monto debe ser menor a 999,999,999.99')
  }

  // Validar categoría
  if (!data.categoria || !CATEGORIAS_INGRESO.includes(data.categoria)) {
    errors.push(`Categoría debe ser una de: ${CATEGORIAS_INGRESO.join(', ')}`)
  }

  // Validar fecha (opcional)
  if (data.fecha) {
    const fechaRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!fechaRegex.test(data.fecha)) {
      errors.push('Fecha debe estar en formato YYYY-MM-DD')
    } else {
      const fecha = new Date(data.fecha + 'T00:00:00')
      const hoy = new Date()
      hoy.setHours(23, 59, 59, 999) // Final del día
      
      if (fecha > hoy) {
        errors.push('No se pueden registrar ingresos futuros')
      }
      
      const fechaMinima = new Date('2020-01-01')
      if (fecha < fechaMinima) {
        errors.push('Fecha no puede ser anterior a 2020-01-01')
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Errores de validación: ${errors.join('; ')}`)
  }

  return {
    descripcion: data.descripcion.trim(),
    monto: parseFloat(Number(data.monto).toFixed(2)),
    categoria: data.categoria,
    fecha: data.fecha || new Date().toISOString().split('T')[0]
  }
}

export function validateGasto(data: any): GastoInput {
  const errors: string[] = []

  // Validar descripción
  if (!data.descripcion || typeof data.descripcion !== 'string') {
    errors.push('Descripción es requerida')
  } else if (data.descripcion.length < 3) {
    errors.push('Descripción debe tener al menos 3 caracteres')
  } else if (data.descripcion.length > 100) {
    errors.push('Descripción debe tener máximo 100 caracteres')
  }

  // Validar monto
  if (!data.monto || isNaN(Number(data.monto))) {
    errors.push('Monto es requerido y debe ser numérico')
  } else if (Number(data.monto) <= 0) {
    errors.push('Monto debe ser mayor a 0')
  } else if (Number(data.monto) > 999999999.99) {
    errors.push('Monto debe ser menor a 999,999,999.99')
  }

  // Validar categoría
  if (!data.categoria || !CATEGORIAS_GASTO.includes(data.categoria)) {
    errors.push(`Categoría debe ser una de: ${CATEGORIAS_GASTO.join(', ')}`)
  }

  // Validar fecha (opcional)
  if (data.fecha) {
    const fechaRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!fechaRegex.test(data.fecha)) {
      errors.push('Fecha debe estar en formato YYYY-MM-DD')
    } else {
      const fecha = new Date(data.fecha + 'T00:00:00')
      const hoy = new Date()
      hoy.setHours(23, 59, 59, 999)
      
      if (fecha > hoy) {
        errors.push('No se pueden registrar gastos futuros')
      }
      
      const fechaMinima = new Date('2020-01-01')
      if (fecha < fechaMinima) {
        errors.push('Fecha no puede ser anterior a 2020-01-01')
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Errores de validación: ${errors.join('; ')}`)
  }

  return {
    descripcion: data.descripcion.trim(),
    monto: parseFloat(Number(data.monto).toFixed(2)),
    categoria: data.categoria,
    fecha: data.fecha || new Date().toISOString().split('T')[0]
  }
}

export function validateSimulacion(data: any): SimulacionInput {
  const errors: string[] = []

  if (!data.nombre_simulacion || data.nombre_simulacion.length < 3) {
    errors.push('Nombre de simulación debe tener al menos 3 caracteres')
  }

  if (!data.monto_prestamo || data.monto_prestamo <= 0) {
    errors.push('Monto del préstamo debe ser mayor a 0')
  } else if (data.monto_prestamo > 1000000000) {
    errors.push('Monto del préstamo no puede exceder 1,000,000,000')
  }

  if (!data.tasa_interes || data.tasa_interes <= 0) {
    errors.push('Tasa de interés debe ser mayor a 0')
  } else if (data.tasa_interes > 100) {
    errors.push('Tasa de interés no puede ser mayor a 100%')
  }

  if (!data.plazo_meses || data.plazo_meses <= 0) {
    errors.push('Plazo debe ser mayor a 0 meses')
  } else if (data.plazo_meses > 600) {
    errors.push('Plazo máximo es 600 meses (50 años)')
  }

  if (errors.length > 0) {
    throw new Error(`Errores de validación: ${errors.join('; ')}`)
  }

  return {
    nombre_simulacion: data.nombre_simulacion.trim(),
    monto_prestamo: parseFloat(data.monto_prestamo),
    tasa_interes: parseFloat(data.tasa_interes),
    plazo_meses: parseInt(data.plazo_meses)
  }
}

export function validateBulkIngresos(data: any[]): IngresoInput[] {
  if (!Array.isArray(data)) {
    throw new Error('Se requiere un array de ingresos')
  }

  if (data.length === 0) {
    throw new Error('El array no puede estar vacío')
  }

  if (data.length > 50) {
    throw new Error('Máximo 50 ingresos por lote')
  }

  return data.map((item, index) => {
    try {
      return validateIngreso(item)
    } catch (error) {
      throw new Error(`Error en ingreso ${index + 1}: ${error.message}`)
    }
  })
}

export function validateBulkGastos(data: any[]): GastoInput[] {
  if (!Array.isArray(data)) {
    throw new Error('Se requiere un array de gastos')
  }

  if (data.length === 0) {
    throw new Error('El array no puede estar vacío')
  }

  if (data.length > 50) {
    throw new Error('Máximo 50 gastos por lote')
  }

  return data.map((item, index) => {
    try {
      return validateGasto(item)
    } catch (error) {
      throw new Error(`Error en gasto ${index + 1}: ${error.message}`)
    }
  })
}
