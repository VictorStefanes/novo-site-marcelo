# 🏠 Marcelo Imóveis - Sistema Completo

Sistema profissional de gerenciamento de imóveis com dashboard administrativo e site público.

---

## 🚀 ACESSO RÁPIDO

### **Dashboard Administrativo**
- **URL:** https://corretormarcelo.netlify.app/html/login.html
- **Usuário:** `marcelocorretor`
- **Senha:** `marcelo0101!`

### **Site Público**
- **URL:** https://corretormarcelo.netlify.app

---

## 📋 FUNCIONALIDADES

### ✅ Dashboard (Administrativo)
- ➕ Adicionar imóveis com até 10 fotos
- ✏️ Editar informações completas
- 🗑️ Excluir imóveis
- 👁️ Ativar/Desativar visibilidade
- 📊 Visualizar lista completa
- 🔐 Login persistente (365 dias)

### ✅ Site Público
- 🏠 Catálogo de imóveis
- 🎠 Carrossel de fotos
- 🔍 Filtros avançados
- 📱 Design responsivo
- 📄 Página de detalhes
- 💬 Formulário de contato via WhatsApp

---

## 🛠️ TECNOLOGIAS

### **Backend**
- Node.js + Express
- SQLite (banco de dados)
- JWT (autenticação)
- bcrypt (criptografia)
- Multer (upload de imagens)

### **Frontend**
- HTML5 + CSS3 + JavaScript puro
- Sistema modular
- Sem frameworks pesados
- Design responsivo

