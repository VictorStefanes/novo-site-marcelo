// ========================================
// CONFIGURAÇÃO DE AMBIENTE
// ========================================

// Detectar se está em desenvolvimento ou produção
const isDevelopment = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname === '192.168.1.1';

// URL da API baseada no ambiente
const API_URL = isDevelopment 
    ? 'http://localhost:3000'  // Desenvolvimento local
    : 'https://marcelo-imoveis-api.onrender.com';  // Produção (ATUALIZAR COM SUA URL DO RENDER)

// Configuração de debug
const DEBUG_MODE = isDevelopment;

// Exportar para uso global
window.API_URL = API_URL;
window.DEBUG_MODE = DEBUG_MODE;

// Log de configuração
if (DEBUG_MODE) {
    console.log('🔧 Ambiente:', isDevelopment ? 'Desenvolvimento' : 'Produção');
    console.log('🌐 API URL:', API_URL);
}

// Helper para fazer requisições autenticadas
window.authFetch = async function(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };
    
    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(`${API_URL}${endpoint}`, mergedOptions);
        
        // Se não autorizado, redirecionar para login
        if (response.status === 401 && !endpoint.includes('/auth/')) {
            localStorage.removeItem('token');
            window.location.href = '/html/dashboard.html';
        }
        
        return response;
    } catch (error) {
        if (DEBUG_MODE) {
            console.error('❌ Erro na requisição:', error);
        }
        throw error;
    }
};

// Helper para formatar valores
window.formatCurrency = function(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
};

window.formatNumber = function(value) {
    return new Intl.NumberFormat('pt-BR').format(value);
};
