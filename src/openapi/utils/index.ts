import { getErrorSchema } from "~/schemas/error.schema";

const getErrorResponse = (description: string, msg?: string) => ({
  description,
  content: {
    "application/json": {
      schema: getErrorSchema("error", msg),
    },
  },
});

export { getErrorResponse };
