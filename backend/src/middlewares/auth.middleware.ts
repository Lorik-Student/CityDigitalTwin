import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../http-errors.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

export interface AuthUser {
    id: string;
    role: 'user' | 'admin';
}

export type AuthenticatedRequest = Request & {
    user?: AuthUser;
};

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    const queryToken = typeof req.query.accessToken === 'string' ? req.query.accessToken : null;

    if ((!authHeader || !authHeader.startsWith('Bearer ')) && !queryToken) {
        throw new UnauthorizedError({ code: "MISSING_AUTH_HEADER", message: "Mungon header-i i autorizimit" });
    }

    const token = queryToken ?? authHeader!.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
        (req as AuthenticatedRequest).user = decoded;
        next();
    } catch (error) {
        throw new UnauthorizedError({ code: "INVALID_TOKEN", message: "Tokeni i pavlefshëm ose ka skaduar" });
        
    }
};

export const authorizeRole = (roles: Array<'user' | 'admin'>) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const user = (req as AuthenticatedRequest).user;

        if (!user || !roles.includes(user.role)) {
            throw new UnauthorizedError({ message: "Nuk keni akses për këtë resurs" });
        }

        next();
    };
};
