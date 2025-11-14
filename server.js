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

// Sistema de upload de imagens
const imageUploadSystem = require('./image-upload-server');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'marcelo_imoveis_secret_2024';

// ========================================
// CONFIGURAÇÕES DE SEGURANÇA
// ========================================

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "blob:", "https:"],
            connectSrc: ["'self'"],
        }
    }
}));

// Permitir origins do Netlify e localhost
const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'file://',
    process.env.FRONTEND_URL || 'https://seu-site.netlify.app'
];

app.use(cors({
    origin: function(origin, callback) {
        // Permitir requisições sem origin (mobile apps, curl, etc)
        if (!origin) return callback(null, true);
        
        // Permitir qualquer subdomínio do netlify em desenvolvimento
        if (origin.includes('netlify.app') || origin.includes('localhost')) {
            return callback(null, true);
        }
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Não permitido pelo CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname)));

// Upload middleware está configurado nas rotas específicas
app.use('/api/images', express.static(path.join(__dirname, 'assets', 'images')));

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

    const createPropertiesTable = `
        CREATE TABLE IF NOT EXISTS properties (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            descricao TEXT,
            finalidade TEXT NOT NULL, -- 'Venda', 'Aluguel', 'Temporada'
            tipo TEXT NOT NULL, -- 'Casa', 'Apartamento', 'Cobertura', 'Studio', 'Kitnet', 'Terreno', 'Comercial'
            price DECIMAL(15,2) NOT NULL,
            quartos TEXT, -- '1', '2', '3', '4' (4 ou mais)
            suites TEXT, -- '1', '2', '3', '4' (4 ou mais)
            banheiros TEXT, -- '1', '2', '3' (3 ou mais)
            vagas TEXT, -- '0', '1', '2', '3' (3 ou mais)
            area DECIMAL(10,2),
            endereco TEXT,
            bairro TEXT,
            cidade TEXT DEFAULT 'Maceió',
            estado TEXT DEFAULT 'AL',
            caracteristicas TEXT, -- Características especiais
            -- Informações financeiras
            ano_construcao INTEGER,
            iptu_mensal DECIMAL(10,2),
            condominio_mensal DECIMAL(10,2),
            situacao_imovel TEXT, -- 'novo', 'usado', 'na-planta', 'em-construcao'
            opcoes_financiamento TEXT, -- JSON array: ['financiamento-proprio', 'financiamento-bancario', 'entrada-parcelada', 'aceita-fgts']
            disponibilidade TEXT, -- 'imediata', '30-dias', '60-dias', '90-dias', 'aguardar-conclusao'
            -- Campos específicos para lançamentos
            andamento_obra TEXT, -- '0-25%', '26-50%', '51-75%', '76-99%', 'concluido'
            previsao_entrega TEXT, -- Data ou texto livre
            entrada_minima DECIMAL(10,2),
            images TEXT, -- JSON string with image URLs
            video_url TEXT,
            virtual_tour_url TEXT,
            status TEXT DEFAULT 'disponivel', -- 'disponivel', 'vendido', 'alugado', 'reservado'
            destaque BOOLEAN DEFAULT 0, -- Para imóveis em destaque
            categoria TEXT DEFAULT 'lancamentos', -- 'lancamentos', 'mais-procurados', 'beira-mar'
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users (id)
        )
    `;

    const createPropertyImagesTable = `
        CREATE TABLE IF NOT EXISTS property_images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            property_id INTEGER NOT NULL,
            image_url TEXT NOT NULL,
            image_title TEXT,
            is_main BOOLEAN DEFAULT 0,
            sort_order INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (property_id) REFERENCES properties (id) ON DELETE CASCADE
        )
    `;

    db.run(createUsersTable, (err) => {
        if (err) {
            console.error('❌ Erro ao criar tabela users:', err.message);
        } else {
            console.log('✅ Tabela users criada/verificada');
            
            // Criar tabela de imóveis
            db.run(createPropertiesTable, (err) => {
                if (err) {
                    console.error('❌ Erro ao criar tabela properties:', err.message);
                } else {
                    console.log('✅ Tabela properties criada/verificada');
                    
                    // Criar tabela de imagens
                    db.run(createPropertyImagesTable, (err) => {
                        if (err) {
                            console.error('❌ Erro ao criar tabela property_images:', err.message);
                        } else {
                            console.log('✅ Tabela property_images criada/verificada');
                            // Adicionar novas colunas se não existirem
                            updatePropertiesTableStructure();
                            createDefaultAdmin();
                        }
                    });
                }
            });
        }
    });
}

