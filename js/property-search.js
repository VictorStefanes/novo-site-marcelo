// Property Search System

class PropertySearchSystem {
    constructor() {
        this.properties = [];
        this.filteredProperties = [];
        this.currentFilters = {};
        this.init();
    }

    // Dados mockados de imóveis
    generateMockProperties() {
        const tipos = ['Casa', 'Apartamento', 'Cobertura', 'Studio', 'Kitnet'];
        const finalidades = ['Venda', 'Aluguel', 'Temporada'];
        const bairros = ['Ponta Verde', 'Jatiúca', 'Pajuçara', 'Farol', 'Mangabeiras', 'Cruz das Almas'];
        const categorias = ['mais-procurados', 'lancamentos', 'beira-mar'];
        
        const properties = [];
        
        for (let i = 1; i <= 50; i++) {
            const tipo = tipos[Math.floor(Math.random() * tipos.length)];
            const finalidade = finalidades[Math.floor(Math.random() * finalidades.length)];
            const bairro = bairros[Math.floor(Math.random() * bairros.length)];
            const categoria = categorias[Math.floor(Math.random() * categorias.length)];
            
            const property = {
                id: `IMV_${String(i).padStart(3, '0')}`, // ID único formato IMV_001, IMV_002, etc.
                titulo: `${tipo} ${i} - ${bairro}`,
                tipo: tipo,
                finalidade: finalidade,
                preco: Math.floor(Math.random() * 1500000) + 100000,
                quartos: Math.floor(Math.random() * 4) + 1,
                suites: Math.floor(Math.random() * 3) + 1,
                banheiros: Math.floor(Math.random() * 3) + 1,
                vagas: Math.floor(Math.random() * 4),
                area: Math.floor(Math.random() * 200) + 50,
                estado: 'AL',
                cidade: 'Maceió',
                bairro: bairro,
                categoria: categoria,
                endereco: `Rua Exemplo ${i}, ${bairro}, Maceió - AL`,
                descricao: `Excelente ${tipo.toLowerCase()} localizado no ${bairro}, com acabamento de primeira qualidade.`,
                imagem: `https://via.placeholder.com/400x300?text=${tipo}+${i}`,
                coordenadas: {
                    lat: -9.6658 + (Math.random() - 0.5) * 0.1,
                    lng: -35.7350 + (Math.random() - 0.5) * 0.1
                },
                createdAt: new Date(Date.now() - Math.random() * 10000000000)
            };
            
            properties.push(property);
        }
        
        return properties;
    }

    init() {
        this.properties = this.generateMockProperties();
        this.filteredProperties = [...this.properties];
        this.setupEventListeners();
        this.updatePropertyCount();
    }

