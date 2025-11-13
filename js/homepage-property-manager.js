/**
 * Sistema de Gerenciamento Dinâmico de Imóveis por Categoria
 * Mantém os 4 imóveis mais recentes em cada seção da homepage
 */

class HomepagePropertyManager {
    constructor() {
        this.maxItemsPerCategory = 4;
        this.categories = {
            'mais-procurados': {
                selector: '.mais-procurados-cards',
                apiEndpoint: '/api/properties/mais-procurados/recent',
                fallbackData: []
            },
            'lancamentos': {
                selector: '.lancamentos-cards', 
                apiEndpoint: '/api/properties/lancamentos/recent',
                fallbackData: []
            },
            'pronto-para-morar': {
                selector: '.pronto-cards',
                apiEndpoint: '/api/properties/pronto-para-morar/recent',
                fallbackData: []
            }
        };
        
        this.init();
    }

    /**
     * Inicializa o sistema
     */
    init() {
        console.log('Iniciando Homepage Property Manager...');
        this.loadAllCategories();
        
        // Atualiza a cada 5 minutos para manter sincronizado
        setInterval(() => {
            this.loadAllCategories();
        }, 5 * 60 * 1000);
    }

    /**
     * Carrega todas as categorias
     */
    async loadAllCategories() {
        const promises = Object.keys(this.categories).map(category => 
            this.loadCategoryProperties(category)
        );
        
        try {
            await Promise.all(promises);
            console.log('Todas as categorias foram atualizadas');
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
        }
    }

    /**
     * Carrega imóveis de uma categoria específica
     */
    async loadCategoryProperties(categoryKey) {
        const category = this.categories[categoryKey];
        
        try {
            const response = await fetch(category.apiEndpoint);
            let properties = [];
            
            if (response.ok) {
                const data = await response.json();
                properties = data.properties || data || [];
            } else {
                console.warn(`API não disponível para ${categoryKey}, usando dados estáticos`);
                properties = category.fallbackData;
            }
            
            // Limita aos 4 mais recentes
            const recentProperties = properties
                .sort((a, b) => new Date(b.created_at || b.data_criacao) - new Date(a.created_at || a.data_criacao))
                .slice(0, this.maxItemsPerCategory);
            
            this.renderCategoryProperties(categoryKey, recentProperties);
            
        } catch (error) {
            console.error(`Erro ao carregar ${categoryKey}:`, error);
            // Em caso de erro, mantém os cards estáticos existentes
        }
    }

    /**
     * Renderiza os imóveis de uma categoria
     */
    renderCategoryProperties(categoryKey, properties) {
        const category = this.categories[categoryKey];
        const container = document.querySelector(category.selector);
        
        if (!container) {
            console.warn(`Container não encontrado para ${categoryKey}`);
            return;
        }

        // Se não há propriedades, mantém os cards estáticos
        if (!properties || properties.length === 0) {
            console.log(`Nenhuma propriedade encontrada para ${categoryKey}, mantendo cards estáticos`);
            return;
        }

        // Limpa apenas se há novos dados
        container.innerHTML = '';
        
        // Renderiza cada propriedade
        properties.forEach(property => {
            const cardHtml = this.generatePropertyCard(property, categoryKey);
            container.insertAdjacentHTML('beforeend', cardHtml);
        });

        console.log(`${categoryKey}: ${properties.length} propriedades renderizadas`);
    }

