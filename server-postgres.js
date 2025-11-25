const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Importar conexão PostgreSQL e migrations
const { query, getClient, closePool } = require('./database/db');
const { initDatabase } = require('./database/migrations');

// Sistema de upload de imagens
const { handleImageUpload, handleImageDelete, setupStaticImages } = require('./image-upload-server');

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

// Configuração CORS segura e profissional
const allowedOrigins = [
    'https://corretormarcelo.netlify.app',
    'http://localhost:3000',
    'http://localhost:5500',
    'http://localhost:5501',
    'http://localhost:5502',
    'http://localhost:5503',
    'http://localhost:8080',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5500',
    'http://127.0.0.1:5501',
    'http://127.0.0.1:5502',
    'http://127.0.0.1:5503',
    'http://127.0.0.1:8080'
];

app.use(cors({
    origin: function(origin, callback) {
        // Permitir requisições sem origin (Postman, mobile apps)
        if (!origin) return callback(null, true);
        
        // Verificar se a origin está na lista permitida
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        // Rejeitar outras origins
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Length', 'Content-Type'],
    maxAge: 86400 // Cache preflight por 24h
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
// MIDDLEWARE DE AUTENTICAÇÃO
// ========================================

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Token de autenticação não fornecido'
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Token inválido ou expirado'
            });
        }
        req.user = user;
        next();
    });
}

