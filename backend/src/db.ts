import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'city_digital_twin',
  password: process.env.DB_PASSWORD || 'password123',
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function testConnection() { 
    try {
        await pool.connect();
        console.log(`Connected to PostgreSQL database at ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}`);
    } catch (err) {
        console.error('Error connection to PostgreSQL database:', err);
        process.exit(1);
    }
};

await testConnection();
export default pool;