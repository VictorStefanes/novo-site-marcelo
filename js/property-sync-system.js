/**
 * SISTEMA DE SINCRONIZAÇÃO DE IMÓVEIS
 * Gerencia a atualização automática entre dashboard → páginas → index
 */

class PropertySyncSystem {
    constructor() {
        // Aguarda configurações serem carregadas ou define fallback
        this.initializeConfig();
        this.init();
    }

    /**
     * Inicializa configurações com fallback seguro
     */
    initializeConfig() {
        // Aguarda SYSTEM_CONFIG estar disponível
        if (typeof SYSTEM_CONFIG !== 'undefined') {
            this.categories = SYSTEM_CONFIG.categories;
            this.apiBase = SYSTEM_CONFIG.api.baseUrl + SYSTEM_CONFIG.api.endpoints.properties;
            this.config = SYSTEM_CONFIG;
        } else {
            console.warn('⚠️ SYSTEM_CONFIG não carregado, usando configuração padrão');
            // Configuração padrão mais robusta
            this.categories = {
                'mais-procurados': {
                    name: 'Mais Procurados',
                    page: 'html/mais-procurados.html',
                    indexSection: '.carousel-cards:not(.lancamentos-cards):not(.pronto-cards)',
                    maxHighlights: 4,
                    icon: '🔥',
                    color: '#e74c3c'
                },
                'lancamentos': {
                    name: 'Lançamentos',
                    page: 'html/lancamentos.html', 
                    indexSection: '.lancamentos-cards',
                    maxHighlights: 4,
                    icon: '🆕',
                    color: '#3498db'
                },
                'pronto-morar': {
                    name: 'Pronto para Morar',
                    page: 'html/pronto-morar.html',
                    indexSection: '.pronto-cards', 
                    maxHighlights: 4,
                    icon: '🏠',
                    color: '#27ae60'
                },
                'beira-mar': {
                    name: 'Beira Mar',
                    page: 'html/beira-mar.html',
                    indexSection: null,
                    maxHighlights: 0,
                    icon: '🏖️',
                    color: '#16a085'
                }
            };
            this.apiBase = '/api/properties';
            this.config = {
                api: {
                    timeout: 10000
                },
                messages: {
                    error: {
                        loadFailed: 'Erro ao carregar dados. Tente novamente.',
                        networkError: 'Erro de conexão. Verifique sua internet.'
                    }
                }
            };
        }
    }

    /**
     * Inicializa o sistema de sincronização
     */
    async init() {
        console.log('🔄 Inicializando sistema de sincronização...');
        
        // Carrega os dados iniciais
        await this.loadAllProperties();
        
        // Configura listeners para mudanças
        this.setupEventListeners();
        
        console.log('✅ Sistema de sincronização ativo');
    }

