// ========================================
// DASHBOARD SECTIONS SYSTEM
// Leads, Agenda, Analytics
// ========================================

class DashboardSections {
    constructor() {
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initComponents());
        } else {
            this.initComponents();
        }
    }

    initComponents() {
        this.initLeads();
        this.initAgenda();
        this.initAnalytics();
    }

    // ========================================
    // LEADS MANAGEMENT
    // ========================================

    initLeads() {
        // Add Lead Button
        const addLeadBtn = document.getElementById('addLeadBtn');
        if (addLeadBtn) {
            addLeadBtn.addEventListener('click', () => this.showAddLeadModal());
        }

        // Search and Filters
        const leadsSearch = document.getElementById('leadsSearch');
        const leadStatusFilter = document.getElementById('leadStatusFilter');
        const leadSourceFilter = document.getElementById('leadSourceFilter');

        if (leadsSearch) {
            leadsSearch.addEventListener('input', (e) => this.filterLeads());
        }

        if (leadStatusFilter) {
            leadStatusFilter.addEventListener('change', () => this.filterLeads());
        }

        if (leadSourceFilter) {
            leadSourceFilter.addEventListener('change', () => this.filterLeads());
        }

        // WhatsApp buttons
        document.querySelectorAll('.btn-icon .fa-whatsapp').forEach(btn => {
            btn.parentElement.addEventListener('click', (e) => {
                const phone = e.target.closest('tr')?.querySelector('.fa-phone')?.nextSibling?.textContent?.trim();
                if (phone) {
                    this.openWhatsApp(phone);
                }
            });
        });
    }

    showAddLeadModal() {
        alert('Funcionalidade de adicionar lead será implementada');
        // Aqui você pode criar um modal para adicionar leads
    }

    filterLeads() {
        const searchTerm = document.getElementById('leadsSearch')?.value.toLowerCase() || '';
        const statusFilter = document.getElementById('leadStatusFilter')?.value || '';
        const sourceFilter = document.getElementById('leadSourceFilter')?.value || '';

        const rows = document.querySelectorAll('#leadsTableBody tr');
        
        rows.forEach(row => {
            const name = row.querySelector('.lead-name-cell span')?.textContent.toLowerCase() || '';
            const status = row.querySelector('.lead-badge')?.textContent.toLowerCase() || '';
            const source = row.querySelector('.lead-source')?.textContent.toLowerCase() || '';
            
            const matchesSearch = name.includes(searchTerm);
            const matchesStatus = !statusFilter || status.includes(statusFilter);
            const matchesSource = !sourceFilter || source.includes(sourceFilter);
            
            row.style.display = (matchesSearch && matchesStatus && matchesSource) ? '' : 'none';
        });
    }

    openWhatsApp(phone) {
        const cleanPhone = phone.replace(/\D/g, '');
        window.open(`https://wa.me/55${cleanPhone}`, '_blank');
    }

    // ========================================
    // AGENDA MANAGEMENT
    // ========================================

    initAgenda() {
        this.currentDate = new Date();
        
        // Calendar navigation
        const prevMonth = document.getElementById('prevMonth');
        const nextMonth = document.getElementById('nextMonth');

        if (prevMonth) {
            prevMonth.addEventListener('click', () => this.changeMonth(-1));
        }

        if (nextMonth) {
            nextMonth.addEventListener('click', () => this.changeMonth(1));
        }

        // Schedule Visit Button
        const scheduleVisitBtn = document.getElementById('scheduleVisitBtn');
        if (scheduleVisitBtn) {
            scheduleVisitBtn.addEventListener('click', () => this.showScheduleModal());
        }

        // Load appointments
        this.loadAppointments();
    }

    async loadAppointments() {
        try {
            const token = localStorage.getItem('token');
            const month = this.currentDate.getMonth() + 1;
            const year = this.currentDate.getFullYear();
            
            const response = await fetch(`http://localhost:3000/api/appointments?month=${month}&year=${year}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (data.success && data.appointments.length > 0) {
                this.renderAppointments(data.appointments);
            } else {
                this.showEmptyAppointments();
            }
        } catch (error) {
            console.error('Erro ao carregar agendamentos:', error);
            this.showEmptyAppointments();
        }
    }

    renderAppointments(appointments) {
        const appointmentsList = document.getElementById('appointmentsList');
        if (!appointmentsList) return;
        
        const today = new Date().toISOString().split('T')[0];
        
        appointmentsList.innerHTML = appointments.map(apt => {
            const isToday = apt.appointment_date === today;
            const dateObj = new Date(apt.appointment_date);
            const dateLabel = isToday ? 'Hoje' : dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
            
            return `
                <div class="appointment-card ${isToday ? 'today' : ''}" data-id="${apt.id}">
                    <div class="appointment-time">
                        <div class="time">${apt.appointment_time}</div>
                        <div class="date">${dateLabel}</div>
                    </div>
                    <div class="appointment-content">
                        <h4>${apt.title}</h4>
                        <p class="appointment-client"><i class="fas fa-user"></i> ${apt.client_name}</p>
                        ${apt.location ? `<p class="appointment-location"><i class="fas fa-map-marker-alt"></i> ${apt.location}</p>` : ''}
                        <p class="appointment-contact"><i class="fas fa-phone"></i> ${apt.client_phone}</p>
                    </div>
                    <div class="appointment-actions">
                        <button class="btn-icon success" onclick="dashboardSections.confirmAppointment(${apt.id})" title="Confirmar">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn-icon danger" onclick="dashboardSections.cancelAppointment(${apt.id})" title="Cancelar">
                            <i class="fas fa-times"></i>
                        </button>
                        <button class="btn-icon" onclick="dashboardSections.openWhatsApp('${apt.client_phone}')" title="WhatsApp">
                            <i class="fab fa-whatsapp"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    showEmptyAppointments() {
        const appointmentsList = document.getElementById('appointmentsList');
        if (appointmentsList) {
            appointmentsList.innerHTML = `
                <div class="empty-state-inline">
                    <i class="fas fa-calendar"></i>
                    <p>Nenhum compromisso agendado</p>
                </div>
            `;
        }
    }

    async confirmAppointment(id) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/appointments/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'confirmed' })
            });
            
            const data = await response.json();
            if (data.success) {
                alert('Compromisso confirmado!');
                this.loadAppointments();
            }
        } catch (error) {
            console.error('Erro ao confirmar:', error);
            alert('Erro ao confirmar compromisso');
        }
    }

    async cancelAppointment(id) {
        if (!confirm('Deseja realmente cancelar este compromisso?')) return;
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/appointments/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            if (data.success) {
                alert('Compromisso cancelado!');
                this.loadAppointments();
            }
        } catch (error) {
            console.error('Erro ao cancelar:', error);
            alert('Erro ao cancelar compromisso');
        }
    }

    changeMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.updateCalendarHeader();
        this.loadAppointments();
    }

    updateCalendarHeader() {
        const currentMonth = document.getElementById('currentMonth');
        if (currentMonth) {
            const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
            currentMonth.textContent = `${months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
        }
    }

    showScheduleModal() {
        alert('Modal de agendamento será implementado em breve.\n\nVocê pode criar agendamentos via API:\nPOST /api/appointments');
    }

    // ========================================
    // ANALYTICS
    // ========================================

    initAnalytics() {
        // Period selector
        const analyticsPeriod = document.getElementById('analyticsPeriod');
        if (analyticsPeriod) {
            analyticsPeriod.addEventListener('change', (e) => {
                this.updateAnalytics(e.target.value);
            });
        }

        // Export report button
        const exportReportBtn = document.getElementById('exportReportBtn');
        if (exportReportBtn) {
            exportReportBtn.addEventListener('click', () => this.exportReport());
        }

        // Initialize analytics charts
        this.initAnalyticsCharts();
    }

    updateAnalytics(period) {
        console.log('Atualizando analytics para período:', period);
        // Aqui você pode buscar dados do backend baseado no período selecionado
        // e atualizar os gráficos e métricas
    }

    exportReport() {
        alert('Exportando relatório em PDF...');
        // Aqui você pode implementar a exportação do relatório
        // usando bibliotecas como jsPDF ou html2canvas
    }

    initAnalyticsCharts() {
        this.initSalesPerformanceChart();
        this.initLeadSourceChart();
    }

    initSalesPerformanceChart() {
        const ctx = document.getElementById('salesPerformanceChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                datasets: [
                    {
                        label: 'Vendas',
                        data: [0, 0, 0, 0, 0, 0],
                        backgroundColor: 'rgba(102, 126, 234, 0.8)',
                        borderRadius: 8
                    },
                    {
                        label: 'Meta',
                        data: [0, 0, 0, 0, 0, 0],
                        backgroundColor: 'rgba(56, 239, 125, 0.3)',
                        borderRadius: 8
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        align: 'end',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.05)'
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

    initLeadSourceChart() {
        const ctx = document.getElementById('leadSourceChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Site', 'WhatsApp', 'Telefone', 'Indicação', 'Outros'],
                datasets: [{
                    data: [0, 0, 0, 0, 0],
                    backgroundColor: [
                        '#667eea',
                        '#25d366',
                        '#38ef7d',
                        '#f5576c',
                        '#9ca3af'
                    ],
                    borderWidth: 4,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 15,
                            generateLabels: (chart) => {
                                const data = chart.data;
                                return data.labels.map((label, i) => ({
                                    text: `${label}: ${data.datasets[0].data[i]}%`,
                                    fillStyle: data.datasets[0].backgroundColor[i],
                                    hidden: false,
                                    index: i
                                }));
                            }
                        }
                    },
                    tooltip: {
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
}

// Initialize when document is ready
let dashboardSections;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        dashboardSections = new DashboardSections();
    });
} else {
    dashboardSections = new DashboardSections();
}
