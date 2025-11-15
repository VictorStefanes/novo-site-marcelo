const { Pool } = require('pg');

// Configuração do pool de conexões PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false,
    max: 20, // Máximo de conexões no pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Log de conexão bem-sucedida
pool.on('connect', () => {
    console.log('✓ Conectado ao PostgreSQL');
});

// Log de erros
pool.on('error', (err) => {
    console.error('Erro inesperado no cliente PostgreSQL:', err);
    process.exit(-1);
});

// Função helper para executar queries
async function query(text, params) {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Query executada:', { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error('Erro na query:', { text, error: error.message });
        throw error;
    }
}

// Função para obter um cliente do pool (para transações)
async function getClient() {
    const client = await pool.connect();
    const originalQuery = client.query;
    const originalRelease = client.release;
    
    // Timeout para liberar o cliente
    const timeout = setTimeout(() => {
        console.error('Cliente não foi liberado após 5 segundos!');
    }, 5000);
    
    // Wrapper para query com log
    client.query = (...args) => {
        client.lastQuery = args;
        return originalQuery.apply(client, args);
    };
    
    // Wrapper para release com log
    client.release = () => {
        clearTimeout(timeout);
        client.query = originalQuery;
        client.release = originalRelease;
        return originalRelease.apply(client);
    };
    
    return client;
}

// Fechar pool gracefully
async function closePool() {
    await pool.end();
    console.log('✓ Pool PostgreSQL fechado');
}

module.exports = {
    query,
    getClient,
    pool,
    closePool
};
