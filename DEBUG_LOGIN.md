# 🔧 **DEBUG DO LOGIN - INSTRUÇÕES**

## **Como testar o login:**

### **1. Abra o login.html no navegador**
```
Navegue até: html/login.html
```

### **2. Abra o Console do navegador (F12)**
- Pressione **F12** 
- Clique na aba **Console**
- Você deve ver mensagens de debug

### **3. Teste com estas credenciais:**
```
Email: admin@marceloimoveis.com
Senha: admin123
```

### **4. Mensagens esperadas no Console:**
```
DOM loaded, current path: .../login.html
Initializing AuthManager for login page
AuthManager initializing...
Binding login form events...
Login form found: true
Submit event listener added
```

### **5. Após clicar "Entrar":**
```
Login form submitted!
Email: admin@marceloimoveis.com Password: admin123  
Validating credentials for: admin@marceloimoveis.com
Credentials valid: true
Redirecting to dashboard...
Attempting to redirect to dashboard...
Current location: .../login.html
```

---

## **Se não funcionar, veja:**

### **Problema 1: Não aparece "DOM loaded"**
- O script auth.js não está carregando
- Verifique se o caminho está correto

### **Problema 2: "Login form found: false"**
- O ID do formulário está errado
- Verifique se existe `id="loginForm"`

### **Problema 3: "Credentials valid: false"**
- Digite exatamente: `admin@marceloimoveis.com` e `admin123`
- Verifique se não há espaços extras

### **Problema 4: Não redireciona**
- Verifique se dashboard.html existe na mesma pasta
- Pode ser problema de caminho relativo

---

## **Teste rápido via Console:**
Cole isto no Console do navegador:
```javascript
// Teste direto
window.location.href = 'dashboard.html';
```

Se isso funcionar, o problema está na autenticação.
Se não funcionar, o problema é o caminho do arquivo.

**Teste agora e me diga o que aparece no Console!** 🔍