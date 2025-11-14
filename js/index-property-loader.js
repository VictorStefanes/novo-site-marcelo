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
        const images = Array.isArray(property.images) ? property.images : [];
        const mainImage = images[0] || 'assets/images/placeholder.jpg';
        
        const price = property.price ? 
            new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(property.price) : 
            'Consulte';

        const pageUrl = this.getCategoryPage(category);

        return `
            <div class="card-imovel" data-id="${property.id}">
                <div class="card-image-container">
                    <img src="${mainImage}" alt="${property.title || 'Imóvel'}" class="card-image">
                    ${images.length > 1 ? `
                        <div class="image-counter">
                            <i class="fas fa-camera"></i> ${images.length}
                        </div>
                    ` : ''}
                </div>
                <div class="card-content">
                    <h3 class="card-title">${property.title || 'Imóvel sem título'}</h3>
                    <p class="card-location">
                        <i class="fas fa-map-marker-alt"></i> 
                        ${property.bairro || property.endereco || 'Localização não informada'}
                    </p>
                    <div class="card-features">
                        ${property.quartos ? `
                            <span class="feature">
                                <i class="fas fa-bed"></i> ${property.quartos} quarto${property.quartos > 1 ? 's' : ''}
                            </span>
                        ` : ''}
                        ${property.banheiros ? `
                            <span class="feature">
                                <i class="fas fa-bath"></i> ${property.banheiros} banheiro${property.banheiros > 1 ? 's' : ''}
                            </span>
                        ` : ''}
                        ${property.area ? `
                            <span class="feature">
                                <i class="fas fa-ruler-combined"></i> ${property.area}m²
                            </span>
                        ` : ''}
                    </div>
                    <div class="card-footer">
                        <span class="card-price">${price}</span>
                        <a href="${pageUrl}?id=${property.id}" class="btn-detalhes">
                            Ver Detalhes <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </div>
        `;
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
