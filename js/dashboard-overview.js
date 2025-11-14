// ========================================
// DASHBOARD OVERVIEW SYSTEM
// ========================================

class DashboardOverview {
    constructor() {
        this.salesChart = null;
        this.revenueChart = null;
        this.init();
    }

    async init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initComponents());
        } else {
            this.initComponents();
        }
    }

    async initComponents() {
        await this.loadMetrics();
        this.initCharts();
        await this.loadActivities();
        await this.loadTopProperties();
    }

    async loadMetrics() {
        try {
            // Obter token do localStorage
            const token = localStorage.getItem('token');
            
            const response = await fetch('http://localhost:3000/api/dashboard/metrics', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (data.success) {
                this.updateMetricCard('activePropertiesCount', data.metrics.activeProperties);
                this.updateMetricCard('monthlySalesCount', data.metrics.monthlySales);
                this.updateMetricCard('monthlyRevenue', this.formatCurrency(data.metrics.monthlyRevenue));
                this.updateMetricCard('newLeadsCount', data.metrics.newLeads);

                // Update changes
                this.updateMetricChange('activePropertiesChange', data.metrics.changes.properties);
                this.updateMetricChange('monthlySalesChange', data.metrics.changes.sales);
                this.updateMetricChange('revenueChange', data.metrics.changes.revenue);
                this.updateMetricChange('leadsChange', data.metrics.changes.leads);
            } else {
                this.loadDemoMetrics();
            }
        } catch (error) {
            console.error('Erro ao carregar métricas:', error);
            // Fallback to demo data
            this.loadDemoMetrics();
        }
    }

    loadDemoMetrics() {
        this.updateMetricCard('activePropertiesCount', '0');
        this.updateMetricCard('monthlySalesCount', '0');
        this.updateMetricCard('monthlyRevenue', 'R$ 0');
        this.updateMetricCard('newLeadsCount', '0');
        
        this.updateMetricChange('activePropertiesChange', '0%');
        this.updateMetricChange('monthlySalesChange', '0%');
        this.updateMetricChange('revenueChange', '0%');
        this.updateMetricChange('leadsChange', '0%');
    }

    updateMetricCard(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }

    updateMetricChange(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
            const parent = element.closest('.metric-change');
            if (parent) {
                parent.classList.toggle('positive', !value.includes('-'));
                parent.classList.toggle('negative', value.includes('-'));
            }
        }
    }

    initCharts() {
        this.initSalesChart();
        this.initRevenueChart();
    }

    initSalesChart() {
        const ctx = document.getElementById('salesChart');
        if (!ctx) return;

        const months = this.getLast12Months();
        
        this.salesChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'Vendas',
                        data: Array(12).fill(0),
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: '#667eea',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    },
                    {
                        label: 'Aluguéis',
                        data: Array(12).fill(0),
                        borderColor: '#38ef7d',
                        backgroundColor: 'rgba(56, 239, 125, 0.1)',
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: '#38ef7d',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        align: 'end',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                size: 12,
                                weight: '500'
                            }
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        cornerRadius: 8,
                        titleFont: {
                            size: 14,
                            weight: '600'
                        },
                        bodyFont: {
                            size: 13
                        },
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += context.parsed.y + ' imóveis';
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 5,
                            font: {
                                size: 11
                            }
                        },
                        grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.05)',
                            drawBorder: false
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                size: 11
                            }
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });

        // Chart period selector
        const periodSelector = document.getElementById('salesChartPeriod');
        if (periodSelector) {
            periodSelector.addEventListener('change', (e) => {
                this.updateSalesChartPeriod(e.target.value);
            });
        }
    }

    initRevenueChart() {
        const ctx = document.getElementById('revenueChart');
        if (!ctx) return;

        this.revenueChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Apartamentos', 'Casas', 'Terrenos', 'Comercial'],
                datasets: [{
                    data: [0, 0, 0, 0],
                    backgroundColor: [
                        '#667eea',
                        '#38ef7d',
                        '#f5576c',
                        '#ffd93d'
                    ],
                    borderWidth: 4,
                    borderColor: '#fff',
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                size: 12,
                                weight: '500'
                            },
                            generateLabels: (chart) => {
                                const data = chart.data;
                                return data.labels.map((label, i) => ({
                                    text: `${label}: ${data.datasets[0].data[i]}%`,
                                    fillStyle: data.datasets[0].backgroundColor[i],
                                    hidden: false,
                                    index: i,
                                    pointStyle: 'circle'
                                }));
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        cornerRadius: 8,
                        titleFont: {
                            size: 14,
                            weight: '600'
                        },
                        bodyFont: {
                            size: 13
                        },
                        callbacks: {
                            label: (context) => {
                                return `${context.label}: ${context.parsed}%`;
                            }
                        }
                    }
                }
            }
        });
    }

    async loadActivities() {
        const activityList = document.getElementById('activityList');
        if (!activityList) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/dashboard/activities', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (data.success && data.activities.length > 0) {
                activityList.innerHTML = data.activities.map(activity => 
                    this.createActivityItem(activity)
                ).join('');
            } else {
                this.loadDemoActivities();
            }
        } catch (error) {
            console.error('Erro ao carregar atividades:', error);
            this.loadDemoActivities();
        }
    }

    loadDemoActivities() {
        const activityList = document.getElementById('activityList');
        if (!activityList) return;

        activityList.innerHTML = `
            <div class="empty-state-inline">
                <i class="fas fa-history"></i>
                <p>Nenhuma atividade registrada ainda</p>
            </div>
        `;
    }

    createActivityItem(activity) {
        return `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}">
                    <i class="fas ${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-description">${activity.description}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </div>
        `;
    }

    async loadTopProperties() {
        const topPropertiesList = document.getElementById('topPropertiesList');
        if (!topPropertiesList) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/dashboard/top-properties', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (data.success && data.properties.length > 0) {
                topPropertiesList.innerHTML = data.properties.map(property => 
                    this.createTopPropertyItem(property)
                ).join('');
            } else {
                this.loadDemoTopProperties();
            }
        } catch (error) {
            console.error('Erro ao carregar imóveis em destaque:', error);
            this.loadDemoTopProperties();
        }
    }

    loadDemoTopProperties() {
        const topPropertiesList = document.getElementById('topPropertiesList');
        if (!topPropertiesList) return;

        topPropertiesList.innerHTML = `
            <div class="empty-state-inline">
                <i class="fas fa-star"></i>
                <p>Nenhum imóvel em destaque ainda</p>
            </div>
        `;
    }

    createTopPropertyItem(property) {
        return `
            <div class="top-property-item">
                <img src="${property.image}" alt="${property.title}" class="top-property-image">
                <div class="top-property-info">
                    <div class="top-property-title">${property.title}</div>
                    <div class="top-property-location">${property.location}</div>
                    <div class="top-property-stats">
                        <span class="stat-item">
                            <i class="fas fa-eye"></i>
                            ${property.views} visualizações
                        </span>
                        <span class="stat-item">
                            <i class="fas fa-users"></i>
                            ${property.leads} leads
                        </span>
                    </div>
                </div>
                <div class="top-property-price">
                    ${this.formatCurrency(property.price)}
                </div>
            </div>
        `;
    }

    updateSalesChartPeriod(months) {
        if (!this.salesChart) return;
        
        const labels = this.getLastNMonths(parseInt(months));
        this.salesChart.data.labels = labels;
        this.salesChart.update();
    }

    getLast12Months() {
        return this.getLastNMonths(12);
    }

    getLastNMonths(n) {
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const result = [];
        const currentDate = new Date();
        
        for (let i = n - 1; i >= 0; i--) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            result.push(months[date.getMonth()]);
        }
        
        return result;
    }

    formatCurrency(value) {
        if (typeof value === 'string') return value;
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0
        }).format(value);
    }
}

// Inicializar quando o documento estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new DashboardOverview();
    });
} else {
    new DashboardOverview();
}