// Atualizar estrutura da tabela properties com novos campos
function updatePropertiesTableStructure() {
    const newColumns = [
        'ano_construcao INTEGER',
        'iptu_mensal DECIMAL(10,2)',
        'condominio_mensal DECIMAL(10,2)',
        'situacao_imovel TEXT',
        'opcoes_financiamento TEXT',
        'disponibilidade TEXT',
        'andamento_obra TEXT',
        'previsao_entrega TEXT',
        'entrada_minima DECIMAL(10,2)',
        "categoria TEXT DEFAULT 'lancamentos'"
    ];

    // Verificar quais colunas já existem
    db.all("PRAGMA table_info(properties)", (err, columns) => {
        if (err) {
            console.error('❌ Erro ao verificar estrutura da tabela properties:', err.message);
            return;
        }

        const existingColumns = columns.map(col => col.name);
        
        newColumns.forEach(columnDef => {
            const columnName = columnDef.split(' ')[0];
            
            if (!existingColumns.includes(columnName)) {
                db.run(`ALTER TABLE properties ADD COLUMN ${columnDef}`, (err) => {
                    if (err) {
                        console.error(`❌ Erro ao adicionar coluna ${columnName}:`, err.message);
                    } else {
                        console.log(`✅ Coluna ${columnName} adicionada à tabela properties`);
                    }
                });
            }
        });
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
// MIDDLEWARE DE AUTENTICAÇÃO
// ========================================

// Middleware para verificar JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Token de acesso requerido'
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Token inválido'
            });
        }
        req.user = user;
        next();
    });
}

// ========================================
// ROTAS DA API
// ========================================

// Rota de registro
// Rota de registro DESABILITADA - Sistema com único usuário administrador
app.post('/api/auth/register', async (req, res) => {
    res.status(403).json({
        success: false,
        message: 'Registro de novos usuários desabilitado. Sistema configurado para uso exclusivo.'
    });
});

