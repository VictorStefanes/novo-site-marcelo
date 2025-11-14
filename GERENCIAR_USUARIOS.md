# 👤 GERENCIAMENTO DE USUÁRIOS - MARCELO IMÓVEIS

## 📋 **OPÇÕES PARA CRIAR USUÁRIOS**

---

## ✅ **OPÇÃO 1: AUTO-REGISTRO (Recomendado para Clientes)**

### 🌐 **Como Funciona:**

Qualquer pessoa pode criar uma conta através do site:

**URL:** https://corretormarcelo.netlify.app/html/register.html

### 📝 **Passo a Passo:**

1. **Acesse a página de registro**
2. **Preencha os dados:**
   - Nome completo
   - E-mail (será o login)
   - Senha (mínimo 6 caracteres)
3. **Clique em "Criar Conta"**
4. **Sistema cria automaticamente:**
   - Usuário com role `client`
   - Token JWT válido por 24h
   - Sessão automática no dashboard
5. **Redirecionamento** para o dashboard

### ✨ **Vantagens:**

- ✅ Rápido e fácil
- ✅ Não precisa de administrador
- ✅ Senha criptografada automaticamente
- ✅ Login imediato após registro
- ✅ Verificação de força da senha
- ✅ Validação de e-mail duplicado

### ⚙️ **Configurações Automáticas:**

```javascript
{
  role: 'client',          // Permissões básicas
  is_verified: 1,          // Conta verificada
  is_active: 1,            // Conta ativa
  created_at: AGORA,       // Data de criação
  last_login: NULL         // Primeiro login após registro
}
```

---

## 🔧 **OPÇÃO 2: CRIAR MANUALMENTE (Administrador/Backend)**

### 💻 **Via Node.js (Backend):**

Você pode criar usuários diretamente no banco de dados:

```javascript
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/users.db');

async function criarUsuario(nome, email, senha, role = 'client') {
    // Criptografar senha
    const senhaHash = await bcrypt.hash(senha, 10);
    
    // Inserir no banco
    db.run(`
        INSERT INTO users (name, email, password, role, is_active, is_verified)
        VALUES (?, ?, ?, ?, 1, 1)
    `, [nome, email, senhaHash, role], function(err) {
        if (err) {
            console.error('❌ Erro:', err.message);
        } else {
            console.log('✅ Usuário criado! ID:', this.lastID);
        }
    });
}

// Exemplo de uso:
criarUsuario('João Silva', 'joao@exemplo.com', 'senha123', 'corretor');
```

### 🖥️ **Via PowerShell (Linha de Comando):**

Execute este comando no terminal:

```powershell
node -e "const sqlite3 = require('sqlite3').verbose(); const bcrypt = require('bcryptjs'); const db = new sqlite3.Database('./database/users.db'); const nome = 'João Silva'; const email = 'joao@exemplo.com'; const senha = 'senha123'; const role = 'corretor'; bcrypt.hash(senha, 10, (err, hash) => { db.run('INSERT INTO users (name, email, password, role, is_active, is_verified) VALUES (?, ?, ?, ?, 1, 1)', [nome, email, hash, role], function(err) { if (err) console.error(err); else console.log('Usuário criado! ID:', this.lastID); db.close(); }); });"
```

### 🔑 **Roles (Níveis de Acesso):**

| Role | Descrição | Permissões |
|------|-----------|------------|
| `admin` | Administrador | Acesso total ao sistema |
| `owner` | Proprietário/Dono | Gerenciar imóveis, leads, vendas, relatórios |
| `corretor` | Corretor | Gerenciar imóveis e leads, agendar visitas |
| `client` | Cliente | Visualizar imóveis, fazer contato |

---

## 🎯 **QUAL OPÇÃO ESCOLHER?**

### **Para o seu cliente (Marcelo):**

#### ✅ **Recomendação: AUTO-REGISTRO**

**Por quê?**
1. **Mais simples**: Ele mesmo cria a conta quando quiser
2. **Mais seguro**: Senha nunca é compartilhada
3. **Independente**: Não precisa pedir para você
4. **Profissional**: Processo padronizado

#### 📧 **Envie este link para ele:**

```
https://corretormarcelo.netlify.app/html/register.html
```

**Instruções:**
- Preencher nome, e-mail e senha
- Criar conta
- Já estará logado no dashboard

---

### **Para você criar para ele:**

#### ⚠️ **Opção Manual - Use apenas se necessário**

Se preferir criar manualmente:

