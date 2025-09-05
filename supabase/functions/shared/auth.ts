// Authentication middleware for Supabase Edge Functions
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export interface AuthResult {
  user: any;
  supabase: any;
}

export async function validateAuth(req: Request): Promise<AuthResult> {
  const authHeader = req.headers.get('Authorization')
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Token de autorización requerido')
  }

  const token = authHeader.replace('Bearer ', '')
  
  // Crear cliente Supabase
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  )

  // Verificar el token
  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error || !user) {
    throw new Error(`Token inválido: ${error?.message || 'Usuario no encontrado'}`)
  }

  return { user, supabase }
}

export function createAuthHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  }
}

export function handleCors(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 200, 
      headers: createAuthHeaders() 
    })
  }
  return null
}
