# 🏗️ ARQUITETURA FINAL - SISTEMA MARCELO IMÓVEIS

## 📋 VISÃO GERAL DO SISTEMA

Sistema completo de gerenciamento de imóveis com frontend, backend e banco de dados PostgreSQL.

---

## 🌐 INFRAESTRUTURA DE PRODUÇÃO

### **Frontend - Netlify**
- **URL:** https://corretormarcelo.netlify.app
- **Deploy:** Automático via GitHub (branch master)
- **Tecnologias:** HTML5, CSS3, JavaScript (Vanilla)
- **Estrutura:**
  - `index.html` - Página principal
  - `html/` - Páginas secundárias (lançamentos, beira-mar, mais-procurados, dashboard, login)
  - `js/` - Scripts JavaScript
  - `css/` - Estilos CSS
  - `assets/` - Imagens e recursos

### **Backend - Render**
- **URL:** https://marcelo-imoveis-backend-x70k.onrender.com
- **Deploy:** Automático via GitHub (branch master)
- **Tecnologias:** Node.js + Express
- **Servidor:** `server-postgres.js`
- **Porta:** 3000

### **Banco de Dados - PostgreSQL (Render)**
- **Host:** dpg-ct4ql0pu0jms73fh0h90-a.oregon-postgres.render.com
- **Database:** marcelo_imoveis
- **Usuário:** marcelo_imoveis_user
- **Conexão:** SSL habilitado
- **Estrutura:** Migrations automáticas (`database/migrations.js`)

---

## 🔐 SISTEMA DE AUTENTICAÇÃO

### **Endpoints de Auth**
```
POST /api/auth/register - Registrar novo usuário
POST /api/auth/login    - Login (retorna JWT token)
POST /api/auth/logout   - Logout
GET  /api/auth/verify   - Verificar token
```

### **Fluxo de Autenticação**
1. Usuário faz login em `/html/login.html`
2. Backend valida credenciais
3. Retorna JWT token
4. Token armazenado em `localStorage`
5. Todas requisições incluem header: `Authorization: Bearer {token}`

### **Proteção de Rotas**
- Dashboard requer autenticação
- Middleware `authenticateToken()` valida JWT
- Redirecionamento automático para login se token inválido

---

## 📦 API DE IMÓVEIS

### **Endpoints Principais**
```
GET    /api/properties           - Listar todos os imóveis
GET    /api/properties/:id       - Buscar imóvel específico
POST   /api/properties           - Criar novo imóvel (requer auth)
PUT    /api/properties/:id       - Atualizar imóvel (requer auth)
DELETE /api/properties/:id       - Deletar imóvel (requer auth)
GET    /api/properties/category/:category - Filtrar por categoria
```

### **Filtros Disponíveis**
- Categoria (lancamentos, beira-mar, mais-procurados)
- Tipo (casa, apartamento, cobertura, etc)
- Finalidade (venda, aluguel, temporada)
- Preço (min/max)
- Quartos, suítes, banheiros, vagas
- Localização (estado, cidade, bairro)
- Status (disponivel, vendido, alugado, reservado)

