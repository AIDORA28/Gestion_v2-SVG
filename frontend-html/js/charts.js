// Sistema de Gráficos Financieros Profesional
// Wrapper inteligente para Chart.js con contextos financieros específicos

class FinancialCharts {
    constructor() {
        // Configuración global de Chart.js
        Chart.defaults.font.family = 'Inter, system-ui, sans-serif';
        Chart.defaults.color = '#6b7280'; // gray-500
        Chart.defaults.borderColor = '#e5e7eb'; // gray-200
        Chart.defaults.backgroundColor = 'rgba(59, 130, 246, 0.1)'; // primary-500 with opacity
        
        // Colores financieros consistentes
        this.colors = {
            primary: '#3b82f6',
            success: '#16a34a', 
            warning: '#d97706',
            danger: '#dc2626',
            gray: '#6b7280',
            
            // Paleta para múltiples series
            palette: [
                '#3b82f6', // blue
                '#16a34a', // green  
                '#d97706', // orange
                '#dc2626', // red
                '#7c3aed', // purple
                '#059669', // emerald
                '#ea580c', // orange-600
                '#be123c', // rose-700
            ]
        };
        
        console.log('📊 Sistema de gráficos financieros inicializado');
    }
    
    // ===============================
    // GRÁFICOS DE BALANCE Y RESUMEN
    // ===============================
    
