# 🔐 MARCELO IMÓVEIS - DOCUMENTAÇÃO DEFINITIVA

## ✅ SISTEMA SIMPLIFICADO E LIMPO

O sistema foi **completamente limpo e simplificado** para ter apenas **1 usuário administrador**.

---

## 👤 CREDENCIAIS DE ACESSO

```
📧 URL: https://corretormarcelo.netlify.app/html/login.html
👤 Usuário: marcelocorretor
🔑 Senha: marcelo0101!
👨‍💼 Nome: Marcelo Corretor
🎭 Função: Owner (Controle Total)
⏰ Sessão: 365 dias (1 ano)
```

---

## 🎯 O QUE MUDOU

### ✅ **Antes:**
- ❌ Login com email
- ❌ Múltiplos usuários
- ❌ Sistema de registro aberto
- ❌ 4 usuários diferentes (admin, marcelo, corretor, marcelocorretor)

### ✅ **Agora:**
- ✅ Login com **username** (não email)
- ✅ **Apenas 1 usuário** no sistema
- ✅ Registro **desabilitado** (403 Forbidden)
- ✅ Banco de dados **limpo** - apenas marcelocorretor

---

## 🚀 COMO FAZER LOGIN

### **Acesso:**
1. Vá para: **https://corretormarcelo.netlify.app/html/login.html**
2. Digite:
   - **Usuário:** `marcelocorretor`
   - **Senha:** `marcelo0101!`
3. Clique em **Entrar**
4. ✅ Login salvo por **365 dias**

### **Dashboard:**
- URL direta: **https://corretormarcelo.netlify.app/html/dashboard.html**
- Após primeiro login, acesso automático por 1 ano

---

## 🛠️ CONTROLE TOTAL DO DASHBOARD

O usuário `marcelocorretor` tem acesso completo para:

### ✅ **Gerenciar Imóveis:**
- ➕ Adicionar novos imóveis
- ✏️ Editar imóveis existentes
- 🗑️ Remover imóveis
- 📸 Upload de até 10 fotos por imóvel
- 🏷️ Definir status (Ativo/Inativo)
- 💰 Definir preços e características

### ✅ **Controlar o Front-End:**
- 🌐 Imóveis aparecem automaticamente no site
- 🔄 Sincronização em tempo real
- 🎨 Carrossel de fotos nos cards
- 📱 Página de detalhes dinâmica
- 🔍 Filtros e busca funcionam automaticamente

### ✅ **Gerenciar Leads:**
- 📧 Visualizar contatos de clientes
- 📞 Acessar informações de interessados
- 📊 Acompanhar solicitações

---

## 🔒 SEGURANÇA

### **Registro Desabilitado:**
- ✅ Rota `/api/auth/register` retorna **403 Forbidden**
- ✅ Ninguém pode criar novos usuários
- ✅ Link "Criar Conta" removido da tela de login

### **Proteções Ativas:**
- ✅ JWT com 365 dias de validade
- ✅ Senha criptografada com bcrypt (12 rounds)
- ✅ Token assinado com chave secreta
- ✅ Dashboard protegido por autenticação
- ✅ API valida token em todas as requisições

---

## 🗄️ BANCO DE DADOS

### **Estrutura Atual:**
```sql
-- Tabela: users
-- Total de registros: 1

id | email (username) | password (hash) | name            | role  | is_active
---|------------------|-----------------|-----------------|-------|----------
1  | marcelocorretor  | $2a$12$...     | Marcelo Corretor| owner | 1
```

### **Campo "email" agora armazena o username:**
- Mantivemos o nome da coluna `email` por compatibilidade
- Mas agora armazena o **username** ao invés de email
- Backend aceita tanto `username` quanto `email` no JSON

---

## 📂 ARQUIVOS MODIFICADOS

### **Backend (server.js):**
```javascript
// Linha ~474: Login aceita 'username'
app.post('/api/auth/login', async (req, res) => {
    const { username, password, email } = req.body;
    const loginIdentifier = username || email; // Retrocompatibilidade
    // ...
});

// Linha ~383: Registro desabilitado
app.post('/api/auth/register', async (req, res) => {
    return res.status(403).json({
        success: false,
        message: 'Registro de novos usuários desabilitado.'
    });
});
```

