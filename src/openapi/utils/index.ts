import { ResponseConfig } from "@asteasolutions/zod-to-openapi";
import { ZodType } from "zod";

const getErrorResponseConfig = (
  description: string,
  schema: ZodType<any>
): ResponseConfig => ({
  description,
  content: {
    "application/json": {
      schema,
    },
  },
});

export { getErrorResponseConfig };
