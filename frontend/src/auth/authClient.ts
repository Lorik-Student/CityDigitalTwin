import type { AuthSession, LoginInfo, LoginResult, SignupInfo } from "@shared/api-types/auth";
import type { ErrorPayload } from "@shared/api-types/errors";
import type { UserProfile } from "@shared/api-types/users";

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";
const SESSION_STORAGE_KEY = "city-digital-twin.auth";

export type AuthState = AuthSession & {
    user: UserProfile;
};

type SignupResponse = {
    success: boolean;
    message: string;
    user: UserProfile;
};

async function parseResponse<T>(response: Response): Promise<T> {
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
        const error = payload as ErrorPayload | null;
        throw new Error(error?.message ?? "Request failed.");
    }

    return payload as T;
}

export function getStoredSession(): AuthState | null {
    const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!storedSession) return null;

    try {
        return JSON.parse(storedSession) as AuthState;
    } catch {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        return null;
    }
}

export function storeSession(session: AuthState) {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearSession() {
    localStorage.removeItem(SESSION_STORAGE_KEY);
}

export async function login(credentials: LoginInfo): Promise<AuthState> {
    const session = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
    }).then(response => parseResponse<LoginResult>(response));

    return session;
}

export async function signup(userData: SignupInfo): Promise<SignupResponse> {
    return fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
    }).then(response => parseResponse<SignupResponse>(response));
}

export async function logout(refreshToken: string): Promise<void> {
    await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-refresh-token": refreshToken,
        },
    }).then(response => parseResponse<{ message: string }>(response));
}