### **Frontend (login.html):**
```html
<!-- Antes: Email -->
<input type="email" id="email" placeholder="seu@email.com">

<!-- Agora: Username -->
<input type="text" id="username" placeholder="Digite seu usuário">
```

### **JavaScript (auth-api.js):**
```javascript
// Antes: { email, password }
body: JSON.stringify({ email, password })

// Agora: { username, password }
body: JSON.stringify({ username, password })
```

---

## 🔄 COMO ADICIONAR MAIS USUÁRIOS (SE NECESSÁRIO)

**⚠️ Atualmente não é possível via interface.**

Se no futuro precisar criar mais usuários:

### **Opção 1: Modificar Banco Direto (SQLite):**
```javascript
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const db = new sqlite3.Database('./database/users.db');

bcrypt.hash('SenhaAqui', 12, (err, hash) => {
    db.run(
        'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
        ['novousuario', hash, 'Nome Completo', 'owner'],
        (err) => {
            console.log(err ? 'Erro' : 'Usuário criado!');
            db.close();
        }
    );
});
```

### **Opção 2: Reabilitar Registro Temporariamente:**
1. Comentar a linha de retorno 403 no `server.js`
2. Descomentar o código original de registro
3. Fazer push e deploy
4. Criar usuário via `/html/register.html`
5. Desabilitar novamente

---

## 📊 FLUXO DE TRABALHO

### **1. Login Inicial:**
```
Usuário acessa /html/login.html
     ↓
Digite: marcelocorretor / marcelo0101!
     ↓
POST /api/auth/login { username, password }
     ↓
Backend valida e retorna JWT (365 dias)
     ↓
Frontend salva em localStorage
     ↓
Redireciona para /html/dashboard.html
```

### **2. Gerenciar Imóveis:**
```
Dashboard carregado
     ↓
Clica "Adicionar Imóvel"
     ↓
Preenche formulário + upload de fotos
     ↓
POST /api/properties (com Authorization: Bearer <token>)
     ↓
Imóvel salvo no banco
     ↓
Front-end atualiza automaticamente
```

### **3. Visualização no Site:**
```
Cliente acessa index.html
     ↓
GET /api/properties (sem autenticação)
     ↓
Carrega todos os imóveis ativos
     ↓
Renderiza cards com carrossel
     ↓
Cliente clica "Ver Detalhes"
     ↓
Abre property-details.html?id=X
```

---

## ⚠️ IMPORTANTE

### **NÃO PERCA AS CREDENCIAIS!**
- ✅ Anote em lugar seguro: `marcelocorretor` / `marcelo0101!`
- ✅ Não há recuperação de senha implementada
- ✅ Se perder, precisará resetar o banco de dados

### **Cache do Navegador:**
- ✅ Login válido por 365 dias
- ❌ Limpar cache = perde o login
- ✅ Sempre use o mesmo navegador/computador

### **Backup Regular:**
```bash
# Fazer backup do banco de dados
cp database/users.db database/users.db.backup
```

---

## 🎉 VANTAGENS DESTA CONFIGURAÇÃO

✅ **Simplicidade:**
- 1 único usuário
- Sem confusão de permissões
- Sem gestão de múltiplos acessos

✅ **Segurança:**
- Registro fechado
- Apenas você tem acesso
- Token de longa duração

✅ **Controle Total:**
- Gerencia 100% do conteúdo
- Adiciona/remove imóveis à vontade
- Controla o que aparece no site

✅ **Manutenção Zero:**
- Não precisa criar/deletar usuários
- Não precisa gerenciar permissões
- Sistema "set and forget"

---

## 📞 SUPORTE

Se precisar de ajuda ou quiser adicionar funcionalidades:
- 📧 Entre em contato com o desenvolvedor
- 📝 Documente qualquer mudança neste arquivo
- 🔒 Sempre faça backup antes de modificar

---

**Sistema configurado e pronto para uso! 🚀**