// Rota de login
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Usuário e senha são obrigatórios'
        });
    }

    try {
        // Buscar usuário
        const user = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE email = ? AND is_active = 1', [username], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Usuário ou senha incorretos'
            });
        }

        // Verificar senha
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Usuário ou senha incorretos'
            });
        }

        // Atualizar último login
        db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

        // Gerar token (365 dias para login persistente)
        const token = jwt.sign(
            { userId: user.id, username: user.email, name: user.name, role: user.role },
            JWT_SECRET,
            { expiresIn: '365d' }
        );

        res.json({
            success: true,
            message: 'Login realizado com sucesso!',
            user: {
                id: user.id,
                username: user.email, // Campo 'email' armazena o username
                name: user.name,
                role: user.role
            },
            token,
            redirect: '/html/dashboard.html'
        });

        console.log('✅ Login realizado:', username);

    } catch (error) {
        console.error('❌ Erro no login:', error.message);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// ========================================
// ROTAS DO CRUD DE IMÓVEIS
// ========================================

// Listar todos os imóveis (com filtros opcionais) - VERSÃO DEFINITIVA
app.get('/api/properties', async (req, res) => {
    try {
        const { category, status = 'active', limit = 50 } = req.query;
        
        let query = `SELECT * FROM properties WHERE status = ?`;
        const params = [status];

        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }

        query += ' ORDER BY created_at DESC LIMIT ?';
        params.push(parseInt(limit));

        const properties = await new Promise((resolve, reject) => {
            db.all(query, params, (err, rows) => {
                if (err) {
                    console.error('Database error:', err);
                    reject(err);
                } else {
                    resolve(rows || []);
                }
            });
        });

        // Parse JSON fields de forma segura
        const processedProperties = properties.map(property => {
            const result = { ...property };
            
            // Parse features safely
            if (property.features) {
                try {
                    result.features = JSON.parse(property.features);
                } catch (e) {
                    result.features = [];
                }
            } else {
                result.features = [];
            }
            
            // Parse images safely
            if (property.images) {
                try {
                    result.images = JSON.parse(property.images);
                } catch (e) {
                    result.images = [];
                }
            } else {
                result.images = [];
            }
            
            return result;
        });

        res.json(processedProperties);

    } catch (error) {
        console.error('❌ Erro ao buscar imóveis:', error.message);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// Rota para buscar os 5 imóveis mais recentes por categoria (para index.html)
app.get('/api/properties/home', async (req, res) => {
    try {
        const categories = ['lancamentos', 'beira-mar', 'mais-procurados'];
        const result = {};

        for (const category of categories) {
            const query = `
                SELECT * FROM properties 
                WHERE categoria = ? AND status = 'disponivel'
                ORDER BY created_at DESC 
                LIMIT 5
            `;
            const properties = await new Promise((resolve, reject) => {
                db.all(query, [category], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                });
            });
            
            // Parse images para cada propriedade
            const processedProperties = properties.map(prop => ({
                ...prop,
                images: prop.images ? JSON.parse(prop.images) : []
            }));
            
            result[category] = processedProperties;
        }

        // Retornar objeto com arrays separados por categoria
        res.json(result);

    } catch (error) {
        console.error('❌ Erro ao buscar propriedades para home:', error.message);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// Buscar imóvel específico
app.get('/api/properties/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const property = await new Promise((resolve, reject) => {
            db.get(`
                SELECT p.*, u.name as created_by_name 
                FROM properties p 
                LEFT JOIN users u ON p.created_by = u.id 
                WHERE p.id = ?
            `, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Imóvel não encontrado'
            });
        }

        // Parse JSON fields
        const propertyWithParsedData = {
            ...property,
            features: property.features ? JSON.parse(property.features) : [],
            images: property.images ? JSON.parse(property.images) : []
        };

        res.json({
            success: true,
            data: propertyWithParsedData
        });

    } catch (error) {
        console.error('❌ Erro ao buscar imóvel:', error.message);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// Criar novo imóvel (requer autenticação)
app.post('/api/properties', authenticateToken, async (req, res) => {
    try {
        const {
            title,
            description,
            price_type,
            property_type,
            price,
            bedrooms,
            bathrooms,
            parking_spaces,
            area,
            address,
            neighborhood,
            city = 'Maceió',
            state = 'AL',
            features,
            category = 'lancamentos',
            status = 'active',
            highlight,
            // Informações financeiras
            ano_construcao, iptu_mensal, condominio_mensal, situacao_imovel,
            opcoes_financiamento, disponibilidade,
            // Campos específicos para lançamentos
            andamento_obra, previsao_entrega, entrada_minima,
            // Mídia
            images = [],
            video_url,
            virtual_tour_url,
            status = 'disponivel',
            destaque = false,
            categoria = 'lancamentos'
        } = req.body;

        // Validações
        if (!title || !price || !property_type || !category) {
            console.log('❌ Validação falhou:', { title, price, property_type, category });
            return res.status(400).json({
                success: false,
                message: 'Campos obrigatórios: title, price, property_type, category'
            });
        }

        console.log('✅ Validação passou, inserindo no banco...');

        const propertyId = await new Promise((resolve, reject) => {
            db.run(`
                INSERT INTO properties (
                    title, description, price_type, property_type, price, bedrooms, bathrooms,
                    parking_spaces, area, address, neighborhood, city, state, features,
                    ano_construcao, iptu_mensal, condominio_mensal, situacao_imovel,
                    opcoes_financiamento, disponibilidade, andamento_obra, previsao_entrega,
                    entrada_minima, images, video_url, virtual_tour_url, status, 
                    highlight, category, created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                title, description || '', price_type || 'sale', property_type, price, bedrooms || 0, bathrooms || 0,
                parking_spaces || 0, area, address, neighborhood, city, state, JSON.stringify(features || []),
                ano_construcao, iptu_mensal, condominio_mensal, situacao_imovel,
                opcoes_financiamento, disponibilidade, andamento_obra, 
                previsao_entrega, entrada_minima, JSON.stringify(images || []), video_url, 
                virtual_tour_url, status, highlight ? 1 : 0, category, req.user.userId
            ], function(err) {
                if (err) {
                    console.error('❌ Erro no INSERT:', err.message);
                    reject(err);
                } else {
                    console.log('✅ Imóvel inserido com ID:', this.lastID);
                    resolve(this.lastID);
                }
            });
        });

        res.status(201).json({
            success: true,
            message: 'Imóvel criado com sucesso!',
            data: { id: propertyId }
        });

        console.log('✅ Novo imóvel criado:', propertyId, 'por', req.user.username);

    } catch (error) {
        console.error('❌ Erro ao criar imóvel:', error.message);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// Atualizar imóvel (requer autenticação)
app.put('/api/properties/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Verificar se imóvel existe
        const existingProperty = await new Promise((resolve, reject) => {
            db.get('SELECT id, created_by FROM properties WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!existingProperty) {
            return res.status(404).json({
                success: false,
                message: 'Imóvel não encontrado'
            });
        }

        // Verificar permissão (apenas criador ou admin)
        if (existingProperty.created_by !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Sem permissão para editar este imóvel'
            });
        }

        // Montar query de update dinamicamente
        const allowedFields = [
            'title', 'descricao', 'finalidade', 'tipo', 'price', 'quartos', 'suites',
            'banheiros', 'vagas', 'area', 'endereco', 'bairro', 'cidade', 'estado',
            'caracteristicas', 'video_url', 'virtual_tour_url', 'status', 'destaque', 'categoria'
        ];

        const updateFields = [];
        const updateValues = [];

        for (const [key, value] of Object.entries(updateData)) {
            if (allowedFields.includes(key)) {
                updateFields.push(`${key} = ?`);
                if (key === 'images') {
                    updateValues.push(JSON.stringify(value));
                } else if (key === 'destaque') {
                    updateValues.push(value ? 1 : 0);
                } else {
                    updateValues.push(value);
                }
            }
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Nenhum campo válido para atualizar'
            });
        }

        updateFields.push('updated_at = CURRENT_TIMESTAMP');
        updateValues.push(id);

        await new Promise((resolve, reject) => {
            db.run(`
                UPDATE properties SET ${updateFields.join(', ')} WHERE id = ?
            `, updateValues, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        res.json({
            success: true,
            message: 'Imóvel atualizado com sucesso!'
        });

        console.log('✅ Imóvel atualizado:', id, 'por', req.user.username);

    } catch (error) {
        console.error('❌ Erro ao atualizar imóvel:', error.message);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// Deletar imóvel (requer autenticação)
app.delete('/api/properties/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar se imóvel existe
        const existingProperty = await new Promise((resolve, reject) => {
            db.get('SELECT id, created_by FROM properties WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!existingProperty) {
            return res.status(404).json({
                success: false,
                message: 'Imóvel não encontrado'
            });
        }

        // Verificar permissão (owner e admin podem deletar qualquer imóvel)
        if (req.user.role !== 'owner' && req.user.role !== 'admin' && existingProperty.created_by !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: 'Sem permissão para deletar este imóvel'
            });
        }

        await new Promise((resolve, reject) => {
            db.run('DELETE FROM properties WHERE id = ?', [id], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        res.json({
            success: true,
            message: 'Imóvel deletado com sucesso!'
        });

        console.log('✅ Imóvel deletado:', id, 'por', req.user.username);

    } catch (error) {
        console.error('❌ Erro ao deletar imóvel:', error.message);
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
// ROTAS DE UPLOAD DE IMAGENS
// ========================================

// Upload de imagens (requer autenticação)
app.post('/api/upload/images', authenticateToken, async (req, res) => {
    try {
        const result = await imageUploadSystem.processImages(req, res);
        res.json({
            success: true,
            images: result.urls,
            message: `${result.urls.length} imagem(ns) enviada(s) com sucesso`
        });
    } catch (error) {
        console.error('Erro no upload:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Erro no upload das imagens'
        });
    }
});

// Upload sem autenticação para desenvolvimento
app.post('/api/dev/upload/images', async (req, res) => {
    try {
        const result = await imageUploadSystem.processImages(req, res);
        res.json({
            success: true,
            images: result.urls,
            message: `${result.urls.length} imagem(ns) enviada(s) com sucesso`
        });
    } catch (error) {
        console.error('Erro no upload:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Erro no upload das imagens'
        });
    }
});

// ========================================
// ROTAS DE DESENVOLVIMENTO (SEM AUTENTICAÇÃO)
// ========================================

// POST sem autenticação para desenvolvimento
app.post('/api/dev/properties', async (req, res) => {
    try {
        console.log('📦 Dados recebidos:', JSON.stringify(req.body, null, 2));
        
        const {
            title, description, price_type, property_type, price, bedrooms, bathrooms,
            parking_spaces, area, address, neighborhood, city = 'Maceió', state = 'AL',
            features, status = 'active', category = 'lancamentos',
            // Informações financeiras
            ano_construcao, iptu_mensal, condominio_mensal, situacao_imovel,
            opcoes_financiamento, disponibilidade,
            // Campos específicos para lançamentos
            andamento_obra, previsao_entrega, entrada_minima,
            // Mídia
            images, video_url, virtual_tour_url, highlight
        } = req.body;

        if (!title || !price || !property_type || !category) {
            console.log('❌ Validação falhou:', { title, price, property_type, category });
            return res.status(400).json({
                success: false,
                message: 'Campos obrigatórios: title, price, property_type, category'
            });
        }

        console.log('✅ Validação passou, inserindo no banco...');

        const propertyId = await new Promise((resolve, reject) => {
            db.run(`
                INSERT INTO properties (
                    title, description, price_type, property_type, price, bedrooms, bathrooms,
                    parking_spaces, area, address, neighborhood, city, state, features,
                    ano_construcao, iptu_mensal, condominio_mensal, situacao_imovel,
                    opcoes_financiamento, disponibilidade, andamento_obra, previsao_entrega,
                    entrada_minima, images, video_url, virtual_tour_url, status, 
                    highlight, category, created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                title, description || '', price_type || 'sale', property_type, price, bedrooms || 0, bathrooms || 0,
                parking_spaces || 0, area, address, neighborhood, city, state, JSON.stringify(features || []),
                ano_construcao, iptu_mensal, condominio_mensal, situacao_imovel,
                opcoes_financiamento, disponibilidade, andamento_obra, 
                previsao_entrega, entrada_minima, JSON.stringify(images || []), video_url, 
                virtual_tour_url, status, highlight ? 1 : 0, category, 1
            ], function(err) {
                if (err) {
                    console.error('❌ Erro no INSERT:', err.message);
                    reject(err);
                } else {
                    console.log('✅ Imóvel inserido com ID:', this.lastID);
                    resolve(this.lastID);
                }
            });
        });

        res.json({
            success: true,
            message: 'Imóvel criado com sucesso',
            data: { id: propertyId }
        });

    } catch (error) {
        console.error('❌ Erro ao criar imóvel:', error.message);
        console.error('Stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor: ' + error.message
        });
    }
});

// ========================================
// DASHBOARD METRICS & ANALYTICS
// ========================================

// Rota para obter métricas do dashboard
app.get('/api/dashboard/metrics', authenticateToken, (req, res) => {
    try {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

        // Contadores
        let metrics = {
            activeProperties: 0,
            monthlySales: 0,
            monthlyRevenue: 0,
            newLeads: 0,
            changes: {
                properties: '+0%',
                sales: '+0%',
                revenue: '+0%',
                leads: '+0%'
            }
        };

        // Imóveis ativos
        db.get(`SELECT COUNT(*) as count FROM properties WHERE status = 'active'`, (err, row) => {
            if (!err && row) {
                metrics.activeProperties = row.count;
            }

            // Vendas do mês atual
            db.get(`
                SELECT COUNT(*) as count, SUM(price) as revenue 
                FROM properties 
                WHERE status = 'sold' 
                AND strftime('%m', created_at) = ? 
                AND strftime('%Y', created_at) = ?
            `, [currentMonth.toString().padStart(2, '0'), currentYear.toString()], (err, row) => {
                if (!err && row) {
                    metrics.monthlySales = row.count || 0;
                    metrics.monthlyRevenue = row.revenue || 0;
                }

                // Vendas do mês anterior (para comparação)
                db.get(`
                    SELECT COUNT(*) as count, SUM(price) as revenue 
                    FROM properties 
                    WHERE status = 'sold' 
                    AND strftime('%m', created_at) = ? 
                    AND strftime('%Y', created_at) = ?
                `, [lastMonth.toString().padStart(2, '0'), lastMonthYear.toString()], (err, lastMonthRow) => {
                    if (!err && lastMonthRow) {
                        const lastSales = lastMonthRow.count || 1;
                        const lastRevenue = lastMonthRow.revenue || 1;
                        
                        const salesChange = ((metrics.monthlySales - lastSales) / lastSales * 100).toFixed(0);
                        const revenueChange = ((metrics.monthlyRevenue - lastRevenue) / lastRevenue * 100).toFixed(0);
                        
                        metrics.changes.sales = salesChange >= 0 ? `+${salesChange}%` : `${salesChange}%`;
                        metrics.changes.revenue = revenueChange >= 0 ? `+${revenueChange}%` : `${revenueChange}%`;
                    }

                    // Leads reais (0 quando não há dados)
                    metrics.newLeads = 0;
                    metrics.changes.leads = '0%';
                    metrics.changes.properties = propertiesChange >= 0 ? `+${propertiesChange}%` : `${propertiesChange}%`;

                    res.json({
                        success: true,
                        metrics: metrics
                    });
                });
            });
        });
    } catch (error) {
        console.error('Erro ao buscar métricas:', error);
        res.status(500).json({ success: false, message: 'Erro ao buscar métricas' });
    }
});

// Rota para obter atividades recentes
app.get('/api/dashboard/activities', authenticateToken, (req, res) => {
    try {
        db.all(`
            SELECT 
                id,
                title,
                price,
                status,
                property_type,
                created_at
            FROM properties 
            ORDER BY created_at DESC 
            LIMIT 10
        `, (err, rows) => {
            if (err) {
                console.error('Erro ao buscar atividades:', err);
                return res.json({ success: true, activities: [] });
            }

            const activities = rows.map(row => {
                const timeAgo = this.getTimeAgo(new Date(row.created_at));
                
                let type = 'property';
                let icon = 'fa-home';
                let activityTitle = 'Imóvel Cadastrado';
                
                if (row.status === 'sold') {
                    type = 'sale';
                    icon = 'fa-dollar-sign';
                    activityTitle = 'Venda Concluída';
                } else if (row.status === 'rented') {
                    type = 'sale';
                    icon = 'fa-key';
                    activityTitle = 'Aluguel Fechado';
                }

                return {
                    type: type,
                    icon: icon,
                    title: activityTitle,
                    description: `${row.title} - R$ ${row.price.toLocaleString('pt-BR')}`,
                    time: timeAgo
                };
            });

            res.json({
                success: true,
                activities: activities
            });
        });
    } catch (error) {
        console.error('Erro ao buscar atividades:', error);
        res.json({ success: true, activities: [] });
    }
});

// Rota para obter imóveis em destaque (mais visualizados)
app.get('/api/dashboard/top-properties', authenticateToken, (req, res) => {
    try {
        db.all(`
            SELECT 
                id,
                title,
                price,
                neighborhood,
                city,
                images
            FROM properties 
            WHERE status = 'active'
            ORDER BY highlight DESC, created_at DESC
            LIMIT 5
        `, (err, rows) => {
            if (err) {
                console.error('Erro ao buscar top properties:', err);
                return res.json({ success: true, properties: [] });
            }

            const properties = rows.map(row => {
                let image = 'https://via.placeholder.com/60x60/667eea/ffffff?text=Img';
                
                if (row.images) {
                    try {
                        const images = JSON.parse(row.images);
                        if (images.length > 0) {
                            image = images[0];
                        }
                    } catch (e) {
                        // Use placeholder
                    }
                }

                return {
                    title: row.title,
                    location: `${row.neighborhood}, ${row.city}`,
                    views: 0,
                    leads: 0,
                    price: row.price,
                    image: image
                };
            });

            res.json({
                success: true,
                properties: properties
            });
        });
    } catch (error) {
        console.error('Erro ao buscar top properties:', error);
        res.json({ success: true, properties: [] });
    }
});

// ============================================
// ADMIN: Limpar todos os imóveis (apenas owner)
// ============================================
app.delete('/api/admin/clear-properties', authenticateToken, async (req, res) => {
    try {
        console.log('🗑️  Requisição para limpar todos os imóveis');
        console.log('👤 Usuário:', req.user.username, '| Role:', req.user.role);

        // Só owner pode limpar o banco
        if (req.user.role !== 'owner') {
            console.log('❌ Permissão negada: apenas owner pode limpar');
            return res.status(403).json({
                success: false,
                message: 'Apenas o proprietário pode limpar todos os imóveis'
            });
        }

        // Contar quantos imóveis serão deletados
        const countBefore = await new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as total FROM properties', [], (err, row) => {
                if (err) reject(err);
                else resolve(row.total);
            });
        });

        console.log(`📊 Imóveis a serem deletados: ${countBefore}`);

        // Deletar todos os imóveis
        await new Promise((resolve, reject) => {
            db.run('DELETE FROM properties', [], function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });

        // Resetar o contador de IDs
        await new Promise((resolve, reject) => {
            db.run("DELETE FROM sqlite_sequence WHERE name='properties'", [], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // Verificar se está vazio
        const countAfter = await new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as total FROM properties', [], (err, row) => {
                if (err) reject(err);
                else resolve(row.total);
            });
        });

        console.log('✅ Banco limpo com sucesso');
        console.log(`📊 Imóveis deletados: ${countBefore}`);
        console.log(`📊 Imóveis restantes: ${countAfter}`);

        res.json({
            success: true,
            message: 'Todos os imóveis foram removidos com sucesso',
            deleted: countBefore,
            remaining: countAfter
        });

    } catch (error) {
        console.error('❌ Erro ao limpar imóveis:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao limpar imóveis',
            error: error.message
        });
    }
});

