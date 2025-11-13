/* ========================================
   MODO DESENVOLVEDOR - BYPASS COMPLETO
======================================== */

// Configuração do modo desenvolvedor
const DEV_MODE = true; // Mude para false em produção

// Credenciais de desenvolvedor
const DEV_CREDENTIALS = {
    email: 'dev@marceloimoveis.com',
    password: 'dev123',
    name: 'Desenvolvedor',
    role: 'developer'
};

// Função para ativar modo desenvolvedor
function enableDevMode() {
    if (!DEV_MODE) return false;
    
    console.log('🔧 MODO DESENVOLVEDOR ATIVADO');
    console.log('👨‍💻 Acesso liberado para desenvolvedor');
    
    // Criar sessão de desenvolvedor automaticamente
    const session = {
        user: {
            email: DEV_CREDENTIALS.email,
            name: DEV_CREDENTIALS.name,
            role: DEV_CREDENTIALS.role,
            loginTime: new Date().toISOString()
        },
        expires: new Date().getTime() + (365 * 24 * 60 * 60 * 1000), // 1 ano
        token: 'DEV_TOKEN_' + Date.now(),
        isDeveloper: true
    };
    
    localStorage.setItem('marceloImoveis_session', JSON.stringify(session));
    
    // Configurar interface para desenvolvedor
    setTimeout(() => {
        const userNameElement = document.querySelector('.user-name');
        if (userNameElement) {
            userNameElement.textContent = '👨‍💻 Desenvolvedor';
            userNameElement.style.color = '#00ff00';
        }
        
        // Adicionar badge de desenvolvedor
        const userAvatar = document.querySelector('.user-avatar');
        if (userAvatar) {
            userAvatar.style.background = 'linear-gradient(135deg, #00ff00, #008800)';
            userAvatar.innerHTML = '<i class="fas fa-code"></i>';
        }
    }, 100);
    
    return true;
}

// Auto-ativar se estiver em modo dev
if (DEV_MODE) {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🚀 Sistema em MODO DESENVOLVEDOR');
        console.log('📧 Email dev: dev@marceloimoveis.com');
        console.log('🔑 Senha dev: dev123');
        
        // Se estiver no dashboard, ativar modo dev
        if (window.location.pathname.includes('dashboard.html')) {
            enableDevMode();
        }
        
        // Se estiver no login, adicionar opção de login dev
        if (window.location.pathname.includes('login.html')) {
            addDevLoginOption();
        }
    });
}

// Adicionar botão de login de desenvolvedor na tela de login
function addDevLoginOption() {
    setTimeout(() => {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            const devButton = document.createElement('button');
            devButton.type = 'button';
            devButton.className = 'dev-login-btn';
            devButton.innerHTML = '👨‍💻 Login Desenvolvedor';
            devButton.style.cssText = `
                width: 100%;
                padding: 0.75rem;
                background: linear-gradient(135deg, #00ff00, #008800);
                color: white;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                margin-top: 1rem;
                cursor: pointer;
                transition: all 0.3s ease;
            `;
            
            devButton.addEventListener('mouseover', () => {
                devButton.style.transform = 'translateY(-2px)';
                devButton.style.boxShadow = '0 4px 12px rgba(0, 255, 0, 0.3)';
            });
            
            devButton.addEventListener('mouseout', () => {
                devButton.style.transform = 'translateY(0)';
                devButton.style.boxShadow = 'none';
            });
            
            devButton.addEventListener('click', () => {
                console.log('🔧 Login de desenvolvedor ativado');
                enableDevMode();
                
                // Redirecionar para dashboard
                setTimeout(() => {
                    if (window.location.pathname.includes('login.html')) {
                        window.location.href = window.location.href.replace('login.html', 'dashboard.html');
                    }
                }, 500);
            });
            
            // Inserir após o botão de login normal
            const loginButton = document.getElementById('loginButton');
            if (loginButton) {
                loginButton.parentNode.insertBefore(devButton, loginButton.nextSibling);
            }
        }
    }, 1000);
}

// Modificar o sistema de autenticação para aceitar credenciais de dev
if (DEV_MODE && window.authManager) {
    const originalValidate = window.authManager.validateCredentials;
    window.authManager.validateCredentials = async function(email, password) {
        // Verificar se são credenciais de desenvolvedor
        if (email === DEV_CREDENTIALS.email && password === DEV_CREDENTIALS.password) {
            console.log('🔧 Credenciais de desenvolvedor aceitas');
            return true;
        }
        
        // Senão, usar validação normal
        return originalValidate.call(this, email, password);
    };
}

// Comando rápido para acesso de emergência
window.devAccess = function() {
    enableDevMode();
    if (window.location.pathname.includes('login.html')) {
        window.location.href = window.location.href.replace('login.html', 'dashboard.html');
    } else if (!window.location.pathname.includes('dashboard.html')) {
        window.location.href = 'html/dashboard.html';
    }
    console.log('🚀 Acesso de desenvolvedor ativado!');
};

// Exibir comandos de desenvolvedor
console.log('👨‍💻 COMANDOS DE DESENVOLVEDOR:');
console.log('🚀 devAccess() - Acesso direto ao dashboard');
console.log('🔧 enableDevMode() - Ativar modo desenvolvedor');
console.log('📧 Email: dev@marceloimoveis.com | Senha: dev123');