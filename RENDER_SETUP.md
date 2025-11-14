# 🚀 PASSO A PASSO: DEPLOY NO RENDER

## ✅ PRÉ-REQUISITOS
- [ ] Código no GitHub
- [ ] Frontend publicado no Netlify
- [ ] Conta no GitHub criada

---

## 📝 PASSO 1: Criar Conta no Render

1. Acesse: **https://render.com**
2. Clique em **"Get Started for Free"**
3. Escolha **"Sign in with GitHub"**
4. Autorize o Render a acessar seus repositórios

---

## 📦 PASSO 2: Criar Web Service

### 2.1 - No Dashboard do Render:
1. Clique no botão azul **"New +"** (canto superior direito)
2. Selecione **"Web Service"**

### 2.2 - Conectar Repositório:
1. Procure o repositório **"novo-site-marcelo"**
2. Clique em **"Connect"**

### 2.3 - Configurar o Serviço:

```
┌─────────────────────────────────────────────┐
│ CONFIGURAÇÕES OBRIGATÓRIAS                  │
├─────────────────────────────────────────────┤
│ Name:                                       │
│ marcelo-imoveis-backend                     │
│                                             │
│ Region:                                     │
│ Oregon (US West) - mais perto do BR        │
│                                             │
│ Branch:                                     │
│ master                                      │
│                                             │
│ Root Directory:                             │
│ novo-site-marcelo                           │
│                                             │
│ Runtime:                                    │
│ Node                                        │
│                                             │
│ Build Command:                              │
│ npm install                                 │
│                                             │
│ Start Command:                              │
│ node server.js                              │
│                                             │
│ Instance Type:                              │
│ Free                                        │
└─────────────────────────────────────────────┘
```

**NÃO clique em "Create Web Service" ainda!**

---

## 🔐 PASSO 3: Configurar Variáveis de Ambiente

### 3.1 - Ainda na tela de configuração, role até **"Environment Variables"**

### 3.2 - Adicione CADA variável (botão "Add Environment Variable"):

```bash
# 1. Ambiente
NODE_ENV=production

# 2. Porta (o Render define automaticamente, mas podemos garantir)
PORT=3000

# 3. JWT Secret (GERAR UM SEGURO!)
JWT_SECRET=
```

### 3.3 - Como gerar JWT_SECRET seguro:

**Opção A - No seu computador (PowerShell):**
```powershell
# Cole este comando no PowerShell:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Exemplo de resultado:
```
a4f8e2b9c1d7f3e6a8b5c9d2e4f7a1b3c5d8e2f4a7b9c1d3e5f7a9b2c4d6e8f1
```

**Copie esse valor e cole em JWT_SECRET**

### 3.4 - Adicionar variáveis de email (se quiser recuperação de senha):

```bash
# Email (Gmail)
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app-aqui
```

**Como obter senha de app do Gmail:**
1. Vá em: https://myaccount.google.com/security
2. Ative "Verificação em duas etapas"
3. Volte e procure "Senhas de app"
4. Crie uma senha para "Mail"
5. Use essa senha de 16 caracteres em EMAIL_PASS

### 3.5 - Adicionar URL do Frontend:

```bash
# URL do seu site no Netlify
FRONTEND_URL=https://seu-site.netlify.app
```

**⚠️ Troque pela URL REAL do seu Netlify!**

---

## 🚀 PASSO 4: Fazer Deploy

1. **Revise todas as configurações**
2. Clique no botão azul **"Create Web Service"**
3. Aguarde o build (vai aparecer logs coloridos)

### O que vai acontecer:
```
⏳ Cloning repository...
⏳ Installing dependencies...
⏳ Running npm install...
⏳ Starting server...
✅ Live! Your service is running
```

**Tempo estimado: 3-5 minutos**

---

## 📋 PASSO 5: Pegar URL do Backend

Quando o deploy terminar:

1. No topo da página vai aparecer:
   ```
   https://marcelo-imoveis-backend.onrender.com
   ```

2. **COPIE essa URL!**

---

## 🔗 PASSO 6: Conectar Frontend com Backend

### 6.1 - Abra o arquivo `js/config.js` no seu projeto

### 6.2 - Substitua a URL:

```javascript
const API_URL = isDevelopment 
    ? 'http://localhost:3000'
    : 'https://SEU-BACKEND.onrender.com';  // 👈 COLE AQUI
