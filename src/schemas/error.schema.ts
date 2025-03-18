import z from "~/utils/zod/zod-extended";
import registry from "~/openapi/registry";

// Get ValidationErrorSchema with specific examples
const getErrorSchema = (
  status = "error",
  message = "An error occurred",
  path = "fieldName",
  messageError = "String must contain at least 1 character(s)"
) =>
  z.object({
    status: z.string().openapi({ example: status }),
    message: z.string().openapi({ example: message }),
    errors: z
      .array(
        z.object({
          path: path ? z.string().openapi({ example: path }) : z.string(),
          message: messageError
            ? z.string().openapi({ example: messageError })
            : z.string(),
        })
      )
      .openapi({ example: [] }),
  });

const ValidationErrorSchema = getErrorSchema("error", "", "", "");

const UnauthorizedErrorSchema = getErrorSchema(
  "error",
  "Invalid or expired token. Please log in again."
);

const InternalServerErrorSchema = getErrorSchema("error", "InternalError");

const NotFoundErrorSchema = getErrorSchema("error", "Resource not found");

// Enregistrer les schémas dans le registry
registry.register("ValidationError", ValidationErrorSchema);
registry.register("NotFoundError", NotFoundErrorSchema);
registry.register("UnauthorizedError", UnauthorizedErrorSchema);
registry.register("InternalServerError", InternalServerErrorSchema);

export {
  getErrorSchema,
  ValidationErrorSchema,
  UnauthorizedErrorSchema,
  InternalServerErrorSchema,
};