### **Estrutura do Imóvel (PostgreSQL)**
```javascript
{
  id: INTEGER (auto-increment),
  title: VARCHAR(255),
  description: TEXT,
  property_type: VARCHAR(50),      // Tipo do imóvel
  purpose: VARCHAR(20),             // Finalidade (sale/rent/season)
  sale_price: DECIMAL(12,2),
  rent_price: DECIMAL(12,2),
  bedrooms: INTEGER,
  bathrooms: INTEGER,
  suites: INTEGER,
  parking_spaces: INTEGER,
  total_area: DECIMAL(10,2),
  built_area: DECIMAL(10,2),
  address: TEXT,
  neighborhood: VARCHAR(100),
  city: VARCHAR(100),
  state: VARCHAR(2),
  zip_code: VARCHAR(10),
  images: TEXT[],                   // Array de Base64 strings
  features: TEXT[],
  category: VARCHAR(50),            // lancamentos, beira-mar, mais-procurados
  status: VARCHAR(20),              // available, sold, rented, reserved
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

---

## 🖼️ SISTEMA DE IMAGENS

### **Armazenamento**
- **Formato:** Base64 strings
- **Tipo de campo:** PostgreSQL `TEXT[]` (array)
- **Limite:** ~5MB por imagem (compressão automática)
- **Upload:** Via dashboard (`image-upload-system.js`)

### **Processamento**
1. Usuário seleciona imagens no dashboard
2. JavaScript converte para Base64
3. Array de strings enviado ao backend
4. Backend armazena no PostgreSQL
5. Frontend renderiza diretamente os Base64

### **Vantagens**
- ✅ Sem necessidade de storage externo (S3, Cloudinary)
- ✅ Imagens sempre disponíveis
- ✅ Deploy simples (tudo no banco)
- ✅ Não depende de CDN

---

## 🔒 SEGURANÇA

### **Implementações**
- ✅ **Helmet.js** - Headers de segurança HTTP
- ✅ **CORS** - Origens permitidas configuradas
- ✅ **Rate Limiting** - 100 req/15min (geral), 5 req/15min (login)
- ✅ **JWT** - Tokens com expiração
- ✅ **bcrypt** - Hash de senhas (10 rounds)
- ✅ **SQL Injection Protection** - Prepared statements
- ✅ **XSS Protection** - Sanitização de inputs

### **CORS - Origens Permitidas**
```javascript
- https://corretormarcelo.netlify.app  // Produção
- http://localhost:5500-5503           // Desenvolvimento
- http://127.0.0.1:5500-5503          // Desenvolvimento
- http://localhost:8080                // Alternativa
```

---

## 📱 PÁGINAS DO SISTEMA

### **Públicas (Não requerem login)**
- `/index.html` - Homepage com destaques
- `/html/lancamentos.html` - Imóveis em lançamento
- `/html/beira-mar.html` - Imóveis na beira-mar
- `/html/mais-procurados.html` - Imóveis mais procurados
- `/html/property-details.html` - Detalhes do imóvel
- `/html/login.html` - Login
- `/html/register.html` - Cadastro

### **Privadas (Requerem autenticação)**
- `/html/dashboard.html` - Painel administrativo
  - Visão geral (métricas)
  - Gestão de imóveis (CRUD completo)
  - Gestão de leads
  - Agenda de visitas
  - Relatórios e analytics
  - Configurações

---

## 🎨 SISTEMA DE CARDS

### **Estado Atual**
⚠️ **CARDS REMOVIDOS PARA RECONSTRUÇÃO**

Todos os cards foram limpos em:
- `index.html` (3 seções)
- `lancamentos.html`
- `beira-mar.html`
- `mais-procurados.html`
- `dashboard.html`

### **Arquivos JS Limpos**
- `property-system-final.js` → função `renderPropertyCard()` esvaziada
- `index-property-loader.js` → função `createCard()` esvaziada
- `dashboard-system-final.js` → renderização de tabela limpa

### **Pronto para Reconstrução**
Containers HTML vazios esperando nova implementação de cards sem risco de duplicação.

---

## 🚀 DEPLOY E ATUALIZAÇÃO

### **Fluxo de Deploy**
```bash
1. Fazer alterações no código
2. git add .
3. git commit -m "mensagem"
4. git push origin master
5. Netlify faz deploy automático (1-2 min)
6. Render faz deploy automático (2-3 min)
```

### **Verificar Status**
- **Netlify:** https://app.netlify.com/sites/corretormarcelo/deploys
- **Render:** https://dashboard.render.com

### **Redeploy Manual (se necessário)**
- **Netlify:** Site settings → Trigger deploy
- **Render:** Service → Manual Deploy → Deploy latest commit

---

## 📊 ESTRUTURA DE PASTAS

```
novo-site-marcelo/
├── index.html                      # Homepage
├── styles.css                      # Estilos globais
├── package.json                    # Dependências Node.js
├── server-postgres.js              # Backend principal
├── render.yaml                     # Config deploy Render
│
├── html/                           # Páginas HTML
│   ├── dashboard.html
│   ├── login.html
│   ├── register.html
│   ├── lancamentos.html
│   ├── beira-mar.html
│   ├── mais-procurados.html
│   └── property-details.html
│
├── js/                             # JavaScript
│   ├── config.js                   # Configuração API
│   ├── script.js                   # Scripts gerais
│   ├── auth-api.js                 # Sistema de autenticação
│   ├── dashboard-system-final.js   # Dashboard
│   ├── property-system-final.js    # Sistema de propriedades
│   ├── index-property-loader.js    # Loader da homepage
│   ├── image-upload-system.js      # Upload de imagens
│   └── price-filters.js            # Filtros de preço
│
├── css/                            # Estilos CSS
│   ├── dashboard-clean.css
│   ├── filters.css
│   ├── property-cards.css
│   └── (outros arquivos CSS)
│
├── database/                       # Configuração BD
│   ├── db.js                       # Conexão PostgreSQL
│   └── migrations.js               # Migrations
│
└── assets/                         # Recursos
    ├── images/                     # Imagens
    └── svg/                        # Logos SVG
