// ===================================================================
// 🔄 FUNCIÓN EDGE PARA RECURRENCIAS AUTOMÁTICAS
// ===================================================================
// Descripción: Procesa recurrencias usando Vercel Edge Functions
// Autor: Sistema PlanificaPro
// Fecha: 2025-09-10
// ===================================================================

import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // ¡Usar Service Role!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export default async function handler(req, res) {
  // Verificar que sea una request autorizada (opcional)
  const authHeader = req.headers.authorization
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    console.log('🔄 Iniciando procesamiento de recurrencias...')
    
    // Opción A: Usar las funciones SQL que creamos
    const { data, error } = await supabase.rpc('procesar_todas_recurrencias')
    
    if (error) {
      console.error('❌ Error procesando recurrencias:', error)
      return res.status(500).json({ 
        success: false, 
        error: error.message 
      })
    }

    console.log('✅ Recurrencias procesadas:', data)
    
    return res.status(200).json({
      success: true,
      message: 'Recurrencias procesadas correctamente',
      data: data,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Error inesperado:', error)
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    })
  }
}

// ===================================================================
// 📝 CONFIGURACIÓN PARA VERCEL
// ===================================================================
/*
// vercel.json
{
  "functions": {
    "api/cron-recurrencias.js": {
      "maxDuration": 30
    }
  },
  "crons": [
    {
      "path": "/api/cron-recurrencias",
      "schedule": "0 6 * * *"
    }
  ]
}
*/

// ===================================================================
// 🔧 VARIABLES DE ENTORNO NECESARIAS
// ===================================================================
/*
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
CRON_SECRET=tu-secreto-seguro-para-cron
*/