    // Balance mensual (Ingresos vs Gastos)
    createBalanceChart(canvasId, data) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        
        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels || this.getMonthLabels(),
                datasets: [
                    {
                        label: 'Ingresos',
                        data: data.ingresos || [],
                        borderColor: this.colors.success,
                        backgroundColor: this.colors.success + '20',
                        fill: false,
                        tension: 0.4,
                        pointBackgroundColor: this.colors.success,
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 6
                    },
                    {
                        label: 'Gastos', 
                        data: data.gastos || [],
                        borderColor: this.colors.danger,
                        backgroundColor: this.colors.danger + '20',
                        fill: false,
                        tension: 0.4,
                        pointBackgroundColor: this.colors.danger,
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 6
                    },
                    {
                        label: 'Balance Neto',
                        data: data.balance || [],
                        borderColor: this.colors.primary,
                        backgroundColor: this.colors.primary + '10',
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: this.colors.primary,
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 3,
                        pointRadius: 8
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Balance Financiero Mensual',
                        font: { size: 18, weight: 'bold' },
                        color: '#111827'
                    },
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': S/ ' + 
                                       context.parsed.y.toLocaleString('es-PE', {
                                           minimumFractionDigits: 2,
                                           maximumFractionDigits: 2
                                       });
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'S/ ' + value.toLocaleString('es-PE');
                            }
                        },
                        grid: {
                            color: '#f3f4f6'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }
    
    // Gráfico de dona para distribución de gastos
    createExpenseDistribution(canvasId, data) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        
        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.labels || ['Alimentación', 'Transporte', 'Vivienda', 'Entretenimiento', 'Otros'],
                datasets: [{
                    data: data.values || [],
                    backgroundColor: this.colors.palette.slice(0, data.labels?.length || 5),
                    borderWidth: 2,
                    borderColor: '#ffffff',
                    hoverBorderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribución de Gastos por Categoría',
                        font: { size: 18, weight: 'bold' },
                        color: '#111827'
                    },
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                
                                return `${label}: S/ ${value.toLocaleString('es-PE', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }
    
    // Gráfico de barras para ingresos por categoría
    createIncomeByCategory(canvasId, data) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        
        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels || ['Salario', 'Freelance', 'Inversiones', 'Otros'],
                datasets: [{
                    label: 'Ingresos',
                    data: data.values || [],
                    backgroundColor: this.colors.success + '80',
                    borderColor: this.colors.success,
                    borderWidth: 1,
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Ingresos por Categoría',
                        font: { size: 18, weight: 'bold' },
                        color: '#111827'
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'S/ ' + context.parsed.y.toLocaleString('es-PE', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                });
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'S/ ' + value.toLocaleString('es-PE');
                            }
                        },
                        grid: {
                            color: '#f3f4f6'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
    
    // ===============================
    // GRÁFICOS ESPECÍFICOS DE CRÉDITO
    // ===============================
    
    // Tabla de amortización visual
    createAmortizationChart(canvasId, data) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        
        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels || [], // ['Cuota 1', 'Cuota 2', ...]
                datasets: [
                    {
                        label: 'Capital',
                        data: data.capital || [],
                        backgroundColor: this.colors.primary + '80',
                        borderColor: this.colors.primary,
                        borderWidth: 1
                    },
                    {
                        label: 'Interés',
                        data: data.interes || [],
                        backgroundColor: this.colors.warning + '80',
                        borderColor: this.colors.warning,
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Composición de Cuotas (Capital vs Interés)',
                        font: { size: 18, weight: 'bold' },
                        color: '#111827'
                    },
                    legend: {
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': S/ ' + 
                                       context.parsed.y.toLocaleString('es-PE', {
                                           minimumFractionDigits: 2,
                                           maximumFractionDigits: 2
                                       });
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        grid: { display: false }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'S/ ' + value.toLocaleString('es-PE');
                            }
                        }
                    }
                }
            }
        });
    }
    
    // ===============================
    // GRÁFICOS DE TENDENCIAS
    // ===============================
    
    // Tendencia de ahorro
    createSavingsTrend(canvasId, data) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        
        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels || this.getMonthLabels(),
                datasets: [{
                    label: 'Ahorro Acumulado',
                    data: data.values || [],
                    borderColor: this.colors.primary,
                    backgroundColor: this.colors.primary + '20',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: this.colors.primary,
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Tendencia de Ahorro',
                        font: { size: 18, weight: 'bold' },
                        color: '#111827'
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'S/ ' + value.toLocaleString('es-PE');
                            }
                        }
                    }
                }
            }
        });
    }
    
    // ===============================
    // UTILIDADES Y HELPERS
    // ===============================
    
    getMonthLabels() {
        return ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    }
    
    // Generar datos de ejemplo para testing
    generateSampleData(type) {
        switch(type) {
            case 'balance':
                return {
                    labels: this.getMonthLabels().slice(0, 6),
                    ingresos: [5000, 5200, 4800, 5500, 5300, 5600],
                    gastos: [3200, 3400, 3100, 3600, 3300, 3500],
                    balance: [1800, 1800, 1700, 1900, 2000, 2100]
                };
                
            case 'expenses':
                return {
                    labels: ['Alimentación', 'Transporte', 'Vivienda', 'Entretenimiento', 'Otros'],
                    values: [1200, 300, 800, 400, 300]
                };
                
            case 'income':
                return {
                    labels: ['Salario', 'Freelance', 'Inversiones', 'Otros'],
                    values: [4500, 800, 200, 100]
                };
                
            default:
                return { labels: [], values: [] };
        }
    }
    
    // Actualizar datos de un gráfico existente
    updateChart(chart, newData) {
        if (newData.labels) {
            chart.data.labels = newData.labels;
        }
        
        if (newData.datasets) {
            chart.data.datasets = newData.datasets;
        }
        
        chart.update();
    }
    
    // Destruir gráfico (liberar memoria)
    destroyChart(chart) {
        if (chart) {
            chart.destroy();
        }
    }
    
    // Configuración para gráficos responsivos
    getResponsiveOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: window.innerWidth < 768 ? 1 : 2
        };
    }
}

// ===============================
// INICIALIZACIÓN GLOBAL
// ===============================

// Instancia global
window.FinancialCharts = new FinancialCharts();
window.charts = window.FinancialCharts;

// Log de confirmación
console.log('📊 Sistema de gráficos financieros disponible globalmente');
console.log('💡 Uso: charts.createBalanceChart("canvas-id", data)');

// Export para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FinancialCharts;
}
