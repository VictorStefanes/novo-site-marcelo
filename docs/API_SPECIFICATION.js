/**
 * ESPECIFICAÇÃO DA API - SISTEMA IMOBILIÁRIO
 * Estrutura completa para backend com Node.js/Express
 */

// ============================================
// ESTRUTURA DO BANCO DE DADOS
// ============================================

const DATABASE_SCHEMA = {
    // Tabela de Usuários (Corretores)
    users: {
        id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
        username: 'VARCHAR(50) UNIQUE NOT NULL',
        email: 'VARCHAR(100) UNIQUE NOT NULL',
        password_hash: 'VARCHAR(255) NOT NULL',
        name: 'VARCHAR(100) NOT NULL',
        phone: 'VARCHAR(20)',
        avatar: 'VARCHAR(255)',
        plan: 'ENUM("free", "basic", "premium") DEFAULT "free"',
        created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
        updated_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
        last_login: 'DATETIME',
        active: 'BOOLEAN DEFAULT 1'
    },

    // Tabela de Propriedades
    properties: {
        id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
        user_id: 'INTEGER NOT NULL', // FK para users.id
        title: 'VARCHAR(200) NOT NULL',
        description: 'TEXT',
        category: 'ENUM("mais-procurados", "lancamentos", "pronto-morar", "beira-mar") NOT NULL',
        type: 'ENUM("apartamento", "casa", "terreno", "comercial") NOT NULL',
        status: 'ENUM("disponivel", "vendido", "reservado") DEFAULT "disponivel"',
        
        // Localização
        address: 'VARCHAR(255)',
        neighborhood: 'VARCHAR(100)',
        city: 'VARCHAR(100) DEFAULT "Maceió"',
        state: 'VARCHAR(2) DEFAULT "AL"',
        zipcode: 'VARCHAR(10)',
        latitude: 'DECIMAL(10, 8)',
        longitude: 'DECIMAL(11, 8)',
        
        // Características
        price: 'DECIMAL(12, 2) NOT NULL',
        bedrooms: 'INTEGER DEFAULT 0',
        bathrooms: 'INTEGER DEFAULT 0',
        parking: 'INTEGER DEFAULT 0',
        area: 'DECIMAL(8, 2)', // m²
        built_area: 'DECIMAL(8, 2)', // m²
        lot_area: 'DECIMAL(8, 2)', // m²
        
        // Comodidades (JSON array)
        amenities: 'TEXT', // JSON: ["piscina", "academia", "churrasqueira"]
        
        // SEO e busca
        slug: 'VARCHAR(255) UNIQUE',
        keywords: 'TEXT',
        
        // Metadados
        featured: 'BOOLEAN DEFAULT 0', // Destaque especial
        views: 'INTEGER DEFAULT 0',
        created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
        updated_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
    },

    // Tabela de Imagens
    property_images: {
        id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
        property_id: 'INTEGER NOT NULL', // FK para properties.id
        filename: 'VARCHAR(255) NOT NULL',
        original_name: 'VARCHAR(255)',
        path: 'VARCHAR(500) NOT NULL',
        size: 'INTEGER', // bytes
        mime_type: 'VARCHAR(50)',
        order: 'INTEGER DEFAULT 0', // ordem de exibição
        is_cover: 'BOOLEAN DEFAULT 0', // imagem principal
        created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
    },

    // Tabela de Leads/Contatos
    leads: {
        id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
        property_id: 'INTEGER NOT NULL',
        user_id: 'INTEGER NOT NULL', // corretor
        name: 'VARCHAR(100) NOT NULL',
        email: 'VARCHAR(100)',
        phone: 'VARCHAR(20) NOT NULL',
        message: 'TEXT',
        source: 'ENUM("site", "whatsapp", "telefone") DEFAULT "site"',
        status: 'ENUM("novo", "contatado", "agendado", "finalizado") DEFAULT "novo"',
        created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
    }
};

// ============================================
// ENDPOINTS DA API
// ============================================

