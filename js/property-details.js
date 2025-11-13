/* Property Details - Dynamic Loading System */

class PropertyDetailsSystem {
    constructor() {
        this.propertyId = null;
        this.propertyData = null;
        this.currentImageIndex = 0;
        this.images = [];
        
        this.init();
    }

    init() {
        // Extrair ID da URL
        this.propertyId = this.getPropertyIdFromUrl();
        
        if (!this.propertyId) {
            this.showError('ID do imóvel não encontrado na URL');
            return;
        }


        this.loadPropertyData();
    }

    getPropertyIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    async loadPropertyData() {
        try {
            // Por enquanto, vou usar dados mock
            // Em produção, isso seria uma chamada para API: /api/properties/${this.propertyId}
            const propertyData = await this.fetchPropertyData(this.propertyId);
            
            if (!propertyData) {
                this.showError('Imóvel não encontrado');
                return;
            }

            this.propertyData = propertyData;
            this.renderPropertyDetails();
            this.setupEventListeners();
            this.hideLoading();
            
        } catch (error) {
            this.showError('Erro ao carregar dados do imóvel');
        }
    }

    // MOCK DATA - Em produção, isso seria uma chamada para API
    async fetchPropertyData(propertyId) {
        // Simular delay da API
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Base de dados mock expandida com IDs únicos (compatível com property-search.js)
        const mockProperties = {
            'IMV_001': {
                id: 'IMV_001',
                title: 'Apartamento Luxo Vista Mar',
                category: 'Beira Mar',
                categorySlug: 'beira-mar',
                price: 850000,
                address: {
                    street: 'Av. Dr. Antônio Gouveia, 123',
                    neighborhood: 'Pajuçara',
                    city: 'Maceió',
                    state: 'AL',
                    zipcode: '57030-170',
                    coordinates: {
                        lat: -9.6658,
                        lng: -35.7089
                    }
                },
                characteristics: {
                    bedrooms: 3,
                    bathrooms: 2,
                    area: 120,
                    parking: 2,
                    furnished: true,
                    floor: 15,
                    building_floors: 20,
                    elevator: true,
                    balcony: true,
                    sea_view: true
                },
                description: `Apartamento luxuoso com vista panorâmica para o mar de Pajuçara. 
                
                Este imóvel excepcional oferece acabamentos de primeira qualidade, com pisos em porcelanato, cozinha planejada com bancada em granito, suíte master com closet e hidromassagem.
                
                O prédio conta com área de lazer completa incluindo piscina, churrasqueira, playground, salão de festas e academia. Localização privilegiada a poucos metros da praia, próximo a restaurantes, shopping e pontos turísticos.
                
                Ideal para quem busca qualidade de vida e valorização do investimento.`,
                images: [
                    'https://via.placeholder.com/800x600/667eea/ffffff?text=Vista+Mar+1',
                    'https://via.placeholder.com/800x600/764ba2/ffffff?text=Vista+Mar+2',
                    'https://via.placeholder.com/800x600/667eea/ffffff?text=Vista+Mar+3',
                    'https://via.placeholder.com/800x600/764ba2/ffffff?text=Vista+Mar+4',
                    'https://via.placeholder.com/800x600/667eea/ffffff?text=Vista+Mar+5'
                ],
                agent: {
                    name: 'Marcelo Augusto',
                    phone: '5582988780126',
                    email: 'marcelo@marceloimoveis.com'
                },
                features: [
                    'Vista para o mar',
                    'Piscina no prédio',
                    'Academia',
                    'Salão de festas',
                    'Playground',
                    'Portaria 24h',
                    'Elevador',
                    'Varanda'
                ],
                status: 'available'
            },
            'IMV_002': {
                id: 'IMV_002',
                title: 'Casa Moderna Condomínio Fechado',
                category: 'Lançamentos',
                categorySlug: 'lancamentos',
                price: 450000,
                address: {
                    street: 'Rua das Palmeiras, 456',
                    neighborhood: 'Cidade Universitária',
                    city: 'Maceió',
                    state: 'AL',
                    zipcode: '57073-090',
                    coordinates: {
                        lat: -9.5408,
                        lng: -35.7695
                    }
                },
                characteristics: {
                    bedrooms: 3,
                    bathrooms: 3,
                    area: 150,
                    parking: 2,
                    furnished: false,
                    floors: 2,
                    yard: true,
                    pool: false,
                    gourmet_area: true
                },
                description: `Casa moderna em condomínio fechado, projeto arquitetônico contemporâneo com amplos espaços e muita iluminação natural.
                
                A residência conta com sala de estar integrada, cozinha americana, área gourmet, 3 quartos sendo 1 suíte, quintal privativo e 2 vagas de garagem cobertas.
                
                O condomínio oferece segurança 24h, área verde, playground e quadra poliesportiva. Localização estratégica próxima a universidades, supermercados e principais vias de acesso.
                
                Excelente opção para famílias que buscam conforto e segurança.`,
                images: [
                    'https://via.placeholder.com/800x600/28a745/ffffff?text=Casa+Moderna+1',
                    'https://via.placeholder.com/800x600/17a2b8/ffffff?text=Casa+Moderna+2',
                    'https://via.placeholder.com/800x600/28a745/ffffff?text=Casa+Moderna+3',
                    'https://via.placeholder.com/800x600/17a2b8/ffffff?text=Casa+Moderna+4'
                ],
                agent: {
                    name: 'Marcelo Augusto',
                    phone: '5582988780126',
                    email: 'marcelo@marceloimoveis.com'
                },
                features: [
                    'Condomínio fechado',
                    'Área gourmet',
                    'Quintal privativo',
                    'Segurança 24h',
                    'Playground',
                    'Quadra poliesportiva',
                    'Garagem coberta',
                    'Projeto moderno'
                ],
                status: 'available'
            },
            'IMV_003': {
                id: 'IMV_003',
                title: 'Apartamento Centro Histórico',
                category: 'Mais Procurados',
                categorySlug: 'mais-procurados',
                price: 280000,
                address: {
                    street: 'Rua do Comércio, 789',
                    neighborhood: 'Centro',
                    city: 'Maceió',
                    state: 'AL',
                    zipcode: '57020-000',
                    coordinates: {
                        lat: -9.6658,
                        lng: -35.7353
                    }
                },
                characteristics: {
                    bedrooms: 2,
                    bathrooms: 1,
                    area: 85,
                    parking: 1,
                    furnished: false,
                    floor: 3,
                    building_floors: 5,
                    elevator: false,
                    balcony: true,
                    historic: true
                },
                description: `Apartamento charmoso no coração do centro histórico de Maceió, com arquitetura preservada e localização privilegiada.
                
                O imóvel possui pé-direito alto, grandes janelas com vista para ruas históricas, piso original restaurado e detalhes arquitetônicos únicos que remetem à época colonial.
                
                Localizado próximo aos principais pontos turísticos, museus, teatros, restaurantes e ao mercado central. Acesso fácil ao transporte público e a poucos minutos da orla.
                
                Perfeito para quem aprecia história, cultura e quer viver no centro da cidade.`,
                images: [
                    'https://via.placeholder.com/800x600/dc3545/ffffff?text=Centro+Historico+1',
                    'https://via.placeholder.com/800x600/ffc107/000000?text=Centro+Historico+2',
                    'https://via.placeholder.com/800x600/dc3545/ffffff?text=Centro+Historico+3'
                ],
                agent: {
                    name: 'Marcelo Augusto',
                    phone: '5582988780126',
                    email: 'marcelo@marceloimoveis.com'
                },
                features: [
                    'Centro histórico',
                    'Arquitetura preservada',
                    'Pé-direito alto',
                    'Próximo a museus',
                    'Transporte público',
                    'Comércio local',
                    'Vista histórica',
                    'Localização central'
                ],
                status: 'available'
            }
        };

        return mockProperties[propertyId] || null;
    }

