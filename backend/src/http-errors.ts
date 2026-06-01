type HttpErrorOptions = {
    details?: unknown;
    expose?: boolean;
};

type HttpErrorParams = {
    statusCode: number;
    code: string;
    message: string;
    options?: HttpErrorOptions;
};

export class HttpError extends Error {
    readonly statusCode: number;
    readonly code: string;
    readonly message: string;
    readonly options?: HttpErrorOptions;

    constructor(params: HttpErrorParams) {
        super(params.message);
        this.statusCode = params.statusCode;
        this.code = params.code;
        this.message = params.message;
        this.options = params.options;
        if (this.options) {
            this.options.details = params.options?.details;
            this.options.expose = params.statusCode < 500;
        }
    }
}

export class BadRequestError extends HttpError { 
    constructor(params: {code?: string; message?: string; options?: HttpErrorOptions }) {
        const { message = "Kërkesa e pasaktë.", options = {} } = params;
        super({ statusCode: 400,
                code: params.code ?? "BAD_REQUEST",
                message: message ?? "Kërkesa e pasaktë.",
                options 
        });
    }
}

export class UnauthorizedError extends HttpError {
    constructor(params: { code?: string; message?: string; options?: HttpErrorOptions }) {
        const { message = "Autentifikimi i nevojshëm.", options = {} } = params;
        super({ statusCode: 401, code: params.code ?? "UNAUTHORIZED", message, options });
    }
}

export class ForbiddenError extends HttpError {
    constructor(params: { code?: string; message?: string; options?: HttpErrorOptions }) {
        const { message = "Ju nuk keni leje për të përdorur këtë burim.", options = {} } = params;
        super({ statusCode: 403, code: params.code ?? "FORBIDDEN", message, options });
    }
}
export class NotFoundError extends HttpError {
    constructor(params: { code?: string; message?: string; options?: HttpErrorOptions }) {
        const { message = "Rruga nuk u gjet.", options = {} } = params;
        super({ statusCode: 404, code: params.code ?? "ROUTE_NOT_FOUND", message, options });
    }
}

export class ConflictError extends HttpError {
    constructor(params: { code?: string; message?: string; options?: HttpErrorOptions }) {
        const { message = "Ndodhi një konflikt.", options = {} } = params;
        super({ statusCode: 409, code: params.code ?? "CONFLICT", message, options });
    }
}

export class InternalServerError extends HttpError {
    constructor(params: { code?: string; message?: string; options?: HttpErrorOptions }) {
        const { message = "Ndodhi një gabim i papritur.", options = {} } = params;
        super({ statusCode: 500, code: params.code ?? "INTERNAL_SERVER_ERROR", message, options: { ...options, expose: false } });
    }
}