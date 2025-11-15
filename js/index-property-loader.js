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
        // Mapear campos do PostgreSQL (IDÊNTICO às páginas)
        const id = property.id;
        const title = property.title || 'Imóvel sem título';
        const bedrooms = property.bedrooms || 0;
        const bathrooms = property.bathrooms || 0;
        const parkingSpaces = property.parking_spaces || 0;
        const displayArea = property.total_area || property.built_area || property.area || 0;
        const neighborhood = property.neighborhood || '';
        const city = property.city || 'Maceió';

        // PostgreSQL usa sale_price ou rent_price
        const price = property.sale_price || property.rent_price || 0;
        const finalidade = property.sale_price ? 'Venda' : property.rent_price ? 'Aluguel' : 'Consulte';
        
        const categoryName = this.getCategoryLabel(category);
        const pageUrl = this.getCategoryPage(category);

        // Processar imagens (IDÊNTICO às páginas)
        const propertyImages = property.images && property.images.length > 0 ? property.images : ['/assets/images/property-placeholder.jpg'];
        const imagesHTML = propertyImages.map((img, index) => {
            const imgSrc = typeof img === 'string' ? img : (img.data || img.url || '/assets/images/property-placeholder.jpg');
            return `
                <div class="carousel-slide ${index === 0 ? 'active' : ''}" data-slide="${index}">
                    <img src="${imgSrc}" alt="${title} - Foto ${index + 1}" loading="lazy" 
                         onerror="this.src='/assets/images/property-placeholder.jpg'">
                </div>
            `;
        }).join('');

        // Controles do carrossel (só aparecem se houver mais de 1 imagem)
        const carouselControls = propertyImages.length > 1 ? `
            <button class="carousel-btn carousel-prev" onclick="event.stopPropagation(); window.indexPropertyLoader.prevSlide(${id})">
                <i class="fas fa-chevron-left"></i>
            </button>
            <button class="carousel-btn carousel-next" onclick="event.stopPropagation(); window.indexPropertyLoader.nextSlide(${id})">
                <i class="fas fa-chevron-right"></i>
            </button>
            <div class="carousel-indicators">
                ${propertyImages.map((_, index) => `
                    <span class="indicator ${index === 0 ? 'active' : ''}" data-slide="${index}"></span>
                `).join('')}
            </div>
        ` : '';

        // Estrutura IDÊNTICA às páginas de categoria
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
                        <h3><a href="${pageUrl}?id=${id}" class="property-link">${title}</a></h3>
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
                            <span>${parkingSpaces} ${parkingSpaces === 1 ? 'vaga' : 'vagas'}</span>
                        </div>
                        <div class="feature">
                            <i class="fas fa-ruler-combined"></i>
                            <span>${displayArea}m²</span>
                        </div>
                    </div>
                    <div class="property-price">
                        <h3>${this.formatCurrency(price)}</h3>
                        <p class="price-type">${finalidade}</p>
                    </div>
                    <div class="property-actions">
                        <button class="btn-details" onclick="window.location.href='${pageUrl}?id=${id}'">
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