    renderPropertyDetails() {
        // Atualizar título da página e meta tags
        this.updatePageMeta();
        
        // Renderizar header do imóvel
        this.renderPropertyHeader();
        
        // Renderizar galeria de imagens
        this.renderGallery();
        
        // Renderizar características
        this.renderCharacteristics();
        
        // Renderizar descrição
        this.renderDescription();
        
        // Renderizar informações de localização
        this.renderLocationInfo();
        
        // Configurar formulário de contato
        this.setupContactForm();
        
        // Renderizar breadcrumb
        this.renderBreadcrumb();
        
        // Configurar botões de compartilhamento
        this.setupSocialShare();
        
        // Carregar imóveis similares
        this.loadSimilarProperties();
    }

    updatePageMeta() {
        const { title, description, images, category, address } = this.propertyData;
        
        // Título da página
        document.getElementById('propertyTitle').textContent = `${title} - Marcelo Imóveis`;
        document.title = `${title} - Marcelo Imóveis`;
        
        // Meta description
        const metaDesc = `${title} em ${address.neighborhood}, ${address.city}. ${description.substring(0, 160)}...`;
        document.getElementById('propertyDescription').setAttribute('content', metaDesc);
        
        // Meta keywords
        const keywords = `${title}, ${category}, ${address.neighborhood}, ${address.city}, imóvel, venda, Marcelo Imóveis`;
        document.getElementById('propertyKeywords').setAttribute('content', keywords);
        
        // Open Graph tags
        const currentUrl = window.location.href;
        document.getElementById('ogTitle').setAttribute('content', title);
        document.getElementById('ogDescription').setAttribute('content', metaDesc);
        document.getElementById('ogImage').setAttribute('content', images[0]);
        document.getElementById('ogUrl').setAttribute('content', currentUrl);
    }