const API_ENDPOINTS = {
    // Autenticação
    auth: {
        'POST /api/auth/login': {
            description: 'Login do corretor',
            body: { username: 'string', password: 'string' },
            response: { token: 'string', user: 'object', expires: 'string' }
        },
        'POST /api/auth/register': {
            description: 'Registro de novo corretor',
            body: { username: 'string', email: 'string', password: 'string', name: 'string' },
            response: { message: 'string', user: 'object' }
        },
        'POST /api/auth/logout': {
            description: 'Logout do corretor',
            headers: { Authorization: 'Bearer token' },
            response: { message: 'string' }
        },
        'GET /api/auth/me': {
            description: 'Dados do usuário logado',
            headers: { Authorization: 'Bearer token' },
            response: { user: 'object' }
        }
    },

    // Propriedades - CRUD Completo
    properties: {
        'GET /api/properties': {
            description: 'Lista todas as propriedades do corretor',
            query: {
                category: 'string (opcional)',
                status: 'string (opcional)',
                limit: 'number (default: 50)',
                offset: 'number (default: 0)',
                search: 'string (opcional)'
            },
            response: {
                properties: 'array',
                total: 'number',
                page: 'number',
                totalPages: 'number'
            }
        },
        'GET /api/properties/highlights': {
            description: 'Últimos 4 imóveis por categoria para destaque no index',
            response: {
                'mais-procurados': 'array[4]',
                'lancamentos': 'array[4]',
                'pronto-morar': 'array[4]',
                'beira-mar': 'array[4]'
            }
        },
        'GET /api/properties/:id': {
            description: 'Detalhes de uma propriedade específica',
            response: { property: 'object', images: 'array' }
        },
        'POST /api/properties': {
            description: 'Criar nova propriedade',
            body: {
                title: 'string',
                description: 'string',
                category: 'string',
                type: 'string',
                price: 'number',
                address: 'string',
                neighborhood: 'string',
                bedrooms: 'number',
                bathrooms: 'number',
                parking: 'number',
                area: 'number',
                amenities: 'array'
            },
            response: { property: 'object', message: 'string' }
        },
        'PUT /api/properties/:id': {
            description: 'Atualizar propriedade existente',
            body: 'object (mesmo que POST)',
            response: { property: 'object', message: 'string' }
        },
        'DELETE /api/properties/:id': {
            description: 'Excluir propriedade',
            response: { message: 'string' }
        }
    },

    // Upload de Imagens
    uploads: {
        'POST /api/properties/:id/images': {
            description: 'Upload de imagens para propriedade',
            contentType: 'multipart/form-data',
            body: { images: 'file[]' },
            response: { images: 'array', message: 'string' }
        },
        'DELETE /api/properties/:id/images/:imageId': {
            description: 'Excluir imagem específica',
            response: { message: 'string' }
        },
        'PUT /api/properties/:id/images/:imageId/cover': {
            description: 'Definir imagem como capa',
            response: { message: 'string' }
        }
    },

    // Leads e Contatos
    leads: {
        'GET /api/leads': {
            description: 'Lista todos os leads do corretor',
            query: { status: 'string (opcional)', limit: 'number', offset: 'number' },
            response: { leads: 'array', total: 'number' }
        },
        'POST /api/leads': {
            description: 'Criar novo lead (contato do site)',
            body: {
                property_id: 'number',
                name: 'string',
                email: 'string',
                phone: 'string',
                message: 'string',
                source: 'string'
            },
            response: { lead: 'object', message: 'string' }
        },
        'PUT /api/leads/:id/status': {
            description: 'Atualizar status do lead',
            body: { status: 'string' },
            response: { message: 'string' }
        }
    },

    // Dashboard Analytics
    dashboard: {
        'GET /api/dashboard/stats': {
            description: 'Estatísticas do dashboard',
            response: {
                totalProperties: 'number',
                totalLeads: 'number',
                totalViews: 'number',
                monthlyStats: 'object',
                categoryBreakdown: 'object',
                recentActivity: 'array'
            }
        }
    }
};

// ============================================
// ESTRUTURA DE PASTAS DO BACKEND
// ============================================

