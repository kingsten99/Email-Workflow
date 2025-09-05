const mysql = require('mysql2');
require('dotenv').config();

console.log('🔍 Database configuration:');
console.log('  - Host:', process.env.DB_HOST || 'localhost');
console.log('  - User:', process.env.DB_USER || 'root');
console.log('  - Database:', process.env.DB_NAME || 'workflow_platform');
console.log('  - Password set:', !!process.env.DB_PASSWORD);

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root', 
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'workflow_platform',
  charset: 'utf8mb4',
  timeout: 60000,
  acquireTimeout: 60000
};

// Create connection
const connection = mysql.createConnection(dbConfig);

// Connect to database
connection.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.message);
    console.error('❌ Full error:', err);
    process.exit(1);
  }
  console.log('✅ Connected to MySQL database:', dbConfig.database);
});

// Handle connection errors
connection.on('error', (err) => {
  console.error('❌ Database error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('🔄 Reconnecting to database...');
    connection.connect();
  } else {
    throw err;
  }
});

module.exports = connection;