// Helper function para calcular "tempo atrás"
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return `Há ${Math.floor(interval)} ${Math.floor(interval) === 1 ? 'ano' : 'anos'}`;
    
    interval = seconds / 2592000;
    if (interval > 1) return `Há ${Math.floor(interval)} ${Math.floor(interval) === 1 ? 'mês' : 'meses'}`;
    
    interval = seconds / 86400;
    if (interval > 1) return `Há ${Math.floor(interval)} ${Math.floor(interval) === 1 ? 'dia' : 'dias'}`;
    
    interval = seconds / 3600;
    if (interval > 1) return `Há ${Math.floor(interval)} ${Math.floor(interval) === 1 ? 'hora' : 'horas'}`;
    
    interval = seconds / 60;
    if (interval > 1) return `Há ${Math.floor(interval)} ${Math.floor(interval) === 1 ? 'minuto' : 'minutos'}`;
    
    return 'Agora';
}

// ========================================
// AGENDA & APPOINTMENTS API
// ========================================

// Criar tabela de agendamentos
db.run(`
    CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        client_name TEXT NOT NULL,
        client_phone TEXT NOT NULL,
        client_email TEXT,
        property_id INTEGER,
        appointment_date TEXT NOT NULL,
        appointment_time TEXT NOT NULL,
        location TEXT,
        type TEXT DEFAULT 'visit',
        status TEXT DEFAULT 'pending',
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
`, (err) => {
    if (err) {
        console.error('❌ Erro ao criar tabela appointments:', err.message);
    } else {
        console.log('✅ Tabela appointments verificada/criada');
    }
});

