const { query } = require('./db');

/**
 * Inicializa as tabelas do banco de dados PostgreSQL
 * Executa as migrations necessárias para criar a estrutura
 */
async function initDatabase() {
    try {
        console.log('🔄 Iniciando migrations do banco de dados...');

        // Tabela de usuários
        await query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role VARCHAR(50) DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✓ Tabela users criada/verificada');

        // Tabela de propriedades com schema padronizado em inglês
        await query(`
            CREATE TABLE IF NOT EXISTS properties (
                id SERIAL PRIMARY KEY,
                
                -- Informações básicas
                title VARCHAR(255) NOT NULL,
                description TEXT,
                category VARCHAR(100) NOT NULL,
                status VARCHAR(50) DEFAULT 'available',
                
                -- Localização
                address TEXT,
                neighborhood VARCHAR(255),
                city VARCHAR(255),
                state VARCHAR(100),
                zip_code VARCHAR(20),
                
                -- Características do imóvel
                property_type VARCHAR(100),
                bedrooms INTEGER DEFAULT 0,
                bathrooms INTEGER DEFAULT 0,
                suites INTEGER DEFAULT 0,
                parking_spaces INTEGER DEFAULT 0,
                total_area DECIMAL(10, 2),
                built_area DECIMAL(10, 2),
                
                -- Valores
                sale_price DECIMAL(15, 2),
                rent_price DECIMAL(15, 2),
                condo_fee DECIMAL(15, 2),
                iptu DECIMAL(15, 2),
                
                -- Features e amenidades
                features TEXT[], -- Array de features
                nearby_places TEXT[], -- Array de locais próximos
                
                -- Mídia
                main_image TEXT,
                images TEXT[], -- Array de URLs de imagens
                video_url TEXT,
                virtual_tour_url TEXT,
                
                -- Metadados
                views INTEGER DEFAULT 0,
                is_featured BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                published_at TIMESTAMP,
                
                -- Índices para buscas
                CONSTRAINT valid_category CHECK (category IN ('lancamentos', 'beira-mar', 'mais-procurados', 'pronto-morar')),
                CONSTRAINT valid_status CHECK (status IN ('available', 'sold', 'rented', 'reserved'))
            )
        `);
        console.log('✓ Tabela properties criada/verificada');

        // Índices para melhor performance
        await query(`
            CREATE INDEX IF NOT EXISTS idx_properties_category ON properties(category);
        `);
        await query(`
            CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
        `);
        await query(`
            CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at DESC);
        `);
        await query(`
            CREATE INDEX IF NOT EXISTS idx_properties_category_status ON properties(category, status);
        `);
        console.log('✓ Índices criados/verificados');

        // Criar usuário padrão se não existir
        const userCheck = await query(
            'SELECT id FROM users WHERE username = $1',
            ['marcelocorretor']
        );

        if (userCheck.rows.length === 0) {
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash('marcelo0101!', 10);
            
            await query(
                'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)',
                ['marcelocorretor', hashedPassword, 'owner']
            );
            console.log('✓ Usuário padrão criado: marcelocorretor');
        } else {
            console.log('✓ Usuário padrão já existe');
        }

        console.log('✅ Database inicializado com sucesso!');
        return true;

    } catch (error) {
        console.error('❌ Erro ao inicializar database:', error);
        throw error;
    }
}

module.exports = { initDatabase };
