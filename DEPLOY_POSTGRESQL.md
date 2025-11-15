# 🚀 Guia de Deploy com PostgreSQL no Render

## 📋 Passo a Passo Completo

### 1. Criar PostgreSQL Database no Render

1. Acesse [Render Dashboard](https://dashboard.render.com/)
2. Clique em **"New +"** → **"PostgreSQL"**
3. Preencha:
   - **Name**: `marcelo-imoveis-db`
   - **Database**: `marcelo_imoveis`
   - **User**: `marcelo_admin` (ou deixe o padrão)
   - **Region**: Oregon (US West) - mais próximo do Brasil
   - **Instance Type**: Free
4. Clique em **"Create Database"**
5. ⏳ Aguarde alguns minutos até o status ficar **"Available"**
6. 📋 **COPIE** a **Internal Database URL** (começa com `postgresql://`)

### 2. Configurar Web Service no Render

1. No Render Dashboard, clique em **"New +"** → **"Web Service"**
2. Conecte seu repositório GitHub: `VictorStefanes/novo-site-marcelo`
3. Preencha:
   - **Name**: `marcelo-imoveis-backend`
   - **Region**: Oregon (mesma do banco)
   - **Branch**: `master`
   - **Root Directory**: deixe vazio
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server-postgres.js` ⚠️ **IMPORTANTE**
   - **Instance Type**: Free

### 3. Configurar Variáveis de Ambiente

No Render, na seção **Environment**, adicione:

```
NODE_ENV=production
PORT=3000
JWT_SECRET=marcelo_imoveis_secret_2024_change_this_in_production
DATABASE_URL=[COLE_AQUI_A_INTERNAL_DATABASE_URL]
FRONTEND_URL=https://corretormarcelo.netlify.app
```

**⚠️ IMPORTANTE**: 
- A `DATABASE_URL` é a **Internal Database URL** que você copiou no passo 1
- Exemplo: `postgresql://marcelo_admin:senha_gerada@dpg-xxxxx/marcelo_imoveis`

### 4. Deploy

1. Clique em **"Create Web Service"**
2. O Render fará automaticamente:
   - Clone do repositório
   - `npm install` (instala pg e dependências)
   - Executa `node server-postgres.js`
   - Roda migrations (cria tabelas automaticamente)
   - Cria usuário padrão: `marcelocorretor` / `marcelo0101!`

### 5. Verificar Deploy

Após o deploy (3-5 minutos):

1. Acesse a URL do seu backend (ex: `https://marcelo-imoveis-backend.onrender.com`)
2. Você verá a página estática servida
3. Teste a API: `https://marcelo-imoveis-backend.onrender.com/api/properties/home`

### 6. Logs para Verificar

No Render, vá em **Logs** e verifique:

```
✓ Conectado ao PostgreSQL
🔄 Iniciando migrations do banco de dados...
✓ Tabela users criada/verificada
✓ Tabela properties criada/verificada
✓ Índices criados/verificados
✓ Usuário padrão criado: marcelocorretor
✅ Database inicializado com sucesso!
🚀 Servidor rodando em http://localhost:3000
📊 Ambiente: production
🗄️  Database: PostgreSQL
✅ Sistema pronto para uso!
```

---

## 🔄 Diferenças entre SQLite e PostgreSQL

### O que muda para você:

**ANTES (SQLite - Temporário)**
- ❌ Dados somem a cada deploy
- ❌ Banco resetado quando server reinicia
- ❌ Imóveis cadastrados são perdidos

**AGORA (PostgreSQL - Persistente)**
- ✅ Dados permanentes
- ✅ Banco separado do servidor
- ✅ Imóveis salvos para sempre
- ✅ Backups automáticos pelo Render

### Schema atualizado:

A tabela `properties` agora usa **campos em inglês padronizados**:
- ✅ `category` (não `categoria`)
- ✅ `status: 'available'` (não `'disponivel'`)
- ✅ `property_type` (não `tipo`)
- ✅ `bedrooms`, `bathrooms`, `parking_spaces`
- ✅ Arrays nativos: `features`, `nearby_places`, `images`

---

## 🧪 Testar Localmente (Opcional)

Se quiser testar localmente antes de fazer deploy:

1. **Instale PostgreSQL** localmente:
   - Windows: [PostgreSQL Installer](https://www.postgresql.org/download/windows/)
   - Ou use Docker: `docker run -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres`

2. **Crie arquivo `.env`**:
```bash
cp .env.example .env
```

3. **Edite `.env`** com sua database URL local:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/marcelo_imoveis
```

4. **Rode o servidor**:
```bash
node server-postgres.js
```

---

## 🆘 Troubleshooting

### Erro: "connection refused"
- Verifique se DATABASE_URL está correta
- Use a **Internal Database URL**, não a External

### Erro: "too many connections"
- O free tier do PostgreSQL tem limite de 97 conexões
- Reinicie o Web Service se necessário

### Imóveis não aparecem
- Verifique se o campo `category` está correto: `'lancamentos'`, `'beira-mar'`, `'mais-procurados'`
- Verifique se o campo `status` está: `'available'` (não `'disponivel'`)

### CORS ainda bloqueando
- Verifique se `https://corretormarcelo.netlify.app` está na lista `allowedOrigins`
- Aguarde o deploy completar (5 minutos)
- Limpe cache do navegador (Ctrl+Shift+Del)

---

## 📊 Monitoramento

### Render Dashboard:
- **Logs**: Ver erros em tempo real
- **Metrics**: CPU, memória, requests
- **PostgreSQL**: Tamanho do banco, conexões ativas

### Free Tier Limits:
- **PostgreSQL**: 1GB de storage, 97 conexões simultâneas, 90 dias (depois expira)
- **Web Service**: 750 horas/mês, hiberna após 15 min inatividade

⚠️ **IMPORTANTE**: O PostgreSQL free expira em 90 dias. Antes disso:
1. Faça backup: `pg_dump` no Render
2. Crie novo PostgreSQL free
3. Restore do backup
4. Atualize DATABASE_URL no Web Service

---

## ✅ Próximos Passos

Após deploy bem-sucedido:

1. ✅ Login no dashboard: `marcelocorretor` / `marcelo0101!`
2. ✅ Cadastrar imóveis de teste
3. ✅ Verificar se aparecem no site
4. ✅ Fazer outro deploy para testar persistência
5. ✅ Confirmar que imóveis continuam lá! 🎉

---

**Precisa de ajuda?** Verifique os logs no Render e me avise se algo não funcionar!