// GET - Listar todos os agendamentos
app.get('/api/appointments', authenticateToken, (req, res) => {
    const { status, month, year } = req.query;
    
    let query = 'SELECT * FROM appointments WHERE 1=1';
    let params = [];
    
    if (status) {
        query += ' AND status = ?';
        params.push(status);
    }
    
    if (month && year) {
        query += ` AND strftime('%m', appointment_date) = ? AND strftime('%Y', appointment_date) = ?`;
        params.push(month.toString().padStart(2, '0'), year.toString());
    }
    
    query += ' ORDER BY appointment_date ASC, appointment_time ASC';
    
    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Erro ao buscar agendamentos:', err);
            return res.status(500).json({ success: false, message: 'Erro ao buscar agendamentos' });
        }
        
        res.json({ success: true, appointments: rows });
    });
});

// GET - Buscar agendamento por ID
app.get('/api/appointments/:id', authenticateToken, (req, res) => {
    db.get('SELECT * FROM appointments WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Erro ao buscar agendamento' });
        }
        
        if (!row) {
            return res.status(404).json({ success: false, message: 'Agendamento não encontrado' });
        }
        
        res.json({ success: true, appointment: row });
    });
});

// POST - Criar novo agendamento
app.post('/api/appointments', authenticateToken, (req, res) => {
    const {
        title,
        client_name,
        client_phone,
        client_email,
        property_id,
        appointment_date,
        appointment_time,
        location,
        type,
        notes
    } = req.body;
    
    // Validações
    if (!title || !client_name || !client_phone || !appointment_date || !appointment_time) {
        return res.status(400).json({ 
            success: false, 
            message: 'Campos obrigatórios: título, nome do cliente, telefone, data e hora' 
        });
    }
    
    db.run(`
        INSERT INTO appointments (
            title, client_name, client_phone, client_email, property_id,
            appointment_date, appointment_time, location, type, notes, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `, [
        title, client_name, client_phone, client_email, property_id,
        appointment_date, appointment_time, location, type || 'visit', notes
    ], function(err) {
        if (err) {
            console.error('Erro ao criar agendamento:', err);
            return res.status(500).json({ success: false, message: 'Erro ao criar agendamento' });
        }
        
        res.json({ 
            success: true, 
            message: 'Agendamento criado com sucesso',
            appointment_id: this.lastID 
        });
    });
});

