#!/usr/bin/env node

// ✅ CORRECTED SUPABASE CONNECTIVITY TEST
// Prueba corregida basada en estructura real de tabla

const { createClient } = require('@supabase/supabase-js');

class CorrectedSupabaseTest {
    constructor() {
        this.supabaseUrl = 'https://lobyofpwqwqsszugdwnw.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzMxNTg0MiwiZXhwIjoyMDcyODkxODQyfQ.J87Bps9KzRg94X1Hax8XjMuTt7krJ_ySfWTbkU0p5_k';
        
        this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
        this.testCreditId = null;
    }

    generateValidUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    log(message, type = 'info') {
        const prefix = { 'success': '✅', 'error': '❌', 'warning': '⚠️', 'info': '📋' }[type] || '📋';
        const color = { 'success': '\x1b[32m', 'error': '\x1b[31m', 'warning': '\x1b[33m', 'info': '\x1b[36m' }[type] || '\x1b[36m';
        console.log(`${color}${prefix} ${new Date().toLocaleTimeString()} - ${message}\x1b[0m`);
    }

    async runCorrectedTests() {
        console.log('🧪 PRUEBAS CORREGIDAS DE CONECTIVIDAD SUPABASE');
        console.log('=' .repeat(50));

        try {
            // Test 1: Verificar tabla
            await this.testTableAccess();
            
            // Test 2: Insertar con estructura mínima
            await this.testMinimalInsert();
            
            // Test 3: Leer datos
            await this.testRead();
            
            // Test 4: Actualizar
            await this.testUpdate();
            
            // Test 5: Eliminar
            await this.testDelete();
            
        } catch (error) {
            this.log(`Error crítico: ${error.message}`, 'error');
        }
    }

    async testTableAccess() {
        this.log('Test 1: Verificando acceso a tabla...', 'info');
        
        try {
            const { data, error } = await this.supabase
                .from('simulaciones_credito')
                .select('*')
                .limit(1);
            
            if (error) {
                this.log(`Error: ${error.message}`, 'error');
            } else {
                this.log('Acceso a tabla exitoso', 'success');
                this.log(`Registros existentes: ${data.length}`, 'info');
            }
        } catch (error) {
            this.log(`Error accediendo tabla: ${error.message}`, 'error');
        }
    }

    async testMinimalInsert() {
        this.log('Test 2: Inserción con estructura mínima...', 'info');
        
        try {
            const testCredit = {
                usuario_id: this.generateValidUUID(),
                tipo_credito: 'personal',
                monto_solicitado: 15000.00,
                tasa_interes: 18.50,
                plazo_meses: 18,
                cuota_mensual: 1050.75,
                estado: 'simulacion',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            const { data, error } = await this.supabase
                .from('simulaciones_credito')
                .insert([testCredit])
                .select();
            
            if (error) {
                this.log(`Error insertando: ${error.message}`, 'error');
                
                // Analizar error específico
                if (error.message.includes('entidad_financiera')) {
                    this.log('Columna entidad_financiera no existe en la tabla', 'warning');
                }
                if (error.message.includes('fecha_simulacion')) {
                    this.log('Columna fecha_simulacion no existe en la tabla', 'warning');
                }
            } else {
                this.testCreditId = data[0].id;
                this.log(`Inserción exitosa - ID: ${this.testCreditId}`, 'success');
            }
        } catch (error) {
            this.log(`Error en inserción: ${error.message}`, 'error');
        }
    }

    async testRead() {
        this.log('Test 3: Leyendo registros...', 'info');
        
        try {
            const { data, error } = await this.supabase
                .from('simulaciones_credito')
                .select('*');
            
            if (error) {
                this.log(`Error leyendo: ${error.message}`, 'error');
            } else {
                this.log(`Registros leídos: ${data.length}`, 'success');
                if (data.length > 0) {
                    this.log('Estructura del primer registro:', 'info');
                    console.log(JSON.stringify(data[0], null, 2));
                }
            }
        } catch (error) {
            this.log(`Error en lectura: ${error.message}`, 'error');
        }
    }

    async testUpdate() {
        if (!this.testCreditId) {
            this.log('No hay ID para actualizar', 'warning');
            return;
        }

        this.log('Test 4: Actualizando registro...', 'info');
        
        try {
            const { data, error } = await this.supabase
                .from('simulaciones_credito')
                .update({ 
                    estado: 'aprobado',
                    updated_at: new Date().toISOString()
                })
                .eq('id', this.testCreditId)
                .select();
            
            if (error) {
                this.log(`Error actualizando: ${error.message}`, 'error');
            } else {
                this.log('Actualización exitosa', 'success');
            }
        } catch (error) {
            this.log(`Error en actualización: ${error.message}`, 'error');
        }
    }

    async testDelete() {
        if (!this.testCreditId) {
            this.log('No hay ID para eliminar', 'warning');
            return;
        }

        this.log('Test 5: Eliminando registro...', 'info');
        
        try {
            const { error } = await this.supabase
                .from('simulaciones_credito')
                .delete()
                .eq('id', this.testCreditId);
            
            if (error) {
                this.log(`Error eliminando: ${error.message}`, 'error');
            } else {
                this.log('Eliminación exitosa', 'success');
            }
        } catch (error) {
            this.log(`Error en eliminación: ${error.message}`, 'error');
        }
    }
}

// Ejecutar pruebas
const test = new CorrectedSupabaseTest();
test.runCorrectedTests().then(() => {
    console.log('\n🎯 Pruebas completadas');
    process.exit(0);
});