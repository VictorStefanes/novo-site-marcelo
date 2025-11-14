# 🔐 CREDENCIAIS DE ACESSO - SISTEMA MARCELO IMÓVEIS

## 📋 Usuários Cadastrados

### 👑 Administrador (Acesso Total)
- **E-mail:** `admin@marceloimoveis.com`
- **Senha:** `admin123`
- **Permissões:** Todas as funcionalidades do sistema
- **Uso:** Gestão completa da plataforma

### ⭐ Proprietário/Dono (Marcelo)
- **E-mail:** `marcelo@marceloimoveis.com`
- **Senha:** `marcelo123`
- **Permissões:** Gerenciar imóveis, leads, vendas, relatórios
- **Uso:** Conta principal do dono do negócio

### 👨‍💼 Corretor
- **E-mail:** `corretor@marceloimoveis.com`
- **Senha:** `corretor123`
- **Permissões:** Gerenciar imóveis e leads, agendar visitas
- **Uso:** Corretores da equipe

---

## 🚀 Como Fazer Login

1. Acesse: **https://corretormarcelo.netlify.app/html/login.html**
2. Digite o e-mail e senha de um dos usuários acima
3. Clique em **"Entrar"**
4. Você será redirecionado para o dashboard

---

## 🔄 Sistema de Autenticação

### ✅ **Recursos Implementados:**

- **Login com JWT**: Token de autenticação válido por 24 horas
- **Sessão Persistente**: "Lembrar de mim" mantém login ativo
- **Logout Seguro**: Limpa token e sessão completamente
- **Proteção de Rotas**: Dashboard só acessível com login
- **Menu do Usuário**: Dropdown com opções de perfil e sair

### 🔧 **Endpoints da API:**

```javascript
POST /api/auth/login
Body: {
  "email": "admin@marceloimoveis.com",
  "password": "admin123"
}

Response: {
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR...",
  "user": {
    "id": 1,
    "email": "admin@marceloimoveis.com",
    "name": "Administrador",
    "role": "admin"
  },
  "redirect": "/html/dashboard.html"
}
```

### 📦 **Armazenamento Local:**

O sistema salva no `localStorage`:

1. **`token`**: Token JWT para autenticação nas requisições
2. **`marceloImoveis_session`**: Dados completos da sessão (usuário + expiração)

```javascript
// Exemplo de sessão salva:
{
  "user": {
    "id": 1,
    "email": "admin@marceloimoveis.com",
    "name": "Administrador",
    "role": "admin",
    "loginTime": "2025-11-14T19:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR...",
  "expires": 1731628200000,
  "created": "2025-11-14T19:30:00.000Z",
  "isValid": true
}
```

---

## 🛡️ **Como Funciona a Proteção:**

### **Dashboard (Requer Login):**
```javascript
// Verificação automática ao carregar dashboard
if (!localStorage.getItem('token')) {
  window.location.href = 'login.html';
}
```

### **Requisições Autenticadas:**
```javascript
// Todas as operações do dashboard usam o token
fetch(`${API_URL}/api/properties/${id}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
```

---

## 🔓 **Como Fazer Logout:**

### **Via Interface:**
1. Clique no seu nome/avatar no canto superior direito
2. Clique em **"Sair"**
3. Confirme a ação

### **Via JavaScript:**
```javascript
function handleLogout() {
  localStorage.removeItem('marceloImoveis_session');
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}
```

---

## 🧪 **Testando o Sistema:**

### **1. Teste de Login:**
```bash
curl -X POST https://marcelo-imoveis-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@marceloimoveis.com", "password": "admin123"}'
```

### **2. Teste de Requisição Autenticada:**
```bash
curl -X GET https://marcelo-imoveis-backend.onrender.com/api/properties \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### **3. Teste de Exclusão de Imóvel:**
```bash
curl -X DELETE https://marcelo-imoveis-backend.onrender.com/api/properties/14 \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## ⚠️ **Importante:**

1. **Nunca compartilhe** as credenciais de admin publicamente
2. **Altere as senhas** em produção para senhas mais seguras
3. **Token expira** em 24 horas - usuário precisa fazer login novamente
4. **Backend deve estar rodando** para o login funcionar via API

---

## 🔄 **Alterando Senhas (Backend):**

Se precisar alterar a senha de um usuário:

```javascript
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/users.db');

bcrypt.hash('NovaSenha123', 10, (err, hash) => {
  db.run('UPDATE users SET password = ? WHERE email = ?', 
    [hash, 'email@exemplo.com'], 
    (err) => {
      if (err) console.error(err);
      else console.log('Senha atualizada!');
      db.close();
    }
  );
});
```

---

## 📞 **Suporte:**

Se tiver problemas com login:

1. Verifique se o backend está online: https://marcelo-imoveis-backend.onrender.com
2. Abra o console do navegador (F12) para ver erros
3. Verifique se há token no localStorage: `localStorage.getItem('token')`
4. Tente fazer logout completo e login novamente

---

**Última atualização:** 14/11/2025
**Status:** ✅ Sistema totalmente funcional
