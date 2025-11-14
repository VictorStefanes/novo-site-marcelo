/* ========================================
   SISTEMA DE AUTENTICAÇÃO COM API
   Conecta com backend Node.js + SQLite
======================================== */

class AuthManager {
    constructor() {
        this.sessionKey = 'marceloImoveis_session';
        this.currentUser = null;
        this.apiUrl = (window.API_URL || 'http://localhost:3000') + '/api/auth';
        
        this.init();
    }

    init() {
        // Carregar usuário da sessão se existir
        this.loadUserFromSession();
        
        // Configurar eventos do formulário
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
    }

    // Carregar usuário da sessão existente
    loadUserFromSession() {
        const session = localStorage.getItem(this.sessionKey);
        if (session) {
            try {
                const sessionData = JSON.parse(session);
                const now = new Date().getTime();
                
                if (sessionData.expires > now) {
                    this.currentUser = sessionData.user;
                    console.log('✅ Sessão válida carregada:', this.currentUser.name);
                } else {
                    console.log('⏰ Sessão expirada, limpando...');
                    this.clearSession();
                }
            } catch (error) {
                console.log('❌ Erro ao carregar sessão:', error.message);
                this.clearSession();
            }
        }
    }

    // Processar login via API
    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email')?.value;
        const password = document.getElementById('password')?.value;
        
        if (!email || !password) {
            this.showMessage('Preencha todos os campos', 'error');
            return;
        }

        this.setLoading(true);
        
