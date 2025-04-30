// MSSQL unique connection handling
const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT, 10) || 1433,
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
    },
};

let poolPromise;

async function getConnection() {
    if (!poolPromise) {
        try {
            poolPromise = sql.connect(config);
            const pool = await poolPromise;
            console.log('Connected to MSSQL');
            return pool;
        } catch (err) {
            console.error('Database connection failed:', err);
            poolPromise = null;
            throw err;
        }
    }
    return poolPromise;
}


module.exports = { getConnection, sql };