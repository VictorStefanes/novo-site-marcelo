/**
 * CONFIGURAÇÃO DO SISTEMA IMOBILIÁRIO
 * Configurações centralizadas para fácil manutenção
 */

const SYSTEM_CONFIG = {
    // Configurações da API
    api: {
        baseUrl: '/api',
        endpoints: {
            properties: '/properties',
            highlights: '/properties/highlights',
            auth: '/auth',
            upload: '/upload'
        },
        timeout: 10000 // 10 segundos
    },

    // Configurações das categorias e mapeamento
    categories: {
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
            indexSection: null, // Não tem seção no index
            maxHighlights: 0,
            icon: '🏖️',
            color: '#16a085'
        }
    },

    // Configurações de UI
    ui: {
        notifications: {
            duration: 5000, // 5 segundos
            position: 'top-right'
        },
        animations: {
            cardHover: 300,
            slideTransition: 500
        },
        breakpoints: {
            mobile: 768,
            tablet: 1024,
            desktop: 1200
        }
    },

    // Configurações de imagens
    images: {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        thumbnailSize: { width: 400, height: 300 },
        placeholder: 'assets/images/placeholder.jpg'
    },

    // Configurações de formatação
    format: {
        currency: {
            locale: 'pt-BR',
            currency: 'BRL'
        },
        date: {
            locale: 'pt-BR',
            options: {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }
        }
    },

    // Mensagens do sistema
    messages: {
        success: {
            propertyAdded: 'Imóvel adicionado com sucesso!',
            propertyUpdated: 'Imóvel atualizado com sucesso!',
            propertyDeleted: 'Imóvel removido com sucesso!',
            imageUploaded: 'Imagem enviada com sucesso!'
        },
        error: {
            loadFailed: 'Erro ao carregar dados. Tente novamente.',
            saveFailed: 'Erro ao salvar. Verifique os dados e tente novamente.',
            uploadFailed: 'Erro no upload. Verifique o arquivo e tente novamente.',
            unauthorized: 'Acesso negado. Faça login novamente.',
            networkError: 'Erro de conexão. Verifique sua internet.'
        },
        info: {
            loading: 'Carregando...',
            uploading: 'Enviando imagem...',
            saving: 'Salvando...',
            empty: 'Nenhum imóvel encontrado'
        }
    },

    // Configurações de desenvolvimento
    development: {
        debug: true,
        mockData: false,
        apiDelay: 0 // Simular delay da API em ms
    }
};

// Função para obter configuração específica
window.getConfig = function(path) {
    return path.split('.').reduce((obj, key) => obj && obj[key], SYSTEM_CONFIG);
};

// Função para atualizar configuração
window.setConfig = function(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const obj = keys.reduce((obj, key) => obj[key], SYSTEM_CONFIG);
    if (obj) {
        obj[lastKey] = value;
    }
};

// Exporta configurações globalmente
window.SYSTEM_CONFIG = SYSTEM_CONFIG;

// Para uso em módulos Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SYSTEM_CONFIG;
}