    setupEventListeners() {
        // Botão aplicar filtros
        const applyBtn = document.getElementById('aplicarFiltros');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => this.applyFilters());
        }

        // Botão limpar filtros
        const clearBtn = document.getElementById('limparFiltros');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearFilters());
        }

        // Inputs de preço
        const precoMin = document.getElementById('precoMin');
        const precoMax = document.getElementById('precoMax');
        if (precoMin && precoMax) {
            precoMin.addEventListener('input', () => this.updatePriceDisplay());
            precoMax.addEventListener('input', () => this.updatePriceDisplay());
        }

        // Auto-aplicar filtros quando houver mudanças
        const filterInputs = document.querySelectorAll('.filter-input, .filter-select');
        filterInputs.forEach(input => {
            input.addEventListener('change', () => {
                // Delay para evitar muitas chamadas
                setTimeout(() => this.applyFilters(), 300);
            });
        });
    }

    updatePriceDisplay() {
        const precoMin = document.getElementById('precoMin');
        const precoMax = document.getElementById('precoMax');
        const valorMin = document.getElementById('valorMin');
        const valorMax = document.getElementById('valorMax');

        if (precoMin && precoMax && valorMin && valorMax) {
            valorMin.textContent = this.formatPrice(precoMin.value);
            valorMax.textContent = this.formatPrice(precoMax.value);
        }
    }

    formatPrice(value) {
        return new Intl.NumberFormat('pt-BR').format(value);
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    collectFilters() {
        const filters = {};

        // Finalidade (radio)
        const finalidade = document.querySelector('input[name="finalidade"]:checked');
        if (finalidade && finalidade.value) {
            filters.finalidade = finalidade.value;
        }

        // Tipo (checkboxes)
        const tipos = Array.from(document.querySelectorAll('input[name="tipo"]:checked'))
                          .map(cb => cb.value);
        if (tipos.length > 0) {
            filters.tipos = tipos;
        }

        // Preço
        const precoMin = document.getElementById('precoMin');
        const precoMax = document.getElementById('precoMax');
        if (precoMin && precoMax) {
            filters.precoMin = parseInt(precoMin.value);
            filters.precoMax = parseInt(precoMax.value);
        }

        // Quartos
        const quartos = document.querySelector('select[name="quartos"]');
        if (quartos && quartos.value) {
            filters.quartos = quartos.value;
        }

        // Suítes
        const suites = document.querySelector('select[name="suites"]');
        if (suites && suites.value) {
            filters.suites = suites.value;
        }

        // Banheiros
        const banheiros = document.querySelector('select[name="banheiros"]');
        if (banheiros && banheiros.value) {
            filters.banheiros = banheiros.value;
        }

        // Vagas
        const vagas = document.querySelector('select[name="vagas"]');
        if (vagas && vagas.value) {
            filters.vagas = vagas.value;
        }

        // Localização
        const bairro = document.querySelector('select[name="bairro"]');
        if (bairro && bairro.value) {
            filters.bairro = bairro.value;
        }

        return filters;
    }

    applyFilters() {
        this.currentFilters = this.collectFilters();
        this.filteredProperties = this.properties.filter(property => {
            return this.matchesFilters(property, this.currentFilters);
        });

        this.renderProperties();
        this.updatePropertyCount();
    }

    matchesFilters(property, filters) {
        // Finalidade
        if (filters.finalidade && property.finalidade !== filters.finalidade) {
            return false;
        }

        // Tipos
        if (filters.tipos && !filters.tipos.includes(property.tipo)) {
            return false;
        }

        // Preço
        if (filters.precoMin && property.preco < filters.precoMin) {
            return false;
        }
        if (filters.precoMax && property.preco > filters.precoMax) {
            return false;
        }

        // Quartos
        if (filters.quartos) {
            const quartosNum = parseInt(filters.quartos);
            if (quartosNum === 4 && property.quartos < 4) {
                return false;
            } else if (quartosNum !== 4 && property.quartos !== quartosNum) {
                return false;
            }
        }

        // Suítes
        if (filters.suites) {
            const suitesNum = parseInt(filters.suites);
            if (suitesNum === 4 && property.suites < 4) {
                return false;
            } else if (suitesNum !== 4 && property.suites !== suitesNum) {
                return false;
            }
        }

        // Banheiros
        if (filters.banheiros) {
            const banheirosNum = parseInt(filters.banheiros);
            if (banheirosNum === 3 && property.banheiros < 3) {
                return false;
            } else if (banheirosNum !== 3 && property.banheiros !== banheirosNum) {
                return false;
            }
        }

        // Vagas
        if (filters.vagas) {
            const vagasNum = parseInt(filters.vagas);
            if (vagasNum === 3 && property.vagas < 3) {
                return false;
            } else if (vagasNum !== 3 && property.vagas !== vagasNum) {
                return false;
            }
        }

        // Bairro
        if (filters.bairro && property.bairro !== filters.bairro) {
            return false;
        }

        return true;
    }

    clearFilters() {
        // Limpar radio buttons
        const radioButtons = document.querySelectorAll('input[name="finalidade"]');
        radioButtons.forEach(radio => {
            radio.checked = radio.value === '';
        });

        // Limpar checkboxes
        const checkboxes = document.querySelectorAll('input[name="tipo"]');
        checkboxes.forEach(cb => cb.checked = false);

        // Resetar preços
        const precoMin = document.getElementById('precoMin');
        const precoMax = document.getElementById('precoMax');
        if (precoMin && precoMax) {
            precoMin.value = precoMin.min;
            precoMax.value = precoMax.max;
            this.updatePriceDisplay();
        }

        // Resetar selects
        const selects = document.querySelectorAll('.filter-select');
        selects.forEach(select => select.selectedIndex = 0);

        // Aplicar filtros limpos
        this.applyFilters();
    }

    renderProperties() {
        const container = document.querySelector('.properties-grid');
        if (!container) return;

        if (this.filteredProperties.length === 0) {
            container.innerHTML = this.renderEmptyState();
            return;
        }

        const propertiesHTML = this.filteredProperties.map(property => 
            this.renderPropertyCard(property)
        ).join('');

        container.innerHTML = propertiesHTML;
    }

    renderPropertyCard(property) {
        return `
            <div class="property-card" data-property-id="${property.id}">
                <div class="property-image">
                    <img src="${property.imagem}" alt="${property.titulo}" loading="lazy">
                    <div class="property-category ${property.categoria}">${this.getCategoryName(property.categoria)}</div>
                </div>
                <div class="property-content">
                    <div class="property-title">
                        <h3><a href="imovel.html?id=${property.id}" class="property-link">${property.titulo}</a></h3>
                        <span class="property-code">Código: ${property.id}</span>
                    </div>
                    <div class="property-location">
                        <p><i class="fas fa-map-marker-alt"></i> ${property.bairro}, ${property.cidade}</p>
                    </div>
                    <div class="property-features">
                        <div class="feature">
                            <i class="fas fa-bed"></i>
                            <span>${property.quartos} quartos</span>
                        </div>
                        <div class="feature">
                            <i class="fas fa-bath"></i>
                            <span>${property.banheiros} banheiros</span>
                        </div>
                        <div class="feature">
                            <i class="fas fa-car"></i>
                            <span>${property.vagas} vagas</span>
                        </div>
                        <div class="feature">
                            <i class="fas fa-ruler-combined"></i>
                            <span>${property.area}m²</span>
                        </div>
                    </div>
                    <div class="property-price">
                        <h3>${this.formatCurrency(property.preco)}</h3>
                        <p class="price-type">${property.finalidade}</p>
                    </div>
                    <div class="property-actions">
                        <a href="imovel.html?id=${property.id}" class="btn-details">
                            <i class="fas fa-eye"></i> Ver Detalhes
                        </a>
                        <button class="btn-contact" onclick="contactAboutProperty('${property.id}')">
                            <i class="fab fa-whatsapp"></i> Contatar
                        </button>
                        <button class="btn-favorite" onclick="toggleFavorite('${property.id}')">
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
                <div class="empty-state-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3 class="empty-state-title">Nenhum imóvel encontrado</h3>
                <p class="empty-state-message">
                    Tente ajustar os filtros ou limpar a busca para ver mais opções.
                </p>
                <button class="empty-state-cta" onclick="window.propertySearch.clearFilters()">
                    Limpar Filtros
                </button>
            </div>
        `;
    }

    getCategoryName(category) {
        const names = {
            'mais-procurados': 'Mais Procurado',
            'lancamentos': 'Lançamento',
            'beira-mar': 'Beira Mar'
        };
        return names[category] || category;
    }

    updatePropertyCount() {
        const countElement = document.querySelector('.properties-count');
        if (countElement) {
            const total = this.filteredProperties.length;
            countElement.textContent = `${total} ${total === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}`;
        }
    }

    // Método para busca por categoria (usado no index.html)
    filterByCategory(category) {
        this.currentFilters = { categoria: category };
        this.filteredProperties = this.properties.filter(property => 
            property.categoria === category
        );
        this.renderProperties();
        this.updatePropertyCount();
    }

    // Método para obter propriedades por categoria (para homepage)
    getPropertiesByCategory(category, limit = 10) {
        return this.properties
            .filter(property => property.categoria === category)
            .slice(0, limit);
    }
}