```

---

## 🔧 MANUTENÇÃO E SUPORTE

### **Comandos Úteis**
```bash
# Ver logs do backend
heroku logs --tail  # Se usar Heroku
# ou acessar Render dashboard

# Verificar status Git
git status
git log --oneline -10

# Limpar cache do navegador
Ctrl + Shift + R (hard refresh)
Ctrl + Shift + Delete (limpar cache)
```

### **Troubleshooting Comum**

**1. "Imóveis não aparecem"**
- Verificar se backend está online (acessar URL do Render)
- Verificar console do navegador (F12)
- Verificar se há dados no PostgreSQL

**2. "Erro de CORS"**
- Verificar se origem está na lista permitida (`server-postgres.js`)
- Fazer redeploy no Render após alterações

**3. "Login não funciona"**
- Verificar se backend está rodando
- Verificar credenciais no banco
- Verificar token JWT no localStorage

**4. "Imagens não aparecem"**
- Verificar se imagens foram salvas como Base64
- Verificar campo `images` no banco (array de strings)
- Verificar console para erros de renderização

---

## 📝 CREDENCIAIS DE ACESSO

### **Dashboard (Exemplo)**
```
Usuário: admin
Senha: [definida no registro]
```

### **PostgreSQL (Render)**
```
Host: dpg-ct4ql0pu0jms73fh0h90-a.oregon-postgres.render.com
Database: marcelo_imoveis
User: marcelo_imoveis_user
Password: iELjYqKzGvA8Hk2agtAM7a7lBIlpd2A8
Port: 5432
SSL: Required
```

---

## ✅ SISTEMA PRONTO PARA PRODUÇÃO

### **Checklist Final**
- ✅ Frontend no Netlify (deploy automático)
- ✅ Backend no Render (deploy automático)
- ✅ PostgreSQL configurado e funcionando
- ✅ Autenticação JWT implementada
- ✅ CRUD de imóveis completo
- ✅ Sistema de upload de imagens Base64
- ✅ Filtros avançados funcionando
- ✅ CORS configurado corretamente
- ✅ Segurança implementada (Helmet, Rate Limit)
- ✅ Código versionado no GitHub
- ⏳ Cards limpos (aguardando nova implementação)

---

## 🎯 PRÓXIMOS PASSOS (OPCIONAL)

1. **Implementar novos cards de imóveis** - Design do zero
2. **Dashboard analytics** - Gráficos e métricas
3. **Sistema de leads** - Captura e gestão
4. **Notificações email** - Nodemailer configurado
5. **SEO e Performance** - Meta tags, lazy loading
6. **PWA** - Service Worker para app mobile

---

## 📞 CONTATOS E LINKS

- **Site:** https://corretormarcelo.netlify.app
- **Dashboard:** https://corretormarcelo.netlify.app/html/dashboard.html
- **API:** https://marcelo-imoveis-backend-x70k.onrender.com
- **GitHub:** https://github.com/VictorStefanes/novo-site-marcelo
- **Netlify:** https://app.netlify.com/sites/corretormarcelo
- **Render:** https://dashboard.render.com

---

**Sistema desenvolvido e documentado em Novembro/2025**
**Pronto para entrega ao cliente** ✅