### **Hospedagem**
- **Backend:** Render (https://marcelo-imoveis-backend.onrender.com)
- **Frontend:** Netlify (https://corretormarcelo.netlify.app)
- **Deploy:** Automático via GitHub

---

## 📂 ESTRUTURA DO PROJETO

```
novo-site-marcelo/
├── html/                    # Páginas HTML
│   ├── login.html          # Login administrativo
│   ├── dashboard.html      # Dashboard de gestão
│   ├── clear-cache.html    # Limpeza de cache
│   ├── lancamentos.html    # Lançamentos
│   ├── beira-mar.html      # Imóveis beira-mar
│   └── property-details.html  # Detalhes do imóvel
├── js/                      # JavaScript
│   ├── auth-api.js         # Sistema de autenticação
│   ├── dashboard-system-final.js  # Gestão do dashboard
│   ├── property-sync-system.js    # Sincronização
│   └── config.js           # Configurações
├── css/                     # Estilos
├── database/               # Banco SQLite
│   └── users.db           # Único usuário
├── server.js              # Backend Node.js
└── USUARIO_UNICO.md      # Documentação completa
```

---

## 🔐 SEGURANÇA

### **Autenticação**
- JWT com validade de 365 dias
- Senha criptografada com bcrypt (12 rounds)
- Token assinado com chave secreta
- Registro de novos usuários **DESABILITADO**

### **Permissões**
- Role: `owner` → Controle total
- Único usuário no sistema
- Todas as ações requerem autenticação

---

## 🔄 FLUXO DE USO

### **1. Login Inicial**
```
1. Acesse: https://corretormarcelo.netlify.app/html/login.html
2. Digite: marcelocorretor / marcelo0101!
3. Login salvo por 365 dias
```

### **2. Adicionar Imóvel**
```
1. Dashboard → "Adicionar Imóvel"
2. Preencha todos os campos
3. Upload de 1 a 10 fotos
4. Salvar → Aparece no site automaticamente
```

### **3. Editar Imóvel**
```
1. Dashboard → Tabela de Imóveis
2. Clique no botão "Editar" (✏️)
3. Modifique os dados
4. Salvar → Atualiza instantaneamente
```

### **4. Excluir Imóvel**
```
1. Dashboard → Tabela de Imóveis
2. Clique no botão "Excluir" (🗑️)
3. Confirme a exclusão
4. Removido do site imediatamente
```

---

## 🐛 SOLUÇÃO DE PROBLEMAS

### **❌ Não consigo excluir imóveis**
**Solução:**
1. Acesse: https://corretormarcelo.netlify.app/html/clear-cache.html
2. Clique em "Limpar Cache e Fazer Login"
3. Faça login novamente
4. Tente excluir novamente

### **❌ Login não persiste**
**Solução:**
- Não limpe o cache do navegador
- Use sempre o mesmo navegador
- Verifique se não está em modo anônimo

### **❌ Imagens não aparecem**
**Solução:**
- Aguarde 1-2 minutos após o upload
- Recarregue a página (F5)
- Verifique o formato (JPG, PNG, WebP)

### **❌ Erro 403 ou 401**
**Solução:**
- Token expirado ou inválido
- Limpe o cache e faça novo login
- Aguarde 5 minutos se o deploy estiver em andamento

---

## 🔧 MANUTENÇÃO

### **Backup do Banco de Dados**
```bash
# Local
cp database/users.db database/users.db.backup

# Render (via SSH ou Dashboard)
# Download manual do arquivo users.db
```

### **Deploy Manual**
```bash
# Frontend (Netlify)
git add .
git commit -m "Mensagem"
git push
# Deploy automático em ~2 minutos

# Backend (Render)
# Deploy automático ao detectar push
# Aguarde ~3-5 minutos
```

### **Resetar Senha (se necessário)**
```bash
cd database
node -e "
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const db = new sqlite3.Database('./users.db');
bcrypt.hash('NOVA_SENHA', 12, (err, hash) => {
  db.run('UPDATE users SET password = ? WHERE email = ?', 
    [hash, 'marcelocorretor'], 
    () => console.log('✅ Senha atualizada!')
  );
  db.close();
});
"
```

---

## 📞 SUPORTE

### **Comandos Úteis**

**Verificar status do servidor:**
```bash
curl https://marcelo-imoveis-backend.onrender.com/health
```

**Verificar usuários no banco:**
```bash
sqlite3 database/users.db "SELECT id, email, name, role FROM users;"
```

**Limpar cache do navegador:**
```javascript
// Console do navegador (F12)
localStorage.clear();
sessionStorage.clear();
location.reload();
```

---

## 📊 INFORMAÇÕES TÉCNICAS

### **API Endpoints**

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/auth/login` | Login | ❌ |
| POST | `/api/auth/register` | Registro (desabilitado) | ❌ |
| GET | `/api/properties` | Listar imóveis | ❌ |
| GET | `/api/properties/:id` | Detalhes do imóvel | ❌ |
| POST | `/api/properties` | Criar imóvel | ✅ |
| PUT | `/api/properties/:id` | Atualizar imóvel | ✅ |
| DELETE | `/api/properties/:id` | Excluir imóvel | ✅ |

### **Banco de Dados**

**Tabela: users**
```sql
id | email (username) | password (hash) | name | role | is_active
1  | marcelocorretor  | $2a$12$...     | Marcelo Corretor | owner | 1
```

**Tabela: properties**
```sql
id | title | description | price | location | type | bedrooms | 
bathrooms | area | images (JSON) | status | created_by | created_at
```

---

## ✅ CHECKLIST DE VERIFICAÇÃO

Antes de usar o sistema, verifique:

- [ ] Backend está online (Render)
- [ ] Frontend está online (Netlify)
- [ ] Login funciona corretamente
- [ ] Pode adicionar imóveis
- [ ] Pode editar imóveis
- [ ] Pode excluir imóveis
- [ ] Imóveis aparecem no site público
- [ ] Carrossel de fotos funciona
- [ ] Filtros funcionam
- [ ] WhatsApp funciona

---

## 🎉 RESUMO

✅ **Sistema 100% funcional**
✅ **Código limpo e organizado**
✅ **Sem dependências legadas**
✅ **Documentação completa**
✅ **Deploy automático**
✅ **Segurança implementada**

**Desenvolvido com ❤️ para Marcelo Imóveis**
