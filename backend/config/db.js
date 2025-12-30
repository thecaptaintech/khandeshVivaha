const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'khandesh_vivah',
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Test connection with detailed logging
pool.getConnection((err, connection) => {
    if (err) {
        console.error('\n❌ ============================================');
        console.error('❌ DATABASE CONNECTION FAILED');
        console.error('❌ ============================================');
        console.error('❌ Error:', err.message);
        console.error('❌ Error code:', err.code);
        console.error('\n📋 Environment Variables:');
        console.error('   DB_HOST:', process.env.DB_HOST || 'NOT SET');
        console.error('   DB_USER:', process.env.DB_USER || 'NOT SET');
        console.error('   DB_NAME:', process.env.DB_NAME || 'NOT SET');
        console.error('   DB_PASSWORD:', process.env.DB_PASSWORD ? 'SET ✓' : 'NOT SET ✗');
        console.error('\n🔍 Troubleshooting:');
        if (err.code === 'ECONNREFUSED') {
            console.error('   → MySQL server is NOT running');
            console.error('   → Start MySQL: brew services start mysql');
        } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('   → Wrong username or password');
            console.error('   → Check DB_USER and DB_PASSWORD in .env');
        } else if (err.code === 'ER_BAD_DB_ERROR') {
            console.error('   → Database does not exist');
            console.error('   → Create: CREATE DATABASE khandesh_vivah;');
        }
        console.error('❌ ============================================\n');
        return;
    }
    console.log('\n✅ ============================================');
    console.log('✅ DATABASE CONNECTED SUCCESSFULLY');
    console.log('✅ ============================================');
    console.log('📊 Connection Details:');
    console.log('   Host:', connection.config.host);
    console.log('   Database:', connection.config.database);
    console.log('   User:', connection.config.user);
    console.log('✅ ============================================\n');
    connection.release();
});

module.exports = pool.promise();

