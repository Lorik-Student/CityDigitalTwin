import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../../http-errors.js";
import * as UserModel from "../user/user.model.js";
import * as UserService from "../user/user.service";
import * as TokenModel from "./token.model.js";
import type { SignupInfo, LoginInfo, LoginResult } from "@shared/api-types/auth.js";
import type { UserProfile } from "@shared/api-types/users.js";
import type { UserRecord } from "../user/user.model.js";

const JWT_SECRET = process.env.JWT_SECRET || "secret123";

export async function signup(userData: SignupInfo): Promise<UserProfile> {
    const user = await UserService.createUser({
        name: userData.name,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        ...(userData.phoneNumber !== undefined ? { phoneNumber: userData.phoneNumber } : {}),
    });

    if (!user) 
        throw new UnauthorizedError({message: "Failed to create user"});
    return UserService.getUserProfile(user.uuid);
}

export async function login(userData: LoginInfo): Promise<LoginResult> {
    const authenticatedUser = await authenticate(userData);
    if (!authenticatedUser) {
        throw new UnauthorizedError({message: "Invalid credentials"});
    }

    const userId = authenticatedUser.uuid;
    const [accessToken, refreshToken, user] = await Promise.all([
        generateAccessToken(userId),
        createRefreshToken(userId),
        UserService.getUserProfile(userId),
    ]);

    return {
        user,
        accessToken,
        refreshToken,
    };
}

export async function logout(refreshToken: string): Promise<void> {
    const revokedUserId = await markRefreshTokenAsUsed(refreshToken);
    if (!revokedUserId) {
        throw new UnauthorizedError({ code: "INVALID_REFRESH_TOKEN", message: "The provided refresh token is invalid or has already been used." });
    }
}

export async function refreshSession(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const userId = await validateRefreshToken(refreshToken);
    const revokedUserId = await markRefreshTokenAsUsed(refreshToken);

    if (!revokedUserId || revokedUserId !== userId) {
        throw new UnauthorizedError({ code: "INVALID_REFRESH_TOKEN", message: "The provided refresh token is invalid or has already been used." });
    }

    const [accessToken, newRefreshToken] = await Promise.all([
        generateAccessToken(userId),
        createRefreshToken(userId),
    ]);

    return {
        accessToken,
        refreshToken: newRefreshToken,
    };
}

async function authenticate(userData: LoginInfo): Promise<UserRecord | null> {
    const foundUser = await UserModel.findUserByEmail(userData.email);
    if (!foundUser) {
        return null;
    }

    const isMatch = await bcrypt.compare(userData.password, foundUser.passwordHash);
    if (!isMatch) {
        return null;
    }

    return foundUser;
}

async function generateAccessToken(uuid: string): Promise<string> {
    const roles = await UserModel.getUserRoles(uuid);
    const payload = {
        id: uuid,
        role: roles.length ? roles[0] : 'user',
        exp: Math.floor(Date.now() / 1000) + (15 * 60), //(15 * 60)
    };
    return jwt.sign(payload, JWT_SECRET);
}

function generateRefreshToken(): string {
    return crypto.randomBytes(40).toString("hex");
}

async function createRefreshToken(userId: string): Promise<string> {
    const token = generateRefreshToken();
    await TokenModel.saveRefreshToken(userId, token);
    return token;
}

async function markRefreshTokenAsUsed(token: string): Promise<string | null> {
    return TokenModel.markRefreshTokenAsUsed(token);
}

async function validateRefreshToken(token: string): Promise<string> {
    const foundToken = await TokenModel.findRefreshToken(token);
    if (!foundToken) {
        throw new UnauthorizedError({ code: "INVALID_REFRESH_TOKEN", message: "The provided refresh token is invalid." });
    }
    if (foundToken.revoked) {
        throw new UnauthorizedError({ code: "USED_REFRESH_TOKEN", message: "The provided refresh token has already been used." });
    }
    if (new Date(foundToken.expires_at) < new Date()) {
        throw new UnauthorizedError({ code: "EXPIRED_REFRESH_TOKEN", message: "The provided refresh token has expired." });
    }

    return foundToken.user_id;
}

