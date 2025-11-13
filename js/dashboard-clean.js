/* ========================================
   DASHBOARD CLEAN - JAVASCRIPT
======================================== */

class DashboardClean {
    constructor() {
        this.currentSection = 'overview';
        this.sidebarCollapsed = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.updatePageTitle();
    }

    bindEvents() {
        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }

        // Navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Responsive sidebar
        this.handleResize();
        window.addEventListener('resize', () => this.handleResize());
    }

    toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        this.sidebarCollapsed = !this.sidebarCollapsed;
        sidebar.classList.toggle('collapsed', this.sidebarCollapsed);
    }

    handleNavigation(e) {
        e.preventDefault();
        
        const link = e.currentTarget;
        const section = link.dataset.section;
        
        if (section && section !== this.currentSection) {
            this.switchSection(section);
        }
    }

    switchSection(sectionId) {
        // Remove active class from current nav item
        document.querySelector('.nav-item.active')?.classList.remove('active');
        
        // Add active class to new nav item
        const newNavItem = document.querySelector(`[data-section="${sectionId}"]`).closest('.nav-item');
        if (newNavItem) {
            newNavItem.classList.add('active');
        }
        
        // Hide current content section
        document.querySelector('.content-section.active')?.classList.remove('active');
        
        // Show new content section
        const newSection = document.getElementById(sectionId);
        if (newSection) {
            newSection.classList.add('active');
        }
        
        // Update page title
        this.updatePageTitle(sectionId);
        
        // Update current section
        this.currentSection = sectionId;
    }

    updatePageTitle(sectionId = this.currentSection) {
        const pageTitle = document.querySelector('.page-title');
        
        const sectionTitles = {
            'overview': 'Visão Geral',
            'properties': 'Gestão de Imóveis',
            'leads': 'Gestão de Leads',
            'agenda': 'Agenda de Visitas',
            'analytics': 'Relatórios e Analytics',
            'settings': 'Configurações'
        };
        
        if (pageTitle) {
            pageTitle.textContent = sectionTitles[sectionId] || 'Dashboard';
        }
    }

    handleResize() {
        const sidebar = document.querySelector('.sidebar');
        const windowWidth = window.innerWidth;
        
        if (windowWidth <= 1024) {
            sidebar.classList.remove('collapsed');
            this.sidebarCollapsed = false;
        }
    }
}

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardClean = new DashboardClean();
    console.log('Dashboard Clean initialized');
});