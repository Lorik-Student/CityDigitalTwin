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

// Konverto fushat e databazes prej formatit snake_case ne camelCase
export function toCamelCase<T>(obj: any): T {
    if (!obj || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
        return obj.map(toCamelCase) as T;
    }
    
    return Object.keys(obj).reduce((acc: any, key) => {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        acc[camelKey] = obj[key];
        return acc;
    }, {}) as T;
}

export function to_snake_case(str: string): string {
    return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

export default pool;