import registry from "../registry";
import z from "~/utils/zod/zod-extended";
import HTTP_STATUS from "~/utils/http_status";
import {
  OperationSchema,
  CreateOperationSchema,
} from "~/schemas/operation.schema";
import { operationValidationExample } from "../examples/operation.examples";
import { ErrorSchema } from "~/schemas/error.schema";
import {
  unauthorizedResponse,
  internalServerResponse,
} from "~/openapi/examples/error.examples";

// Register paths
export const registerOperationPaths = () => {
  // POST /operations
  registry.registerPath({
    method: "post",
    path: "/operations",
    tags: ["Operations"],
    summary: "Create a new operation",
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          "application/json": {
            schema: CreateOperationSchema,
          },
        },
      },
    },
    responses: {
      [HTTP_STATUS.CREATED]: {
        description: "Operation created successfully",
        content: {
          "application/json": {
            schema: z.object({ tag: OperationSchema }),
          },
        },
      },
      [HTTP_STATUS.BAD_REQUEST]: {
        description: "Validation error - missing or invalid fields",
        content: {
          "application/json": {
            schema: ErrorSchema,
            example: operationValidationExample,
          },
        },
      },
      [HTTP_STATUS.UNAUTHORIZED]: unauthorizedResponse,
      [HTTP_STATUS.INTERNAL_SERVER_ERROR]: internalServerResponse,
    },
  });
};
