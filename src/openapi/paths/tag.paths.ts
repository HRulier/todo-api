import registry from "../registry";
import z from "~/utils/zod/zod-extended";
import HTTP_STATUS from "~/utils/http_status";
import { TagSchema, CreateTagSchema } from "~/schemas/tag.schema";
import {
  tagValidationExample,
  tagAlreadyExistsResponse,
} from "../examples/tag.examples";
import { ErrorSchema } from "~/schemas/error.schema";
import {
  unauthorizedResponse,
  internalServerResponse,
} from "~/openapi/examples/error.examples";

// Register paths
export const registerTagPaths = () => {
  // GET /tags
  registry.registerPath({
    method: "get",
    path: "/tags",
    tags: ["Tags"],
    summary: "Get all tags for the authenticated user",
    security: [{ bearerAuth: [] }],
    responses: {
      [HTTP_STATUS.OK]: {
        description: "List of tags",
        content: {
          "application/json": {
            schema: z.object({
              tags: z.array(TagSchema),
            }),
          },
        },
      },
      [HTTP_STATUS.UNAUTHORIZED]: unauthorizedResponse,
      [HTTP_STATUS.INTERNAL_SERVER_ERROR]: internalServerResponse,
    },
  });

  // POST /tags
  registry.registerPath({
    method: "post",
    path: "/tags",
    tags: ["Tags"],
    summary: "Create a new tag for the authenticated user",
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          "application/json": {
            schema: CreateTagSchema,
          },
        },
      },
    },
    responses: {
      [HTTP_STATUS.CREATED]: {
        description: "Tag created successfully",
        content: {
          "application/json": {
            schema: z.object({ tag: TagSchema }),
          },
        },
      },
      [HTTP_STATUS.BAD_REQUEST]: {
        description: "Validation error - missing or invalid fields",
        content: {
          "application/json": {
            schema: ErrorSchema,
            example: tagValidationExample,
          },
        },
      },
      [HTTP_STATUS.CONFLICT]: tagAlreadyExistsResponse,
      [HTTP_STATUS.UNAUTHORIZED]: unauthorizedResponse,
      [HTTP_STATUS.INTERNAL_SERVER_ERROR]: internalServerResponse,
    },
  });
};
