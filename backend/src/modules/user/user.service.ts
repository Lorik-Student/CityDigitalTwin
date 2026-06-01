import * as UserModel from "./user.model.js";
import { ConflictError, NotFoundError } from "../../http-errors.js";
import bcrypt from "bcrypt";

export async function getUsers() {
    return UserModel.getAllUserProfiles();
}

export async function getUser(userId: string) {
    return UserModel.findUserById(userId);
}

type CreateUserInput = {
    name: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber?: string;
    picture?: string;
};

type UpdateUserInput = Partial<Omit<CreateUserInput, "password"> & { password: string }>;

export async function createUser(userData: CreateUserInput) {
    const existingUser = await UserModel.findUserByEmail(userData.email);
    if (existingUser) {
        throw new ConflictError({
            code: "EMAIL_ALREADY_EXISTS",
            message: "Ky email eshte tashme i regjistruar.",
        });
    }

    const passwordHash = await bcrypt.hash(userData.password, 10);
    return UserModel.createUser({
        name: userData.name,
        lastName: userData.lastName,
        email: userData.email,
        passwordHash,
        phoneNumber: userData.phoneNumber,
        picture: userData.picture,
    });
}

export async function updateUser(userId: string, userData: UpdateUserInput) {
    const { password, ...safeUserData } = userData;
    const updateData: Partial<UserModel.CreateUserRecord> = { ...safeUserData };

    if (userData.password) {
        updateData.passwordHash = await bcrypt.hash(password as string, 10);
    }

    return UserModel.updateUser(userId, updateData);
}

export async function deleteUser(userId: string) {
    return UserModel.deleteUser(userId);
}

export async function getUserProfile(userId: string, isOwner = false) {
    const user = await UserModel.findUserProfileById(userId);
    if (!user) {
        throw new NotFoundError({ code: "USER_NOT_FOUND", message: "Perdoruesi nuk u gjet." });
    }

    return user;
}

export async function getAllUserProfiles() {
    return UserModel.getAllUserProfiles();
}
