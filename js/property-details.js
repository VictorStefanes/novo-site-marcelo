// ========================================
// SISTEMA DE DETALHES DO IMÓVEL
// ========================================

class PropertyDetailsSystem {
    constructor() {
        this.property = null;
        this.currentImageIndex = 0;
        this.images = [];
        this.init();
    }

    async init() {
        // Obter ID do imóvel da URL
        const urlParams = new URLSearchParams(window.location.search);
        const propertyId = urlParams.get('id');

        if (!propertyId) {
            this.showError();
            return;
        }

        await this.loadProperty(propertyId);
    }

    async loadProperty(id) {
        try {
            const response = await fetch(`${window.API_URL}/api/properties/${id}`);
            
            if (!response.ok) {
                throw new Error('Imóvel não encontrado');
            }

            this.property = await response.json();
            this.images = this.property.images && this.property.images.length > 0 ? 
                this.property.images : [{data: '/assets/images/property-placeholder.jpg'}];
            
            this.renderProperty();
            this.hideLoading();
            
        } catch (error) {
            console.error('Erro ao carregar imóvel:', error);
            this.showError();
        }
    }

    renderProperty() {
        // Título e meta
        document.title = `${this.property.title} - Corretor Marcelo`;
        document.getElementById('propertyTitle').textContent = this.property.title;
        document.getElementById('propertyCode').textContent = `Código: ${this.property.id}`;
        
        // Categoria
        const categoryElement = document.getElementById('propertyCategory');
        categoryElement.textContent = this.getCategoryName(this.property.category);
        
        // Breadcrumb
        document.getElementById('breadcrumbCategory').textContent = this.getCategoryName(this.property.category);
        document.getElementById('breadcrumbTitle').textContent = this.property.title;

        // Preço
        document.getElementById('propertyPrice').textContent = this.formatCurrency(this.property.price);
        document.getElementById('priceType').textContent = this.property.price_type === 'rent' ? 'Aluguel' : 'Venda';

        // Localização
        const location = `${this.property.neighborhood || ''}, ${this.property.city || 'João Pessoa'} - ${this.property.state || 'PB'}`;
        document.getElementById('propertyLocation').textContent = location;

        // Características principais
        document.getElementById('bedrooms').textContent = this.property.bedrooms || '0';
        document.getElementById('bathrooms').textContent = this.property.bathrooms || '0';
        document.getElementById('parkingSpaces').textContent = this.property.parking_spaces || '0';
        document.getElementById('area').textContent = this.property.area || '0';

        // Descrição
        document.getElementById('propertyDescription').innerHTML = 
            this.property.description ? 
            `<p>${this.property.description.replace(/\n/g, '</p><p>')}</p>` :
            '<p>Descrição não disponível.</p>';

        // Galeria de imagens
        this.renderGallery();

        // Características e comodidades
        this.renderFeatures();

        // Informações financeiras
        this.renderFinancialInfo();

        // Informações adicionais
        this.renderAdditionalInfo();

        // Vídeo e tour virtual
        this.renderMediaExtras();

        // Event listeners
        this.setupEventListeners();
    }

    renderGallery() {
        // Imagem principal
        const mainImage = document.getElementById('mainImage');
        mainImage.src = this.images[0].data || this.images[0].url;
        mainImage.alt = this.property.title;

        // Contador
        document.getElementById('imageCounter').textContent = `1 / ${this.images.length}`;

        // Miniaturas
        const thumbnailsContainer = document.getElementById('thumbnailsContainer');
        thumbnailsContainer.innerHTML = this.images.map((img, index) => {
            const imgSrc = img.data || img.url;
            return `
                <div class="thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}" onclick="propertyDetails.selectImage(${index})">
                    <img src="${imgSrc}" alt="${this.property.title} - Foto ${index + 1}">
                </div>
            `;
        }).join('');

        // Esconder botões se houver apenas 1 imagem
        if (this.images.length <= 1) {
            document.getElementById('prevImageBtn').style.display = 'none';
            document.getElementById('nextImageBtn').style.display = 'none';
        }
    }

    renderFeatures() {
        if (!this.property.features || this.property.features.length === 0) {
            return;
        }

        const featuresSection = document.getElementById('featuresSection');
        const featuresGrid = document.getElementById('featuresGrid');
        
        featuresGrid.innerHTML = this.property.features.map(feature => `
            <div class="feature-badge">
                <i class="fas fa-check-circle"></i>
                <span>${feature}</span>
            </div>
        `).join('');

        featuresSection.style.display = 'block';
    }

    renderFinancialInfo() {
        const financialInfo = document.getElementById('financialInfo');
        let hasFinancialInfo = false;

        // IPTU
        if (this.property.iptu_mensal) {
            document.getElementById('iptuValue').textContent = this.formatCurrency(this.property.iptu_mensal);
            document.getElementById('iptuItem').style.display = 'flex';
            hasFinancialInfo = true;
        }

        // Condomínio
        if (this.property.condominio_mensal) {
            document.getElementById('condominioValue').textContent = this.formatCurrency(this.property.condominio_mensal);
            document.getElementById('condominioItem').style.display = 'flex';
            hasFinancialInfo = true;
        }

        // Entrada mínima
        if (this.property.entrada_minima) {
            document.getElementById('entradaValue').textContent = this.formatCurrency(this.property.entrada_minima);
            document.getElementById('entradaItem').style.display = 'flex';
            hasFinancialInfo = true;
        }

        // Financiamento
        if (this.property.opcoes_financiamento) {
            document.getElementById('financiamentoValue').textContent = this.property.opcoes_financiamento;
            document.getElementById('financiamentoItem').style.display = 'flex';
            hasFinancialInfo = true;
        }

        if (hasFinancialInfo) {
            financialInfo.style.display = 'block';
        }
    }