```

### 6.3 - Atualizar no Render também:

No painel do Render:
1. Vá em **"Environment"** (menu lateral)
2. Edite a variável `FRONTEND_URL`
3. Cole a URL do seu Netlify
4. Click em **"Save Changes"**

O serviço vai redeployar automaticamente!

---

## 🔄 PASSO 7: Atualizar Frontend no Netlify

### 7.1 - No seu computador:

```powershell
# Fazer commit das alterações
git add .
git commit -m "Conectado com backend do Render"
git push origin master
```

### 7.2 - O Netlify vai fazer deploy automático!

Aguarde 1-2 minutos e seu site estará atualizado.

---

## ✅ PASSO 8: Testar Integração

### 8.1 - Testar API diretamente:

Abra no navegador:
```
https://seu-backend.onrender.com/api/properties
```

**Deve retornar:** `[]` (array vazio) ou JSON com propriedades

### 8.2 - Testar Frontend:

1. Abra seu site no Netlify
2. Abra Console (F12)
3. Deve ver: `🌐 API URL: https://seu-backend.onrender.com`
4. Vá para página de lançamentos
5. **Se não aparecer erro de CORS = está funcionando!**

### 8.3 - Testar Dashboard:

1. Acesse: `https://seu-site.netlify.app/dashboard`
2. Faça login (se já tinha usuário criado)
3. Ou crie novo usuário
4. Dashboard deve carregar normalmente

---

## ⚠️ PROBLEMAS COMUNS

### ❌ Erro: "Application failed to respond"

**Solução:**
1. Vá em "Logs" no Render
2. Procure por erros
3. Geralmente é:
   - Dependência faltando
   - Start command errado
   - Porta incorreta

### ❌ Erro: "CORS policy"

**Solução:**
1. Verifique se `FRONTEND_URL` está correto no Render
2. Inclua a URL completa do Netlify (com https://)
3. Salve e aguarde redeploy

### ❌ Erro: "Failed to fetch"

**Solução:**
1. Verifique se `config.js` foi atualizado
2. Confirme que fez push para GitHub
3. Confirme que Netlify fez novo deploy

### ❌ Backend lento na primeira requisição

**Normal!** No plano FREE, o Render hiberna após 15 minutos de inatividade.
- Primeira requisição demora ~30 segundos
- Depois fica rápido
- Solução: upgrade para $7/mês

---

## 🔧 CONFIGURAÇÕES AVANÇADAS (Opcional)

### Persistent Disk (Para não perder banco SQLite)

No Render, vá em **"Disks"**:

```
┌─────────────────────────────────────────┐
│ Disk Name: database-disk                │
│ Mount Path: /opt/render/project/src/    │
│            novo-site-marcelo/database    │
│ Size: 1 GB                               │
│ Cost: $0.25/mês                          │
└─────────────────────────────────────────┘
```

### Health Check

Em **"Settings"** → **"Health Check Path"**:
```
/api/properties
```

O Render vai verificar se API está respondendo.

---

## 💰 CUSTOS

### Plano FREE:
- ✅ 750 horas/mês (31 dias = 744 horas)
- ✅ HTTPS gratuito
- ✅ Deploy automático
- ⚠️ Hiberna após 15 min de inatividade
- ⚠️ Pode perder banco SQLite em reinícios

### Plano Starter ($7/mês):
- ✅ Tudo do FREE
- ✅ Não hiberna (sempre online)
- ✅ Persistent disk incluído
- ✅ Melhor performance

---

## 📊 MONITORAMENTO

### Ver Logs em Tempo Real:

1. No Render, clique em **"Logs"** (menu lateral)
2. Veja requisições acontecendo ao vivo
3. Identifique erros rapidamente

### Comandos úteis:

```bash
# Ver status do serviço
https://dashboard.render.com

# Forçar novo deploy
Settings → Manual Deploy → Deploy latest commit

# Ver métricas
Events → Ver histórico de deploys
```

---

## 🎉 CHECKLIST FINAL

- [ ] Web Service criado no Render
- [ ] Todas as variáveis de ambiente configuradas
- [ ] JWT_SECRET gerado e salvo
- [ ] Build completado com sucesso (✅ Live)
- [ ] URL do backend copiada
- [ ] `config.js` atualizado com URL do Render
- [ ] Push para GitHub feito
- [ ] Netlify fez novo deploy
- [ ] Teste: API responde (abrir URL/api/properties)
- [ ] Teste: Frontend conecta (sem erro CORS)
- [ ] Teste: Dashboard faz login
- [ ] Teste: Criar propriedade funciona

---

## 🆘 PRECISA DE AJUDA?

### Documentação Oficial:
- Render: https://render.com/docs
- Node Deploy: https://render.com/docs/deploy-node-express-app

### Logs do Render:
```
Dashboard → Seu serviço → Logs
```

Sempre começe olhando os logs! Eles mostram exatamente o que deu errado.

---

**Data:** 14 de novembro de 2025  
**Tempo estimado total:** 15-20 minutos  
**Status:** Pronto para seguir! 🚀