    /**
     * Gera o HTML de um card de propriedade
     */
    generatePropertyCard(property, categoryKey) {
        const categoryInfo = this.getCategoryInfo(categoryKey);
        const imageUrl = property.images?.[0] || property.imagem_principal || 
                        'https://via.placeholder.com/400x250/666/ffffff?text=Sem+Imagem';
        
        return `
            <div class="property-card ${categoryInfo.cardClass}">
                <div class="property-image">
                    <img src="${imageUrl}" alt="${property.titulo || property.nome}" loading="lazy">
                    <div class="property-category ${categoryKey}">${categoryInfo.label}</div>
                    <div class="property-badge ${categoryInfo.badgeClass}">${categoryInfo.badge}</div>
                    ${this.generateExtraLabels(property, categoryKey)}
                </div>
                <div class="property-content">
                    <div class="property-title">
                        <h3><a href="html/imovel.html?id=${property.id}" class="property-link">${property.titulo || property.nome}</a></h3>
                        <span class="property-code">Código: ${property.codigo || property.id}</span>
                    </div>
                    <div class="property-location">
                        <p><i class="fas fa-map-marker-alt"></i> ${property.bairro || property.localizacao}, ${property.cidade || 'Maceió'}</p>
                    </div>
                    <div class="property-features">
                        <div class="feature">
                            <i class="fas fa-bed"></i>
                            <span>${property.quartos || 0} quartos</span>
                        </div>
                        <div class="feature">
                            <i class="fas fa-bath"></i>
                            <span>${property.banheiros || 0} banheiros</span>
                        </div>
                        <div class="feature">
                            <i class="fas fa-car"></i>
                            <span>${property.vagas || 0} vagas</span>
                        </div>
                        <div class="feature">
                            <i class="fas fa-ruler-combined"></i>
                            <span>${property.area || 0}m²</span>
                        </div>
                    </div>
                    ${this.generateHighlights(property)}
                    <div class="property-price">
                        <div class="price-container">
                            ${property.preco_antigo ? `<span class="old-price">R$ ${this.formatPrice(property.preco_antigo)}</span>` : ''}
                            <h3 class="current-price">R$ ${this.formatPrice(property.preco || property.valor)}</h3>
                        </div>
                        <p class="price-type">${property.tipo_negocio || 'À Venda'}</p>
                    </div>
                    <div class="property-actions">
                        <a href="html/imovel.html?id=${property.id}" class="btn-details">
                            <i class="fas fa-eye"></i> Ver Detalhes
                        </a>
                        <button class="btn-contact" onclick="contactAboutProperty('${property.codigo || property.id}')">
                            <i class="fab fa-whatsapp"></i> Contatar
                        </button>
                        <button class="btn-favorite" onclick="toggleFavorite('${property.codigo || property.id}')">
                            <i class="far fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Retorna informações específicas da categoria
     */
    getCategoryInfo(categoryKey) {
        const categoryMap = {
            'mais-procurados': {
                label: 'Mais Procurado',
                cardClass: 'popular-card',
                badgeClass: 'hot',
                badge: '🔥 HOT'
            },
            'lancamentos': {
                label: 'Lançamento',
                cardClass: 'premium-card',
                badgeClass: 'new',
                badge: 'NOVO'
            },
            'pronto-para-morar': {
                label: 'Pronto para Morar',
                cardClass: 'ready-card',
                badgeClass: 'ready',
                badge: '✅ PRONTO'
            }
        };
        
        return categoryMap[categoryKey] || categoryMap['lancamentos'];
    }

    /**
     * Gera labels extras baseado na categoria
     */
    generateExtraLabels(property, categoryKey) {
        let extraHtml = '';
        
        if (categoryKey === 'mais-procurados' && property.visualizacoes) {
            extraHtml += `<div class="property-views">+${property.visualizacoes} visualizações</div>`;
        }
        
        if (categoryKey === 'lancamentos' && property.desconto) {
            extraHtml += `<div class="property-discount">${property.desconto}% OFF</div>`;
        }
        
        if (categoryKey === 'pronto-para-morar') {
            extraHtml += `<div class="property-status">Imediato</div>`;
        }
        
        return extraHtml;
    }

    /**
     * Gera destaques do imóvel
     */
    generateHighlights(property) {
        const highlights = property.destaques || property.highlights || [];
        
        if (highlights.length === 0) {
            // Highlights padrão baseados nas características
            const defaultHighlights = [];
            if (property.vista_mar) defaultHighlights.push('<i class="fas fa-water"></i> Vista Mar');
            if (property.piscina) defaultHighlights.push('<i class="fas fa-swimming-pool"></i> Piscina');
            if (property.academia) defaultHighlights.push('<i class="fas fa-dumbbell"></i> Academia');
            
            return defaultHighlights.length > 0 ? `
                <div class="property-highlights">
                    ${defaultHighlights.map(h => `<span class="highlight-item">${h}</span>`).join('')}
                </div>
            ` : '';
        }
        
        return `
            <div class="property-highlights">
                ${highlights.map(highlight => `<span class="highlight-item">${highlight}</span>`).join('')}
            </div>
        `;
    }

    /**
     * Formata preço
     */
    formatPrice(price) {
        return new Intl.NumberFormat('pt-BR').format(price);
    }

    /**
     * Método público para adicionar novo imóvel
     * Será chamado quando um imóvel for adicionado via dashboard
     */
    async addNewProperty(propertyData, categoryKey) {
        console.log(`Novo imóvel adicionado em ${categoryKey}:`, propertyData);
        
        // Recarrega a categoria específica
        await this.loadCategoryProperties(categoryKey);
        
        // Notifica que foi atualizado
        this.notifyUpdate(categoryKey);
    }

    /**
     * Notifica atualização
     */
    notifyUpdate(categoryKey) {
        // Dispatch evento customizado para outras partes do sistema
        document.dispatchEvent(new CustomEvent('homepagePropertyUpdated', {
            detail: { category: categoryKey }
        }));
    }
}

// Inicialização automática quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    // Aguarda um pouco para garantir que outros scripts carregaram
    setTimeout(() => {
        window.homepagePropertyManager = new HomepagePropertyManager();
    }, 1000);
});

// Expõe funções globais para uso do dashboard
window.updateHomepageProperties = function(categoryKey) {
    if (window.homepagePropertyManager) {
        window.homepagePropertyManager.loadCategoryProperties(categoryKey);
    }
};

window.addHomepageProperty = function(propertyData, categoryKey) {
    if (window.homepagePropertyManager) {
        window.homepagePropertyManager.addNewProperty(propertyData, categoryKey);
    }
};