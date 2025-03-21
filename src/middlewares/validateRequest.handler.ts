import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import HTTP_STATUS from "~/utils/http_status";

type ValidationSource = "body" | "query" | "params" | "headers";

type ValidationOptions = {
  source?: ValidationSource | ValidationSource[];
};
const validateRequest = (
  schema: AnyZodObject,
  options: ValidationOptions = {}
): ((req: Request, res: Response, next: NextFunction) => void) => {
  const { source = "body" } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const sources = Array.isArray(source) ? source : [source];
      sources.forEach((src) => {
        if (req[src]) {
          // Parse and validate the data
          req[src] = schema.parse(req[src]);
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
