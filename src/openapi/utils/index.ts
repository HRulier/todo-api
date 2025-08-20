import { ResponseConfig } from "@asteasolutions/zod-to-openapi";
// import { ZodType } from "zod";
import { ErrorResponse } from "~/types/error";
import { ErrorSchema } from "~/schemas/error.schema";

const getErrorResponseConfig = (
  description: string,
  example: ErrorResponse
): ResponseConfig => ({
  description,
  content: {
    "application/json": {
      schema: ErrorSchema,
      example,
    },
  },
});

export { getErrorResponseConfig };
