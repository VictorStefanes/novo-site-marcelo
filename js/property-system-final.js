/* ========================================
   SISTEMA DE PROPRIEDADES DEFINITIVO
   Versão única e completa
======================================== */

class PropertySystemFinal {
    constructor() {
        // Usar URL da API global configurada
        const baseURL = window.API_URL || 'http://localhost:3000';
        this.apiEndpoint = baseURL + '/api/properties';
        
        this.properties = [];
        this.filteredProperties = [];
        this.currentCategory = this.getCurrentCategory();
        this.loading = false;
        this.init();
    }

    getCurrentCategory() {
        const path = window.location.pathname;
        if (path.includes('lancamentos')) return 'lancamentos';
        if (path.includes('mais-procurados')) return 'mais-procurados';
        if (path.includes('beira-mar')) return 'beira-mar';
        return 'all';
    }

    async init() {

        
        this.showLoading();
        await this.loadProperties();
        this.setupEventListeners();
        this.renderProperties();
        this.hideLoading();
    }

    showLoading() {
        const container = document.querySelector('.properties-grid');
        if (container) {
            container.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner">
                        <i class="fas fa-spinner fa-spin"></i>
                    </div>
                    <p>Carregando propriedades...</p>
                </div>
            `;
        }
    }

    hideLoading() {
        const loading = document.querySelector('.loading-state, .loading-placeholder');
        if (loading) loading.remove();
    }

    async loadProperties() {
        this.loading = true;
        
        try {
            const url = this.currentCategory === 'all' ? 
                this.apiEndpoint : 
                `${this.apiEndpoint}?category=${this.currentCategory}`;
                

            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const result = await response.json();
            
            // Backend PostgreSQL retorna { success, data, pagination }
            // Extrair array de properties
            this.properties = result.data || result || [];
            this.filteredProperties = [...this.properties];
            

            
        } catch (error) {
            console.error('❌ Erro ao carregar propriedades:', error);
            this.properties = [];
            this.filteredProperties = [];
            this.showError('Erro ao carregar propriedades. Tente recarregar a página.');
        } finally {
            this.loading = false;
        }
    }

    setupEventListeners() {
        // Filtros
        const applyBtn = document.getElementById('aplicarFiltros');
        const clearBtn = document.getElementById('limparFiltros');
        
        if (applyBtn) {
            applyBtn.addEventListener('click', () => this.applyFilters());
        }
        
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearFilters());
        }

        // Preços com debounce
        const priceInputs = document.querySelectorAll('#precoMin, #precoMax');
        let priceTimeout;
        
        priceInputs.forEach(input => {
            input.addEventListener('input', () => {
                clearTimeout(priceTimeout);
                priceTimeout = setTimeout(() => {
                    this.updatePriceDisplay();
                    this.applyFilters();
                }, 500);
            });
        });

        // Auto-aplicar outros filtros
        const otherFilters = document.querySelectorAll('.filter-input:not(#precoMin):not(#precoMax), .filter-select');
        otherFilters.forEach(filter => {
            filter.addEventListener('change', () => {
                setTimeout(() => this.applyFilters(), 200);
            });
        });

        // Mobile toggle
        this.setupMobileFilters();
    }

    setupMobileFilters() {
        const toggle = document.querySelector('.filter-toggle');
        const container = document.querySelector('.filters-container');
        
        if (toggle && container) {
            toggle.addEventListener('click', () => {
                container.classList.toggle('active');
            });

            // Fechar clicando fora (mobile)
            document.addEventListener('click', (e) => {
                if (window.innerWidth <= 768 && 
                    !container.contains(e.target) && 
                    !toggle.contains(e.target) &&
                    container.classList.contains('active')) {
                    container.classList.remove('active');
                }
            });
        }
    }

    applyFilters() {
        if (this.loading) return;

        const filters = this.collectFilters();
        
        this.filteredProperties = this.properties.filter(property => 
            this.matchesAllFilters(property, filters)
        );

        this.renderProperties();
        this.updatePropertyCount();
    }

    collectFilters() {
        const filters = {};

        // Finalidade (radio)
        const finalidade = document.querySelector('input[name="finalidade"]:checked');
        if (finalidade?.value) filters.finalidade = finalidade.value;

        // Tipos (checkboxes)
        const tipos = Array.from(document.querySelectorAll('input[name="tipo"]:checked'))
            .map(cb => cb.value);
        if (tipos.length > 0) filters.tipos = tipos;

        // Preços
        const precoMin = document.getElementById('precoMin');
        const precoMax = document.getElementById('precoMax');
        if (precoMin?.value) filters.precoMin = parseFloat(precoMin.value);
        if (precoMax?.value) filters.precoMax = parseFloat(precoMax.value);

        // Selects
        ['quartos', 'banheiros', 'vagas', 'bairro'].forEach(field => {
            const element = document.querySelector(`select[name="${field}"]`);
            if (element?.value) filters[field] = element.value;
        });

        return filters;
    }

    matchesAllFilters(property, filters) {
        // Finalidade
        if (filters.finalidade) {
            const propertyFinalidade = this.mapPriceType(property.price_type);
            if (propertyFinalidade !== filters.finalidade) return false;
        }

        // Tipos
        if (filters.tipos?.length > 0) {
            const propertyType = this.mapPropertyType(property.property_type);
            if (!filters.tipos.includes(propertyType)) return false;
        }

        // Preços
        if (filters.precoMin && property.price < filters.precoMin) return false;
        if (filters.precoMax && property.price > filters.precoMax) return false;

        // Quartos
        if (filters.quartos) {
            const required = parseInt(filters.quartos);
            const actual = property.bedrooms || 0;
            if (required === 4) {
                if (actual < 4) return false;
            } else {
                if (actual !== required) return false;
            }
        }

        // Banheiros
        if (filters.banheiros) {
            const required = parseInt(filters.banheiros);
            const actual = property.bathrooms || 0;
            if (required === 3) {
                if (actual < 3) return false;
            } else {
                if (actual !== required) return false;
            }
        }

        // Vagas
        if (filters.vagas) {
            const required = parseInt(filters.vagas);
            const actual = property.parking_spaces || 0;
            if (required === 3) {
                if (actual < 3) return false;
            } else {
                if (actual !== required) return false;
            }
        }

        // Bairro
        if (filters.bairro && property.neighborhood !== filters.bairro) return false;

        return true;
    }

    clearFilters() {
        // Radio buttons para finalidade
        document.querySelectorAll('input[name="finalidade"]').forEach(radio => {
            radio.checked = radio.value === '';
        });

        // Checkboxes para tipos
        document.querySelectorAll('input[name="tipo"]').forEach(cb => {
            cb.checked = false;
        });

        // Selects
        document.querySelectorAll('.filter-select').forEach(select => {
            select.selectedIndex = 0;
        });

        // Preços
        const precoMin = document.getElementById('precoMin');
        const precoMax = document.getElementById('precoMax');
        if (precoMin) precoMin.value = precoMin.min || '50000';
        if (precoMax) precoMax.value = precoMax.max || '2000000';

        this.updatePriceDisplay();
        this.applyFilters();
    }

    updatePriceDisplay() {
        const precoMin = document.getElementById('precoMin');
        const precoMax = document.getElementById('precoMax');
        const valorMin = document.getElementById('valorMin');
        const valorMax = document.getElementById('valorMax');

        if (precoMin && valorMin) {
            valorMin.textContent = this.formatNumber(precoMin.value);
        }
        if (precoMax && valorMax) {
            valorMax.textContent = this.formatNumber(precoMax.value);
        }
    }

    renderProperties() {
        const container = document.querySelector('.properties-grid');
        if (!container) return;

        this.hideLoading();

        if (this.filteredProperties.length === 0) {
            container.innerHTML = this.renderEmptyState();
            return;
        }

        const html = this.filteredProperties.map(property => 
            this.renderPropertyCard(property)
        ).join('');

        container.innerHTML = html;
    }

    renderPropertyCard(property) {
        const {
            id = 'unknown',
            title = 'Propriedade sem título',
            price = 0,
            bedrooms = 0,
            bathrooms = 0,
            parking_spaces = 0,
            area = 0,
            neighborhood = 'Não informado',
            city = 'Maceió',
            price_type = 'sale',
            images = [],
            category = this.currentCategory
        } = property;

        const finalidade = this.mapPriceType(price_type);
        const categoryName = this.getCategoryName(category);

        // Preparar imagens para o carrossel
        const propertyImages = images && images.length > 0 ? images : [{data: '/assets/images/property-placeholder.jpg'}];
        const imagesHTML = propertyImages.map((img, index) => {
            const imgSrc = img.data || img.url || '/assets/images/property-placeholder.jpg';
            return `
                <div class="carousel-slide ${index === 0 ? 'active' : ''}" data-slide="${index}">
                    <img src="${imgSrc}" alt="${title} - Foto ${index + 1}" loading="lazy" 
                         onerror="this.src='/assets/images/property-placeholder.jpg'">
                </div>
            `;
        }).join('');

        // Controles do carrossel (só aparecem se houver mais de 1 imagem)
        const carouselControls = propertyImages.length > 1 ? `
            <button class="carousel-btn carousel-prev" onclick="event.stopPropagation(); window.propertySystem.prevSlide(${id})">
                <i class="fas fa-chevron-left"></i>
            </button>
            <button class="carousel-btn carousel-next" onclick="event.stopPropagation(); window.propertySystem.nextSlide(${id})">
                <i class="fas fa-chevron-right"></i>
            </button>
            <div class="carousel-indicators">
                ${propertyImages.map((_, index) => `
                    <span class="indicator ${index === 0 ? 'active' : ''}" data-slide="${index}"></span>
                `).join('')}
            </div>
        ` : '';

        return `
            <div class="property-card" data-property-id="${id}">
                <div class="property-image-carousel">
                    <div class="carousel-container">
                        ${imagesHTML}
                    </div>
                    ${carouselControls}
                    <div class="property-category ${category}">${categoryName}</div>
                </div>
                <div class="property-content">
                    <div class="property-title">
                        <h3><a href="javascript:void(0)" class="property-link">${title}</a></h3>
                        <span class="property-code">Código: ${id}</span>
                    </div>
                    <div class="property-location">
                        <p><i class="fas fa-map-marker-alt"></i> ${neighborhood}, ${city}</p>
                    </div>
                    <div class="property-features">
                        <div class="feature">
                            <i class="fas fa-bed"></i>
                            <span>${bedrooms} ${bedrooms === 1 ? 'quarto' : 'quartos'}</span>
                        </div>
                        <div class="feature">
                            <i class="fas fa-bath"></i>
                            <span>${bathrooms} ${bathrooms === 1 ? 'banheiro' : 'banheiros'}</span>
                        </div>
                        <div class="feature">
                            <i class="fas fa-car"></i>
                            <span>${parking_spaces} ${parking_spaces === 1 ? 'vaga' : 'vagas'}</span>
                        </div>
                        <div class="feature">
                            <i class="fas fa-ruler-combined"></i>
                            <span>${area}m²</span>
                        </div>
                    </div>
                    <div class="property-price">
                        <h3>${this.formatCurrency(price)}</h3>
                        <p class="price-type">${finalidade}</p>
                    </div>
                    <div class="property-actions">
                        <button class="btn-details" onclick="viewProperty(${id})">
                            <i class="fas fa-eye"></i> Ver Detalhes
                        </button>
                        <button class="btn-contact" onclick="contactProperty(${id})">
                            <i class="fab fa-whatsapp"></i> Contatar
                        </button>
                        <button class="btn-favorite" onclick="toggleFavorite(${id})">
                            <i class="far fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3>Nenhum imóvel encontrado</h3>
                <p>Não encontramos propriedades que correspondam aos filtros selecionados.</p>
                <button class="btn-primary" onclick="window.propertySystem.clearFilters()">
                    <i class="fas fa-eraser"></i> Limpar Filtros
                </button>
            </div>
        `;
    }

    showError(message) {
        const container = document.querySelector('.properties-grid');
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3>Erro ao carregar propriedades</h3>
                    <p>${message}</p>
                    <button class="btn-primary" onclick="window.propertySystem.loadProperties()">
                        <i class="fas fa-redo"></i> Tentar Novamente
                    </button>
                </div>
            `;
        }
    }

