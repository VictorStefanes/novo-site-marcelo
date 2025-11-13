const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'marcelo_imoveis_secret_2024';

// ========================================
// CONFIGURAÇÕES DE SEGURANÇA
// ========================================

app.use(helmet());
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'file://'],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por IP
    message: 'Muitas tentativas. Tente novamente em 15 minutos.'
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo 5 tentativas de login por IP
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
});

app.use(limiter);
app.use('/api/auth', authLimiter);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ========================================
// CONFIGURAÇÃO DO BANCO DE DADOS
// ========================================

const dbPath = path.join(__dirname, 'database', 'users.db');

// Criar diretório do banco se não existir
if (!fs.existsSync(path.dirname(dbPath))) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Erro ao conectar com banco de dados:', err.message);
    } else {
        console.log('✅ Conectado ao banco SQLite');
        initializeDatabase();
    }
});

// Inicializar tabelas
function initializeDatabase() {
    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT DEFAULT 'client',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME,
            is_active BOOLEAN DEFAULT 1,
            verification_token TEXT,
            is_verified BOOLEAN DEFAULT 0
        )
    `;

    db.run(createUsersTable, (err) => {
        if (err) {
            console.error('❌ Erro ao criar tabela users:', err.message);
        } else {
            console.log('✅ Tabela users criada/verificada');
            createDefaultAdmin();
        }
    });
}

// Criar admin padrão
function createDefaultAdmin() {
    const adminEmail = 'admin@marceloimoveis.com';
    
    db.get('SELECT id FROM users WHERE email = ?', [adminEmail], async (err, row) => {
        if (err) {
            console.error('❌ Erro ao verificar admin:', err.message);
        } else if (!row) {
            const hashedPassword = await bcrypt.hash('admin123', 12);
            
            db.run(`INSERT INTO users (email, password, name, role, is_verified) 
                    VALUES (?, ?, ?, ?, ?)`, 
                   [adminEmail, hashedPassword, 'Administrador', 'admin', 1], 
                   (err) => {
                if (err) {
                    console.error('❌ Erro ao criar admin:', err.message);
                } else {
                    console.log('✅ Admin padrão criado:', adminEmail);
                }
            });
        }
    });
}

// ========================================
// CONFIGURAÇÃO DE EMAIL
// ========================================

// Configurar transportador de email (use suas credenciais)
const emailTransporter = nodemailer.createTransport({
    service: 'gmail', // ou outro provedor
    auth: {
        user: process.env.EMAIL_USER || 'seu-email@gmail.com', // Configure no .env
        pass: process.env.EMAIL_PASS || 'sua-senha-app'        // Use senha de app
    }
});

// Função para enviar email de boas-vindas
async function sendWelcomeEmail(userEmail, userName, password) {
    const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@marceloimoveis.com',
        to: userEmail,
        subject: '🏠 Bem-vindo ao Marcelo Imóveis - Suas Credenciais',
        html: `
            <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; border-radius: 15px; overflow: hidden;">
                <div style="padding: 2rem; text-align: center;">
                    <h1 style="color: #d4af37; margin-bottom: 1rem; font-size: 2rem;">
                        🏠 Marcelo Imóveis
                    </h1>
                    
                    <h2 style="color: #ffffff; margin-bottom: 2rem;">
                        Bem-vindo, ${userName}!
                    </h2>
                    
                    <div style="background: rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 10px; margin: 2rem 0; backdrop-filter: blur(10px);">
                        <h3 style="color: #d4af37; margin-bottom: 1rem;">🔑 Suas Credenciais de Acesso</h3>
                        
                        <div style="text-align: left; margin: 1rem 0;">
                            <p><strong>📧 Email:</strong> ${userEmail}</p>
                            <p><strong>🔐 Senha:</strong> <code style="background: rgba(0,0,0,0.3); padding: 4px 8px; border-radius: 4px; color: #d4af37;">${password}</code></p>
                        </div>
                        
                        <div style="margin: 1.5rem 0; padding: 1rem; background: rgba(212, 175, 55, 0.1); border-radius: 8px; border-left: 4px solid #d4af37;">
                            <p style="margin: 0; font-size: 0.9rem;">
                                <strong>🔒 Importante:</strong> Guarde essas credenciais em local seguro. Você pode alterar sua senha após o primeiro login.
                            </p>
                        </div>
                    </div>
                    
                    <div style="margin: 2rem 0;">
                        <a href="#" style="display: inline-block; background: linear-gradient(135deg, #d4af37, #f4d03f); color: #1a1a2e; padding: 1rem 2rem; text-decoration: none; border-radius: 8px; font-weight: bold; transition: all 0.3s;">
                            🚀 Acessar Dashboard
                        </a>
                    </div>
                    
                    <hr style="border: 1px solid rgba(255,255,255,0.2); margin: 2rem 0;">
                    
                    <div style="font-size: 0.9rem; color: rgba(255,255,255,0.7);">
                        <p>📞 Suporte: (XX) XXXX-XXXX</p>
                        <p>🌐 Site: www.marceloimoveis.com</p>
                        <p style="margin-top: 1rem;">
                            Este é um email automático. Sua conta foi criada com sucesso!
                        </p>
                    </div>
                </div>
            </div>
        `
    };

    try {
        await emailTransporter.sendMail(mailOptions);
        console.log('✅ Email enviado para:', userEmail);
        return true;
    } catch (error) {
        console.error('❌ Erro ao enviar email:', error.message);
        return false;
    }
}

// ========================================
// ROTAS DA API
// ========================================

// Rota de registro
app.post('/api/auth/register', async (req, res) => {
    const { email, password, name } = req.body;

    // Validações
    if (!email || !password || !name) {
        return res.status(400).json({
            success: false,
            message: 'Todos os campos são obrigatórios'
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: 'Senha deve ter pelo menos 6 caracteres'
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'Email inválido'
        });
    }

    try {
        // Verificar se email já existe
        const existingUser = await new Promise((resolve, reject) => {
            db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Email já está em uso'
            });
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, 12);

        // Criar usuário
        const userId = await new Promise((resolve, reject) => {
            db.run(`INSERT INTO users (email, password, name, role, is_verified) 
                    VALUES (?, ?, ?, ?, ?)`,
                   [email, hashedPassword, name, 'client', 1],
                   function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
        });

        // Gerar token JWT
        const token = jwt.sign(
            { userId, email, name, role: 'client' },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Enviar email de boas-vindas (não bloquear se falhar)
        sendWelcomeEmail(email, name, password).catch(console.error);

        // Resposta de sucesso
        res.status(201).json({
            success: true,
            message: 'Conta criada com sucesso!',
            user: {
                id: userId,
                email,
                name,
                role: 'client'
            },
            token,
            redirect: '/html/dashboard.html'
        });

        console.log('✅ Novo usuário registrado:', email);

    } catch (error) {
        console.error('❌ Erro no registro:', error.message);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// Rota de login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email e senha são obrigatórios'
        });
    }

    try {
        // Buscar usuário
        const user = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE email = ? AND is_active = 1', [email], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email ou senha incorretos'
            });
        }

        // Verificar senha
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Email ou senha incorretos'
            });
        }

        // Atualizar último login
        db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

        // Gerar token
        const token = jwt.sign(
            { userId: user.id, email: user.email, name: user.name, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login realizado com sucesso!',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            },
            token,
            redirect: '/html/dashboard.html'
        });

        console.log('✅ Login realizado:', email);

    } catch (error) {
        console.error('❌ Erro no login:', error.message);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// Rota para servir arquivos estáticos
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ========================================
// INICIALIZAR SERVIDOR
// ========================================

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📍 Acesse: http://localhost:${PORT}`);
    console.log(`📧 Configure EMAIL_USER e EMAIL_PASS para envio de emails`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🔄 Fechando servidor...');
    db.close((err) => {
        if (err) {
            console.error('❌ Erro ao fechar banco:', err.message);
        } else {
            console.log('✅ Banco de dados fechado');
        }
        process.exit(0);
    });
});