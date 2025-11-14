# 🔐 LOGIN PERSISTENTE - SISTEMA CONFIGURADO

## ✅ CREDENCIAIS DO SEU CLIENTE

**Email:** `marcelocorretor@marceloimoveis.com`  
**Senha:** `marcelo0101!`  
**Função:** Owner (Acesso Total ao Dashboard)

---

## 🎯 COMO FUNCIONA

### **Token Vitalício (365 Dias)**

O sistema agora está configurado para **login persistente**:

- ✅ Token válido por **365 dias** (1 ano)
- ✅ Login salvo no **localStorage** do navegador
- ✅ **Não precisa fazer login todo dia**
- ✅ Funciona mesmo fechando e abrindo o navegador
- ✅ Funciona no **computador dele** automaticamente

### **Quando Ele Precisa Fazer Login Novamente?**

Apenas em 3 situações:

1. **Depois de 365 dias** (1 ano)
2. Se **limpar o cache/dados do navegador**
3. Se **fazer logout manualmente**

---

## 📋 INSTRUÇÕES PARA SEU CLIENTE

### **Primeiro Acesso:**

1. Acesse: **https://corretormarcelo.netlify.app/html/login.html**
2. Digite:
   - Email: `marcelocorretor@marceloimoveis.com`
   - Senha: `marcelo0101!`
3. Clique em **Entrar**
4. ✅ Pronto! O login ficará salvo por 1 ano

### **Próximos Acessos:**

- Basta acessar: **https://corretormarcelo.netlify.app/html/dashboard.html**
- Ele **já estará logado automaticamente**
- Não precisa digitar email/senha novamente

### **Para Fazer Logout:**

- Clique no **avatar dele** no canto superior direito
- Clique em **Sair** no menu

---

## 🔒 SEGURANÇA

### **É Seguro?**

✅ **SIM!** O sistema usa:

- **JWT (JSON Web Token)** - Padrão da indústria
- **Senha criptografada** com bcrypt (12 rounds)
- **Token assinado** com chave secreta no servidor
- **Não pode ser falsificado** ou hackeado facilmente

### **Recomendações:**

1. ✅ Use o **computador pessoal** dele (não computador público)
2. ✅ Não compartilhe a senha com ninguém
3. ✅ Sempre faça **logout em computadores compartilhados**
4. ✅ Senha forte já configurada: `marcelo0101!`

---

## 🛠️ CONFIGURAÇÃO TÉCNICA IMPLEMENTADA

### **Backend (server.js):**

```javascript
// Token JWT válido por 365 dias
const token = jwt.sign(
    { userId: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '365d' } // ← 365 dias
);
```

### **Frontend (auth-api.js):**

```javascript
const session = {
    user: user,
    token: jwtToken,
    expires: new Date().getTime() + (365 * 24 * 60 * 60 * 1000), // ← 365 dias
    created: new Date().toISOString(),
    isValid: true
};
```

### **Armazenamento:**

- **localStorage.token** → Token JWT puro
- **localStorage.marceloImoveis_session** → Sessão completa com dados do usuário

---

## 📱 TESTANDO

### **Para Testar o Login Persistente:**

1. Faça login no dashboard
2. Feche o navegador completamente
3. Abra o navegador novamente
4. Vá direto para: `https://corretormarcelo.netlify.app/html/dashboard.html`
5. ✅ Deve estar logado automaticamente!

### **Para Testar a Expiração:**

```javascript
// Abra o Console (F12) e execute:
const session = JSON.parse(localStorage.getItem('marceloImoveis_session'));
console.log('Token expira em:', new Date(session.expires));
// Deve mostrar uma data daqui a 365 dias
```

---

## 🔄 ATUALIZANDO DEPLOY

### **Deploy no Backend (Render):**

O código já está atualizado localmente. Para aplicar no servidor:

1. **Commit e Push:**
   ```bash
   git add .
   git commit -m "Configura token persistente de 365 dias"
   git push
   ```

2. **Render faz deploy automático** quando detecta push no GitHub

3. **Aguardar 2-3 minutos** para deploy completar

### **Frontend (Netlify):**

- Netlify já está configurado para **deploy automático**
- Quando você fizer `git push`, o deploy acontece sozinho
- ✅ Não precisa fazer nada manualmente

---

## ❓ PERGUNTAS FREQUENTES

### **"O cliente pode usar em vários computadores?"**

✅ **SIM!** Mas ele precisará fazer login em cada computador uma vez. Depois disso, cada computador manterá o login por 365 dias.

### **"E se ele limpar o cache do navegador?"**

❌ Perderá o login e precisará fazer login novamente. Mas é só digitar email/senha uma vez e ficará salvo por mais 365 dias.

### **"Como sei que está funcionando?"**

Abra o Console (F12) e veja:
```javascript
console.log(localStorage.getItem('token')); // Deve mostrar o token
console.log(localStorage.getItem('marceloImoveis_session')); // Deve mostrar a sessão
```

### **"Posso mudar a validade depois?"**

✅ **SIM!** Edite em 2 lugares:

1. **server.js** (linha ~443 e ~518): `expiresIn: '365d'`
2. **auth-api.js** (linha ~143): `365 * 24 * 60 * 60 * 1000`

Exemplos:
- **30 dias:** `'30d'` e `30 * 24 * 60 * 60 * 1000`
- **90 dias:** `'90d'` e `90 * 24 * 60 * 60 * 1000`
- **Para sempre:** `'10y'` e `10 * 365 * 24 * 60 * 60 * 1000` (não recomendado)

---

## 🎉 RESUMO

✅ **Usuário criado:** `marcelocorretor@marceloimoveis.com`  
✅ **Senha configurada:** `marcelo0101!`  
✅ **Token válido por:** 365 dias (1 ano)  
✅ **Login automático:** Funciona no computador dele  
✅ **Seguro:** JWT + bcrypt + chave secreta  

**Seu cliente pode usar o dashboard normalmente por 1 ano sem precisar fazer login novamente!** 🚀
