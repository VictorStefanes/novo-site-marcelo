/* ========================================
   INDEX PROPERTY LOADER
   Carrega imóveis no index.html
   Estrutura IDÊNTICA às páginas de categoria
======================================== */

class IndexPropertyLoader {
    constructor() {
        this.apiUrl = window.API_URL || 'http://localhost:3000';
        this.init();
    }

    async init() {
        try {
            console.log('🔄 Carregando imóveis para o index...');
            
            const response = await fetch(`${this.apiUrl}/api/properties/home`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📦 Dados recebidos:', data);
            
            // data = { lancamentos: [...], 'beira-mar': [...], 'mais-procurados': [...] }
            this.renderCategory('lancamentos', data.lancamentos || [], '.lancamentos-cards');
            this.renderCategory('beira-mar', data['beira-mar'] || [], '.pronto-cards');
            this.renderCategory('mais-procurados', data['mais-procurados'] || [], '.mais-procurados-cards');
            
            console.log('✅ Imóveis carregados por categoria:', {
                lancamentos: data.lancamentos?.length || 0,
                beiraMar: data['beira-mar']?.length || 0,
                maisProcurados: data['mais-procurados']?.length || 0
            });

        } catch (error) {
            console.error('❌ Erro ao carregar imóveis:', error);
            this.showError();
        }
    }

    renderCategory(category, properties, containerSelector) {
        const container = document.querySelector(containerSelector);
        
        if (!container) {
            console.warn(`⚠️ Container não encontrado: ${containerSelector}`);
            return;
        }

        if (properties.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                    <i class="fas fa-home" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                    <p style="color: #666;">Nenhum imóvel cadastrado ainda</p>
                </div>
            `;
            return;
        }

        container.innerHTML = properties.map(property => this.createCard(property, category)).join('');
    }

    createCard(property, category) {
        // FUNÇÃO LIMPA - CARDS SERÃO RECRIADOS DO ZERO
        // Manter estrutura para não quebrar código existente
        return '';
    }

    // Funções de carrossel (IDÊNTICAS às páginas)
    prevSlide(propertyId) {
        const card = document.querySelector(`[data-property-id="${propertyId}"]`);
        if (!card) return;

        const slides = card.querySelectorAll('.carousel-slide');
        const indicators = card.querySelectorAll('.indicator');
        let currentIndex = Array.from(slides).findIndex(slide => slide.classList.contains('active'));
        
        slides[currentIndex].classList.remove('active');
        indicators[currentIndex].classList.remove('active');
        
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        
        slides[currentIndex].classList.add('active');
        indicators[currentIndex].classList.add('active');
    }

    nextSlide(propertyId) {
        const card = document.querySelector(`[data-property-id="${propertyId}"]`);
        if (!card) return;

        const slides = card.querySelectorAll('.carousel-slide');
        const indicators = card.querySelectorAll('.indicator');
        let currentIndex = Array.from(slides).findIndex(slide => slide.classList.contains('active'));
        
        slides[currentIndex].classList.remove('active');
        indicators[currentIndex].classList.remove('active');
        
        currentIndex = (currentIndex + 1) % slides.length;
        
        slides[currentIndex].classList.add('active');
        indicators[currentIndex].classList.add('active');
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    }

    getCategoryLabel(category) {
        const labels = {
            'lancamentos': 'Lançamento',
            'beira-mar': 'Beira Mar',
            'mais-procurados': 'Mais Procurado'
        };
        return labels[category] || 'Imóvel';
    }

    getCategoryPage(category) {
        const pages = {
            'lancamentos': 'html/lancamentos.html',
            'beira-mar': 'html/beira-mar.html',
            'mais-procurados': 'html/mais-procurados.html'
        };
        return pages[category] || 'html/lancamentos.html';
    }

    showError() {
        const containers = ['.lancamentos-cards', '.pronto-cards', '.mais-procurados-cards'];
        
        containers.forEach(selector => {
            const container = document.querySelector(selector);
            if (container) {
                container.innerHTML = `
                    <div class="error-state" style="grid-column: 1/-1; text-align: center; padding: 2rem;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2.5rem; color: #e74c3c; margin-bottom: 1rem;"></i>
                        <p style="color: #666;">Erro ao carregar imóveis. Tente recarregar a página.</p>
                    </div>
                `;
            }
        });
    }
}

// Inicializar apenas se estiver na página index
if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        window.indexPropertyLoader = new IndexPropertyLoader();
    });
}
