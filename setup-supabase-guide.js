// ===================================================================
// CONFIGURACIÓN PARA OBTENER CREDENCIALES DE SUPABASE
// Ejecuta este archivo después de configurar Supabase
// ===================================================================

console.log('🔧 CONFIGURACIÓN DE SUPABASE PARA PLANIFICAPRO');
console.log('================================================');
console.log('');
console.log('📋 PASO 1: Obtener credenciales de Supabase');
console.log('1. Ve a tu dashboard de Supabase: https://app.supabase.com');
console.log('2. Selecciona tu proyecto');
console.log('3. Ve a Settings → API');
console.log('4. Copia las siguientes credenciales:');
console.log('');
console.log('📝 CREDENCIALES NECESARIAS:');
console.log('- Project URL (algo como: https://lobyofpwqwqsszugdwnw.supabase.co');
console.log('- anon/public key (eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTU4NDIsImV4cCI6MjA3Mjg5MTg0Mn0.QsZ2dIU1iPffRGtHUREQIhQ5--7_w4ANowG0rJ0AtcI)');
console.log('- service_role key (eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzMxNTg0MiwiZXhwIjoyMDcyODkxODQyfQ.J87Bps9KzRg94X1Hax8XjMuTt7krJ_ySfWTbkU0p5_k)');
console.log('');
console.log('🔒 IMPORTANTE: La service_role key es PRIVADA y solo para el backend');
console.log('');
console.log('📋 PASO 2: Configurar variables de entorno');
console.log('Crea un archivo .env.production con:');
console.log('');
console.log('SUPABASE_URL=https://lobyofpwqwqsszugdwnw.supabase.co');
console.log('SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTU4NDIsImV4cCI6MjA3Mjg5MTg0Mn0.QsZ2dIU1iPffRGtHUREQIhQ5--7_w4ANowG0rJ0AtcI');
console.log('SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzMxNTg0MiwiZXhwIjoyMDcyODkxODQyfQ.J87Bps9KzRg94X1Hax8XjMuTt7krJ_ySfWTbkU0p5_k');
console.log('NODE_ENV=production');
console.log('');
console.log('📋 PASO 3: Configurar Vercel');
console.log('En tu dashboard de Vercel → Settings → Environment Variables');
console.log('Agrega las mismas variables del .env.production');
console.log('');
console.log('✅ Una vez que tengas las credenciales, te ayudo a configurar todo!');
