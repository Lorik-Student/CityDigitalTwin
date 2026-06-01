import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { ZodError } from "zod";
import { BadRequestError } from "../http-errors.js";

type RequestSchemas = {
    body?: ZodType;
    params?: ZodType;
    query?: ZodType;
};

export function validate(schemas: RequestSchemas) {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            if (schemas.body) {
                req.body = schemas.body.parse(req.body);
            }

            if (schemas.params) {
                req.params = schemas.params.parse(req.params) as Request["params"];
            }

            if (schemas.query) {
                req.query = schemas.query.parse(req.query) as Request["query"];
            }

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                next(new BadRequestError({
                    code: "VALIDATION_ERROR",
                    message: "Te dhenat e derguara nuk jane valide.",
                    options: { details: error.issues },
                }));
                return;
            }

            next(error);
        }
    };
}
