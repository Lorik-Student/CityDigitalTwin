import type { AuthSession, LoginInfo, AuthState, SignupInfo } from "@shared/api-types/auth";
import type { ErrorPayload } from "@shared/api-types/errors";

export type { AuthState };

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";
const SESSION_STORAGE_KEY = "city-digital-twin.auth";
let refreshPromise: Promise<AuthSession> | null = null;

export class ApiError extends Error {
    readonly status: number;
    readonly payload: ErrorPayload | null;

    constructor(
        message: string,
        status: number,
        payload: ErrorPayload | null
    ) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.payload = payload;
    }
}

type ApiFetchInit = RequestInit & {
    skipAuth?: boolean;
    retryOnUnauthorized?: boolean;
};

async function parseResponse<T>(response: Response): Promise<T> {
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
        const error = payload as ErrorPayload | null;
        throw new ApiError(error?.message ?? "Request failed.", response.status, error);
    }

    return payload as T;
}

function getApiUrl(path: string): string {
    if (/^https?:\/\//i.test(path)) return path;

    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${API_BASE_URL}${normalizedPath}`;
}

function buildHeaders(init: ApiFetchInit, session: AuthState | null): Headers {
    const headers = new Headers(init.headers);
    const shouldSetJsonContentType =
        init.body &&
        typeof init.body === "string" &&
        !headers.has("Content-Type");

    if (!headers.has("Accept")) {
        headers.set("Accept", "application/json");
    }

    if (shouldSetJsonContentType) {
        headers.set("Content-Type", "application/json");
    }

    if (!init.skipAuth && session?.accessToken && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${session.accessToken}`);
    }

    return headers;
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

async function refreshSession(currentSession: AuthState): Promise<AuthSession> {
    refreshPromise ??= fetch(getApiUrl("/auth/refresh"), {
        method: "POST",
        headers: {
            "x-refresh-token": currentSession.refreshToken,
        },
    })
        .then(response => parseResponse<AuthSession>(response))
        .then((nextSession) => {
            storeSession({
                ...currentSession,
                accessToken: nextSession.accessToken,
                refreshToken: nextSession.refreshToken,
            });

            return nextSession;
        })
        .catch((error) => {
            clearSession();
            throw error;
        })
        .finally(() => {
            refreshPromise = null;
        });

    return refreshPromise;
}

export async function apiFetch<T>(path: string, init: ApiFetchInit = {}): Promise<T> {
    const { retryOnUnauthorized = true, skipAuth = false, ...requestInit } = init;
    const session = getStoredSession();
    const response = await fetch(getApiUrl(path), {
        ...requestInit,
        headers: buildHeaders({ ...requestInit, skipAuth }, session),
    });

    if (response.status !== 401 || skipAuth || !retryOnUnauthorized || !session?.refreshToken) {
        return parseResponse<T>(response);
    }

    const nextSession = await refreshSession(session);
    const retryHeaders = buildHeaders(
        {
            ...requestInit,
            skipAuth,
            headers: {
                ...Object.fromEntries(new Headers(requestInit.headers).entries()),
                Authorization: `Bearer ${nextSession.accessToken}`,
            },
        },
        getStoredSession()
    );

    const retryResponse = await fetch(getApiUrl(path), {
        ...requestInit,
        headers: retryHeaders,
    });

    return parseResponse<T>(retryResponse);
}

export async function login(credentials: LoginInfo): Promise<AuthState> {
    return apiFetch<AuthState>("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
        skipAuth: true,
    });
}

export async function signup(userData: SignupInfo): Promise<void> {
    await apiFetch<{ message: string }>("/auth/signup", {
        method: "POST",
        body: JSON.stringify(userData),
        skipAuth: true,
    });
}


export async function logout(refreshToken: string): Promise<void> {
    await apiFetch<{ message: string }>("/auth/logout", {
        method: "POST",
        headers: {
            "x-refresh-token": refreshToken,
        },
        skipAuth: true,
        retryOnUnauthorized: false,
    });
}