    renderAdditionalInfo() {
        const additionalSection = document.getElementById('additionalInfoSection');
        let hasAdditionalInfo = false;

        // Ano de construção
        if (this.property.ano_construcao) {
            document.getElementById('anoValue').textContent = this.property.ano_construcao;
            document.getElementById('anoItem').style.display = 'flex';
            hasAdditionalInfo = true;
        }

        // Disponibilidade
        if (this.property.disponibilidade) {
            document.getElementById('disponibilidadeValue').textContent = this.property.disponibilidade;
            document.getElementById('disponibilidadeItem').style.display = 'flex';
            hasAdditionalInfo = true;
        }

        // Situação
        if (this.property.situacao_imovel) {
            document.getElementById('situacaoValue').textContent = this.property.situacao_imovel;
            document.getElementById('situacaoItem').style.display = 'flex';
            hasAdditionalInfo = true;
        }

        // Previsão de entrega
        if (this.property.previsao_entrega) {
            document.getElementById('previsaoValue').textContent = this.property.previsao_entrega;
            document.getElementById('previsaoItem').style.display = 'flex';
            hasAdditionalInfo = true;
        }

        // Andamento da obra
        if (this.property.andamento_obra) {
            document.getElementById('andamentoValue').textContent = this.property.andamento_obra;
            document.getElementById('andamentoItem').style.display = 'flex';
            hasAdditionalInfo = true;
        }

        if (hasAdditionalInfo) {
            additionalSection.style.display = 'block';
        }
    }

    renderMediaExtras() {
        const mediaExtras = document.getElementById('mediaExtras');
        let hasMedia = false;

        // Vídeo
        if (this.property.video_url) {
            const videoContainer = document.getElementById('videoContainer');
            const videoEmbed = document.getElementById('videoEmbed');
            
            // Extrair ID do YouTube
            const videoId = this.extractYouTubeId(this.property.video_url);
            if (videoId) {
                videoEmbed.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
                videoContainer.style.display = 'block';
                hasMedia = true;
            }
        }

        // Tour virtual
        if (this.property.virtual_tour_url) {
            const tourContainer = document.getElementById('virtualTourContainer');
            const tourEmbed = document.getElementById('virtualTourEmbed');
            
            tourEmbed.innerHTML = `<iframe src="${this.property.virtual_tour_url}" frameborder="0" allowfullscreen></iframe>`;
            tourContainer.style.display = 'block';
            hasMedia = true;
        }

        if (hasMedia) {
            mediaExtras.style.display = 'block';
        }
    }

    setupEventListeners() {
        // Navegação de imagens
        document.getElementById('prevImageBtn').addEventListener('click', () => this.prevImage());
        document.getElementById('nextImageBtn').addEventListener('click', () => this.nextImage());

        // Formulário de contato
        document.getElementById('contactForm').addEventListener('submit', (e) => this.handleContact(e));
    }

    selectImage(index) {
        this.currentImageIndex = index;
        
        // Atualizar imagem principal
        const mainImage = document.getElementById('mainImage');
        mainImage.src = this.images[index].data || this.images[index].url;
        
        // Atualizar contador
        document.getElementById('imageCounter').textContent = `${index + 1} / ${this.images.length}`;
        
        // Atualizar miniaturas
        document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
            thumb.classList.toggle('active', i === index);
        });
    }

    nextImage() {
        this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
        this.selectImage(this.currentImageIndex);
    }

    prevImage() {
        this.currentImageIndex = this.currentImageIndex === 0 ? 
            this.images.length - 1 : this.currentImageIndex - 1;
        this.selectImage(this.currentImageIndex);
    }

    handleContact(e) {
        e.preventDefault();
        
        const name = document.getElementById('clientName').value;
        const phone = document.getElementById('clientPhone').value;
        const customMessage = document.getElementById('clientMessage').value;
        
        const message = `Olá! Meu nome é ${name}.
        
Tenho interesse no imóvel:
📍 *${this.property.title}*
💰 ${this.formatCurrency(this.property.price)}
🏠 ${this.property.neighborhood}, ${this.property.city}

${customMessage ? `\nMensagem: ${customMessage}` : ''}

Aguardo retorno!`;

        const phoneNumber = '5582988780126';
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    }

    // Helpers
    getCategoryName(category) {
        const categories = {
            'lancamentos': 'Lançamentos',
            'beira-mar': 'Beira-Mar',
            'mais-procurados': 'Mais Procurados',
            'pronto-morar': 'Pronto para Morar'
        };
        return categories[category] || 'Imóveis';
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    }

    extractYouTubeId(url) {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    hideLoading() {
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('propertyContent').style.display = 'block';
    }

    showError() {
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('errorState').style.display = 'flex';
    }
}

// Funções globais
function shareProperty(platform) {
    const url = window.location.href;
    const title = document.getElementById('propertyTitle').textContent;
    const text = `Confira este imóvel: ${title}`;

    switch (platform) {
        case 'whatsapp':
            window.open(`https://wa.me/?text=${encodeURIComponent(text + ' - ' + url)}`, '_blank');
            break;
        case 'facebook':
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
            break;
        case 'twitter':
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
            break;
        case 'copy':
            navigator.clipboard.writeText(url).then(() => {
                alert('Link copiado para a área de transferência!');
            });
            break;
    }
}

// Inicializar
let propertyDetails;
document.addEventListener('DOMContentLoaded', () => {
    propertyDetails = new PropertyDetailsSystem();
});