        try {
            const response = await fetch(`${this.apiUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                // Criar sessão local
                this.createSession(data.user, data.token);
                
                this.showMessage('✅ Login realizado com sucesso!', 'success');
                
                // Redirecionar
                setTimeout(() => {
                    this.redirectToDashboard();
                }, 1000);

            } else {
                this.showMessage(data.message, 'error');
            }

        } catch (error) {
            console.error('❌ Erro no login:', error);
            
            // Fallback para credenciais locais se API não estiver disponível
            const isValidLocal = await this.validateCredentialsLocal(email, password);
            if (isValidLocal) {
                this.showMessage('✅ Login realizado (modo offline)', 'success');
                setTimeout(() => {
                    this.redirectToDashboard();
                }, 1000);
            } else {
                this.showMessage('Erro de conexão. Verifique se o servidor está rodando.', 'error');
            }
        } finally {
            this.setLoading(false);
        }
    }

    // Validação local (fallback)
    async validateCredentialsLocal(email, password) {
        console.log('🔄 Usando validação local como fallback');
        
        const validCredentials = [
            { email: 'admin@marceloimoveis.com', password: 'admin123', name: 'Administrador', role: 'admin' },
            { email: 'marcelo@marceloimoveis.com', password: 'marcelo2024', name: 'Marcelo', role: 'owner' },
            { email: 'corretor@marceloimoveis.com', password: 'corretor123', name: 'Corretor', role: 'corretor' }
        ];
        
        const user = validCredentials.find(cred => 
            cred.email === email && cred.password === password
        );
        
        if (user) {
            this.createSession(user, 'LOCAL_TOKEN_' + Date.now());
            return true;
        }
        
        return false;
    }

    // Criar sessão do usuário
    createSession(userData, token = null) {
        const user = {
            id: userData.id || Date.now(),
            email: userData.email,
            name: userData.name,
            role: userData.role,
            loginTime: new Date().toISOString()
        };
        
        const session = {
            user: user,
            token: token || this.generateToken(),
            expires: new Date().getTime() + (24 * 60 * 60 * 1000), // 24 horas
            created: new Date().toISOString(),
            isValid: true
        };
        
        localStorage.setItem(this.sessionKey, JSON.stringify(session));
        this.currentUser = user;
        
        console.log('✅ Sessão criada para:', user.name);
    }

    // Gerar token simples
    generateToken() {
        return 'TOKEN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Redirecionar para dashboard
    redirectToDashboard() {
        if (window.location.pathname.includes('login.html')) {
            window.location.href = window.location.href.replace('login.html', 'dashboard.html');
        } else if (window.location.pathname.includes('register.html')) {
            window.location.href = window.location.href.replace('register.html', 'dashboard.html');
        } else {
            window.location.href = 'html/dashboard.html';
        }
    }

    // Limpar sessão
    clearSession() {
        localStorage.removeItem(this.sessionKey);
        this.currentUser = null;
    }

    // Fazer logout
    logout() {
        this.clearSession();
        this.redirectToLogin();
    }

    // Verificar se usuário está autenticado
    isAuthenticated() {
        return this.currentUser !== null;
    }

    // Obter usuário atual
    getCurrentUser() {
        return this.currentUser;
    }

    // Mostrar loading
    setLoading(loading) {
        const loginButton = document.getElementById('loginButton');
        const loadingOverlay = document.getElementById('loadingOverlay');
        
        if (loading) {
            if (loadingOverlay) loadingOverlay.style.display = 'flex';
            if (loginButton) {
                loginButton.disabled = true;
                loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
            }
        } else {
            if (loadingOverlay) loadingOverlay.style.display = 'none';
            if (loginButton) {
                loginButton.disabled = false;
                loginButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar';
            }
        }
    }

    // Mostrar mensagem
    showMessage(message, type = 'info') {
        const existingMessage = document.querySelector('.auth-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `auth-message auth-message-${type}`;
        messageDiv.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        const loginForm = document.getElementById('loginForm') || document.getElementById('registerForm');
        if (loginForm) {
            loginForm.parentNode.insertBefore(messageDiv, loginForm);
        }

        if (type !== 'success') {
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 5000);
        }
    }

    redirectToLogin() {
        if (window.location.pathname.includes('dashboard.html')) {
            window.location.href = window.location.href.replace('dashboard.html', 'login.html');
        } else {
            window.location.href = 'login.html';
        }
    }
}

// ========================================
// PROTEÇÃO DE ROTAS
// ========================================

class RouteProtection {
    constructor() {
        this.init();
    }

    init() {
        // Verificar autenticação apenas se estiver no dashboard
        if (window.location.pathname.includes('dashboard.html')) {
            this.checkAuthentication();
        }
    }

    checkAuthentication() {
        const session = localStorage.getItem('marceloImoveis_session');
        
        if (!session) {
            console.log('❌ Nenhuma sessão encontrada - redirecionando para login');
            this.redirectToLogin();
            return;
        }

        try {
            const sessionData = JSON.parse(session);
            const now = new Date().getTime();
            
            if (sessionData.expires && sessionData.expires <= now) {
                console.log('⏰ Sessão expirada - redirecionando para login');
                localStorage.removeItem('marceloImoveis_session');
                this.redirectToLogin();
                return;
            }

            console.log('✅ Sessão válida para:', sessionData.user?.name || 'Usuário');
            this.setupDashboardUser(sessionData.user);
            
        } catch (error) {
            console.log('❌ Erro ao validar sessão:', error.message);
            localStorage.removeItem('marceloImoveis_session');
            this.redirectToLogin();
        }
    }

    setupDashboardUser(user) {
        // Configurar nome do usuário
        setTimeout(() => {
            const userNameElement = document.querySelector('.user-name');
            if (userNameElement && user) {
                userNameElement.textContent = user.name;
            }
            
            // Configurar avatar baseado no papel
            const userAvatar = document.querySelector('.user-avatar');
            if (userAvatar && user) {
                if (user.role === 'admin') {
                    userAvatar.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
                    userAvatar.innerHTML = '<i class="fas fa-crown"></i>';
                } else if (user.role === 'owner') {
                    userAvatar.style.background = 'linear-gradient(135deg, #d4af37, #f4d03f)';
                    userAvatar.innerHTML = '<i class="fas fa-star"></i>';
                } else {
                    userAvatar.style.background = 'linear-gradient(135deg, #3498db, #2980b9)';
                    userAvatar.innerHTML = '<i class="fas fa-user"></i>';
                }
            }
        }, 100);
    }

    redirectToLogin() {
        if (window.location.pathname.includes('dashboard.html')) {
            window.location.href = window.location.href.replace('dashboard.html', 'login.html');
        } else {
            window.location.href = 'login.html';
        }
    }
}

// ========================================
// INICIALIZAÇÃO
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🔐 Sistema de autenticação inicializado');
    console.log('📍 Página atual:', window.location.pathname);
    
    // Inicializar manager de autenticação
    if (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html')) {
        window.authManager = new AuthManager();
    }
    
    // Inicializar proteção de rotas
    if (window.location.pathname.includes('dashboard.html')) {
        window.routeProtection = new RouteProtection();
    }
});