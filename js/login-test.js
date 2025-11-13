/* ========================================
   FUNCOES DE TESTE PARA LOGIN
======================================== */

// Função para criar uma sessão de teste rapidamente
function createTestSession() {
    const user = {
        email: 'admin@marceloimoveis.com',
        name: 'Administrador',
        role: 'admin',
        loginTime: new Date().toISOString()
    };
    
    const session = {
        user: user,
        expires: new Date().getTime() + (24 * 60 * 60 * 1000), // 24 horas
        token: btoa(Math.random().toString(36).substring(2) + Date.now().toString(36))
    };
    
    localStorage.setItem('marceloImoveis_session', JSON.stringify(session));
    console.log('✅ Sessão de teste criada para:', user.name);
    console.log('📧 Email:', user.email);
    console.log('🕒 Expira em:', new Date(session.expires));
    
    // Redirecionar para dashboard
    if (window.location.pathname.includes('login.html')) {
        window.location.href = window.location.href.replace('login.html', 'dashboard.html');
    } else {
        window.location.href = 'dashboard.html';
    }
}

// Função para testar o login automaticamente
function autoLogin() {
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');
    
    if (emailField && passwordField) {
        emailField.value = 'admin@marceloimoveis.com';
        passwordField.value = 'admin123';
        
        console.log('🔧 Campos preenchidos automaticamente');
        console.log('📧 Email:', emailField.value);
        console.log('🔑 Password:', passwordField.value);
        
        // Simular clique no botão
        const loginButton = document.getElementById('loginButton');
        if (loginButton) {
            loginButton.click();
            console.log('✅ Login iniciado automaticamente');
        }
    } else {
        console.log('❌ Campos de login não encontrados');
    }
}

// Verificar status atual
function checkLoginStatus() {
    const session = localStorage.getItem('marceloImoveis_session');
    
    if (session) {
        try {
            const data = JSON.parse(session);
            const now = new Date().getTime();
            
            if (data.expires > now) {
                console.log('✅ Sessão ativa encontrada');
                console.log('👤 Usuário:', data.user.name);
                console.log('📧 Email:', data.user.email);
                console.log('⏰ Expira em:', new Date(data.expires));
                console.log('🕒 Tempo restante:', Math.round((data.expires - now) / (1000 * 60 * 60)), 'horas');
                return true;
            } else {
                console.log('❌ Sessão expirada');
                localStorage.removeItem('marceloImoveis_session');
                return false;
            }
        } catch (error) {
            console.log('❌ Erro na sessão:', error);
            localStorage.removeItem('marceloImoveis_session');
            return false;
        }
    } else {
        console.log('❌ Nenhuma sessão encontrada');
        return false;
    }
}

// Limpar tudo e voltar ao estado inicial
function resetLogin() {
    localStorage.removeItem('marceloImoveis_session');
    console.log('🧹 Sessão limpa');
    
    if (window.location.pathname.includes('dashboard.html')) {
        window.location.href = window.location.href.replace('dashboard.html', 'login.html');
    } else {
        location.reload();
    }
}

// Exibir comandos disponíveis
console.log('🔧 COMANDOS DE TESTE DISPONÍVEIS:');
console.log('📝 createTestSession() - Cria sessão e vai para dashboard');
console.log('🚀 autoLogin() - Preenche login automaticamente'); 
console.log('🔍 checkLoginStatus() - Verifica se está logado');
console.log('🧹 resetLogin() - Limpa tudo e volta ao login');

// Verificar status automaticamente
checkLoginStatus();