    renderPropertyHeader() {
        const { title, price, category, address, id } = this.propertyData;
        
        document.getElementById('propertyMainTitle').textContent = title;
        document.getElementById('propertyAddress').textContent = 
            `${address.street}, ${address.neighborhood} - ${address.city}/${address.state}`;
        document.getElementById('propertyCode').textContent = id;
        document.getElementById('propertyPrice').textContent = 
            `R$ ${price.toLocaleString('pt-BR')}`;
        document.getElementById('propertyCategory').textContent = category;
    }

    renderGallery() {
        const { images, title } = this.propertyData;
        this.images = images;
        
        if (images.length === 0) {
            // Usar imagem placeholder se não houver imagens
            this.images = ['../assets/images/placeholder-property.jpg'];
        }
        
        // Definir imagem principal
        const mainImage = document.getElementById('mainImage');
        mainImage.src = this.images[0];
        mainImage.alt = title;
        
        // Renderizar thumbnails
        this.renderThumbnails();
        
        // Atualizar contador
        this.updateImageCounter();
    }

    renderThumbnails() {
        const thumbnailGallery = document.getElementById('thumbnailGallery');
        thumbnailGallery.innerHTML = '';
        
        this.images.forEach((image, index) => {
            const thumbnail = document.createElement('img');
            thumbnail.src = image;
            thumbnail.alt = `${this.propertyData.title} - Foto ${index + 1}`;
            thumbnail.className = `thumbnail ${index === 0 ? 'active' : ''}`;
            thumbnail.addEventListener('click', () => this.changeImage(index));
            
            thumbnailGallery.appendChild(thumbnail);
        });
    }

