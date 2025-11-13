const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

console.log('🔧 Inicializando banco de dados...');

const dbPath = path.join(__dirname, '..', 'database', 'users.db');

// Criar diretório se não existir
if (!fs.existsSync(path.dirname(dbPath))) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    console.log('📁 Diretório do banco criado');
}

const db = new sqlite3.Database(dbPath, async (err) => {
    if (err) {
        console.error('❌ Erro ao conectar:', err.message);
        process.exit(1);
    }
    
    console.log('✅ Conectado ao banco SQLite');
    
    try {
        await initializeDatabase();
        console.log('🎉 Banco inicializado com sucesso!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro na inicialização:', error.message);
        process.exit(1);
    }
});

async function initializeDatabase() {
    return new Promise((resolve, reject) => {
        // Criar tabela de usuários
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

        db.run(createUsersTable, async (err) => {
            if (err) {
                reject(err);
                return;
            }
            
            console.log('✅ Tabela users criada');
            
            try {
                await createDefaultUsers();
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    });
}

async function createDefaultUsers() {
    console.log('👤 Criando usuários padrão...');
    
    const defaultUsers = [
        {
            email: 'admin@marceloimoveis.com',
            password: 'admin123',
            name: 'Administrador',
            role: 'admin'
        },
        {
            email: 'marcelo@marceloimoveis.com',
            password: 'marcelo2024',
            name: 'Marcelo Silva',
            role: 'owner'
        },
        {
            email: 'corretor@marceloimoveis.com',
            password: 'corretor123',
            name: 'João Corretor',
            role: 'corretor'
        }
    ];

    for (const user of defaultUsers) {
        try {
            // Verificar se usuário já existe
            const existingUser = await new Promise((resolve, reject) => {
                db.get('SELECT id FROM users WHERE email = ?', [user.email], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });

            if (existingUser) {
                console.log(`⚠️  Usuário ${user.email} já existe, pulando...`);
                continue;
            }

            // Hash da senha
            const hashedPassword = await bcrypt.hash(user.password, 12);

            // Criar usuário
            await new Promise((resolve, reject) => {
                db.run(`INSERT INTO users (email, password, name, role, is_verified) 
                        VALUES (?, ?, ?, ?, ?)`,
                       [user.email, hashedPassword, user.name, user.role, 1],
                       function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                });
            });

            console.log(`✅ Usuário criado: ${user.email} (${user.role})`);

        } catch (error) {
            console.error(`❌ Erro ao criar ${user.email}:`, error.message);
        }
    }
}

process.on('SIGINT', () => {
    console.log('\n🔄 Fechando banco...');
    db.close((err) => {
        if (err) {
            console.error('❌ Erro ao fechar:', err.message);
        } else {
            console.log('✅ Banco fechado');
        }
        process.exit(0);
    });
});