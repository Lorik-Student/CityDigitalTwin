import type { ErrorRequestHandler } from 'express';
import type { ErrorPayload } from '@shared/api-types/errors';
import { HttpError } from '../http-errors';

const errorHandler: ErrorRequestHandler = (err: HttpError, req, res, next) => {
    if (res.headersSent) { 
        return next(err);
    }

    if(err instanceof HttpError) { 
        const payload = {
            code: err.code,
            message: err.message,
            details: err.options?.details
        } satisfies ErrorPayload
        return res.status(err.statusCode).json(payload)
    }

	const payload = {
		code: 'INTERNAL_SERVER_ERROR',
		message: 'Njodhi një gabim i papritur.',
	} satisfies ErrorPayload;

	res.status(500).json(payload);
};

export default errorHandler;