```powershell
# No terminal do projeto:
node -e "const sqlite3 = require('sqlite3').verbose(); const bcrypt = require('bcryptjs'); const db = new sqlite3.Database('./database/users.db'); const nome = 'Marcelo Silva'; const email = 'marcelo.cliente@gmail.com'; const senha = 'MarceloSenha2025'; const role = 'owner'; bcrypt.hash(senha, 10, (err, hash) => { db.run('INSERT INTO users (name, email, password, role, is_active, is_verified) VALUES (?, ?, ?, ?, 1, 1)', [nome, email, hash, role], function(err) { if (err) console.error(err); else console.log('Usuário criado! ID:', this.lastID); db.close(); }); });"
```

**Depois envie as credenciais:**
- E-mail: `marcelo.cliente@gmail.com`
- Senha: `MarceloSenha2025`
- Link: https://corretormarcelo.netlify.app/html/login.html

---

## 🔐 **SEGURANÇA**

### ✅ **Sistema implementa:**

1. **Criptografia bcrypt** (hash com salt)
2. **Validação de e-mail** (formato correto)
3. **Senha mínima** (6 caracteres)
4. **Verificação de duplicados** (e-mail único)
5. **JWT Token** (autenticação segura)
6. **Expiração de sessão** (24 horas)

### 🛡️ **Boas Práticas:**

- ❌ **Nunca compartilhe senhas** por e-mail ou WhatsApp
- ✅ **Use auto-registro** sempre que possível
- ✅ **Senhas fortes**: letras, números e símbolos
- ✅ **Troque senhas** após primeiro acesso (se criou manualmente)

---

## 📊 **GERENCIAR USUÁRIOS EXISTENTES**

### **Listar todos os usuários:**

```powershell
node -e "const sqlite3 = require('sqlite3').verbose(); const db = new sqlite3.Database('./database/users.db'); db.all('SELECT id, name, email, role, created_at FROM users', (err, rows) => { if(err) console.error(err); else console.log(JSON.stringify(rows, null, 2)); db.close(); });"
```

### **Alterar senha de um usuário:**

```powershell
node -e "const sqlite3 = require('sqlite3').verbose(); const bcrypt = require('bcryptjs'); const db = new sqlite3.Database('./database/users.db'); const email = 'usuario@exemplo.com'; const novaSenha = 'NovaSenha123'; bcrypt.hash(novaSenha, 10, (err, hash) => { db.run('UPDATE users SET password = ? WHERE email = ?', [hash, email], function(err) { if (err) console.error(err); else console.log('Senha atualizada!'); db.close(); }); });"
```

### **Alterar role de um usuário:**

```powershell
node -e "const sqlite3 = require('sqlite3').verbose(); const db = new sqlite3.Database('./database/users.db'); const email = 'usuario@exemplo.com'; const novoRole = 'corretor'; db.run('UPDATE users SET role = ? WHERE email = ?', [novoRole, email], function(err) { if (err) console.error(err); else console.log('Role atualizado!'); db.close(); });"
```

### **Desativar um usuário:**

```powershell
node -e "const sqlite3 = require('sqlite3').verbose(); const db = new sqlite3.Database('./database/users.db'); const email = 'usuario@exemplo.com'; db.run('UPDATE users SET is_active = 0 WHERE email = ?', [email], function(err) { if (err) console.error(err); else console.log('Usuário desativado!'); db.close(); });"
```

---

## 💡 **RECOMENDAÇÃO FINAL**

### **Para o Marcelo (seu cliente):**

🎯 **Melhor opção: AUTO-REGISTRO**

1. Envie o link: https://corretormarcelo.netlify.app/html/register.html
2. Peça para ele criar a conta com os dados dele
3. Pronto! Ele já terá acesso ao dashboard

**Vantagens:**
- ✅ Ele escolhe a própria senha
- ✅ Mais seguro
- ✅ Processo profissional
- ✅ Você não precisa fazer nada

---

### **Para outros usuários (funcionários, corretores):**

Você pode:
1. **Enviar o link de registro** para eles criarem a conta
2. **Criar manualmente** e enviar as credenciais
3. **No futuro**: Criar uma tela de "Gerenciar Usuários" no dashboard admin

---

## 📞 **Suporte:**

Se tiver dúvidas sobre criação de usuários:
- Verifique os logs do servidor
- Teste o registro primeiro
- Confirme que o e-mail não existe
- Verifique a senha (mínimo 6 caracteres)

**Última atualização:** 14/11/2025
**Status:** ✅ Sistema totalmente funcional