    changeImage(index) {
        this.currentImageIndex = index;
        
        // Atualizar imagem principal
        const mainImage = document.getElementById('mainImage');
        mainImage.src = this.images[index];
        
        // Atualizar thumbnails ativos
        document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
            thumb.classList.toggle('active', i === index);
        });
        
        // Atualizar contador
        this.updateImageCounter();
    }

    updateImageCounter() {
        document.getElementById('imageCounter').textContent = 
            `${this.currentImageIndex + 1} / ${this.images.length}`;
    }

    renderCharacteristics() {
        const { characteristics } = this.propertyData;
        const container = document.getElementById('propertyCharacteristics');
        container.innerHTML = '';
        
        const characteristicMap = {
            bedrooms: { icon: 'bed', label: 'Quartos', suffix: '' },
            bathrooms: { icon: 'bath', label: 'Banheiros', suffix: '' },
            area: { icon: 'ruler-combined', label: 'Área', suffix: ' m²' },
            parking: { icon: 'car', label: 'Vagas', suffix: '' },
            floor: { icon: 'building', label: 'Andar', suffix: 'º' },
            building_floors: { icon: 'city', label: 'Andares do Prédio', suffix: '' },
            floors: { icon: 'layer-group', label: 'Pavimentos', suffix: '' }
        };
        
        // Características booleanas
        const booleanFeatures = {
            furnished: { icon: 'couch', label: 'Mobiliado' },
            elevator: { icon: 'elevator', label: 'Elevador' },
            balcony: { icon: 'balcony', label: 'Varanda' },
            sea_view: { icon: 'water', label: 'Vista Mar' },
            yard: { icon: 'tree', label: 'Quintal' },
            pool: { icon: 'swimming-pool', label: 'Piscina' },
            gourmet_area: { icon: 'utensils', label: 'Área Gourmet' },
            historic: { icon: 'landmark', label: 'Histórico' }
        };
        
        // Renderizar características numéricas
        Object.entries(characteristics).forEach(([key, value]) => {
            if (characteristicMap[key] && value) {
                const item = this.createCharacteristicItem(
                    characteristicMap[key].icon,
                    characteristicMap[key].label,
                    value + characteristicMap[key].suffix
                );
                container.appendChild(item);
            }
        });
        
        // Renderizar características booleanas (true)
        Object.entries(characteristics).forEach(([key, value]) => {
            if (booleanFeatures[key] && value === true) {
                const item = this.createCharacteristicItem(
                    booleanFeatures[key].icon,
                    booleanFeatures[key].label,
                    'Sim'
                );
                container.appendChild(item);
            }
        });
    }

    createCharacteristicItem(icon, label, value) {
        const item = document.createElement('div');
        item.className = 'characteristic-item';
        
        item.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <div class="characteristic-content">
                <span class="label">${label}</span>
                <span class="value">${value}</span>
            </div>
        `;
        
        return item;
    }

    renderDescription() {
        const { description } = this.propertyData;
        const container = document.getElementById('propertyFullDescription');
        
        // Converter quebras de linha em parágrafos
        const paragraphs = description.split('\n\n').filter(p => p.trim());
        container.innerHTML = paragraphs.map(p => `<p>${p.trim()}</p>`).join('');
    }

    renderLocationInfo() {
        const { address } = this.propertyData;
        const container = document.getElementById('addressInfo');
        
        container.innerHTML = `
            <div class="address-item">
                <i class="fas fa-map-marker-alt"></i>
                <span><strong>Endereço:</strong> ${address.street}</span>
            </div>
            <div class="address-item">
                <i class="fas fa-home"></i>
                <span><strong>Bairro:</strong> ${address.neighborhood}</span>
            </div>
            <div class="address-item">
                <i class="fas fa-city"></i>
                <span><strong>Cidade:</strong> ${address.city}/${address.state}</span>
            </div>
            <div class="address-item">
                <i class="fas fa-mail-bulk"></i>
                <span><strong>CEP:</strong> ${address.zipcode}</span>
            </div>
        `;
        
        // Carregar mapa (placeholder por enquanto)
        this.loadMap();
    }

    loadMap() {
        const mapContainer = document.getElementById('mapContainer');
        const { coordinates } = this.propertyData.address;
        
        // Por enquanto, apenas um placeholder
        // Em produção, integraria com Google Maps ou Leaflet
        mapContainer.innerHTML = `
            <div class="map-placeholder">
                <i class="fas fa-map"></i>
                <p>Mapa será carregado aqui</p>
                <small>Lat: ${coordinates.lat}, Lng: ${coordinates.lng}</small>
            </div>
        `;
    }

    renderBreadcrumb() {
        const { category, categorySlug, title } = this.propertyData;
        
        document.getElementById('categoryBreadcrumb').innerHTML = 
            `<a href="${categorySlug}.html">${category}</a>`;
        document.getElementById('propertyBreadcrumb').textContent = 
            title.length > 30 ? title.substring(0, 30) + '...' : title;
    }

    setupContactForm() {
        const { title, id, agent } = this.propertyData;
        
        // Pré-preencher mensagem
        const messageField = document.getElementById('clientMessage');
        messageField.placeholder = `Tenho interesse no imóvel ${title} (Código: ${id}). Gostaria de mais informações.`;
        
        // Configurar botões de contato rápido
        this.setupQuickContact();
    }

    setupQuickContact() {
        const { agent, title, id } = this.propertyData;
        const currentUrl = window.location.href;
        
        // WhatsApp
        document.getElementById('whatsappContact').addEventListener('click', () => {
            const message = `Olá! Tenho interesse no imóvel "${title}" (${id}). Gostaria de mais informações. ${currentUrl}`;
            const url = `https://wa.me/${agent.phone}?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
        });
        
        // Ligação
        document.getElementById('phoneContact').addEventListener('click', () => {
            window.location.href = `tel:+${agent.phone}`;
        });
    }

    setupSocialShare() {
        const { title } = this.propertyData;
        const currentUrl = window.location.href;
        const shareText = `Confira este imóvel: ${title}`;
        
        // WhatsApp
        document.getElementById('shareWhatsApp').addEventListener('click', () => {
            const url = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${currentUrl}`)}`;
            window.open(url, '_blank');
        });
        
        // Facebook
        document.getElementById('shareFacebook').addEventListener('click', () => {
            const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
            window.open(url, '_blank');
        });
        
        // Twitter
        document.getElementById('shareTwitter').addEventListener('click', () => {
            const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`;
            window.open(url, '_blank');
        });
        
        // Copiar link
        document.getElementById('shareLink').addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(currentUrl);
                alert('Link copiado para a área de transferência!');
            } catch (err) {
                // Fallback para navegadores mais antigos
                const textArea = document.createElement('textarea');
                textArea.value = currentUrl;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                alert('Link copiado para a área de transferência!');
            }
        });
    }

    setupEventListeners() {
        // Navegação da galeria
        document.getElementById('prevImage').addEventListener('click', () => {
            const newIndex = this.currentImageIndex > 0 ? 
                this.currentImageIndex - 1 : this.images.length - 1;
            this.changeImage(newIndex);
        });
        
        document.getElementById('nextImage').addEventListener('click', () => {
            const newIndex = this.currentImageIndex < this.images.length - 1 ? 
                this.currentImageIndex + 1 : 0;
            this.changeImage(newIndex);
        });
        
        // Formulário de contato
        document.getElementById('propertyContactForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleContactSubmit(e);
        });
        
        // Navegação por teclado na galeria
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                document.getElementById('prevImage').click();
            } else if (e.key === 'ArrowRight') {
                document.getElementById('nextImage').click();
            }
        });
    }

    handleContactSubmit(event) {
        const formData = new FormData(event.target);
        const contactData = {
            propertyId: this.propertyId,
            propertyTitle: this.propertyData.title,
            name: formData.get('name'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            message: formData.get('message') || `Interesse no imóvel ${this.propertyData.title} (${this.propertyId})`
        };
        
        // Em produção enviaria para API
        
        // Simular envio
        const submitBtn = document.getElementById('propertyContactForm').querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
            event.target.reset();
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 2000);
    }

    loadSimilarProperties() {
        // Por enquanto, apenas placeholder
        const container = document.getElementById('similarProperties');
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #6c757d;">
                <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>Carregando imóveis similares...</p>
            </div>
        `;
        
        // Em produção, faria chamada para API para buscar imóveis similares
        // baseado na categoria, preço e localização
    }

    hideLoading() {
        document.getElementById('loadingScreen').style.display = 'none';
        document.getElementById('propertyContent').style.display = 'block';
        
        // Adicionar animações
        document.getElementById('propertyContent').classList.add('fade-in');
    }

    showError(message) {
        document.getElementById('loadingScreen').style.display = 'none';
        document.getElementById('errorScreen').style.display = 'flex';
        
        const errorContent = document.querySelector('.error-content p');
        if (errorContent) {
            errorContent.textContent = message;
        }
    }
}

// Inicializar quando DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    window.propertyDetailsSystem = new PropertyDetailsSystem();
});

// Exportar para uso global
window.PropertyDetailsSystem = PropertyDetailsSystem;