// Funções globais para interação
function contactAboutProperty(propertyId) {
    const property = window.propertySearch.properties.find(p => p.id === propertyId);
    if (property) {
        const message = `Olá! Tenho interesse no imóvel: ${property.titulo} - ${property.formatCurrency(property.preco)}. Podem me enviar mais informações?`;
        const phoneNumber = '5582988780126';
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    }
}

function toggleFavorite(propertyId) {
    const btn = document.querySelector(`[data-property-id="${propertyId}"] .btn-favorite i`);
    if (btn) {
        if (btn.classList.contains('far')) {
            btn.classList.remove('far');
            btn.classList.add('fas');
            btn.style.color = '#d4af37';
        } else {
            btn.classList.remove('fas');
            btn.classList.add('far');
            btn.style.color = '';
        }
    }
}

// Método para inicializar o sistema
PropertySearchSystem.prototype.init = function() {
    // Gerar propriedades mock se ainda não existirem
    if (this.properties.length === 0) {
        this.properties = this.generateMockProperties();
    }

    // Renderizar propriedades iniciais
    this.renderProperties();

    // Setup event listeners
    this.setupEventListeners();

    console.log('Sistema de busca de propriedades inicializado com', this.properties.length, 'propriedades');
};

// Setup de event listeners
PropertySearchSystem.prototype.setupEventListeners = function() {
    // Botão de limpar filtros (suporta tanto ID quanto classe)
    const clearButton = document.querySelector('#limparFiltros') || document.querySelector('.clear-filters-btn');
    if (clearButton) {
        clearButton.addEventListener('click', () => this.clearAllFilters());
    }

    // Event listeners para filtros
    const filterElements = document.querySelectorAll('select, input[type="number"], input[type="checkbox"]');
    filterElements.forEach(element => {
        element.addEventListener('change', () => this.handleFilterChange());
    });

    // Debounce para campos de preço
    const priceInputs = document.querySelectorAll('input[type="number"]');
    priceInputs.forEach(input => {
        let timeout;
        input.addEventListener('input', () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => this.handleFilterChange(), 300);
        });
    });
};

// Método para limpar todos os filtros
PropertySearchSystem.prototype.clearAllFilters = function() {
    // Reset dropdowns
    const dropdowns = document.querySelectorAll('.filter-dropdown select');
    dropdowns.forEach(dropdown => {
        dropdown.value = '';
    });

    // Reset price inputs
    const priceInputs = document.querySelectorAll('input[type="number"]');
    priceInputs.forEach(input => {
        input.value = '';
    });

    // Reset checkbox filters
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });

    // Renderizar todas as propriedades
    this.renderProperties(this.properties);
};

// Alias para compatibilidade
PropertySearchSystem.prototype.clearFilters = function() {
    this.clearAllFilters();
};

// Inicializar sistema quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.properties-grid')) {
        window.propertySearch = new PropertySearchSystem();
        window.propertySearch.init();
    }
});

// Exportar para uso em outros scripts
window.PropertySearchSystem = PropertySearchSystem;