const BACKEND_STRUCTURE = `
backend/
├── server.js                 # Servidor principal Express
├── package.json              # Dependências Node.js
├── .env                      # Variáveis de ambiente
├── .gitignore               # Git ignore
├── database/
│   ├── database.db          # SQLite database
│   ├── migrations/          # Migrações do DB
│   └── seeds/              # Dados iniciais
├── routes/
│   ├── auth.js             # Rotas de autenticação
│   ├── properties.js       # CRUD de propriedades
│   ├── uploads.js          # Upload de imagens
│   ├── leads.js            # Leads e contatos
│   └── dashboard.js        # Dashboard analytics
├── middleware/
│   ├── auth.js             # Verificação de token JWT
│   ├── upload.js           # Configuração multer
│   └── validation.js       # Validação de dados
├── models/
│   ├── User.js             # Model de usuário
│   ├── Property.js         # Model de propriedade
│   ├── PropertyImage.js    # Model de imagens
│   └── Lead.js             # Model de leads
├── utils/
│   ├── database.js         # Configuração SQLite
│   ├── jwt.js              # Funções JWT
│   ├── upload.js           # Configuração de upload
│   └── helpers.js          # Funções auxiliares
├── uploads/                # Pasta para imagens
│   ├── properties/         # Imagens de propriedades
│   └── avatars/           # Avatars de usuários
└── public/                 # Arquivos estáticos
    └── api-docs/          # Documentação da API
`;

// ============================================
// DEPENDÊNCIAS NECESSÁRIAS
// ============================================

const PACKAGE_JSON = {
    "name": "marcelo-imoveis-api",
    "version": "1.0.0",
    "description": "API para sistema imobiliário SaaS",
    "main": "server.js",
    "scripts": {
        "start": "node server.js",
        "dev": "nodemon server.js",
        "migrate": "node database/migrate.js",
        "seed": "node database/seed.js"
    },
    "dependencies": {
        "express": "^4.18.2",           // Framework web
        "cors": "^2.8.5",              // CORS para frontend
        "helmet": "^7.0.0",            // Segurança
        "sqlite3": "^5.1.6",           // Database SQLite
        "bcryptjs": "^2.4.3",          // Hash de senhas
        "jsonwebtoken": "^9.0.2",      // JWT tokens
        "multer": "^1.4.5",            // Upload de arquivos
        "sharp": "^0.32.6",            // Processamento de imagens
        "express-validator": "^7.0.1",  // Validação
        "express-rate-limit": "^6.10.0", // Rate limiting
        "dotenv": "^16.3.1"            // Variáveis de ambiente
    },
    "devDependencies": {
        "nodemon": "^3.0.1"           // Auto-restart em desenvolvimento
    }
};

// ============================================
// EXEMPLOS DE RESPOSTA DA API
// ============================================

const API_EXAMPLES = {
    // GET /api/properties/highlights
    highlights: {
        "mais-procurados": [
            {
                "id": 1,
                "title": "Apartamento Vista Mar Completo",
                "location": "Ponta Verde, Maceió - AL",
                "price": 850000,
                "bedrooms": 3,
                "bathrooms": 2,
                "parking": 2,
                "area": 120,
                "images": [
                    "/uploads/properties/1/cover.jpg",
                    "/uploads/properties/1/sala.jpg"
                ],
                "category": "mais-procurados",
                "status": "disponivel",
                "featured": true,
                "created_at": "2025-11-06T10:30:00Z"
            }
        ],
        "lancamentos": ["Array com propriedades da categoria lançamentos"],
        "pronto-morar": ["Array com propriedades da categoria pronto-morar"],
        "beira-mar": ["Array com propriedades da categoria beira-mar"]
    },

    // POST /api/properties
    createProperty: {
        "property": {
            "id": 15,
            "title": "Casa Moderna em Condomínio",
            "slug": "casa-moderna-condominio-15",
            "category": "pronto-morar",
            "price": 680000,
            "created_at": "2025-11-06T15:45:00Z"
        },
        "message": "Propriedade criada com sucesso!"
    }
};

module.exports = {
    DATABASE_SCHEMA,
    API_ENDPOINTS,
    BACKEND_STRUCTURE,
    PACKAGE_JSON,
    API_EXAMPLES
};