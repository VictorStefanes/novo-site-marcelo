/* Login System */

class AuthSystem {
    constructor() {
        this.init();
        this.setupEventListeners();
        this.loadStoredCredentials();
    }

    init() {
        // Configurações da API (futuro backend)
        this.apiConfig = {
            baseUrl: 'http://localhost:3000/api', // URL do futuro backend
            endpoints: {
                login: '/auth/login',
                logout: '/auth/logout',
                verify: '/auth/verify',
                resetPassword: '/auth/reset-password'
            }
        };

        // Estado do sistema
        this.isLoading = false;
        this.rememberMe = false;
        
    
    }

    setupEventListeners() {
        // Form submission
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Password toggle
        const passwordToggle = document.getElementById('passwordToggle');
        if (passwordToggle) {
            passwordToggle.addEventListener('click', () => this.togglePassword());
        }

        // Real-time validation
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        
        if (emailInput) {
            emailInput.addEventListener('blur', () => this.validateEmail());
            emailInput.addEventListener('input', () => this.clearError('email'));
        }
        
        if (passwordInput) {
            passwordInput.addEventListener('blur', () => this.validatePassword());
            passwordInput.addEventListener('input', () => this.clearError('password'));
        }

        // Remember me checkbox
        const rememberMeCheckbox = document.getElementById('rememberMe');
        if (rememberMeCheckbox) {
            rememberMeCheckbox.addEventListener('change', (e) => {
                this.rememberMe = e.target.checked;
            });
        }

        // Forgot password link
        const forgotPasswordLink = document.getElementById('forgotPasswordLink');
        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', (e) => this.handleForgotPassword(e));
        }