// ========================================
// ROTAS DE AUTENTICAÇÃO
// ========================================

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username e senha são obrigatórios'
            });
        }

        // Buscar usuário por username
        const result = await query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Credenciais inválidas'
            });
        }

        const user = result.rows[0];

        // Verificar senha
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: 'Credenciais inválidas'
            });
        }

        // Gerar token JWT (válido por 1 ano)
        const token = jwt.sign(
            {
                userId: user.id,
                username: user.username,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: '365d' }
        );

        res.json({
            success: true,
            message: 'Login realizado com sucesso',
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });

        console.log('✓ Login bem-sucedido:', username);

    } catch (error) {
        console.error('❌ Erro no login:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// Verificar token
app.get('/api/auth/verify', authenticateToken, (req, res) => {
    res.json({
        success: true,
        user: {
            id: req.user.userId,
            username: req.user.username,
            role: req.user.role
        }
    });
});

// ========================================
// ROTAS DE IMÓVEIS
// ========================================

// Buscar imóveis com filtros e paginação
app.get('/api/properties', async (req, res) => {
    try {
        const {
            category,
            price_min,
            price_max,
            bedrooms,
            bathrooms,
            parking_spaces,
            property_type,
            neighborhood,
            city = 'Maceió',
            status = 'available',
            page = 1,
            limit = 12,
            sort = 'recent'
        } = req.query;

        // Construir query dinamicamente
        let whereConditions = [];
        let queryParams = [];
        let paramCounter = 1;

        // Filtro de categoria
        if (category) {
            whereConditions.push(`category = $${paramCounter}`);
            queryParams.push(category);
            paramCounter++;
        }

        // Filtro de status
        whereConditions.push(`status = $${paramCounter}`);
        queryParams.push(status);
        paramCounter++;

        // Filtro de preço
        if (price_min) {
            whereConditions.push(`sale_price >= $${paramCounter}`);
            queryParams.push(parseFloat(price_min));
            paramCounter++;
        }
        if (price_max) {
            whereConditions.push(`sale_price <= $${paramCounter}`);
            queryParams.push(parseFloat(price_max));
            paramCounter++;
        }

        // Filtros de características
        if (bedrooms) {
            whereConditions.push(`bedrooms >= $${paramCounter}`);
            queryParams.push(parseInt(bedrooms));
            paramCounter++;
        }
        if (bathrooms) {
            whereConditions.push(`bathrooms >= $${paramCounter}`);
            queryParams.push(parseInt(bathrooms));
            paramCounter++;
        }
        if (parking_spaces) {
            whereConditions.push(`parking_spaces >= $${paramCounter}`);
            queryParams.push(parseInt(parking_spaces));
            paramCounter++;
        }

        // Filtro de tipo de imóvel
        if (property_type) {
            whereConditions.push(`property_type = $${paramCounter}`);
            queryParams.push(property_type);
            paramCounter++;
        }

        // Filtro de bairro
        if (neighborhood) {
            whereConditions.push(`neighborhood ILIKE $${paramCounter}`);
            queryParams.push(`%${neighborhood}%`);
            paramCounter++;
        }

        // Filtro de cidade
        whereConditions.push(`city = $${paramCounter}`);
        queryParams.push(city);
        paramCounter++;

        // Montar WHERE clause
        const whereClause = whereConditions.length > 0 
            ? 'WHERE ' + whereConditions.join(' AND ')
            : '';

        // Ordenação
        let orderBy = 'ORDER BY created_at DESC';
        if (sort === 'price_asc') orderBy = 'ORDER BY sale_price ASC';
        if (sort === 'price_desc') orderBy = 'ORDER BY sale_price DESC';
        if (sort === 'area_asc') orderBy = 'ORDER BY total_area ASC';
        if (sort === 'area_desc') orderBy = 'ORDER BY total_area DESC';

        // Paginação
        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Query principal
        const propertiesQuery = `
            SELECT * FROM properties 
            ${whereClause}
            ${orderBy}
            LIMIT $${paramCounter} OFFSET $${paramCounter + 1}
        `;
        queryParams.push(parseInt(limit), offset);

        // Count total
        const countQuery = `
            SELECT COUNT(*) as total FROM properties 
            ${whereClause}
        `;

        const [propertiesResult, countResult] = await Promise.all([
            query(propertiesQuery, queryParams),
            query(countQuery, queryParams.slice(0, -2)) // Remove limit e offset do count
        ]);

        const total = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(total / parseInt(limit));

        res.json({
            success: true,
            data: propertiesResult.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages
            }
        });

    } catch (error) {
        console.error('❌ Erro ao buscar imóveis:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// Buscar imóveis para home (5 mais recentes por categoria)
app.get('/api/properties/home', async (req, res) => {
    try {
        const categories = ['lancamentos', 'beira-mar', 'mais-procurados'];
        const result = {};

        for (const category of categories) {
            const propertiesResult = await query(`
                SELECT * FROM properties 
                WHERE category = $1 AND status = $2
                ORDER BY created_at DESC 
                LIMIT 5
            `, [category, 'available']);
            
            result[category] = propertiesResult.rows;
        }

        res.json(result);

    } catch (error) {
        console.error('❌ Erro ao buscar propriedades para home:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// Buscar imóvel específico por ID
app.get('/api/properties/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query(`
            SELECT p.*, u.username as created_by_name 
            FROM properties p 
            LEFT JOIN users u ON p.created_by = u.id 
            WHERE p.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Imóvel não encontrado'
            });
        }

        // Incrementar visualizações
        await query(
            'UPDATE properties SET views = views + 1 WHERE id = $1',
            [id]
        );

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error('❌ Erro ao buscar imóvel:', error);
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
            category,
            status = 'available',
            address,
            neighborhood,
            city = 'Maceió',
            state = 'AL',
            zip_code,
            property_type,
            bedrooms = 0,
            bathrooms = 0,
            suites = 0,
            parking_spaces = 0,
            total_area,
            built_area,
            sale_price,
            rent_price,
            condo_fee,
            iptu,
            features = [],
            nearby_places = [],
            main_image,
            images = [],
            video_url,
            virtual_tour_url,
            is_featured = false
        } = req.body;

        // Validações
        if (!title || !category || !property_type) {
            return res.status(400).json({
                success: false,
                message: 'Campos obrigatórios: title, category, property_type'
            });
        }

        if (!sale_price && !rent_price) {
            return res.status(400).json({
                success: false,
                message: 'Informe pelo menos o preço de venda ou aluguel'
            });
        }

        // Inserir propriedade
        const result = await query(`
            INSERT INTO properties (
                title, description, category, status,
                address, neighborhood, city, state, zip_code,
                property_type, bedrooms, bathrooms, suites, parking_spaces,
                total_area, built_area, sale_price, rent_price, condo_fee, iptu,
                features, nearby_places, main_image, images, video_url, virtual_tour_url,
                is_featured, created_at, updated_at, published_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
                $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26,
                $27, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            ) RETURNING id
        `, [
            title, description, category, status,
            address, neighborhood, city, state, zip_code,
            property_type, bedrooms, bathrooms, suites, parking_spaces,
            total_area, built_area, sale_price, rent_price, condo_fee, iptu,
            features, nearby_places, main_image, images, video_url, virtual_tour_url,
            is_featured
        ]);

        const propertyId = result.rows[0].id;

        res.status(201).json({
            success: true,
            message: 'Imóvel criado com sucesso!',
            data: { id: propertyId }
        });

        console.log('✓ Novo imóvel criado:', propertyId, 'por', req.user.username);

    } catch (error) {
        console.error('❌ Erro ao criar imóvel:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});

// Atualizar imóvel (requer autenticação)
app.put('/api/properties/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Verificar se imóvel existe
        const checkResult = await query('SELECT id FROM properties WHERE id = $1', [id]);
        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Imóvel não encontrado'
            });
        }

        // Construir query de update dinamicamente
        const allowedFields = [
            'title', 'description', 'category', 'status', 'address', 'neighborhood',
            'city', 'state', 'zip_code', 'property_type', 'bedrooms', 'bathrooms',
            'suites', 'parking_spaces', 'total_area', 'built_area', 'sale_price',
            'rent_price', 'condo_fee', 'iptu', 'features', 'nearby_places',
            'main_image', 'images', 'video_url', 'virtual_tour_url', 'is_featured'
        ];

        const setClause = [];
        const values = [];
        let paramCounter = 1;

        Object.keys(updates).forEach(key => {
            if (allowedFields.includes(key)) {
                setClause.push(`${key} = $${paramCounter}`);
                values.push(updates[key]);
                paramCounter++;
            }
        });

        if (setClause.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Nenhum campo válido para atualizar'
            });
        }

        // Adicionar updated_at
        setClause.push(`updated_at = CURRENT_TIMESTAMP`);

        // Adicionar ID no final
        values.push(id);

        const updateQuery = `
            UPDATE properties 
            SET ${setClause.join(', ')}
            WHERE id = $${paramCounter}
        `;

        await query(updateQuery, values);

        res.json({
            success: true,
            message: 'Imóvel atualizado com sucesso'
        });

        console.log('✓ Imóvel atualizado:', id, 'por', req.user.username);

    } catch (error) {
        console.error('❌ Erro ao atualizar imóvel:', error);
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

        const result = await query('DELETE FROM properties WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Imóvel não encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Imóvel deletado com sucesso'
        });

        console.log('✓ Imóvel deletado:', id, 'por', req.user.username);

    } catch (error) {
        console.error('❌ Erro ao deletar imóvel:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// ========================================
// ROTAS DE UPLOAD DE IMAGENS
// ========================================

// Configurar rotas de upload
setupStaticImages(app);
app.post('/api/upload/images', authenticateToken, handleImageUpload);
app.delete('/api/upload/images/:filename', authenticateToken, handleImageDelete);

// ========================================
// INICIALIZAÇÃO DO SERVIDOR
// ========================================

async function startServer() {
    try {
        // Inicializar banco de dados
        await initDatabase();
        
        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`\n🚀 Servidor rodando em http://localhost:${PORT}`);
            console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🗄️  Database: PostgreSQL`);
            console.log(`✅ Sistema pronto para uso!\n`);
        });

    } catch (error) {
        console.error('❌ Erro ao iniciar servidor:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('\n⚠️  SIGTERM recebido, fechando servidor gracefully...');
    await closePool();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('\n⚠️  SIGINT recebido, fechando servidor gracefully...');
    await closePool();
    process.exit(0);
});

// Iniciar servidor
startServer();
