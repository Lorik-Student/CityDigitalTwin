import { pool } from "../../db.js";
import type { PoolClient } from "pg";

export type RefreshToken = { 
    id: string;
    user_id: string;
    token: string;
    expires_at: Date;
    created_at: Date;
    revoked: Date | null;
}

const REFRESH_TOKEN_TABLE = "refreshtokens";

export async function findRefreshToken(token: string): Promise<RefreshToken | null> { 
    const query = `SELECT * FROM ${REFRESH_TOKEN_TABLE} WHERE token = $1 LIMIT 1`;
    const { rows } = await pool.query<RefreshToken>(query, [token]);
    return rows.length ? rows[0] : null;
}

export async function saveRefreshToken(userId: string, token: string): Promise<string> { 
    const query = `INSERT INTO 
                ${REFRESH_TOKEN_TABLE} (user_id, token, expires_at) 
                VALUES ($1, $2, $3)`;
    await pool.query(query, [userId, token, new Date(Date.now() + (7 * 24 * 60 * 60 * 1000))]);
    return token;
}

export async function markRefreshTokenAsUsed(token: string, providedConn?: PoolClient): Promise<string | null> { 
    const conn = providedConn ?? await pool.connect();
    const isLocalConnection = !providedConn; 

    try {
        const query = `
            SELECT user_id
            FROM ${REFRESH_TOKEN_TABLE}
            WHERE token = $1 AND revoked IS NULL
            LIMIT 1
        `;
        const { rows } = await conn.query<RefreshToken>(query, [token]);
        const foundToken = rows[0];
        if (!foundToken) {
            return null;
        }

        const revokeQuery = `UPDATE ${REFRESH_TOKEN_TABLE} SET revoked = $1 WHERE token = $2`;
        await conn.query(revokeQuery, [new Date(), token]);
        
        return foundToken.user_id;
    } finally {
        if (isLocalConnection) {
            conn.release();
        }
    }
}