// PUT - Atualizar agendamento
app.put('/api/appointments/:id', authenticateToken, (req, res) => {
    const {
        title,
        client_name,
        client_phone,
        client_email,
        appointment_date,
        appointment_time,
        location,
        status,
        notes
    } = req.body;
    
    db.run(`
        UPDATE appointments SET
            title = ?,
            client_name = ?,
            client_phone = ?,
            client_email = ?,
            appointment_date = ?,
            appointment_time = ?,
            location = ?,
            status = ?,
            notes = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `, [
        title, client_name, client_phone, client_email,
        appointment_date, appointment_time, location, status, notes,
        req.params.id
    ], function(err) {
        if (err) {
            console.error('Erro ao atualizar agendamento:', err);
            return res.status(500).json({ success: false, message: 'Erro ao atualizar agendamento' });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ success: false, message: 'Agendamento não encontrado' });
        }
        
        res.json({ success: true, message: 'Agendamento atualizado com sucesso' });
    });
});

// DELETE - Deletar agendamento
app.delete('/api/appointments/:id', authenticateToken, (req, res) => {
    db.run('DELETE FROM appointments WHERE id = ?', [req.params.id], function(err) {
        if (err) {
            console.error('Erro ao deletar agendamento:', err);
            return res.status(500).json({ success: false, message: 'Erro ao deletar agendamento' });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ success: false, message: 'Agendamento não encontrado' });
        }
        
        res.json({ success: true, message: 'Agendamento deletado com sucesso' });
    });
});

// PATCH - Atualizar status do agendamento
app.patch('/api/appointments/:id/status', authenticateToken, (req, res) => {
    const { status } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Status inválido. Use: pending, confirmed, completed ou cancelled' 
        });
    }
    
    db.run(`
        UPDATE appointments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `, [status, req.params.id], function(err) {
        if (err) {
            console.error('Erro ao atualizar status:', err);
            return res.status(500).json({ success: false, message: 'Erro ao atualizar status' });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ success: false, message: 'Agendamento não encontrado' });
        }
        
        res.json({ success: true, message: 'Status atualizado com sucesso' });
    });
});

// ========================================
// INICIALIZAR SERVIDOR
// ========================================

// Rota de teste simples
app.get('/api/test', (req, res) => {
    console.log('🧪 Rota de teste chamada');
    res.json({ message: 'API funcionando!', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📍 Acesse: http://localhost:${PORT}`);
    console.log(`📧 Configure EMAIL_USER e EMAIL_PASS para envio de emails`);
    console.log(`🔧 Rota de desenvolvimento: POST /api/dev/properties`);
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