    updatePropertyCount() {
        const countElement = document.querySelector('.properties-count');
        if (countElement) {
            const total = this.filteredProperties.length;
            const text = total === 0 ? 'Nenhum imóvel encontrado' :
                        total === 1 ? '1 imóvel encontrado' :
                        `${total} imóveis encontrados`;
            countElement.textContent = text;
        }
    }

    // Utilitários
    mapPriceType(type) {
        const mapping = {
            'sale': 'Venda',
            'rent': 'Aluguel',
            'vacation': 'Temporada'
        };
        return mapping[type] || 'Venda';
    }

    mapPropertyType(type) {
        const mapping = {
            'apartment': 'Apartamento',
            'house': 'Casa',
            'penthouse': 'Cobertura',
            'studio': 'Studio',
            'kitnet': 'Kitnet'
        };
        return mapping[type] || type;
    }

    getCategoryName(category) {
        const names = {
            'mais-procurados': 'Mais Procurado',
            'lancamentos': 'Lançamento',
            'beira-mar': 'Beira Mar'
        };
        return names[category] || category;
    }

    formatNumber(value) {
        return new Intl.NumberFormat('pt-BR').format(value);
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    // Método de atualização para dashboard
    async refresh() {
        await this.loadProperties();
        this.applyFilters();
    }

    // ========================================
    // CONTROLES DO CARROSSEL DE IMAGENS
    // ========================================

    nextSlide(propertyId) {
        const card = document.querySelector(`[data-property-id="${propertyId}"]`);
        if (!card) return;

        const slides = card.querySelectorAll('.carousel-slide');
        const indicators = card.querySelectorAll('.indicator');
        const activeSlide = card.querySelector('.carousel-slide.active');
        const activeIndex = parseInt(activeSlide.dataset.slide);
        const nextIndex = (activeIndex + 1) % slides.length;

        // Atualizar slides
        activeSlide.classList.remove('active');
        slides[nextIndex].classList.add('active');

        // Atualizar indicadores
        indicators.forEach(ind => ind.classList.remove('active'));
        indicators[nextIndex].classList.add('active');
    }

    prevSlide(propertyId) {
        const card = document.querySelector(`[data-property-id="${propertyId}"]`);
        if (!card) return;

        const slides = card.querySelectorAll('.carousel-slide');
        const indicators = card.querySelectorAll('.indicator');
        const activeSlide = card.querySelector('.carousel-slide.active');
        const activeIndex = parseInt(activeSlide.dataset.slide);
        const prevIndex = activeIndex === 0 ? slides.length - 1 : activeIndex - 1;

        // Atualizar slides
        activeSlide.classList.remove('active');
        slides[prevIndex].classList.add('active');

        // Atualizar indicadores
        indicators.forEach(ind => ind.classList.remove('active'));
        indicators[prevIndex].classList.add('active');
    }
}

// Funções globais para interação
function viewProperty(propertyId) {
    // Redirecionar para página de detalhes
    window.location.href = `property-details.html?id=${propertyId}`;
}

function contactProperty(propertyId) {
    const property = window.propertySystem?.filteredProperties?.find(p => p.id == propertyId);
    const message = property ? 
        `Olá! Tenho interesse no imóvel: ${property.title} - ${window.propertySystem.formatCurrency(property.price)}. Podem me enviar mais informações?` :
        `Olá! Tenho interesse em imóveis. Podem me enviar mais informações?`;
    
    const phoneNumber = '5582988780126';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

function toggleFavorite(propertyId) {
    const btn = document.querySelector(`[data-property-id="${propertyId}"] .btn-favorite i`);
    if (btn) {
        const isFavorited = btn.classList.contains('fas');
        btn.className = isFavorited ? 'far fa-heart' : 'fas fa-heart';
        btn.style.color = isFavorited ? '' : '#d4af37';
    }
}

// Inicialização automática
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.properties-grid')) {
        window.propertySystem = new PropertySystemFinal();
    }
});

// Exportar para uso em outros scripts
window.PropertySystemFinal = PropertySystemFinal;