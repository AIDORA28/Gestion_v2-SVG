/**
 * 🎨 DASHBOARD ENHANCEMENTS - JavaScript para KPIs Animados
 * Animaciones y efectos visuales para el dashboard
 */

// 🎯 Enhanced KPI Animations
class DashboardEnhancer {
    constructor() {
        this.charts = {};
        this.animationDuration = 2000;
        this.init();
    }

    init() {
        this.initializeCounterAnimations();
        this.initializeMiniCharts();
        this.initializeProgressBars();
        this.initializeTooltips();
        console.log('🎨 Dashboard Enhancer initialized');
    }

    // 🔢 Animated Counter for KPI Values
    animateCounter(elementId, targetValue, duration = 2000, prefix = '$', suffix = '') {
        const element = document.getElementById(elementId);
        if (!element) return;

        const startValue = 0;
        const startTime = performance.now();
        const isNegative = targetValue < 0;
        const absTargetValue = Math.abs(targetValue);

        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue = startValue + (absTargetValue * easedProgress);
            
            // Format the number
            const formattedValue = this.formatCurrency(isNegative ? -currentValue : currentValue);
            element.textContent = `${prefix}${formattedValue}${suffix}`;
            
            // Add animation class
            element.classList.add('animate-counter');
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.classList.remove('animate-counter');
            }
        };

        requestAnimationFrame(updateCounter);
    }

    // 💰 Format Currency
    formatCurrency(value) {
        return new Intl.NumberFormat('es-PE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(Math.abs(value));
    }

    // 📊 Initialize Mini Sparkline Charts
    initializeMiniCharts() {
        this.createSparklineChart('ingresos-sparkline', [300, 450, 320, 580, 720, 650, 800], '#3b82f6');
        this.createSparklineChart('gastos-sparkline', [200, 180, 220, 250, 190, 280, 240], '#ef4444');
    }

    // ✨ Create Sparkline Chart
    createSparklineChart(canvasId, data, color) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = canvas.offsetWidth * 2;
        canvas.height = canvas.offsetHeight * 2;
        ctx.scale(2, 2);
        
        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Calculate points
        const maxValue = Math.max(...data);
        const minValue = Math.min(...data);
        const range = maxValue - minValue;
        
        const points = data.map((value, index) => ({
            x: (index / (data.length - 1)) * width,
            y: height - ((value - minValue) / range) * height
        }));
        
        // Draw line
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Create gradient fill
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, color + '20');
        gradient.addColorStop(1, color + '05');
        
        // Draw filled area
        ctx.beginPath();
        ctx.moveTo(points[0].x, height);
        points.forEach(point => ctx.lineTo(point.x, point.y));
        ctx.lineTo(points[points.length - 1].x, height);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Draw line
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach(point => ctx.lineTo(point.x, point.y));
        ctx.stroke();
        
        // Draw points
        ctx.fillStyle = color;
        points.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    // 📈 Initialize Progress Bars
    initializeProgressBars() {
        this.animateProgressBar('balance-progress-bar', 65);
        this.animateProgressBar('ahorro-progress-bar', 40);
        
        // Update text
        document.getElementById('balance-percentage').textContent = '65%';
        document.getElementById('ahorro-percentage').textContent = '40%';
    }

    // 🎯 Animate Progress Bar
    animateProgressBar(elementId, targetPercentage, duration = 1500) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const startTime = performance.now();
        
        const updateProgress = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const currentPercentage = targetPercentage * easedProgress;
            
            element.style.width = `${currentPercentage}%`;
            
            if (progress < 1) {
                requestAnimationFrame(updateProgress);
            }
        };

        requestAnimationFrame(updateProgress);
    }

    // 🏷️ Initialize Tooltips
    initializeTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        tooltipElements.forEach(element => {
            element.classList.add('tooltip');
        });
    }

    // 📊 Update KPI Values with Animation
    updateKPIValues(data) {
        // Animate balance total
        this.animateCounter('balance-total', data.balanceTotal || 5420.50);
        
        // Animate monthly income
        this.animateCounter('ingresos-mes', data.ingresosmes || 3200.00);
        
        // Animate monthly expenses  
        this.animateCounter('gastos-mes', data.gastosMes || 1780.00);
        
        // Animate projected savings
        this.animateCounter('ahorro-proyectado', data.ahorroProyectado || 1420.00);
        
        // Update trend indicators
        this.updateTrendIndicators(data);
        
        // Update status badges
        this.updateStatusBadges(data);
    }

    // 📈 Update Trend Indicators
    updateTrendIndicators(data) {
        const ingresosChange = data.ingresosChange || 12.5;
        const gastosChange = data.gastosChange || -8.3;
        
        const ingresosTrend = document.getElementById('ingresos-trend');
        const gastosTrend = document.getElementById('gastos-trend');
        
        if (ingresosTrend) {
            ingresosTrend.textContent = `+${ingresosChange.toFixed(1)}%`;
        }
        
        if (gastosTrend) {
            gastosTrend.textContent = `${gastosChange.toFixed(1)}%`;
        }
    }

    // 🏷️ Update Status Badges
    updateStatusBadges(data) {
        const balanceStatus = document.getElementById('balance-status');
        const ahorroStatus = document.getElementById('ahorro-status');
        
        if (balanceStatus) {
            const balance = data.balanceTotal || 5420.50;
            if (balance > 5000) {
                balanceStatus.textContent = 'Excelente';
                balanceStatus.className = balanceStatus.className.replace(/bg-\w+-100/, 'bg-emerald-100');
            } else if (balance > 2000) {
                balanceStatus.textContent = 'Saludable';
            } else {
                balanceStatus.textContent = 'Atención';
                balanceStatus.className = balanceStatus.className.replace(/bg-\w+-100/, 'bg-yellow-100');
            }
        }
        
        if (ahorroStatus) {
            const ahorroPercentage = parseInt(document.getElementById('ahorro-percentage').textContent);
            if (ahorroPercentage >= 50) {
                ahorroStatus.textContent = 'Objetivo';
            } else if (ahorroPercentage >= 25) {
                ahorroStatus.textContent = 'En progreso';
            } else {
                ahorroStatus.textContent = 'Inicial';
            }
        }
    }

    // 🔄 Refresh Dashboard Data
    refreshDashboard(newData = {}) {
        console.log('🔄 Refreshing dashboard with new data');
        this.updateKPIValues(newData);
        this.initializeMiniCharts();
    }

    // 📱 Handle Mobile Interactions
    initializeMobileEnhancements() {
        if ('ontouchstart' in window) {
            // Add touch-friendly classes
            document.querySelectorAll('.group').forEach(card => {
                card.classList.add('touch-action-manipulation');
            });
        }
    }
}

// 🚀 Initialize Dashboard Enhancer
let dashboardEnhancer;

document.addEventListener('DOMContentLoaded', function() {
    dashboardEnhancer = new DashboardEnhancer();
    
    // Simulate loading data after a short delay
    setTimeout(() => {
        dashboardEnhancer.refreshDashboard({
            balanceTotal: 5420.50,
            ingresosMes: 3200.00,
            gastosMes: 1780.00,
            ahorroProyectado: 1420.00,
            ingresosChange: 12.5,
            gastosChange: -8.3
        });
    }, 500);
});

// 🎯 Initialize user profile
function initializeUserProfile() {
    const userInitials = document.getElementById('user-initials');
    if (userInitials) {
        // Get user data from localStorage or default
        const userData = JSON.parse(localStorage.getItem('user_data')) || { name: 'Usuario' };
        const initials = userData.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        userInitials.textContent = initials;
    }
}

// Initialize user profile and AOS on load
setTimeout(() => {
    initializeUserProfile();
    
    // Initialize AOS if available
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            offset: 100
        });
    }
}, 100);

// 🎯 Export for external use
window.DashboardEnhancer = DashboardEnhancer;
window.dashboardEnhancer = dashboardEnhancer;
