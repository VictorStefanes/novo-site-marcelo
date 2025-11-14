// ========================================
// SISTEMA FINAL DO DASHBOARD
// ========================================

class DashboardSystemFinal {
    constructor() {
        this.propertySystem = null;
        this.imageUpload = null;
        this.modal = null;
        this.form = null;
        this.init();
    }

    async init() {
        try {
            // Aguarda o DOM estar pronto
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initComponents());
            } else {
                this.initComponents();
            }
        } catch (error) {
            console.error('Erro ao inicializar dashboard:', error);
        }
    }

    initComponents() {
        // Inicializa elementos do DOM
        this.modal = document.getElementById('propertyModal');
        this.form = document.getElementById('propertyForm');
        
        if (!this.modal || !this.form) {
            console.error('Elementos do modal não encontrados');
            return;
        }

        // CRÍTICO: Adicionar atributo 'name' a todos os campos do formulário
        this.addNameAttributesToFormFields();

        // Inicializa sistemas
        this.initPropertySystem();
        this.initImageUpload();
        this.setupEventListeners();
        this.setupModalHandlers();
    }

    addNameAttributesToFormFields() {
        // Adiciona o atributo 'name' a todos os inputs, selects e textareas que têm 'id'
        const fields = this.form.querySelectorAll('input[id], select[id], textarea[id]');
        fields.forEach(field => {
            if (!field.hasAttribute('name')) {
                field.setAttribute('name', field.id);
                console.log(`✅ Atributo 'name' adicionado ao campo: ${field.id}`);
            }
        });
    }

    initPropertySystem() {
        if (typeof PropertySystemFinal !== 'undefined') {
            this.propertySystem = new PropertySystemFinal();
        } else {
            console.error('PropertySystemFinal não encontrado. Verifique se o script foi carregado.');
        }
    }

    initImageUpload() {
        if (typeof ImageUploadSystem !== 'undefined') {
            this.imageUpload = new ImageUploadSystem();
            console.log('✅ Sistema de upload de imagens inicializado');
        } else {
            console.error('❌ ImageUploadSystem não encontrado. Verifique se o script foi carregado.');
        }
    }

    setupEventListeners() {
        // Botão adicionar imóvel
        const addPropertyBtn = document.getElementById('addPropertyBtn');
        if (addPropertyBtn) {
            addPropertyBtn.addEventListener('click', () => this.openModal());
        }

        // Submit do formulário
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Botão fechar modal
        const closeBtn = this.modal?.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        // Campos condicionais
        this.setupConditionalFields();
    }

    setupModalHandlers() {
        // Fechar modal ao clicar fora
        window.addEventListener('click', (event) => {
            if (event.target === this.modal) {
                this.closeModal();
            }
        });

        // ESC para fechar modal
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.modal?.style.display === 'block') {
                this.closeModal();
            }
        });
    }

    setupConditionalFields() {
        // Campos que controlam outros campos
        const finalidadeSelect = document.getElementById('finalidade');
        const tipoSelect = document.getElementById('tipo');
        const categoriaSelect = document.getElementById('categoria');

        if (finalidadeSelect) {
            finalidadeSelect.addEventListener('change', () => this.updateConditionalFields());
        }
        if (tipoSelect) {
            tipoSelect.addEventListener('change', () => this.updateConditionalFields());
        }
        if (categoriaSelect) {
            categoriaSelect.addEventListener('change', () => this.updateConditionalFields());
        }

        // Executar uma vez para configurar estado inicial
        this.updateConditionalFields();
    }

    updateConditionalFields() {
        const finalidade = document.getElementById('finalidade')?.value;
        const categoria = document.getElementById('categoria')?.value;

        // Mostrar/ocultar campos específicos de lançamentos
        const lancamentosFields = document.querySelectorAll('.lancamentos-only');
        lancamentosFields.forEach(field => {
            field.style.display = categoria === 'lancamentos' ? 'block' : 'none';
        });

        // Mostrar/ocultar campos específicos de venda/aluguel
        const vendaFields = document.querySelectorAll('.venda-only');
        const aluguelFields = document.querySelectorAll('.aluguel-only');
        
        vendaFields.forEach(field => {
            field.style.display = finalidade === 'venda' ? 'block' : 'none';
        });
        
        aluguelFields.forEach(field => {
            field.style.display = finalidade === 'aluguel' ? 'block' : 'none';
        });
    }

    openModal() {
        if (this.modal) {
            this.modal.style.display = 'block';
            this.form?.reset();
            
            // Reset do sistema de upload
            if (this.imageUpload) {
                this.imageUpload.reset();
            }
            
            // Configurar campos condicionais
            this.updateConditionalFields();
        }
    }

    closeModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
            this.form?.reset();
            
            // Reset do sistema de upload
            if (this.imageUpload) {
                this.imageUpload.reset();
            }
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        console.log('📝 Formulário submetido!');
        
        if (!this.form) {
            console.error('❌ Formulário não encontrado');
            return;
        }

        try {
            // Mostrar loading
            this.showLoading(true);

            // Coletar dados do formulário
            const formData = new FormData(this.form);
            const rawData = Object.fromEntries(formData.entries());
            console.log('📋 Dados brutos do formulário:', rawData);

            // Mapear campos do formulário para estrutura do banco (inglês)
            const propertyData = {
                title: rawData.title,
                description: rawData.descricao || '',
                price: parseFloat(rawData.price),
                property_type: rawData.tipo,
                price_type: rawData.finalidade === 'Venda' ? 'sale' : rawData.finalidade === 'Aluguel' ? 'rent' : 'vacation',
                category: rawData.categoria,
                bedrooms: parseInt(rawData.quartos) || 0,
                bathrooms: parseInt(rawData.banheiros) || 0,
                parking_spaces: parseInt(rawData.vagas) || 0,
                area: parseFloat(rawData.area) || null,
                address: rawData.endereco,
                neighborhood: rawData.bairro,
                city: rawData.cidade || 'Maceió',
                state: rawData.estado || 'AL',
                status: rawData.status === 'disponivel' ? 'active' : rawData.status,
                highlight: rawData.destaque === 'true' || rawData.destaque === '1' ? 1 : 0,
                // Campos adicionais
                ano_construcao: parseInt(rawData.ano_construcao) || null,
                iptu_mensal: parseFloat(rawData.iptu_mensal) || null,
                condominio_mensal: parseFloat(rawData.condominio_mensal) || null,
                situacao_imovel: rawData.situacao_imovel,
                opcoes_financiamento: rawData.opcoes_financiamento,
                disponibilidade: rawData.disponibilidade,
                andamento_obra: rawData.andamento_obra,
                previsao_entrega: rawData.previsao_entrega,
                entrada_minima: parseFloat(rawData.entrada_minima) || null,
                video_url: rawData.video_url,
                virtual_tour_url: rawData.virtual_tour_url
            };

            // Adicionar imagens do sistema de upload
            if (this.imageUpload && this.imageUpload.selectedImages && this.imageUpload.selectedImages.length > 0) {
                propertyData.images = this.imageUpload.selectedImages;
                console.log('🖼️ Imagens anexadas:', propertyData.images.length);
            } else {
                propertyData.images = [];
                console.log('📷 Nenhuma imagem anexada');
            }

            // Processar características (converter para array)
            if (rawData.caracteristicas) {
                const caracteristicas = rawData.caracteristicas.split(',').map(c => c.trim()).filter(c => c);
                propertyData.features = caracteristicas;
            } else {
                propertyData.features = [];
            }

            console.log('📤 Enviando dados:', propertyData);

            // Validar campos obrigatórios
            if (!propertyData.title || !propertyData.price || !propertyData.property_type || !propertyData.category) {
                console.error('❌ Validação falhou - campos obrigatórios faltando:', {
                    title: propertyData.title,
                    price: propertyData.price,
                    property_type: propertyData.property_type,
                    category: propertyData.category
                });
                this.showError('Preencha todos os campos obrigatórios: Título, Preço, Tipo e Categoria');
                return;
            }

            // Enviar para a API
            const response = await this.submitProperty(propertyData);

            if (response && response.success) {
                this.showSuccess('Imóvel adicionado com sucesso!');
                this.form.reset();
                this.closeModal();
                
                // Recarregar propriedades se o sistema estiver disponível
                if (this.propertySystem && typeof this.propertySystem.loadProperties === 'function') {
                    setTimeout(() => this.propertySystem.loadProperties(), 500);
                }
            } else {
                this.showError(response?.message || 'Erro ao salvar imóvel');
            }

        } catch (error) {
            console.error('❌ ERRO CRÍTICO ao enviar formulário:', error);
            console.error('Stack trace:', error.stack);
            this.showError(`Erro interno: ${error.message}`);
        } finally {
            this.showLoading(false);
        }
    }

    async submitProperty(propertyData) {
        const token = localStorage.getItem('token');
        
        // Usar URL da API global configurada
        const baseURL = window.API_URL || 'http://localhost:3000';
        
        // Primeiro tenta com autenticação
        let endpoint = '/api/properties';
        let headers = {
            'Content-Type': 'application/json'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
            console.log('🔑 Usando autenticação');
        } else {
            // Se não tem token, usa endpoint de desenvolvimento
            endpoint = '/api/dev/properties';
            console.log('🔓 Usando endpoint de desenvolvimento (sem token)');
        }

        const fullURL = baseURL + endpoint;
        console.log('📡 URL completa:', fullURL);
        console.log('📦 Dados enviados:', propertyData);

        try {
            const response = await fetch(fullURL, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(propertyData)
            });

            console.log('📊 Status da resposta:', response.status, response.statusText);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Erro na resposta:', errorText);
                throw new Error(`Erro ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            console.log('✅ Resposta da API:', result);
            return result;

        } catch (error) {
            console.error('❌ Erro ao enviar propriedade:', error);
            throw error;
        }
    }

    showLoading(show) {
        const submitBtn = this.form?.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = show;
            submitBtn.textContent = show ? 'Salvando...' : 'Salvar Imóvel';
        }
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        // Remove notificação anterior se existir
        const existing = document.querySelector('.dashboard-notification');
        if (existing) {
            existing.remove();
        }

        // Criar nova notificação
        const notification = document.createElement('div');
        notification.className = `dashboard-notification ${type}`;
        notification.textContent = message;
        
        // Estilos
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '5px',
            color: 'white',
            fontSize: '14px',
            zIndex: '10001',
            minWidth: '250px',
            backgroundColor: type === 'success' ? '#4CAF50' : '#f44336'
        });

        document.body.appendChild(notification);

        // Auto-remover após 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
}

// Inicializar quando o script for carregado
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardSystem = new DashboardSystemFinal();
});

// Compatibilidade com scripts antigos
window.DashboardSystemFinal = DashboardSystemFinal;