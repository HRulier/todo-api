import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import HTTP_STATUS from "~/utils/http_status";

type ValidationSource = "body" | "query" | "params" | "headers" | "cookies";

type ValidationSchemas = {
  body?: AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
  headers?: AnyZodObject;
  cookies?: AnyZodObject;
};

const validateRequest = (
  schemas: ValidationSchemas
): ((req: Request, res: Response, next: NextFunction) => void) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate each source that has a schema
      Object.entries(schemas).forEach(([source, schema]) => {
        if (schema && req[source as ValidationSource]) {
          // Parse and validate the data
          req[source as ValidationSource] = schema.parse(req[source as ValidationSource]);
        }
      });

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod errors
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          status: "error",
          message: "Validation failed",
          errors: error.errors.map((err) => ({
            path: err.path.join("."),
            message: err.message,
          })),
        });
      }

      next(error);
    }
  };
};

export default validateRequest;