    /**
     * Carrega todas as propriedades e sincroniza
     */
    async loadAllProperties() {
        try {
            const response = await fetch(`${this.apiBase}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const properties = await response.json();
            
            // Agrupa por categoria
            const byCategory = this.groupByCategory(properties);
            
            // Atualiza cada seção
            for (const [category, props] of Object.entries(byCategory)) {
                await this.updateIndexSection(category, props);
            }
            
            console.log('✅ Propriedades carregadas com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao carregar propriedades:', error);
            // Não mostra dados de teste - deixa seções vazias
            this.showEmptyStates();
        }
    }

    /**
     * Agrupa propriedades por categoria
     */
    groupByCategory(properties) {
        const grouped = {};
        
        for (const category of Object.keys(this.categories)) {
            grouped[category] = properties
                .filter(prop => prop.category === category)
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // Mais recentes primeiro
                .slice(0, this.categories[category].maxHighlights); // Últimos 4
        }
        
        return grouped;
    }

    /**
     * Atualiza a seção específica no index
     */
    async updateIndexSection(category, properties) {
        const categoryConfig = this.categories[category];
        
        if (!categoryConfig.indexSection) {
            console.log(`⏭️ Categoria ${category} não tem seção no index`);
            return;
        }

        const container = document.querySelector(categoryConfig.indexSection);
        if (!container) {
            console.warn(`⚠️ Container não encontrado: ${categoryConfig.indexSection}`);
            return;
        }

        // Gera HTML dos cards
        const cardsHTML = properties.map(property => this.generatePropertyCard(property)).join('');
        
        // Atualiza o container
        container.innerHTML = cardsHTML || this.getEmptyState(category);
        
        console.log(`✅ Seção ${category} atualizada com ${properties.length} imóveis`);
    }

    /**
     * Gera HTML de um card de propriedade
     */
    generatePropertyCard(property) {
        const images = property.images || ['assets/images/placeholder.jpg'];
        const mainImage = images[0];
        
        return `
            <div class="property-card" data-id="${property.id}" data-category="${property.category}">
                <div class="property-image">
                    <img src="${mainImage}" alt="${property.title}" loading="lazy">
                    ${images.length > 1 ? this.generateImageDots(images) : ''}
                    <div class="property-badge">${this.getCategoryBadge(property.category)}</div>
                </div>
                <div class="property-content">
                    <div class="property-title">
                        <h3>${property.title}</h3>
                    </div>
                    <div class="property-location">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${property.location}</span>
                    </div>
                    <div class="property-features">
                        <div class="feature">
                            <i class="fas fa-bed"></i>
                            <span>${property.bedrooms || 0}</span>
                        </div>
                        <div class="feature">
                            <i class="fas fa-bath"></i>
                            <span>${property.bathrooms || 0}</span>
                        </div>
                        <div class="feature">
                            <i class="fas fa-car"></i>
                            <span>${property.parking || 0}</span>
                        </div>
                        <div class="feature">
                            <i class="fas fa-ruler-combined"></i>
                            <span>${property.area || 0}m²</span>
                        </div>
                    </div>
                    <div class="property-price">
                        <h3>R$ ${this.formatPrice(property.price)}</h3>
                    </div>
                    <div class="property-actions">
                        <button class="btn-details" onclick="viewProperty(${property.id})">
                            <i class="fas fa-eye"></i> Ver Detalhes
                        </button>
                        <button class="btn-contact" onclick="contactProperty(${property.id})">
                            <i class="fab fa-whatsapp"></i> Contato
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Gera dots para múltiplas imagens
     */
    generateImageDots(images) {
        const dots = images.map((_, index) => 
            `<button class="image-dot ${index === 0 ? 'active' : ''}" data-image="${index}"></button>`
        ).join('');
        
        return `<div class="image-dots">${dots}</div>`;
    }

    /**
     * Retorna badge da categoria
     */
    getCategoryBadge(category) {
        const badges = {
            'mais-procurados': '🔥 Destaque',
            'lancamentos': '🆕 Lançamento', 
            'pronto-morar': '🏠 Pronto',
            'beira-mar': '🏖️ Beira Mar'
        };
        return badges[category] || '🏢 Imóvel';
    }

    /**
     * Formata o preço
     */
    formatPrice(price) {
        return new Intl.NumberFormat('pt-BR').format(price);
    }

    /**
     * Estado vazio quando não há imóveis
     */
    getEmptyState(category) {
        const categoryConfig = this.categories[category];
        const categoryName = categoryConfig ? categoryConfig.name : category;

        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-building"></i>
                </div>
                <h3 class="empty-state-title">Aguardando Imóveis</h3>
                <p class="empty-state-message">
                    Ainda não há imóveis em "${categoryName}". 
                    <br>
                    Acesse o dashboard para adicionar novos imóveis que aparecerão aqui automaticamente.
                </p>
                <button class="empty-state-cta" onclick="propertySyncSystem.accessDashboard()">
                    <i class="fas fa-plus"></i>
                    Acessar Dashboard
                </button>
            </div>
        `;
    }

    /**
     * Mostra estados vazios para todas as seções
     */
    showEmptyStates() {
        console.log('📝 Exibindo estados vazios - aguardando dados do dashboard...');
        
        // Para cada categoria que tem seção no index, mostra estado vazio
        for (const [category, config] of Object.entries(this.categories)) {
            if (config.indexSection) {
                const container = document.querySelector(config.indexSection);
                if (container) {
                    container.innerHTML = this.getEmptyState(category);
                }
            }
        }
    }

    /**
     * Configura listeners para eventos
     */
    setupEventListeners() {
        // Listener para quando um novo imóvel é adicionado
        document.addEventListener('propertyAdded', (event) => {
            this.handlePropertyAdded(event.detail);
        });

        // Listener para quando um imóvel é removido
        document.addEventListener('propertyRemoved', (event) => {
            this.handlePropertyRemoved(event.detail);
        });

        // Listener para cliques nos dots das imagens
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('image-dot')) {
                this.handleImageDotClick(event.target);
            }
        });
    }

    /**
     * Manipula adição de novo imóvel
     */
    async handlePropertyAdded(propertyData) {
        console.log('🆕 Novo imóvel adicionado:', propertyData);
        
        // Recarrega a seção específica
        await this.refreshCategorySection(propertyData.category);
        
        // Mostra notificação
        this.showNotification(`Imóvel "${propertyData.title}" adicionado com sucesso!`, 'success');
    }

    /**
     * Manipula remoção de imóvel
     */
    async handlePropertyRemoved(propertyData) {
        console.log('🗑️ Imóvel removido:', propertyData);
        
        // Recarrega a seção específica
        await this.refreshCategorySection(propertyData.category);
        
        // Mostra notificação
        this.showNotification(`Imóvel removido com sucesso!`, 'info');
    }

    /**
     * Atualiza uma categoria específica
     */
    async refreshCategorySection(category) {
        try {
            const response = await fetch(`${this.apiBase}?category=${category}`);
            const properties = await response.json();
            
            const recent = properties
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, this.categories[category].maxHighlights);
            
            await this.updateIndexSection(category, recent);
            
        } catch (error) {
            console.error(`❌ Erro ao atualizar categoria ${category}:`, error);
        }
    }

    /**
     * Manipula clique nos dots das imagens
     */
    handleImageDotClick(dotElement) {
        const card = dotElement.closest('.property-card');
        const imageIndex = parseInt(dotElement.dataset.image);
        const img = card.querySelector('.property-image img');
        
        // Aqui você implementaria a troca de imagem
        // Por enquanto, apenas marca o dot como ativo
        card.querySelectorAll('.image-dot').forEach(dot => dot.classList.remove('active'));
        dotElement.classList.add('active');
    }

    /**
     * Mostra notificação para o usuário
     */
    showNotification(message, type = 'info') {
        // Implementar sistema de notificações
        console.log(`📢 ${type.toUpperCase()}: ${message}`);
    }

    /**
     * Acessa o dashboard (abre modal de login se não autenticado)
     */
    accessDashboard() {
        // Verifica se existe token de autenticação
        const token = localStorage.getItem('auth_token');
        
        if (token) {
            // Redireciona para dashboard se já autenticado
            window.location.href = 'dashboard.html';
        } else {
            // Abre modal de login
            const loginBtn = document.getElementById('login-btn');
            if (loginBtn) {
                loginBtn.click();
            }
        }
    }
}

// Funções globais para interação com os cards
window.viewProperty = function(propertyId) {
    console.log(`👁️ Visualizar propriedade ${propertyId}`);
    // Implementar modal de detalhes ou redirect
};

window.contactProperty = function(propertyId) {
    console.log(`📞 Contatar sobre propriedade ${propertyId}`);
    // Implementar integração WhatsApp
};

// Inicializa o sistema quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    window.propertySyncSystem = new PropertySyncSystem();
});

// Exporta para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PropertySyncSystem;
}