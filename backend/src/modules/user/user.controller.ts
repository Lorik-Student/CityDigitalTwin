import * as Service from "./user.service.js";
import { type Request, type Response } from "express";
import { UnauthorizedError } from "../../http-errors.js";
import type { AuthenticatedRequest } from "../../middlewares/auth.middleware.js";

function getRouteId(req: Request): string {
    const id = req.params.id;
    return Array.isArray(id) ? id[0] : id;
}

export async function getUsers(req: Request, res: Response) {
    const users = await Service.getUsers();
    res.status(200).json({ success: true, users });
}

export async function getUser(req: Request, res: Response) { 
    const userId = getRouteId(req);
    const user = await Service.getUser(userId);
    res.status(200).json({ success: true, user });
}

export async function createUser(req: Request, res: Response) {
    const userData = req.body;
    const user = await Service.createUser(userData);
    res.status(201).json({ success: true, user });
}

export async function updateUser(req: Request, res: Response) { 
    const userId = getRouteId(req);
    const userData = req.body;
    const updatedUser = await Service.updateUser(userId, userData);
    res.status(200).json({ success: true, user: updatedUser });
}

export async function deleteUser(req: Request, res: Response) { 
    const userId = getRouteId(req);
    await Service.deleteUser(userId);
    res.status(204).send();
}

export async function getUserProfile(req: Request, res: Response) { 
    const userAuth = (req as AuthenticatedRequest).user;
    const viewerUserId = userAuth?.id;
    const routeUserId = req.params.id ? getRouteId(req) : viewerUserId;

    if (!routeUserId) {
        throw new UnauthorizedError({
            code: "AUTH_USER_MISSING",
            message: "Autentifikimi mungon.",
        });
    }

    const isOwner = viewerUserId === routeUserId;
    const user = await Service.getUserProfile(routeUserId, isOwner);
    res.status(200).json({ success: true, user });
}

export async function getAllUserProfiles(req: Request, res: Response) { 
    const users = await Service.getAllUserProfiles();
    res.status(200).json({ success: true, users });
}
