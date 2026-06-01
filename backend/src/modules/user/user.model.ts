import { pool, toCamelCase } from "../../db";
import type { UserProfile } from "@shared/api-types/users";

const DEFAULT_PROFILE_PICTURE = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";

export type UserRecord = {
    uuid: string;
    name: string;
    lastName: string;
    email: string;
    phoneNumber?: string | null;
    picture?: string | null;
    passwordHash: string;
    role: "user" | "admin";
    createdAt: Date;
    updatedAt: Date;
};

export type CreateUserRecord = {
    name: string;
    lastName: string;
    email: string;
    passwordHash: string;
    phoneNumber?: string;
    picture?: string;
};

const USER_SELECT = `
    id as uuid,
    name,
    last_name,
    email,
    phone_number,
    picture,
    password_hash,
    role,
    created_at,
    updated_at
`;

const USER_PROFILE_SELECT = `
    id as uuid,
    name,
    last_name,
    email,
    phone_number,
    picture
`;

export async function createUser(data: CreateUserRecord): Promise<UserRecord> {
    const result = await pool.query(
        `INSERT INTO Users (name, last_name, email, password_hash, phone_number, picture)
         VALUES ($1, $2, $3, $4, $5, COALESCE($6, $7))
         RETURNING ${USER_SELECT}`,
        [data.name, data.lastName, data.email, data.passwordHash, data.phoneNumber, data.picture, DEFAULT_PROFILE_PICTURE]
    );

    return toCamelCase<UserRecord>(result.rows[0]);
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
    const result = await pool.query(
        `SELECT ${USER_SELECT} FROM Users WHERE email = $1`,
        [email]
    );

    return result.rows.length ? toCamelCase<UserRecord>(result.rows[0]) : null;
}

export async function findUserProfileByEmail(email: string): Promise<UserProfile | null> {
    const result = await pool.query(
        `SELECT ${USER_PROFILE_SELECT} FROM Users WHERE email = $1`,
        [email]
    );

    return result.rows.length ? toCamelCase<UserProfile>(result.rows[0]) : null;
}

export async function getUsers(): Promise<UserRecord[]> {
    const result = await pool.query(`SELECT ${USER_SELECT} FROM Users`);
    return result.rows.map(row => toCamelCase<UserRecord>(row));
}

export async function findUserById(id: string): Promise<UserRecord | null> {
    const result = await pool.query(`SELECT ${USER_SELECT} FROM Users WHERE id = $1`, [id]);
    return result.rows.length ? toCamelCase<UserRecord>(result.rows[0]) : null;
}

export async function findUserProfileById(id: string): Promise<UserProfile | null> {
    const result = await pool.query(
        `SELECT ${USER_PROFILE_SELECT} FROM Users WHERE id = $1`,
        [id]
    );

    return result.rows.length ? toCamelCase<UserProfile>(result.rows[0]) : null;
}

export async function getAllUserProfiles(): Promise<UserProfile[]> {
    const result = await pool.query(`SELECT ${USER_PROFILE_SELECT} FROM Users`);
    return result.rows.map(row => toCamelCase<UserProfile>(row));
}

export async function updateUser(id: string, userData: Partial<CreateUserRecord>): Promise<UserRecord | null> {
    const fields: string[] = [];
    const values: unknown[] = [];

    for (const [key, value] of Object.entries(userData)) {
        if (value !== undefined) {
            const dbKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            fields.push(`${dbKey} = $${values.length + 1}`);
            values.push(value);
        }
    }

    if (fields.length === 0) {
        return findUserById(id);
    }

    values.push(id);
    const result = await pool.query(
        `UPDATE Users
         SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
         WHERE id = $${values.length}
         RETURNING ${USER_SELECT}`,
        values
    );

    return result.rows.length ? toCamelCase<UserRecord>(result.rows[0]) : null;
}

export async function deleteUser(id: string): Promise<void> {
    await pool.query("DELETE FROM Users WHERE id = $1", [id]);
}

export async function getUserRoles(id: string): Promise<string[]> {
    const result = await pool.query("SELECT role FROM Users WHERE id = $1", [id]);
    return result.rows.length ? [result.rows[0].role] : [];
}
