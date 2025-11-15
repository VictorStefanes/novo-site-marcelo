/* ========================================
   SISTEMA DE CARREGAMENTO PARA INDEX.HTML
   Carrega os 5 imóveis mais recentes por categoria
======================================== */

class IndexPropertyLoader {
    constructor() {
        this.apiUrl = (window.API_URL || 'http://localhost:3000') + '/api/properties/home';
        this.init();
    }

    async init() {
        try {
            await this.loadProperties();
        } catch (error) {
            console.error('❌ Erro ao inicializar:', error);
        }
    }

    async loadProperties() {
        try {
            const response = await fetch(this.apiUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            
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
        // Usar nomes em inglês (novos) com fallback para português (antigos)
        const bedrooms = property.bedrooms || property.quartos || 0;
        const bathrooms = property.bathrooms || property.banheiros || 0;
        const parkingSpaces = property.parking_spaces || property.vagas || 0;
        const area = property.area || 0;
        const neighborhood = property.neighborhood || property.bairro || '';
        const address = property.address || property.endereco || '';
        const city = property.city || property.cidade || 'Maceió';

        const images = Array.isArray(property.images) ? property.images : [];
        const mainImage = images[0] || 'assets/images/placeholder.jpg';
        
        const price = property.price ? 
            new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(property.price) : 
            'Consulte';

        const pageUrl = this.getCategoryPage(category);

        return `
            <div class="property-card" data-property-id="${property.id}">
                <div class="property-image-carousel">
                    <div class="carousel-container">
                        <div class="carousel-slide active">
                            <img src="${mainImage}" alt="${property.title || 'Imóvel'}" loading="lazy" 
                                 onerror="this.src='assets/images/placeholder.jpg'">
                        </div>
                    </div>
                    <div class="property-category ${category}">${this.getCategoryLabel(category)}</div>
                </div>
                <div class="property-content">
                    <div class="property-title">
                        <h3><a href="${pageUrl}?id=${property.id}">${property.title || 'Imóvel sem título'}</a></h3>
                        <span class="property-code">Código: ${property.id}</span>
                    </div>
                    <div class="property-location">
                        <p><i class="fas fa-map-marker-alt"></i> ${neighborhood || address || 'Localização não informada'}, ${city}</p>
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
                            <span>${area}m²</span>
                        </div>
                    </div>
                    <div class="property-price">
                        <h3>${price}</h3>
                        <p class="price-type">Venda</p>
                    </div>
                    <div class="property-actions">
                        <a href="${pageUrl}?id=${property.id}" class="btn-details">
                            <i class="fas fa-eye"></i> Ver Detalhes
                        </a>
                    </div>
                </div>
            </div>
        `;
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
