import type { Request, Response } from 'express';
import type { AuthSession } from '@shared/api-types/auth.js';
import * as Service from "./auth.service.js";
import { UnauthorizedError } from "../../http-errors.js";

function getRefreshToken(req: Request): string {
    const token = req.header("x-refresh-token");
    if (!token) {
        throw new UnauthorizedError({ code: "REFRESH_TOKEN_MISSING", message: "Tokeni i rifreskimit mungon në header." });
    }
    return token;
}

export async function signup(req: Request, res: Response) { 
    const user = await Service.signup(req.body);

    return res.status(201)
                .json({ success: true,
                        message: "Përdoruesi u krijua me sukses",
                        user });
    
}

export async function login(req: Request, res: Response) {
    const session = await Service.login(req.body);
    if (!session) {
        return res.status(401)
            .json({ success: false, 
                message: "Identifikimi dështoi. Ju lutemi provoni përsëri." });
    }

    const { accessToken, refreshToken, user } = session;
    
    res.setHeader("Authorization", `Bearer ${accessToken}`);
    res.setHeader("x-refresh-token", refreshToken);

    res.status(200).json({
        message: "Lidhja ne llogari u realizua me sukses",
        user: user,
        accessToken,
        refreshToken
    });
}

export async function logout(req: Request, res: Response) { 
    const token = getRefreshToken(req);
    await Service.logout(token);

    res.status(200)
        .json({message: "Logged out successfully" });
}

export async function refreshToken(req: Request, res: Response) { 
    const token = getRefreshToken(req);
    const session = await Service.refreshSession(token);

    res.status(200).json({
        accessToken: session.accessToken,
        refreshToken: session.refreshToken
    } satisfies AuthSession);
}