        // Support link
        const supportLink = document.getElementById('supportLink');
        if (supportLink) {
            supportLink.addEventListener('click', (e) => this.handleSupport(e));
        }
    }

    // Validation Methods

    validateEmail() {
        const emailInput = document.getElementById('email');
        const email = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) {
            this.showError('email', 'E-mail é obrigatório');
            return false;
        }

        if (!emailRegex.test(email)) {
            this.showError('email', 'Formato de e-mail inválido');
            return false;
        }

        this.showSuccess('email');
        return true;
    }

    validatePassword() {
        const passwordInput = document.getElementById('password');
        const password = passwordInput.value;

        if (!password) {
            this.showError('password', 'Senha é obrigatória');
            return false;
        }

        if (password.length < 6) {
            this.showError('password', 'Senha deve ter pelo menos 6 caracteres');
            return false;
        }

        this.showSuccess('password');
        return true;
    }

    validateForm() {
        const emailValid = this.validateEmail();
        const passwordValid = this.validatePassword();
        return emailValid && passwordValid;
    }

    // UI Methods

    showError(field, message) {
        const input = document.getElementById(field);
        const errorElement = document.getElementById(`${field}Error`);
        
        if (input) {
            input.classList.remove('success');
            input.classList.add('error');
        }
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    }

    showSuccess(field) {
        const input = document.getElementById(field);
        const errorElement = document.getElementById(`${field}Error`);
        
        if (input) {
            input.classList.remove('error');
            input.classList.add('success');
        }
        
        if (errorElement) {
            errorElement.classList.remove('show');
        }
    }

    clearError(field) {
        const input = document.getElementById(field);
        const errorElement = document.getElementById(`${field}Error`);
        
        if (input) {
            input.classList.remove('error', 'success');
        }
        
        if (errorElement) {
            errorElement.classList.remove('show');
        }
    }

    showFormMessage(message, type = 'error') {
        const messageElement = document.getElementById('formMessage');
        if (messageElement) {
            messageElement.textContent = message;
            messageElement.className = `form-message ${type}`;
            messageElement.style.display = 'block';
            
            // Auto hide after 5 seconds
            setTimeout(() => {
                messageElement.style.display = 'none';
            }, 5000);
        }
    }

    togglePassword() {
        const passwordInput = document.getElementById('password');
        const toggleButton = document.getElementById('passwordToggle');
        const icon = toggleButton.querySelector('i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            passwordInput.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }

    setLoading(loading) {
        this.isLoading = loading;
        const loginButton = document.getElementById('loginButton');
        const buttonText = loginButton.querySelector('.button-text');
        const buttonLoading = loginButton.querySelector('.button-loading');
        const loadingOverlay = document.getElementById('loadingOverlay');
        
        if (loading) {
            loginButton.disabled = true;
            buttonText.style.display = 'none';
            buttonLoading.style.display = 'flex';
            loadingOverlay.style.display = 'flex';
        } else {
            loginButton.disabled = false;
            buttonText.style.display = 'block';
            buttonLoading.style.display = 'none';
            loadingOverlay.style.display = 'none';
        }
    }

    // Authentication Methods

    async handleLogin(event) {
        event.preventDefault();
        
        if (this.isLoading) return;
        
        if (!this.validateForm()) {
            this.showFormMessage('Por favor, corrija os erros antes de continuar', 'error');
            return;
        }

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        this.setLoading(true);
        
        try {
            // DESENVOLVIMENTO: Login mock para testes
            const loginResult = await this.mockLogin(email, password);
            
            if (loginResult.success) {
                this.handleLoginSuccess(loginResult.user, loginResult.token);
            } else {
                this.handleLoginError(loginResult.message);
            }
        } catch (error) {
            console.error('Erro no login:', error);
            this.handleLoginError('Erro interno do servidor. Tente novamente.');
        } finally {
            this.setLoading(false);
        }
    }

    // MOCK LOGIN - Remover quando integrar com backend real
    async mockLogin(email, password) {
        // Simular delay da API
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Credenciais de desenvolvimento
        const validCredentials = [
            { email: 'admin@marceloimoveis.com', password: 'admin123', role: 'admin' },
            { email: 'corretor@marceloimoveis.com', password: 'corretor123', role: 'agent' },
            { email: 'demo@marceloimoveis.com', password: 'demo123', role: 'demo' }
        ];
        
        const user = validCredentials.find(cred => 
            cred.email === email && cred.password === password
        );
        
        if (user) {
            return {
                success: true,
                user: {
                    id: Math.floor(Math.random() * 1000),
                    email: user.email,
                    name: user.email.split('@')[0],
                    role: user.role
                },
                token: 'mock_jwt_token_' + Date.now()
            };
        } else {
            return {
                success: false,
                message: 'E-mail ou senha incorretos'
            };
        }
    }

    // MÉTODO PARA INTEGRAÇÃO FUTURA COM BACKEND REAL
    async realLogin(email, password) {
        const response = await fetch(`${this.apiConfig.baseUrl}${this.apiConfig.endpoints.login}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password,
                rememberMe: this.rememberMe
            })
        });

        if (!response.ok) {
            throw new Error('Erro na requisição de login');
        }

        return await response.json();
    }

    handleLoginSuccess(user, token) {
        
        // Salvar dados do usuário
        this.saveUserSession(user, token);
        
        // Mostrar mensagem de sucesso
        this.showFormMessage('Login realizado com sucesso! Redirecionando...', 'success');
        
        // Preparar redirecionamento para dashboard
        setTimeout(() => {
            this.redirectToDashboard(user.role);
        }, 1500);
    }

    handleLoginError(message) {
        this.showFormMessage(message, 'error');
        
        // Limpar campos sensíveis
        document.getElementById('password').value = '';
        document.getElementById('password').focus();
    }

    saveUserSession(user, token) {
        const sessionData = {
            user,
            token,
            loginTime: new Date().toISOString(),
            expiresAt: new Date(Date.now() + (this.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)).toISOString()
        };

        if (this.rememberMe) {
            localStorage.setItem('marceloImoveisAuth', JSON.stringify(sessionData));
            localStorage.setItem('marceloImoveisRemember', document.getElementById('email').value);
        } else {
            sessionStorage.setItem('marceloImoveisAuth', JSON.stringify(sessionData));
        }
    }

    loadStoredCredentials() {
        const rememberedEmail = localStorage.getItem('marceloImoveisRemember');
        if (rememberedEmail) {
            document.getElementById('email').value = rememberedEmail;
            document.getElementById('rememberMe').checked = true;
            this.rememberMe = true;
        }
    }

    redirectToDashboard(userRole = 'agent') {
        // URLs para diferentes tipos de dashboard baseado no role
        const dashboardUrls = {
            admin: '/dashboard/admin.html',
            agent: '/dashboard/index.html',
            demo: '/dashboard/demo.html'
        };

        const targetUrl = dashboardUrls[userRole] || dashboardUrls.agent;
        
        // Para desenvolvimento, redirecionamos para uma página placeholder
        window.location.href = '../index.html?dashboard=true&role=' + userRole;
        
        // Em produção, será: window.location.href = targetUrl;
    }

    // Utility Methods

    handleForgotPassword(event) {
        event.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        
        if (!email) {
            this.showFormMessage('Digite seu e-mail para recuperar a senha', 'error');
            document.getElementById('email').focus();
            return;
        }

        if (!this.validateEmail()) {
            return;
        }

        // Mock para desenvolvimento
        this.showFormMessage('Instruções de recuperação enviadas para seu e-mail!', 'success');
        
        // Em produção, faria uma requisição para o backend
        // this.sendPasswordResetEmail(email);
    }

    handleSupport(event) {
        event.preventDefault();
        
        const message = 'Olá! Preciso de ajuda para acessar o sistema administrativo.';
        const phoneNumber = '5582988780126';
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    }

    // Método para verificar se usuário está logado (útil para outras páginas)
    static isAuthenticated() {
        const sessionAuth = sessionStorage.getItem('marceloImoveisAuth');
        const localAuth = localStorage.getItem('marceloImoveisAuth');
        
        const authData = sessionAuth || localAuth;
        
        if (!authData) return false;
        
        try {
            const parsed = JSON.parse(authData);
            const now = new Date();
            const expiresAt = new Date(parsed.expiresAt);
            
            return now < expiresAt;
        } catch {
            return false;
        }
    }

    // Método para obter dados do usuário logado
    static getCurrentUser() {
        if (!AuthSystem.isAuthenticated()) return null;
        
        const sessionAuth = sessionStorage.getItem('marceloImoveisAuth');
        const localAuth = localStorage.getItem('marceloImoveisAuth');
        
        const authData = sessionAuth || localAuth;
        
        try {
            const parsed = JSON.parse(authData);
            return parsed.user;
        } catch {
            return null;
        }
    }

    // Método para logout
    static logout() {
        sessionStorage.removeItem('marceloImoveisAuth');
        localStorage.removeItem('marceloImoveisAuth');
        // localStorage.removeItem('marceloImoveisRemember'); // Manter remember me
        
        window.location.href = '../index.html';
    }
}

// Inicializar sistema quando DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se já está logado
    if (AuthSystem.isAuthenticated()) {
        const user = AuthSystem.getCurrentUser();
        // Redirecionar para dashboard baseado no role
        window.location.href = '../index.html?dashboard=true&role=' + user.role;
        return;
    }
    
    // Inicializar sistema de login
    window.authSystem = new AuthSystem();
});

// Exportar para uso global
window.AuthSystem = AuthSystem;